let dropdown = document.querySelector('[name="cities"]');
let input = document.querySelector('[name="city"]');

input.addEventListener('input', function () {
  if (input.value.length >= 3) {
    let url = 'https://raw.githubusercontent.com/Adushar/UkraineCitiesAndVillages/main/CitiesAndVillages%20-%2014%20March.json';

    fetch(url)
      .then(function (response) {
        if (response.status !== 200) {
          console.warn('Looks like there was a problem. Status Code: ' +
            response.status);
          return;
        }

        response.json().then(function (data) {
          dropdown.innerHTML = '';

          let filteredCities = data.filter(city => {
            return city.object_name.toLowerCase().includes(input.value.toLowerCase());
          });

          filteredCities.forEach(city => {
            let option = document.createElement('option');
            option.value = city.object_name;
            option.label = city.community.includes('РАЙОН') ? city.community : city.community + ". РАЙОН";
            option.dataset.city = city.object_code;
            dropdown.appendChild(option);
          });
        });
      })
      .catch(function (err) {
        console.error('Fetch Error -', err);
      });
  } else {
    dropdown.innerHTML = '';
  }
});