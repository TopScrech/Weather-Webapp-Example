export type TemperatureUnit = "celsius" | "fahrenheit"

export type LocationResult = {
  id: string
  name: string
  country: string
  admin1: string
  latitude: number
  longitude: number
  timezone: string
}

type ForecastResponse = {
  latitude: number
  longitude: number
  timezone: string
  current: {
    time: string
    temperature_2m: number
    apparent_temperature: number
    relative_humidity_2m: number
    precipitation: number
    weather_code: number
    is_day: number
    cloud_cover: number
    pressure_msl: number
    surface_pressure: number
    wind_speed_10m: number
    wind_direction_10m: number
    wind_gusts_10m: number
    visibility: number
  }
  hourly: {
    time: string[]
    temperature_2m: number[]
    apparent_temperature: number[]
    precipitation_probability: number[]
    precipitation: number[]
    weather_code: number[]
    uv_index: number[]
    relative_humidity_2m: number[]
    wind_speed_10m: number[]
    dew_point_2m: number[]
  }
  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    sunrise: string[]
    sunset: string[]
    precipitation_probability_max: number[]
    uv_index_max: number[]
    moon_phase?: Array<number | null>
  }
}

type AirQualityResponse = {
  current?: {
    us_aqi?: number
    pm2_5?: number
    pm10?: number
    ozone?: number
    carbon_monoxide?: number
    nitrogen_dioxide?: number
    sulphur_dioxide?: number
  }
  hourly: {
    time: string[]
    us_aqi: Array<number | null>
  }
}

export type WeatherBundle = {
  source: "live" | "mock"
  location: LocationResult
  timezone: string
  unit: TemperatureUnit
  current: {
    time: string
    weatherCode: number
    isDay: number
    temp: number
    apparentTemp: number
    humidity: number
    precipitation: number
    cloudCover: number
    pressureMsl: number
    surfacePressure: number
    windSpeed: number
    windDirection: number
    windGusts: number
    visibility: number
    dewPoint: number | null
    uvIndex: number | null
    precipChance: number | null
  }
  hourly: Array<{
    time: string
    weatherCode: number
    temp: number
    apparentTemp: number
    precipChance: number
    precipitation: number
    uvIndex: number
    humidity: number
    windSpeed: number
  }>
  daily: Array<{
    time: string
    weatherCode: number
    tempMax: number
    tempMin: number
    sunrise: string
    sunset: string
    precipChance: number
    uvIndexMax: number
    moonPhase: number | null
  }>
  airQuality: {
    usAqi: number | null
    pm25: number | null
    pm10: number | null
    ozone: number | null
    carbonMonoxide: number | null
    nitrogenDioxide: number | null
    sulphurDioxide: number | null
    hourlyAqi: Array<{
      time: string
      value: number | null
    }>
  }
}

const DEFAULT_SEARCH_LIMIT = 8

async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }
  return (await response.json()) as T
}

function encodeQuery(value: string): string {
  return encodeURIComponent(value.trim())
}

function normalizeLocation(result: {
  id: number
  name: string
  country: string
  admin1?: string
  latitude: number
  longitude: number
  timezone: string
}): LocationResult {
  return {
    id: String(result.id),
    name: result.name,
    country: result.country,
    admin1: result.admin1 ?? "",
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone,
  }
}

export async function searchLocations(query: string): Promise<LocationResult[]> {
  const safe = query.trim()
  if (safe.length < 2) return []

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeQuery(
    safe,
  )}&count=${DEFAULT_SEARCH_LIMIT}&language=en&format=json`

  const data = await fetchJSON<{ results?: Array<Parameters<typeof normalizeLocation>[0]> }>(url)
  return (data.results ?? []).map(normalizeLocation)
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<LocationResult | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`
  const data = await fetchJSON<{ results?: Array<Parameters<typeof normalizeLocation>[0]> }>(url)
  const first = data.results?.[0]
  return first ? normalizeLocation(first) : null
}

function pickCurrentIndex(times: string[], currentTime: string): number {
  const index = times.indexOf(currentTime)
  if (index >= 0) return index

  let closestIndex = 0
  let smallest = Number.POSITIVE_INFINITY
  const currentMs = new Date(currentTime).getTime()

  times.forEach((time, idx) => {
    const distance = Math.abs(new Date(time).getTime() - currentMs)
    if (distance < smallest) {
      smallest = distance
      closestIndex = idx
    }
  })

  return closestIndex
}

