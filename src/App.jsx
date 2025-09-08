import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [city , setCity] = useState("");
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInput = (e) => {
    setCity(e.target.value);
  };

  const fetchCord = async () => {
    setLoading(true);
    setError(null);
    setCoords(null);
    setWeather(null);

    try {
      const data = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=a6cc5b989a4ac84c02a775bd4dbd86a6`);
      const json = await data.json();

      if (json.length === 0) {
        setError("City not found");
        setLoading(false);
        return;
      }

      const { lat, lon } = json[0];
      setCoords({ lat, lon });

      const weatherData = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=a6cc5b989a4ac84c02a775bd4dbd86a6`);
      const weatherJson = await weatherData.json();

      const { temp , humidity } = weatherJson.main;
      const { description, icon } = weatherJson.weather[0];

      setWeather({ temperature: temp, description, icon ,humidity});
    } catch (err) {
      setError("Failed to fetch data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="overlay">
        <h1 className="title">Weather App coderwing</h1>
        <input 
          type="text"
          placeholder="Enter a city name"
          value={city}
          onChange={handleInput}
          className="city-input"
        />
        <button
          onClick={fetchCord}
          disabled={loading}
          className="fetch-btn"
        >
          {loading ? 'Loading...' : 'Get Weather'}
        </button>

        {error && <p className="error-text">{error}</p>}

        {coords && (
          <p className="coords-text">
            Coordinates — Lat: {coords.lat.toFixed(2)}, Lon: {coords.lon.toFixed(2)}
          </p>
        )}

        {weather && (
          <div className="weather-info">
            <p className="temp-text">Temperature: {weather.temperature}°C</p>
            <p className="condition-text">{weather.description}</p>
            <p className="humidity-text">Humidity: {weather.humidity}%</p>
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt={weather.description}
              className="weather-icon"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
