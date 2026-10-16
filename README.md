# Skycast weather app

A responsive, browser-based current weather app powered by the OpenWeatherMap
Current Weather API.

## Run locally

Open `index.html` in a browser. No build step or package installation is needed.

## Connect an API key

1. Create a free API key at [OpenWeatherMap](https://openweathermap.org/api).
2. Expand **Connect your OpenWeatherMap API key** in the app, paste the key,
   and select **Save key**.
3. Search for a city to view its current conditions.

The API key is stored in this browser's local storage so it remains available
after a refresh. Because this is a client-side app, the key is sent from your
browser to OpenWeatherMap and should not be treated as a secret. Remove it from
the browser's local storage to disconnect it.
