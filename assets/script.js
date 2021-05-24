// Global variables
let searchHistory = [];
let weatherApiUrl = 'https://api.openweathermap.org';
let apiKey = 'bd968fe204394d80c7bb2d806339fbd6';
let searchContainer = document.querySelector('#search-form');
let userInput = document.querySelector('#search-input');
let currentDayContainer = document.querySelector('#today');
let forecastContainer = document.querySelector('#forecast');
let historyContainer = document.querySelector('#history');



//function that displays the history from local storage and creates clickable buttons to view previous cities searched.//
function searchHistoryData() {
  historyContainer.innerHTML = '';
    for (let i = searchHistory.length - 1; i >= 0; i--) {
        let btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.setAttribute('aria-controls', 'today forecast');
        btn.classList.add('history-btn', 'btn-history');
        btn.setAttribute('data-search', searchHistory[i]);
        btn.textContent = searchHistory[i];
        historyContainer.append(btn);
  }
}

// this function updates local storage and updates the displayed history.
function addToHistory(search) {
    if (searchHistory.indexOf(search) !== -1) {
    return;
    }
    searchHistory.push(search);
    localStorage.setItem('search-history', JSON.stringify(searchHistory));
    searchHistoryData();
}

// this is the function that runs when the page first loads and displays data, if any, from local storage.//
function init() {
    let storedData = localStorage.getItem('search-history');
    if (storedData) {
      searchHistory = JSON.parse(storedData);
    }
    searchHistoryData();
}

// this function displays the current date and weather for the searched city, and stores the response information
// from the api into variables.//
function currentWeather(city, weather) {
    let todaysDate = dayjs().format('M/D/YYYY');
    let theTemperature = weather.temp;
    let windSpeed = weather.wind_speed;
    let humidity = weather.humidity;
    let uvIndex = weather.uvIndex;
    let iconUrl = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
    let iconDescription = weather.weather[0].description || weather[0].main;
    let card = document.createElement('div');
    let cardBody = document.createElement('div');
    let heading = document.createElement('h2');
    let weatherIcon = document.createElement('img');
    let tempEl = document.createElement('p');
    let windEl = document.createElement('p');
    let humidityEl = document.createElement('p');
    let uvEl = document.createElement('p');
    let uvIndexImage = document.createElement('button');
  
    card.setAttribute('class', 'card');
    cardBody.setAttribute('class', 'card-body');
    card.append(cardBody);
  
    heading.setAttribute('class', 'h3 card-title');
    tempEl.setAttribute('class', 'card-text');
    windEl.setAttribute('class', 'card-text');
    humidityEl.setAttribute('class', 'card-text');
  
    heading.textContent = `${city} (${todaysDate})`;
    weatherIcon.setAttribute('src', iconUrl);
    weatherIcon.setAttribute('alt', iconDescription);
    weatherIcon.setAttribute('class', 'weather-img');
    heading.append(weatherIcon);
    tempEl.textContent = `Temp: ${theTemperature}°F`;
    windEl.textContent = `Wind: ${windSpeed} MPH`;
    humidityEl.textContent = `Humidity: ${humidity} %`;
    cardBody.append(heading, tempEl, windEl, humidityEl);
  
    uvEl.textContent = 'UV Index: ';
    uvIndexImage.classList.add('btn', 'btn-sm');
  
    if (uvIndex < 3) {
      uvIndexImage.classList.add('btn-success');
    } else if (uvIndex < 7) {
      uvIndexImage.classList.add('btn-warning');
    } else {
      uvIndexImage.classList.add('btn-danger');
    }
  
    uvIndexImage.textContent = uvIndex;
    uvEl.append(uvIndexImage);
    cardBody.append(uvEl);
  
    currentDayContainer.innerHTML = '';
    currentDayContainer.append(card);
}
  
  // Function to display a forecast from open weather api
  // daily forecast.
  function theForecast(forecast) {
    // variables for data from api
    let temps = forecast.dt;
    let iconUrl = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
    let iconDescription = forecast.weather[0].description;
    let theTemperature = forecast.temp.day;
    let { humidity } = forecast;
    let windSpeed = forecast.wind_speed;
  
    // Create elements for a card
    let col = document.createElement('div');
    let card = document.createElement('div');
    let cardBody = document.createElement('div');
    let cardTitle = document.createElement('h5');
    let weatherIcon = document.createElement('img');
    let tempEl = document.createElement('p');
    let windEl = document.createElement('p');
    let humidityEl = document.createElement('p');
  
    col.append(card);
    card.append(cardBody);
    cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);
  
    col.setAttribute('class', 'col-md');
    col.classList.add('five-day-card');
    card.setAttribute('class', 'card bg-primary h-100 text-white');
    cardBody.setAttribute('class', 'card-body p-2');
    cardTitle.setAttribute('class', 'card-title');
    tempEl.setAttribute('class', 'card-text');
    windEl.setAttribute('class', 'card-text');
    humidityEl.setAttribute('class', 'card-text');
  
    // Add content to elements
    cardTitle.textContent = dayjs.unix(temps).format('M/D/YYYY');
    weatherIcon.setAttribute('src', iconUrl);
    weatherIcon.setAttribute('alt', iconDescription);
    tempEl.textContent = `Temp: ${theTemperature} °F`;
    windEl.textContent = `Wind: ${windSpeed} MPH`;
    humidityEl.textContent = `Humidity: ${humidity} %`;
  
    forecastContainer.append(col);
}

