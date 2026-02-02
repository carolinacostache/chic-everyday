import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Gallery from '../../components/gallery/gallery';
import './WeatherPage.css';

const getWeatherTag = (weatherMain, temp) => {
  const condition = weatherMain.toLowerCase();

  // 1. Prioritate: Precipitații (Umbrelă/Impermeabil)
  if (['rain', 'drizzle', 'thunderstorm'].includes(condition)) {
    return 'rainy';
  }

  // 2. Prioritate: Zăpadă
  if (condition === 'snow') {
    return 'snowy'; // sau 'winter'
  }

  // 3. Prioritate: Temperatura
  // Dacă e frig (sub 10 grade), e "winter", chiar dacă cerul e "Clear"
  if (temp < 10) {
    return 'winter';
  }

  // Dacă e foarte cald (peste 25 grade), e "summer"
  if (temp > 25) {
    return 'summer';
  }

  // 4. Zona Moderată (10°C - 25°C)
  if (condition === 'clear') {
    return 'sunny';
  }
  
  if (condition === 'clouds') {
    return 'cloudy';
  }

  if (['mist', 'fog', 'haze'].includes(condition)) {
    return 'foggy';
  }

  return 'casual'; // Fallback
};

const WeatherPage = () => {
  const [weatherTag, setWeatherTag] = useState(null);
  const [location, setLocation] = useState(null);
  const [displayData, setDisplayData] = useState({ temp: null, condition: '' });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocația nu este suportată de browser-ul tău.');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => {
        setError('Nu am putut prelua locația. Permite accesul la locație pentru a vedea ținute.');
        setIsLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    if (location) {
      const fetchWeather = async () => {
        try {
          const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}&units=metric`;
          
          const res = await axios.get(url);
          
          const weatherMain = res.data.weather[0].main;
          const temp = res.data.main.temp;
          const tag = getWeatherTag(weatherMain, temp);
          
          setWeatherTag(tag);
          setDisplayData({ temp: Math.round(temp), condition: weatherMain });
        } catch (err) {
          setError('Nu am putut prelua starea vremii.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchWeather();
    }
  }, [location]);

  if (isLoading) {
    return <div className="weatherLoading">Se preiau datele despre vreme...</div>;
  }

  if (error) {
    return <div className="weatherError">{error}</div>;
  }

  return (
    <div className="weatherPage">
      <h2>Ținute recomandate pentru vremea de azi (tag: "{weatherTag}")</h2>
      <div className="weatherCurrentInfo">
             <span className="tempDisplay">{displayData.temp}°C ~ </span>
             <span className="condDisplay">{displayData.condition}</span>
          </div>
          <p>
            Vremea cere ținute <strong>{weatherTag}</strong>. 
            <br/>Iată ce am selectat pentru tine, bazat pe stilul tău:
          </p>
      {weatherTag && (
        <Gallery type="weather" tag={weatherTag} />
      )}
    </div>
  );
};

export default WeatherPage;