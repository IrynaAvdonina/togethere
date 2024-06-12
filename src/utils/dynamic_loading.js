document.addEventListener('DOMContentLoaded', function () {
  const loadMoreTrigger = document.getElementById('load-more-trigger');
  let isLoading = false;
  let page = 2;
  const filters = {};

  // get the current values of all filter inputs and updates filters 
  function getFilters() {
    const filterElements = document.querySelectorAll('.filter-input');
    filterElements.forEach(element => {
      filters[element.name] = element.value;
    });
  }

  // builds a query string from the filters object
  function buildFilterQuery() {
    return Object.keys(filters)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(filters[key])}`)
      .join('&');
  }

  // creates IntersectionObserver that listens for intersecting trigger element with the viewport
  const observer = new IntersectionObserver(async (entries, observer) => {

    if (entries[0].isIntersecting && !isLoading) {
      getFilters();

      await loadMoreEvents();
    }
  }, {
    threshold: 1
  });

  // start observing the "load-more-trigger" element
  observer.observe(loadMoreTrigger);

  async function loadMoreEvents() {
    if (isLoading) return;
    isLoading = true;
    const filterQuery = buildFilterQuery();
    try {
      // fetch more events from the server
      const response = await fetch(`/events/load-more-filtered?page=${page}&${filterQuery}`);
      const data = await response.json();

      // if there are more events, add them to the page
      if (data.eventsList.length > 0) {
        const eventsCardContainer = document.querySelector('.events-card');
        data.eventsList.forEach(item => {
          // create a card element for each event
          const card = document.createElement('div');
          card.classList.add('card', 'lazy-card');
          card.innerHTML = `
              <!-- Event location -->
              <div class="top-card-event">
                <div class="city-event">
                  <img src="public/img/map.svg" alt="city" class="city-event-img" width="13" height="13">
                  <p class="city-event-name">${item.city}</p>
                </div>
              </div>
              <!-- Event name -->
              <h3 class="type-event-name">${item.name}</h3>
              <!-- Event place (if available) -->
              ${item.place ? `<p class="place-event-name">${item.place}</p>` : ''}
              <!-- Event date and time -->
              <div class="date-time">
                <div class="date-event">
                  <img src="public/img/day.svg" alt="" class="date-event-img" width="13" height="13">
                  <p class="date-event-name">${item.date.split('-').reverse().join('.')}</p>
                </div>
                <div class="time-event">
                  <img src="public/img/time.svg" alt="" class="time-event-img" width="13" height="13">
                  <p class="time-event-name">${item.time}</p>
                </div>
              </div>
              <!-- Event details link -->
              <div class="button-event">
                <a href="/event-card/${item['_id']}" class="button-more">Детальніше</a>
              </div>
            `;
          eventsCardContainer.appendChild(card);
        });
        isLoading = false;
        page++;
      } else {
        // if there are no more events, stop observing the load more trigger
        observer.unobserve(loadMoreTrigger);
      }
    } catch (error) {
      console.error('Error loading more events: ', error);
      isLoading = false;
    }
  }

  // getFilters(); 
  // loadMoreEvents();

});

