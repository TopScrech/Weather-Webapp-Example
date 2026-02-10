import { formatFullDate, formatTemp, weatherCodeIcon, weatherCodeLabel } from "../lib/format"
import type { WeatherBundle } from "../lib/weatherApi"

type CurrentWeatherCardProps = {
  weather: WeatherBundle
}

export default function CurrentWeatherCard({ weather }: CurrentWeatherCardProps) {
  const today = weather.daily[0]

  return (
    <section className="glass-card current-card">
      <div className="current-heading">
        <div>
          <h1>{weather.location.name}</h1>
          <p className="muted-text">{formatFullDate(weather.current.time, weather.timezone)}</p>
        </div>
        <p className="condition-chip">{weatherCodeLabel(weather.current.weatherCode)}</p>
      </div>

      <div className="current-main">
        <p className="current-icon" aria-hidden>
          {weatherCodeIcon(weather.current.weatherCode, weather.current.isDay)}
        </p>
        <div>
          <p className="current-temp">{formatTemp(weather.current.temp)}</p>
          <p className="muted-text">
            Feels like {formatTemp(weather.current.apparentTemp)} • H:{formatTemp(today.tempMax)} L:{formatTemp(today.tempMin)}
          </p>
        </div>
      </div>

      <div className="current-summary">
        <p>
          {weather.current.precipChance ?? 0}% chance of precipitation with {weather.current.cloudCover}% cloud cover
        </p>
        <p>
          Visibility {(weather.current.visibility / 1000).toFixed(1)} km
        </p>
      </div>
    </section>
  )
}
