import { useEffect, useMemo, useState } from "react"
import AirQualityCard from "./components/AirQualityCard"
import CurrentWeatherCard from "./components/CurrentWeatherCard"
import DailyForecast from "./components/DailyForecast"
import HourlyForecast from "./components/HourlyForecast"
import MetricsGrid from "./components/MetricsGrid"
import PrecipitationCard from "./components/PrecipitationCard"
import SearchBar from "./components/SearchBar"
import SunMoonCard from "./components/SunMoonCard"
import {
  DEFAULT_LOCATION,
  detectUserLocation,
  fetchWeatherBundle,
  searchLocations,
  type LocationResult,
  type WeatherBundle,
} from "./lib/weatherApi"

function skyTheme(weather: WeatherBundle | null): string {
  if (!weather) return "sky-default"

  if (weather.current.weatherCode >= 95) return "sky-storm"
  if (weather.current.weatherCode >= 61 && weather.current.weatherCode <= 82) return "sky-rain"
  if (weather.current.weatherCode >= 71 && weather.current.weatherCode <= 86) return "sky-snow"
  if (!weather.current.isDay) return "sky-night"
  if (weather.current.weatherCode <= 2) return "sky-sunny"
  return "sky-cloud"
}

export default function App() {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<LocationResult[]>([])
  const [searching, setSearching] = useState(false)

  const [location, setLocation] = useState<LocationResult>(DEFAULT_LOCATION)
  const unit = "celsius" as const

  const [weather, setWeather] = useState<WeatherBundle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const text = query.trim()
      if (text.length < 2) {
        setSuggestions([])
        setSearching(false)
        return
      }

      try {
        setSearching(true)
        const places = await searchLocations(text)
        setSuggestions(places)
      } catch {
        setSuggestions([])
      } finally {
        setSearching(false)
      }
    }, 350)

    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const payload = await fetchWeatherBundle(location, unit)
        if (!active) return
        setWeather(payload)
      } catch {
        if (!active) return
        setError("Could not load weather data, try another location in a moment")
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [location, unit])

  useEffect(() => {
    let active = true

    async function autoDetect() {
      try {
        const detected = await detectUserLocation()
        if (!active || !detected) return
        setLocation(detected)
      } catch {
        // Geolocation can fail silently if denied
      }
    }

    void autoDetect()

    return () => {
      active = false
    }
  }, [])

  const themeClass = useMemo(() => skyTheme(weather), [weather])
  const showingMock = weather?.source === "mock"

  async function useMyLocation() {
    setError(null)
    try {
      const detected = await detectUserLocation()
      if (!detected) {
        setError("Location access is unavailable on this device")
        return
      }
      setLocation(detected)
      setQuery("")
      setSuggestions([])
    } catch {
      setError("Location permission was denied")
    }
  }

  function selectLocation(nextLocation: LocationResult) {
    setLocation(nextLocation)
    setQuery("")
    setSuggestions([])
    setError(null)
  }

  return (
    <div className={`app-shell ${themeClass}`}>
      <div className="glow-layer" aria-hidden />
      <main className="app-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Weather Atlas</p>
            <h1 className="headline">IWA weather</h1>
          </div>
        </header>

        <SearchBar
          query={query}
          onQueryChange={setQuery}
          suggestions={suggestions}
          onSelect={selectLocation}
          searching={searching}
          onUseMyLocation={useMyLocation}
        />

        {showingMock ? (
          <section className="glass-card error-card">Live weather is unavailable, showing mock data</section>
        ) : null}
        {error ? <section className="glass-card error-card">{error}</section> : null}
        {loading ? <section className="glass-card loading-card">Loading weather data...</section> : null}

        {!loading && weather ? (
          <>
            <CurrentWeatherCard weather={weather} />
            <HourlyForecast weather={weather} />
            <DailyForecast weather={weather} />
            <MetricsGrid weather={weather} />
            <section className="dual-grid">
              <SunMoonCard weather={weather} />
              <AirQualityCard weather={weather} />
            </section>
            <PrecipitationCard weather={weather} />
          </>
        ) : null}
      </main>
    </div>
  )
}
