import { aqiLevel, formatHour } from "../lib/format"
import type { WeatherBundle } from "../lib/weatherApi"

type AirQualityCardProps = {
  weather: WeatherBundle
}

export default function AirQualityCard({ weather }: AirQualityCardProps) {
  const aqi = weather.airQuality.usAqi
  const peak = Math.max(...weather.airQuality.hourlyAqi.map((entry) => entry.value ?? 0), 1)

  return (
    <section className="glass-card air-card">
      <div className="air-header">
        <h2>Air Quality</h2>
        <p className="air-aqi">{aqi != null ? Math.round(aqi) : "--"}</p>
      </div>

      <p className="muted-text">{aqi != null ? aqiLevel(aqi) : "Air quality data unavailable"}</p>

      <div className="air-chart" role="list">
        {weather.airQuality.hourlyAqi.slice(0, 12).map((entry) => {
          const value = entry.value ?? 0
          return (
            <article className="air-bar-wrap" key={entry.time} role="listitem">
              <span className="air-bar" style={{ height: `${Math.max((value / peak) * 100, 5)}%` }} />
              <span className="air-time">{formatHour(entry.time, weather.timezone)}</span>
            </article>
          )
        })}
      </div>

      <div className="pollutants">
        <p>PM2.5: {weather.airQuality.pm25?.toFixed(1) ?? "--"} µg/m³</p>
        <p>PM10: {weather.airQuality.pm10?.toFixed(1) ?? "--"} µg/m³</p>
        <p>Ozone: {weather.airQuality.ozone?.toFixed(1) ?? "--"} µg/m³</p>
      </div>
    </section>
  )
}
