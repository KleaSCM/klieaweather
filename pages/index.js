import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/Home.module.css'; 

const Home = () => {
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [image, setImage] = useState(null);
  const [isFormComplete, setIsFormComplete] = useState(false);

  const fetchWeatherData = async () => {
    try {
      const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: {
          q: `${city},${state},${country}`,
          zip: zip,
          appid: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
          units: 'metric'
        }
      });
      const weather = weatherResponse.data;

      const icon = weather.weather[0].icon;
      const dayOrNight = icon.includes('d') ? 'day' : 'night';

      const imageResponse = await axios.get(`https://api.unsplash.com/search/photos`, {
        params: {
          query: `${city} ${dayOrNight}`,
          client_id: process.env.NEXT_PUBLIC_UNSPLASH_API_KEY,
        }
      });

      const imageUrl = imageResponse.data.results.length > 0 
        ? imageResponse.data.results[0].urls.regular 
        : null;

      const timezoneOffsetInSeconds = weather.timezone;
      const localTime = new Date(new Date().getTime() + timezoneOffsetInSeconds * 1000).toUTCString().replace(/ GMT$/, '');

      setWeatherData({
        city: city,
        state: state,
        country: country,
        description: weather.weather[0].description,
        temperature: weather.main.temp,
        icon: `http://openweathermap.org/img/wn/${icon}.png`,
        time: localTime,
      });

      setImage(imageUrl);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setWeatherData(null);
      setImage(null);
    }
  };

  const getWeather = () => {
    if (country && state && city && zip) {
      fetchWeatherData();
      setIsFormComplete(true);
    }
  };

  useEffect(() => {
    if (isFormComplete) {
      fetchWeatherData();
    }
  }, [isFormComplete]);

  return (
    <div className={styles.container} style={{ backgroundImage: `url(${image})` }}>
      <h1>Weather App</h1>
      <div className={styles.inputContainer}>
        <input
          type="text"
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className={styles.input}
        />
        <input
          type="text"
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className={styles.input}
        />
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className={styles.input}
        />
        <input
          type="text"
          placeholder="Zip Code"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          className={styles.input}
        />
        <button onClick={getWeather} className={styles.button}>Get Weather</button>
      </div>
      {isFormComplete && weatherData && (
        <div className={styles.weatherInfo}>
          <h2>{weatherData.city}, {weatherData.state}, {weatherData.country}</h2>
          <p>{weatherData.time}</p>
          <p>{weatherData.description}</p>
          <p>{weatherData.temperature}°C</p>
          <img src={weatherData.icon} alt="Weather icon" />
        </div>
      )}
    </div>
  );
}

export default Home;
