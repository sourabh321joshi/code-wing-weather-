import { useState } from "react";

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
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          q
        )}&count=10`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError("City not found");
        setLoading(false);
        return;
      }

      // FILTER only Indian cities
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
      setSuggestions([]); // clear suggestions once user picked
    } catch (e) {
      console.error(e);
      setError("Failed to load weather");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 700 }}>
      <h1>Weather App </h1>

      <div style={{ marginBottom: 12 }}>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city (e.g. Indore)"
          style={{ padding: 8, width: 300, marginRight: 8 }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Get Weather"}
        </button>
      </div>

      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}

      {suggestions.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ marginBottom: 6 }}>Multiple places found — pick one:</div>
          <ul style={{ paddingLeft: 18 }}>
            {suggestions.map((place, idx) => (
              <li key={idx} style={{ marginBottom: 6 }}>
                <button
                  onClick={() => fetchWeatherForPlace(place)}
                  style={{ cursor: "pointer" }}
                >
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
        <div
          style={{
            border: "1px solid #ddd",
            padding: 12,
            borderRadius: 6,
            marginTop: 8,
            maxWidth: 420,
          }}
        >
          <h3 style={{ margin: "0 0 8px 0" }}>
            {weather.city}
            {weather.admin1 ? `, ${weather.admin1}` : ""}{" "}
            {weather.country ? `, ${weather.country}` : ""}
          </h3>
          <div>Temperature: {weather.temperature} °C</div>
          <div>Windspeed: {weather.windspeed} km/h</div>
          <div>Wind Direction: {weather.winddirection}°</div>
          <div>Time: {weather.time}</div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
            Lat: {weather.latitude}, Lon: {weather.longitude}
          </div>
        </div>
      )}
    </div>
  );
}
