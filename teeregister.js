/* T2Pilt Teeregister WFS road-address lookup. Requires proj4 loaded before this script. */
(function (root) {
  'use strict';
  const ENDPOINT = 'https://teeregister.mnt.ee/290424/wfs';
  const LEST = '+proj=lcc +lat_1=59.33333333333334 +lat_2=58 +lat_0=57.51755393055556 +lon_0=24 +x_0=500000 +y_0=6375000 +ellps=GRS80 +units=m +no_defs';
  function requireProj4() {
    if (typeof root.proj4 !== 'function') throw new Error('proj4 teek puudub. Laadi proj4 enne teeregister.js faili.');
    return root.proj4;
  }
  function gpsToLest(lat, lon) {
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) throw new Error('Vigased GPS-koordinaadid.');
    return requireProj4()('EPSG:4326', LEST, [lon, lat]);
  }
  function buildUrl(x, y, size, maxFeatures, endpoint) {
    const half = size / 2;
    const params = new URLSearchParams({service:'WFS',version:'1.0.0',request:'GetFeature',typeName:'ms:teeosa',srsName:'EPSG:3301',bbox:[x-half,y-half,x+half,y+half].join(','),maxFeatures:String(maxFeatures),outputFormat:'application/json; subtype=geojson'});
    return `${endpoint || ENDPOINT}?${params.toString()}`;
  }
  function closestPointOnLine(point, coords) {
    if (!Array.isArray(coords) || coords.length < 2) return null;
    let best = null, travelled = 0;
    for (let i=1; i<coords.length; i++) {
      const a=coords[i-1], b=coords[i];
      if (![a[0],a[1],b[0],b[1]].every(Number.isFinite)) continue;
      const dx=b[0]-a[0], dy=b[1]-a[1], length2=dx*dx+dy*dy;
      const length=Math.sqrt(length2);
      if (!length) continue;
      const t=Math.max(0,Math.min(1,((point[0]-a[0])*dx+(point[1]-a[1])*dy)/length2));
      const px=a[0]+t*dx, py=a[1]+t*dy;
      const distance=Math.hypot(point[0]-px,point[1]-py);
      if (!best || distance<best.distance) best={distance, along:travelled+t*length, totalLength:0, nearest:[px,py]};
      travelled+=length;
    }
    if (best) best.totalLength=travelled;
    return best;
  }
  function evaluateFeature(feature, point) {
    const geometry=feature?.geometry, props=feature?.properties || {};
    if (!geometry || geometry.type!=='LineString') return null;
    const closest=closestPointOnLine(point,geometry.coordinates);
    if (!closest) return null;
    const start=Number(props.m_aadress);
    if (!Number.isFinite(start)) return null;
    // m_aadress is a road address in metres; the geometry is assumed to run in increasing address direction.
    // Verify direction with official kilometre points before treating this as an authoritative road address.
    const metres=start+closest.along;
    return {teeNumber:props.tee_number, name:props.nimi || '', roadSection:props.jrknr, carriageway:props.soidutee_nr,
      startMetres:start, roadMetres:metres, kilometre:metres/1000, distanceToRoad:closest.distance,
      nearestLest:closest.nearest, featureId:props.oid, geometryLength:closest.totalLength,
      addressVerified:false};
  }
  async function lookup(lat,lon,options={}) {
    const point=gpsToLest(lat,lon);
    // Search starts at the GPS point (0 m). Sizes are square widths, not minimum distances.
    const sizes=options.sizes || [50,100,200,300,600];
    const maxFeatures=options.maxFeatures || 200;
    const maxDistance=options.maxDistance ?? 300;
    const fetcher=options.fetch || root.fetch.bind(root);
    const diagnostics=[];
    let nearest=null;
    for (const size of sizes) {
      const url=buildUrl(point[0],point[1],size,maxFeatures,options.endpoint);
      let response;
      try { response=await fetcher(url,{method:'GET',mode:'cors',signal:options.signal}); }
      catch (error) { throw new Error('WFS võrgu- või CORS-viga ('+size+' m ala): '+error.message); }
      if (!response.ok) throw new Error('WFS HTTP '+response.status+' ('+size+' m ala)');
      let data;
      try { data=await response.json(); } catch(e) { throw new Error('WFS vastus pole JSON: '+e.message); }
      if (!Array.isArray(data.features)) throw new Error('WFS vastuses puudub features massiiv ('+size+' m ala)');
      const candidates=data.features.map(f=>evaluateFeature(f,point)).filter(Boolean).sort((a,b)=>a.distanceToRoad-b.distanceToRoad);
      diagnostics.push({size,features:data.features.length,valid:candidates.length,nearestDistance:candidates.length?candidates[0].distanceToRoad:null,truncated:data.features.length>=maxFeatures});
      if (candidates.length && (!nearest || candidates[0].distanceToRoad<nearest.distanceToRoad))
        nearest={...candidates[0],querySize:size,returnedFeatures:data.features.length,possiblyTruncated:data.features.length>=maxFeatures};
      // Only accept a result once it is comfortably within the searched square.
      // A smaller result near the edge may miss a closer road just outside the square.
      if (nearest && nearest.distanceToRoad<=Math.min(25,size/2-1) && data.features.length<maxFeatures)
        break;
    }
    return {result:nearest && nearest.distanceToRoad<=maxDistance ? nearest : null,
      nearest, diagnostics, maxDistance, pointLest:point};
  }
  function formatAddress(result) {
    if (!result) return 'Teeaadressi ei leitud';
    return `${result.name || 'Tee'} (nr ${result.teeNumber}), km ${result.kilometre.toFixed(3)} (arvutuslik)`;
  }
  root.T2Teeregister={version:'0.4.1',lookup,gpsToLest,buildUrl,closestPointOnLine,evaluateFeature,formatAddress};
})(typeof window !== 'undefined' ? window : globalThis);
