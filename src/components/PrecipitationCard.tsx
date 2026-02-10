import { formatHour } from "../lib/format"
import type { WeatherBundle } from "../lib/weatherApi"

type PrecipitationCardProps = {
  weather: WeatherBundle
}

export default function PrecipitationCard({ weather }: PrecipitationCardProps) {
  const hours = weather.hourly.slice(0, 12)
  const maxPrecip = Math.max(...hours.map((hour) => hour.precipitation), 1)

  return (
    <section className="glass-card rain-card">
      <h2>Rain Outlook</h2>
      <div className="rain-grid" role="list">
        {hours.map((hour) => (
          <article className="rain-column" key={hour.time} role="listitem">
            <span className="rain-bar" style={{ height: `${Math.max((hour.precipitation / maxPrecip) * 100, 4)}%` }} />
            <span className="rain-mm">{hour.precipitation.toFixed(1)}</span>
            <span className="rain-time">{formatHour(hour.time, weather.timezone)}</span>
          </article>
        ))}
      </div>
      <p className="muted-text">Precipitation in millimeters for the next 12 hours</p>
    </section>
  )
}
