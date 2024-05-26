
if (location.pathname.includes('createEvent')) {

  var mapEv = L.map('map').setView([47.582, 34.39], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(mapEv);

  var searchbox = L.control.searchbox({
    position: 'topright',
    expand: 'left'
  }).addTo(mapEv);

  let marker;

  searchbox.onInput("keypress", function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      var searchTerm = searchbox.getValue();

      var url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&countrycodes=UA`;

      fetch(url)
        .then(response => response.json())
        .then(data => {
          if (data && data.length > 0) {
            var lat = parseFloat(data[0].lat);
            var lon = parseFloat(data[0].lon);

            if (marker) {
              mapEv.removeLayer(marker);
            }

            marker = L.marker([lat, lon], { draggable: true });

            mapEv.setView([lat, lon], 12);
          } else {
            alert('Місце не знайдено');
          }
        })
        .catch(error => console.error('Помилка при пошуку місця:', error));
    }
  });

  mapEv.on('click', function (e) {
    if (marker) {
      mapEv.removeLayer(marker);
    }
    console.log(e.latlng);
    marker = new L.marker(e.latlng, { draggable: 'true' });
    let map = document.querySelector('#map');
    let mapIn = document.querySelector('#mapInput');
    mapIn.value = e.latlng.lat + ',' + e.latlng.lng;
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
    mapEv.addLayer(marker);
  });
}

if (location.pathname.includes('event-card')) {
  let map = document.querySelector('#map');
  let resultlat = +map.dataset.lat;
  let resultLong = +map.dataset.long;
  var mapEv = L.map('map').setView([resultlat, resultLong], 12);
  let marker = new L.marker([resultlat, resultLong], { draggable: 'false' });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(mapEv);
  marker.addTo(mapEv);


}