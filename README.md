# T2Pilt 0.3 – Teeregistri testversioon

Laadi **index.html** ja **teeregister.js** samasse GitHubi repositooriumi juurkausta. Avalda GitHub Pagesiga.

Rakendus kasutab kaamerat, GPS-i, OSM Nominatimi ning Teeregistri WFS 1.0.0 teenust. `proj4` laaditakse jsDelivri CDN-ist. Teeregister küsib 150 × 150 m ala ja vajaduse korral 300 × 300 või 600 × 600 m ala. Lähima tee maksimaalne kaugus on 50 m.

**Tähelepanu:** brauseri CORS-ligipääs WFS-ile ei ole kinnitatud. Kui Teeregistri päring annab CORS-vea, on vaja sama päritolu puhverserverit või muud lubatud API-lahendust. Tee kilometraaž on arvutuslik, sest geomeetria suunda pole ametliku kilometraažiga võrreldud. Maa- ja Ruumiameti teenus on endiselt ühendamata.

Testi HTTPS-aadressil, luba kaamera ja asukoht, vajuta „Käivita kaamera ja GPS“ ning kontrolli Teeregistri tulemust. Salvestatud JPG sisaldab sisse lülitatud teabevälju.