function toUnitTemp(celsius: number, unit: TemperatureUnit): number {
  if (unit === "fahrenheit") return celsius * 1.8 + 32
  return celsius
}

function toIsoHoursFromNow(hoursFromNow: number): string {
  return new Date(Date.now() + hoursFromNow * 3600000).toISOString()
}

function toIsoDaysFromNow(daysFromNow: number): string {
  return new Date(Date.now() + daysFromNow * 86400000).toISOString()
}

function withClock(baseIso: string, hour: number, minute: number): string {
  const date = new Date(baseIso)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

function buildMockWeatherBundle(location: LocationResult, unit: TemperatureUnit): WeatherBundle {
  const hourly = Array.from({ length: 36 }, (_, index) => {
    const swing = Math.sin(index / 3) * 4.2
    const tempC = 7.5 + swing
    const precipChance = Math.min(
      95,
      Math.max(5, Math.round(36 + Math.sin(index / 2.4) * 32 + (index % 8 === 0 ? 16 : 0))),
    )
    const precipitation = Number(
      (
        precipChance > 62 ? (precipChance / 100) * 1.9 : (precipChance / 100) * 0.45
      ).toFixed(1),
    )
    const weatherCode = precipChance > 70 ? 61 : precipChance > 45 ? 3 : precipChance > 28 ? 2 : 1

    return {
      time: toIsoHoursFromNow(index),
      weatherCode,
      temp: toUnitTemp(tempC, unit),
      apparentTemp: toUnitTemp(tempC - 1.4, unit),
      precipChance,
      precipitation,
      uvIndex: Math.max(0, Number((Math.sin((index - 6) / 4) * 3.8).toFixed(1))),
      humidity: Math.min(96, Math.max(50, Math.round(73 + Math.sin(index / 2.3) * 18))),
      windSpeed: Number((12 + Math.cos(index / 5) * 6).toFixed(1)),
    }
  })

  const daily = Array.from({ length: 10 }, (_, index) => {
    const wave = Math.sin(index / 2.1)
    const minC = 4 + wave * 2.8
    const maxC = 10.5 + wave * 3.8
    const precipChance = Math.min(96, Math.max(12, Math.round(44 + Math.cos(index / 1.9) * 26)))
    const weatherCode = precipChance > 64 ? 61 : precipChance > 45 ? 3 : precipChance > 30 ? 2 : 1
    const dayIso = toIsoDaysFromNow(index)

    return {
      time: dayIso,
      weatherCode,
      tempMax: toUnitTemp(maxC, unit),
      tempMin: toUnitTemp(minC, unit),
      sunrise: withClock(dayIso, 7, 38 + (index % 5)),
      sunset: withClock(dayIso, 17, 19 - (index % 5)),
      precipChance,
      uvIndexMax: Math.max(1.1, Number((3.2 + Math.sin(index / 3.2) * 2.2).toFixed(1))),
      moonPhase: Number(((0.18 + index * 0.09) % 1).toFixed(2)),
    }
  })

  const current = hourly[0]
  const hourlyAqi = Array.from({ length: 24 }, (_, index) => ({
    time: toIsoHoursFromNow(index),
    value: Math.min(110, Math.max(32, Math.round(58 + Math.sin(index / 4.1) * 21))),
  }))

  return {
    source: "mock",
    location,
    timezone: location.timezone,
    unit,
    current: {
      time: current.time,
      weatherCode: current.weatherCode,
      isDay: 1,
      temp: current.temp,
      apparentTemp: current.apparentTemp,
      humidity: current.humidity,
      precipitation: current.precipitation,
      cloudCover: Math.min(95, Math.max(10, current.precipChance + 12)),
      pressureMsl: 1013,
      surfacePressure: 1010,
      windSpeed: current.windSpeed,
      windDirection: 245,
      windGusts: Number((current.windSpeed + 8.4).toFixed(1)),
      visibility: 12000,
      dewPoint: toUnitTemp(4.1, unit),
      uvIndex: current.uvIndex,
      precipChance: current.precipChance,
    },
    hourly,
    daily,
    airQuality: {
      usAqi: hourlyAqi[0].value,
      pm25: 9.4,
      pm10: 15.8,
      ozone: 72.1,
      carbonMonoxide: 241.2,
      nitrogenDioxide: 21.7,
      sulphurDioxide: 3.9,
      hourlyAqi,
    },
  }
}

export async function fetchWeatherBundle(
  location: LocationResult,
  unit: TemperatureUnit,
): Promise<WeatherBundle> {
  try {
    const speedUnit = unit === "fahrenheit" ? "mph" : "kmh"

    const forecastUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,is_day,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility` +
      `&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,uv_index,relative_humidity_2m,wind_speed_10m,dew_point_2m` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,uv_index_max,moon_phase` +
      `&forecast_days=10&temperature_unit=${unit}&wind_speed_unit=${speedUnit}&timezone=auto`

    const airQualityUrl =
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.latitude}&longitude=${location.longitude}` +
      `&current=us_aqi,pm2_5,pm10,ozone,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide` +
      `&hourly=us_aqi&timezone=auto`

    const [forecast, air] = await Promise.all([
      fetchJSON<ForecastResponse>(forecastUrl),
      fetchJSON<AirQualityResponse>(airQualityUrl),
    ])

    const currentIndex = pickCurrentIndex(forecast.hourly.time, forecast.current.time)

    return {
      source: "live",
      location,
      timezone: forecast.timezone,
      unit,
      current: {
        time: forecast.current.time,
        weatherCode: forecast.current.weather_code,
        isDay: forecast.current.is_day,
        temp: forecast.current.temperature_2m,
        apparentTemp: forecast.current.apparent_temperature,
        humidity: forecast.current.relative_humidity_2m,
        precipitation: forecast.current.precipitation,
        cloudCover: forecast.current.cloud_cover,
        pressureMsl: forecast.current.pressure_msl,
        surfacePressure: forecast.current.surface_pressure,
        windSpeed: forecast.current.wind_speed_10m,
        windDirection: forecast.current.wind_direction_10m,
        windGusts: forecast.current.wind_gusts_10m,
        visibility: forecast.current.visibility,
        dewPoint: forecast.hourly.dew_point_2m[currentIndex] ?? null,
        uvIndex: forecast.hourly.uv_index[currentIndex] ?? null,
        precipChance: forecast.hourly.precipitation_probability[currentIndex] ?? null,
      },
      hourly: forecast.hourly.time.slice(0, 36).map((time, index) => ({
        time,
        weatherCode: forecast.hourly.weather_code[index],
        temp: forecast.hourly.temperature_2m[index],
        apparentTemp: forecast.hourly.apparent_temperature[index],
        precipChance: forecast.hourly.precipitation_probability[index],
        precipitation: forecast.hourly.precipitation[index],
        uvIndex: forecast.hourly.uv_index[index],
        humidity: forecast.hourly.relative_humidity_2m[index],
        windSpeed: forecast.hourly.wind_speed_10m[index],
      })),
      daily: forecast.daily.time.map((time, index) => ({
        time,
        weatherCode: forecast.daily.weather_code[index],
        tempMax: forecast.daily.temperature_2m_max[index],
        tempMin: forecast.daily.temperature_2m_min[index],
        sunrise: forecast.daily.sunrise[index],
        sunset: forecast.daily.sunset[index],
        precipChance: forecast.daily.precipitation_probability_max[index],
        uvIndexMax: forecast.daily.uv_index_max[index],
        moonPhase: forecast.daily.moon_phase?.[index] ?? null,
      })),
      airQuality: {
        usAqi: air.current?.us_aqi ?? null,
        pm25: air.current?.pm2_5 ?? null,
        pm10: air.current?.pm10 ?? null,
        ozone: air.current?.ozone ?? null,
        carbonMonoxide: air.current?.carbon_monoxide ?? null,
        nitrogenDioxide: air.current?.nitrogen_dioxide ?? null,
        sulphurDioxide: air.current?.sulphur_dioxide ?? null,
        hourlyAqi: air.hourly.time.slice(0, 24).map((time, index) => ({
          time,
          value: air.hourly.us_aqi[index] ?? null,
        })),
      },
    }
  } catch {
    return buildMockWeatherBundle(location, unit)
  }
}

export async function detectUserLocation(): Promise<LocationResult | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return null
  }

  const coords = await new Promise<GeolocationCoordinates>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 120000 },
    )
  })

  const resolved = await reverseGeocode(coords.latitude, coords.longitude)
  if (resolved) return resolved

  return {
    id: `${coords.latitude},${coords.longitude}`,
    name: "Current Location",
    country: "",
    admin1: "",
    latitude: coords.latitude,
    longitude: coords.longitude,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
}

export const DEFAULT_LOCATION: LocationResult = {
  id: "groningen",
  name: "Groningen",
  country: "Netherlands",
  admin1: "Groningen",
  latitude: 53.2194,
  longitude: 6.5665,
  timezone: "Europe/Amsterdam",
}
