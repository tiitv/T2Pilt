# T2Pilt 0.4

GitHub Pages: laadi `index.html` ja `teeregister.js` repositooriumi juurkausta. Failid peavad olema samas kaustas. Veebileht vajab HTTPS-i, kaamera ja asukoha luba ning internetti. `proj4` laetakse CDN-ist.

## Teeregistri otsing

Otsing algab GPS-asukohast (0 m) ja kasutab järjest 50 x 50, 100 x 100, 200 x 200, 300 x 300 ja 600 x 600 m BBOX-päringuid (WFS 1.0.0, EPSG:3301). Tegemist on **ruutude laiustega**, mitte tee minimaalse kaugusega. Lähima tee kaugus mõõdetakse meetrites tee telgjoonest. Maksimaalne lubatud kaugus on vaikimisi 300 m; kaugeid tulemusi ei kuvata kindla teeaadressina.

Ava rakenduses **Teeregistri diagnostika**, et näha GPS-i täpsust, teisendatud koordinaate, iga päringu objektide arvu ja lähima tee kaugust. Võrgu- ja CORS-vead kuvatakse eraldi.

## Tähtsad piirangud

Tee kilomeeter on geomeetriast arvutatud hinnang. Teeosa geomeetria suunda ja ametlikku kilometraaži pole veel kontrollitud. GPS-i ebatäpsus võib anda vale lähima tee, eriti ristmikel ja paralleelsete teede juures. WFS-i CORS-ligipääs GitHub Pagesi brauserist vajab kohapeal testimist. Maa- ja Ruumiameti teenus ei ole ühendatud. OpenStreetMapi Nominatimi avaliku teenuse kasutuspiiranguid tuleb järgida.


## Versioon 0.4.1
Parandatud null-vastuse käsitlemine: report.result kasutamine ei põhjusta enam arusaamatut TypeError-viga. Lisatud teeregister.js vahemälu vältiv versiooniparameeter. Pärast üleslaadimist tee telefonis lehele täielik värskendus. Kui päring ikka ebaõnnestub, kopeeri diagnostika täpne tekst.
