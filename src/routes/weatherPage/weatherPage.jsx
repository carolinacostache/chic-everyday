import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Gallery from '../../components/gallery/gallery';
import './WeatherPage.css';

const getWeatherTag = (weatherMain) => {
  switch (weatherMain.toLowerCase()) {
    case 'rain':
    case 'drizzle':
    case 'thunderstorm':
      return 'rainy';
    case 'snow':
      return 'snowy';
    case 'clear':
      return 'sunny';
    case 'clouds':
      return 'cloudy';
    case 'mist':
    case 'fog':
      return 'foggy';
    default:
      return 'outfit';
  }
};

const WeatherPage = () => {
  const [weatherTag, setWeatherTag] = useState(null);
  const [location, setLocation] = useState(null);
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
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}`;
          
          const res = await axios.get(url);
          
          const weatherMain = res.data.weather[0].main;
          const tag = getWeatherTag(weatherMain);
          
          setWeatherTag(tag);
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
      <p>Acestea sunt pin-uri din comunitate etichetate cu tag-ul "{weatherTag}".</p>
      <Gallery search={weatherTag} />
    </div>
  );
};

export default WeatherPage;