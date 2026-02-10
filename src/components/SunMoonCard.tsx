import { formatClock, moonPhaseLabel } from "../lib/format"
import type { WeatherBundle } from "../lib/weatherApi"

type SunMoonCardProps = {
  weather: WeatherBundle
}

function daylightProgress(now: string, sunrise: string, sunset: string): number {
  const nowMs = new Date(now).getTime()
  const sunriseMs = new Date(sunrise).getTime()
  const sunsetMs = new Date(sunset).getTime()

  if (nowMs <= sunriseMs) return 0
  if (nowMs >= sunsetMs) return 100

  return ((nowMs - sunriseMs) / (sunsetMs - sunriseMs)) * 100
}

export default function SunMoonCard({ weather }: SunMoonCardProps) {
  const today = weather.daily[0]
  const progress = daylightProgress(weather.current.time, today.sunrise, today.sunset)

  return (
    <section className="glass-card sun-card">
      <h2>Sun and Moon</h2>
      <div className="sun-grid">
        <div>
          <p className="muted-text">Sunrise</p>
          <p className="sun-time">{formatClock(today.sunrise, weather.timezone)}</p>
        </div>
        <div>
          <p className="muted-text">Sunset</p>
          <p className="sun-time">{formatClock(today.sunset, weather.timezone)}</p>
        </div>
      </div>

      <div className="sun-track">
        <span className="sun-fill" style={{ width: `${progress}%` }} />
      </div>

      <p className="muted-text">Moon phase: {moonPhaseLabel(today.moonPhase)}</p>
    </section>
  )
}
