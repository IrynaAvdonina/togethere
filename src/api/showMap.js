
//This function initializes the map on the createEvent page and adds search, draggable markers to the map

const initCoords = [47.582, 34.39]; // initial coordinates of Nikopol, UA
const initZoom = 12;

if (location.pathname.includes('create-event')) {
  let marker;

  // create a map with the OpenStreetMap tile layer and set the initial view
  const mapEv = L.map('map').setView(initCoords, initZoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(mapEv);

  const searchbox = L.control.searchbox({
    position: 'topright',
    expand: 'left'
  }).addTo(mapEv);

  // add the locate control to the map
  const locate = L.control.locate().addTo(mapEv);

  searchbox.onInput("keypress", async function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      const searchTerm = searchbox.getValue();

      // build the URL for the search term on OpenStreetMap
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&countrycodes=UA`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        // if data is returned and there is at least one result
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);

          // remove the existing marker from the map, if it exists
          if (marker) {
            mapEv.removeLayer(marker);
          }

          // create a new marker and set its position
          marker = L.marker([lat, lon], { draggable: true });

          // set the view of the map to the new marker position
          mapEv.setView([lat, lon], initZoom);
        } else {
          alert('Місце не знайдено');
        }
      } catch (error) {
        console.error('Error searching place ', error);
      }
    }
  });

  mapEv.on('click', function (e) {
    // if a marker exists, remove it from the map
    if (marker) {
      mapEv.removeLayer(marker);
    }

    let map = document.querySelector('#map');
    let mapIn = document.querySelector('#mapInput');

    // create a new marker and set its position
    marker = new L.marker(e.latlng, { draggable: 'true' });

    // set the input value to the marker's position
    mapIn.value = e.latlng.lat + ',' + e.latlng.lng;

    map.dataset.lat = e.latlng.lat;
    map.dataset.long = e.latlng.lng;

    marker.on('dragend', function (event) {
      let marker = event.target;
      let position = marker.getLatLng();

      map.dataset.lat = e.latlng.lat;
      map.dataset.long = e.latlng.lng;

      // set the position of the marker and zoom the map to that
      marker.setLatLng(new L.LatLng(position.lat, position.lng), { draggable: 'true' });
      mapEv.panTo(new L.LatLng(position.lat, position.lng))
    });

    mapEv.addLayer(marker);
  });

  // add a click event listener to location
  if (locate) {
    locate.on('click', function (e) {

      function success(position) {
        if (marker) {
          mapEv.removeLayer(marker);
        }

        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        marker = new L.marker([latitude, longitude], { draggable: 'true' });

        mapEv.setView([latitude, longitude], 14);
        mapEv.addLayer(marker);
      }

      function error() {
        alert("Не вдається отримати ваше місцезнаходження");
      }
      // it checks if geolocation is supported, gets the user's current location, and adds a marker to the map

      if (!navigator.geolocation) {
        alert("Геолокація не підтримується вашим браузером");
      } else {
        navigator.geolocation.getCurrentPosition(success, error);
      }
    });
  }
}

// This function initializes a map and show marker on the map
if (location.pathname.includes('event-card')) {
  let map = document.querySelector('#map');
  if (map) {
    let resultlat = +map.dataset.lat;
    let resultLong = +map.dataset.long;

    // create a map with the OpenStreetMap tile layer and set the initial view
    let mapEv = L.map('map').setView([resultlat, resultLong], 15);
    let marker = new L.marker([resultlat, resultLong], { draggable: 'false' });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(mapEv);

    // add the marker to the map
    marker.addTo(mapEv);
  }
}

