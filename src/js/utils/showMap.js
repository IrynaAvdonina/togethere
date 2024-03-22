
if (location.pathname.includes('createEvent')) {

  var mapEv = L.map('map').setView([47.582, 34.39], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(mapEv);

  let marker;

  mapEv.on('click', function (e) {
    if (marker) {
      mapEv.removeLayer(marker);
    }
    console.log(e.latlng);
    marker = new L.marker(e.latlng, { draggable: 'true' });
    let map = document.querySelector('#map');
    let mapIn = document.querySelector('#mapInput');
    mapIn.value = e.latlng.lat + ',' + e.latlng.lng;
    //console.log(e.latlng.lat + ',' + e.latlng.lng);
    map.dataset.lat = e.latlng.lat;
    map.dataset.long = e.latlng.lng;
    marker.on('dragend', function (event) {

      var marker = event.target;
      var position = marker.getLatLng();
      map.dataset.lat = e.latlng.lat;
      map.dataset.long = e.latlng.lng;
      marker.setLatLng(new L.LatLng(position.lat, position.lng), { draggable: 'true' });
      mapEv.panTo(new L.LatLng(position.lat, position.lng))
    });
    console.log("3")
    mapEv.addLayer(marker);
  });
}

if (location.pathname.includes('event-card')) {
  let map = document.querySelector('#map');
  let resultlat = +map.dataset.lat;
  let resultLong = +map.dataset.long;
  var mapEv = L.map('map').setView([resultlat, resultLong], 14);
  let marker = new L.marker([resultlat, resultLong], { draggable: 'false' });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(mapEv);
  marker.addTo(mapEv);
  /*
    let marker;
  
    map.on('click', function (e) {
      if (marker) {
        map.removeLayer(marker);
      }
      marker = new L.marker(e.latlng, { draggable: 'true' });
  
      marker.on('dragend', function (event) {
        var marker = event.target;
        var position = marker.getLatLng();
        marker.setLatLng(new L.LatLng(position.lat, position.lng), { draggable: 'true' });
  
        map.panTo(new L.LatLng(position.lat, position.lng))
      });
      map.addLayer(marker);
    });*/


}