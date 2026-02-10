import { formatShortDay, formatTemp, weatherCodeIcon, weatherCodeLabel } from "../lib/format"
import type { WeatherBundle } from "../lib/weatherApi"

type DailyForecastProps = {
  weather: WeatherBundle
}

export default function DailyForecast({ weather }: DailyForecastProps) {
  const minTemp = Math.min(...weather.daily.map((day) => day.tempMin))
  const maxTemp = Math.max(...weather.daily.map((day) => day.tempMax))
  const range = Math.max(maxTemp - minTemp, 1)

  return (
    <section className="glass-card daily-card">
      <h2>10-Day Forecast</h2>
      <div className="daily-list">
        {weather.daily.map((day) => {
          const left = ((day.tempMin - minTemp) / range) * 100
          const width = ((day.tempMax - day.tempMin) / range) * 100

          return (
            <article className="daily-item" key={day.time}>
              <p className="daily-day">{formatShortDay(day.time, weather.timezone)}</p>
              <p className="daily-icon">{weatherCodeIcon(day.weatherCode, 1)}</p>
              <p className="daily-label">{weatherCodeLabel(day.weatherCode)}</p>
              <p className="daily-low">{formatTemp(day.tempMin)}</p>
              <div className="daily-range-track">
                <span className="daily-range-fill" style={{ left: `${left}%`, width: `${width}%` }} />
              </div>
              <p className="daily-high">{formatTemp(day.tempMax)}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
