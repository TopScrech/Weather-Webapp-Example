import { aqiLevel, formatTemp, toCompass, uvLevel } from "../lib/format"
import type { WeatherBundle } from "../lib/weatherApi"

type MetricsGridProps = {
  weather: WeatherBundle
}

export default function MetricsGrid({ weather }: MetricsGridProps) {
  const speedUnit = "km/h"

  const metrics: Array<{ label: string; value: string; hint: string }> = [
    {
      label: "UV Index",
      value: weather.current.uvIndex != null ? weather.current.uvIndex.toFixed(1) : "--",
      hint: weather.current.uvIndex != null ? uvLevel(weather.current.uvIndex) : "Unavailable",
    },
    {
      label: "Humidity",
      value: `${weather.current.humidity}%`,
      hint: "Relative humidity",
    },
    {
      label: "Dew Point",
      value: weather.current.dewPoint != null ? formatTemp(weather.current.dewPoint) : "--",
      hint: "Moisture saturation point",
    },
    {
      label: "Wind",
      value: `${Math.round(weather.current.windSpeed)} ${speedUnit}`,
      hint: `${toCompass(weather.current.windDirection)} with gusts ${Math.round(weather.current.windGusts)} ${speedUnit}`,
    },
    {
      label: "Pressure",
      value: `${Math.round(weather.current.pressureMsl)} hPa`,
      hint: "Mean sea-level pressure",
    },
    {
      label: "Air Quality",
      value: weather.airQuality.usAqi != null ? `${Math.round(weather.airQuality.usAqi)} US AQI` : "--",
      hint: weather.airQuality.usAqi != null ? aqiLevel(weather.airQuality.usAqi) : "Unavailable",
    },
  ]

  return (
    <section className="metrics-grid">
      {metrics.map((metric) => (
        <article className="glass-card metric-card" key={metric.label}>
          <h3>{metric.label}</h3>
          <p className="metric-value">{metric.value}</p>
          <p className="muted-text">{metric.hint}</p>
        </article>
      ))}
    </section>
  )
}
