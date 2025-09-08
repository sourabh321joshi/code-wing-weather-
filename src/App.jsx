import { useState } from "react";
import "./App.css"; // import the CSS file

export default function App() {
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    const q = city.trim();
    if (!q) {
      setError("Please enter a city name");
      return;
    }

    setError("");
    setWeather(null);
    setSuggestions([]);
    setLoading(true);

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=10`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError("City not found");
        setLoading(false);
        return;
      }

      const indiaResults = geoData.results.filter((place) => place.country === "India");

      if (indiaResults.length === 0) {
        setError("No Indian city found with this name");
        setLoading(false);
        return;
      }

      if (indiaResults.length === 1) {
        await fetchWeatherForPlace(indiaResults[0]);
      } else {
        setSuggestions(indiaResults);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to search locations");
    } finally {
      setLoading(false);
    }
  }

  async function fetchWeatherForPlace(place) {
    setError("");
    setLoading(true);
    try {
      const { latitude, longitude } = place;
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=Asia%2FKolkata`
      );
      const weatherData = await weatherRes.json();

      setWeather({
        city: place.name,
        admin1: place.admin1 || "",
        country: place.country || "",
        latitude,
        longitude,
        ...weatherData.current_weather,
      });
      setSuggestions([]);
    } catch (e) {
      console.error(e);
      setError("Failed to load weather");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h1>Weather App</h1>

      <div className="search-box">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city (e.g. Indore)"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Get Weather"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {suggestions.length > 0 && (
        <div className="suggestions">
          <div>Multiple places found — pick one:</div>
          <ul>
            {suggestions.map((place, idx) => (
              <li key={idx}>
                <button onClick={() => fetchWeatherForPlace(place)}>
                  {place.name}
                  {place.admin1 ? `, ${place.admin1}` : ""}
                  {place.country ? `, ${place.country}` : ""}
                  {place.latitude && place.longitude
                    ? ` — (${place.latitude.toFixed(2)}, ${place.longitude.toFixed(2)})`
                    : ""}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {weather && (
        <div className="weather-card">
          <h3>
            {weather.city}
            {weather.admin1 ? `, ${weather.admin1}` : ""}{" "}
            {weather.country ? `, ${weather.country}` : ""}
          </h3>
          <div>Temperature: {weather.temperature} °C</div>
          <div>Windspeed: {weather.windspeed} km/h</div>
          <div>Wind Direction: {weather.winddirection}°</div>
          <div>Time: {weather.time}</div>
          <div className="coords">
            Lat: {weather.latitude}, Lon: {weather.longitude}
          </div>
        </div>
      )}
    </div>
  );
}
