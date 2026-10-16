const API_KEY_STORAGE = "skycast-openweathermap-api-key";
const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";

const searchForm = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const searchButton = searchForm.querySelector('button[type="submit"]');
const keyForm = document.querySelector("#key-form");
const keyInput = document.querySelector("#api-key");
const keySummary = document.querySelector("#key-summary");
const apiSettings = document.querySelector("#api-settings");
const notice = document.querySelector("#notice");
const weatherPlaceholder = document.querySelector("#weather-placeholder");
const weatherResult = document.querySelector("#weather-result");

let apiKey = localStorage.getItem(API_KEY_STORAGE) || "";

if (apiKey) {
  keySummary.textContent = "OpenWeatherMap API key connected";
  keyInput.value = apiKey;
  loadWeather(cityInput.value);
} else {
  showNotice("Add your OpenWeatherMap API key below to get started.", "info");
  apiSettings.open = true;
}

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();
  if (!city) {
    showNotice("Enter a city name to search.", "error");
    cityInput.focus();
    return;
  }

  if (!apiKey) {
    showNotice("Add your OpenWeatherMap API key below before searching.", "info");
    apiSettings.open = true;
    keyInput.focus();
    return;
  }

  await loadWeather(city);
});

keyForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submittedKey = keyInput.value.trim();
  if (!submittedKey) {
    showNotice("Enter an API key to connect to OpenWeatherMap.", "error");
    keyInput.focus();
    return;
  }

  apiKey = submittedKey;
  localStorage.setItem(API_KEY_STORAGE, apiKey);
  keySummary.textContent = "OpenWeatherMap API key connected";
  await loadWeather(cityInput.value.trim() || "London");
});

async function loadWeather(city) {
  setLoading(true);
  clearNotice();

  try {
    const url = new URL(WEATHER_URL);
    url.search = new URLSearchParams({
      q: city,
      appid: apiKey,
      units: "metric",
    }).toString();

    const response = await fetch(url);
    const weather = await response.json();

    if (!response.ok) {
      throw new Error(getApiErrorMessage(response.status, weather));
    }

    renderWeather(weather);
  } catch (error) {
    showNotice(
      error instanceof TypeError
        ? "Could not reach the weather service. Check your connection and try again."
        : error.message || "Unable to load weather right now. Please try again.",
      "error",
    );
  } finally {
    setLoading(false);
  }
}

function getApiErrorMessage(status, weather) {
  if (status === 401) {
    return "That API key was not accepted. Check the key and make sure it has been activated.";
  }
  if (status === 404) {
    return `We couldn't find "${weather.message || "that city"}". Check the spelling and try again.`;
  }
  if (status === 429) {
    return "The weather service is receiving too many requests. Please try again shortly.";
  }
  return weather.message
    ? `Weather service error: ${weather.message}.`
    : "Unable to load weather right now. Please try again.";
}

function renderWeather(weather) {
  const description = weather.weather?.[0]?.description;
  const icon = weather.weather?.[0]?.icon;

  if (!weather.name || !Number.isFinite(weather.main?.temp) || !description || !icon) {
    throw new Error("The weather service returned incomplete data. Please try again.");
  }

  document.querySelector("#location-name").textContent = weather.sys?.country
    ? `${weather.name}, ${weather.sys.country}`
    : weather.name;
  document.querySelector("#weather-date").textContent = new Intl.DateTimeFormat(
    undefined,
    { weekday: "long", month: "long", day: "numeric" },
  ).format(new Date());
  document.querySelector("#temperature").textContent = Math.round(weather.main.temp);
  document.querySelector("#humidity").textContent = `${weather.main.humidity}%`;
  document.querySelector("#wind-speed").textContent = `${weather.wind.speed} m/s`;
  document.querySelector("#feels-like").textContent = `${Math.round(weather.main.feels_like)}°`;

  const weatherIcon = document.querySelector("#weather-icon");
  weatherIcon.src = `https://openweathermap.org/img/wn/${encodeURIComponent(icon)}@2x.png`;
  weatherIcon.alt = description;
  document.querySelector("#weather-description").textContent = description;

  weatherPlaceholder.hidden = true;
  weatherResult.hidden = false;
  cityInput.value = weather.name;
}

function setLoading(isLoading) {
  searchButton.disabled = isLoading;
  searchButton.querySelector("span").textContent = isLoading ? "Loading..." : "Search";
  searchForm.setAttribute("aria-busy", String(isLoading));
}

function showNotice(message, type) {
  notice.textContent = message;
  notice.dataset.type = type;
  notice.hidden = false;
}

function clearNotice() {
  notice.textContent = "";
  notice.hidden = true;
  delete notice.dataset.type;
}
