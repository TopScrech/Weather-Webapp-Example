export function formatTemp(value: number): string {
  return `${Math.round(value)}°`
}

export function formatHour(time: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: true,
    timeZone: timezone,
  }).format(new Date(time))
}

export function formatShortDay(time: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: timezone,
  }).format(new Date(time))
}

export function formatFullDate(time: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  }).format(new Date(time))
}

export function formatClock(time: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  }).format(new Date(time))
}

export function weatherCodeLabel(weatherCode: number): string {
  if (weatherCode === 0) return "Clear"
  if (weatherCode === 1) return "Mostly Clear"
  if (weatherCode === 2) return "Partly Cloudy"
  if (weatherCode === 3) return "Cloudy"
  if (weatherCode === 45 || weatherCode === 48) return "Fog"
  if (weatherCode === 51 || weatherCode === 53 || weatherCode === 55) return "Drizzle"
  if (weatherCode === 61 || weatherCode === 63 || weatherCode === 65) return "Rain"
  if (weatherCode === 66 || weatherCode === 67) return "Freezing Rain"
  if (weatherCode === 71 || weatherCode === 73 || weatherCode === 75) return "Snow"
  if (weatherCode === 77) return "Snow Grains"
  if (weatherCode === 80 || weatherCode === 81 || weatherCode === 82) return "Rain Showers"
  if (weatherCode === 85 || weatherCode === 86) return "Snow Showers"
  if (weatherCode === 95) return "Thunderstorm"
  if (weatherCode === 96 || weatherCode === 99) return "Storm with Hail"
  return "Unknown"
}

export function weatherCodeIcon(weatherCode: number, isDay: number): string {
  if (weatherCode === 0) return isDay ? "☀️" : "🌙"
  if (weatherCode === 1 || weatherCode === 2) return isDay ? "🌤️" : "☁️"
  if (weatherCode === 3) return "☁️"
  if (weatherCode === 45 || weatherCode === 48) return "🌫️"
  if (weatherCode >= 51 && weatherCode <= 67) return "🌧️"
  if ((weatherCode >= 71 && weatherCode <= 77) || weatherCode === 85 || weatherCode === 86) return "❄️"
  if (weatherCode >= 80 && weatherCode <= 82) return "🌦️"
  if (weatherCode >= 95) return "⛈️"
  return "🌡️"
}

export function uvLevel(value: number): string {
  if (value <= 2) return "Low"
  if (value <= 5) return "Moderate"
  if (value <= 7) return "High"
  if (value <= 10) return "Very High"
  return "Extreme"
}

export function aqiLevel(value: number): string {
  if (value <= 50) return "Good"
  if (value <= 100) return "Moderate"
  if (value <= 150) return "Unhealthy for Sensitive Groups"
  if (value <= 200) return "Unhealthy"
  if (value <= 300) return "Very Unhealthy"
  return "Hazardous"
}

export function moonPhaseLabel(value: number | null): string {
  if (value == null) return "Not available"
  if (value < 0.03 || value > 0.97) return "New Moon"
  if (value < 0.22) return "Waxing Crescent"
  if (value < 0.28) return "First Quarter"
  if (value < 0.47) return "Waxing Gibbous"
  if (value < 0.53) return "Full Moon"
  if (value < 0.72) return "Waning Gibbous"
  if (value < 0.78) return "Last Quarter"
  return "Waning Crescent"
}

export function toCompass(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
  const index = Math.round(degrees / 45) % 8
  return directions[index]
}
