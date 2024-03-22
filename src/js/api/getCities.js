let dropdown = document.querySelector('[name="cities"]')
dropdown.length = 0;
dropdown.selectedIndex = 0;

const url = 'public/database/CitiesAndVillages.json';

fetch(url)
  .then(
    function (response) {
      if (response.status !== 200) {
        console.warn('Looks like there was a problem. Status Code: ' +
          response.status);
        return;
      }

      // Examine the text in the response  
      response.json().then(function (data) {
        let option;


        for (let i = 0; i < data.length; i++) {
          option = document.createElement('option');

          option.label = data[i].community.includes('РАЙОН') ? data[i].community : data[i].community + ". РАЙОН";
          option.value = data[i].object_name;
          option.dataset.city = data[i].object_code;
          dropdown.appendChild(option);
        }
      });
    }
  )
  .catch(function (err) {
    console.error('Fetch Error -', err);
  });