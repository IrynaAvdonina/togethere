// This script fetches a list of cities from a JSON file and create a dropdown menu based on user input
let dropdown = document.querySelector('[name="cities"]');
let input = document.querySelector('[name="city"]');

input.addEventListener('input', function () {

  if (input.value.length >= 3) {

    // fetch cities JSON file
    let url = 'https://raw.githubusercontent.com/Adushar/UkraineCitiesAndVillages/main/CitiesAndVillages%20-%2014%20March.json';

    fetch(url)
      .then(function (response) {
        // check if response is successful
        if (response.status !== 200) {
          console.warn('Looks like there was a problem in fetching the datalist. Status Code: ' +
            response.status);
          return;
        }

        //parse response as JSON
        response.json().then(function (data) {
          dropdown.innerHTML = '';

          // filter cities based on user input
          let filteredCities = data.filter(city => {
            return city.object_name.toLowerCase().includes(input.value.toLowerCase());
          });

          // creating dropdown with filtered cities
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
        console.error('Fetch Error - ', err);
      });
  } else {
    dropdown.innerHTML = '';
  }
});
