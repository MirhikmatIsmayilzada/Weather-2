import React, { useState } from "react";
import axios from "axios";

const API_KEY = "00b7a6d4718d40dfb4164341250309";

export default function WeatherApp() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [askLocation, setAskLocation] = useState(true);

  const fetchWeatherByCity = async (cityName) => {
    if (!cityName.trim()) {
      setError("Şəhər daxil edin.");
      return;
    }
    setError("");
    setLoading(true);
    setWeather(null);

    try {
      const res = await axios.get(`https://api.weatherapi.com/v1/forecast.json`, {
        params: {
          key: API_KEY,
          q: cityName,
          days: 5,
          aqi: "no",
          alerts: "no",
        },
      });

      setWeather({
        city: res.data.location.name,
        country: res.data.location.country,
        currentTemp: res.data.current.temp_c,
        conditionText: res.data.current.condition.text,
        conditionIcon: res.data.current.condition.icon,
        forecast: res.data.forecast.forecastday,
      });
      setCity(res.data.location.name);
    } catch (err) {
      setError("Xəta baş verdi. Yenidən cəhd edin.");
    } finally {
      setLoading(false);
    }
  };

  const handleUseLocation = () => {
    setAskLocation(false);
    if (!navigator.geolocation) {
      setError("Brauzeriniz geolokasiyanı dəstəkləmir.");
      return;
    }
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const locRes = await axios.get(
            "https://api.weatherapi.com/v1/search.json",
            {
              params: {
                key: API_KEY,
                q: `${latitude},${longitude}`,
              },
            }
          );

          if (locRes.data.length === 0) {
            setError("Mövqe tapılmadı.");
            setLoading(false);
            return;
          }

          const placeName = locRes.data[0].name;
          fetchWeatherByCity(placeName);
        } catch (err) {
          setError("Mövqe məlumatı alınarkən xəta baş verdi.");
          setLoading(false);
        }
      },
      (err) => {
        setError("Mövqeni almaq mümkün olmadı.");
        setLoading(false);
      }
    );
  };

  const handleDeclineLocation = () => {
    setAskLocation(false);
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 p-6 bg-white rounded-lg shadow-md text-gray-900 font-sans min-h-[400px]">
      <h1 className="text-2xl font-semibold mb-6 text-center">Hava Proqnozu</h1>

      {askLocation ? (
        <div className="text-center space-y-6">
          <p className="text-lg font-medium">
            Sayta yerləşdiyiniz mövqeyə əsasən hava proqnozu göstərilsin?
          </p>
          <div className="flex justify-center space-x-6">
            <button
              onClick={handleUseLocation}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md"
            >
              Bəli
            </button>
            <button
              onClick={handleDeclineLocation}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-6 py-2 rounded-md"
            >
              Yox
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex mb-5">
            <input
              type="text"
              placeholder="Şəhər daxil edin"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  fetchWeatherByCity(city);
                }
              }}
              className="flex-grow p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => fetchWeatherByCity(city)}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 rounded-r-md disabled:opacity-50"
            >
              {loading ? "Yüklənir..." : "Axtar"}
            </button>
          </div>

          {error && (
            <p className="text-red-600 text-center mb-4 font-medium">{error}</p>
          )}

          {weather && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold">
                  {weather.city}, {weather.country}
                </h2>
                <div className="flex justify-center items-center mt-3 space-x-4">
                  <img
                    src={weather.conditionIcon}
                    alt={weather.conditionText}
                    className="w-20 h-20"
                  />
                  <div>
                    <p className="text-5xl font-bold">
                      {Math.round(weather.currentTemp)}°C
                    </p>
                    <p className="text-gray-700 mt-1">{weather.conditionText}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between space-x-4 overflow-hidden">
                {weather.forecast.map((day) => {
                  const date = new Date(day.date);
                  const dayName = date
                    .toLocaleDateString("az-AZ", { weekday: "short" })
                    .toUpperCase();

                  return (
                    <div
                      key={day.date}
                      className="flex flex-col items-center bg-gray-100 rounded-lg p-5 min-w-[100px]"
                    >
                      <span className="font-semibold mb-2">{dayName}</span>
                      <img
                        src={day.day.condition.icon}
                        alt={day.day.condition.text}
                        className="w-14 h-14"
                      />
                      <span className="mt-2 font-medium text-lg">
                        {Math.round(day.day.avgtemp_c)}°C
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