// this function creates the times for the start and end of the weekly forecast.//
function displayForecast(weeksForecast) {
    let startDt = dayjs().add(1, 'day').startOf('day').unix();
    let endDt = dayjs().add(6, 'day').startOf('day').unix();
  
    let headingCol = document.createElement('div');
    let heading = document.createElement('h4');
  
    headingCol.setAttribute('class', 'col-12');
    heading.textContent = '5-Day Forecast:';
    headingCol.append(heading);
  
    forecastContainer.innerHTML = '';
    forecastContainer.append(headingCol);
    for (let i = 0; i < weeksForecast.length; i++) {
      if (weeksForecast[i].dt >= startDt && weeksForecast[i].dt < endDt) {
        theForecast(weeksForecast[i]);
      }
    }
}
  
  function renderItems(city, data) {
    currentWeather(city, data.current);
    displayForecast(data.daily);
}

// this function fetches the weather data from the api.//
function getWeather(location) {
  let { lat } = location;
  let { lon } = location;
  let city = location.name;
  let apiUrl = `${weatherApiUrl}/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&appid=${apiKey}`;
  
  fetch(apiUrl)
    .then(function (res) {
     return res.json();
  })
    .then(function (data) {
     renderItems(city, data);
  })
    .catch(function (err) {
     console.error(err);
  });
}
 
//this function fetches the coordinates from the specific city that the user searches.//
function getCoordinates(search) {
  let apiUrl = `${weatherApiUrl}/geo/1.0/direct?q=${search}&limit=5&appid=${apiKey}`;
  
  fetch(apiUrl)
    .then(function (res) {
     return res.json();
  })
    .then(function (data) {
     if (!data[0]) {
      alert('Please enter a valid location');
    } else {
     addToHistory(search);
     getWeather(data[0]);
    }
  })
    .catch(function (err) {
     console.error(err);
  });
}


function searchSubmit(input) {
    if (!userInput.value) {
      return;
    }
  
    input.preventDefault();
    let search = userInput.value.trim();
    getCoordinates(search);
    userInput.value = '';
  }
  
function clickedHistory(output) {
    if (!output.target.matches('.btn-history')) {
      return;
    }
  
    let btn = output.target;
    let search = btn.getAttribute('data-search');
    getCoordinates(search);
  }



// when the initial page loads, it checks the local storage for any stored data and if there is any, 
// displays a button the user can click to show that city's forecast.//
init();
   searchContainer.addEventListener('submit', searchSubmit);
   historyContainer.addEventListener('click', clickedHistory);
