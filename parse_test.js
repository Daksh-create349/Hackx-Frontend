const fs = require('fs');
fetch(`https://nominatim.openstreetmap.org/search?q=Pune&format=geojson&polygon_geojson=1&limit=5`)
  .then(res => res.json())
  .then(data => {
    const polygonFeature = data.features.find((feature) => 
        feature.geometry && (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon')
    );
    console.log("Found:", polygonFeature ? "YES" : "NO");
    if(polygonFeature) console.log("Type:", polygonFeature.geometry.type);
  })
