import type { LocationResult } from "../lib/weatherApi"

type SearchBarProps = {
  query: string
  onQueryChange: (value: string) => void
  suggestions: LocationResult[]
  onSelect: (location: LocationResult) => void
  searching: boolean
  onUseMyLocation: () => void
}

export default function SearchBar({
  query,
  onQueryChange,
  suggestions,
  onSelect,
  searching,
  onUseMyLocation,
}: SearchBarProps) {
  return (
    <section className="glass-card search-card">
      <div className="search-row">
        <input
          className="search-input"
          type="text"
          placeholder="Search city or place"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          aria-label="Search location"
        />
        <button type="button" className="ghost-button" onClick={onUseMyLocation}>
          Use my location
        </button>
      </div>

      {searching ? <p className="search-helper">Searching...</p> : null}
      {!searching && query.trim().length >= 2 && suggestions.length === 0 ? (
        <p className="search-helper">No places found</p>
      ) : null}

      {suggestions.length > 0 ? (
        <ul className="search-results">
          {suggestions.map((suggestion) => (
            <li key={suggestion.id}>
              <button type="button" className="search-result" onClick={() => onSelect(suggestion)}>
                <span>{suggestion.name}</span>
                <span className="search-meta">
                  {suggestion.admin1 ? `${suggestion.admin1}, ` : ""}
                  {suggestion.country}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
