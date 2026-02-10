import { formatHour, formatTemp, weatherCodeIcon } from "../lib/format"
import type { WeatherBundle } from "../lib/weatherApi"

type HourlyForecastProps = {
  weather: WeatherBundle
}

export default function HourlyForecast({ weather }: HourlyForecastProps) {
  return (
    <section className="glass-card hourly-card">
      <h2>Hourly Forecast</h2>
      <div className="hourly-grid" role="list">
        {weather.hourly.map((hour) => (
          <article className="hourly-item" key={hour.time} role="listitem">
            <p className="hourly-time">{formatHour(hour.time, weather.timezone)}</p>
            <p className="hourly-icon">{weatherCodeIcon(hour.weatherCode, 1)}</p>
            <p className="hourly-temp">{formatTemp(hour.temp)}</p>
            <p className="hourly-rain">🌧 {hour.precipChance}%</p>
          </article>
        ))}
      </div>
    </section>
  )
}
