import { useEffect, useRef, useState } from 'react'

function SearchBar({ username, setUsername, onSearch }) {
  const [suggestions, setSuggestions] = useState([])
  const [suggestionsVisible, setSuggestionsVisible] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [suggestionError, setSuggestionError] = useState('')
  const [highlight, setHighlight] = useState(-1)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  const cacheRef = useRef(new Map())

  

  useEffect(() => {
    const query = username.trim()

    if (!query) {
      setSuggestions([])
      setSuggestionError('')
      setLoadingSuggestions(false)
      return
    }

    // use cached if available and offline
    const cached = cacheRef.current.get(query.toLowerCase())
    if (!navigator.onLine && cached) {
      setSuggestions(cached)
      setSuggestionError('Offline — showing cached results')
      return
    }

    const controller = new AbortController()

    const timer = setTimeout(async () => {
      setLoadingSuggestions(true)
      setSuggestionError('')

      try {
        const perPage = 50
        const response = await fetch(
          `https://api.github.com/search/users?q=${encodeURIComponent(query)}&per_page=${perPage}&page=1`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          if (response.status === 403) throw new Error('API rate limit exceeded')
          throw new Error('Could not load suggestions')
        }

        const result = await response.json()
        const items = result.items ?? []
        const names = items.map((item) => item.login)
        const unique = Array.from(new Set(names))
        const filtered = unique.filter((login) => login.toLowerCase().includes(query.toLowerCase()))

        setSuggestions(filtered)
        setCurrentPage(1)
        setHasMore(result.total_count > perPage)
        setTotalCount(result.total_count ?? 0)
        cacheRef.current.set(query.toLowerCase(), filtered)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setSuggestionError(navigator.onLine ? 'Unable to load suggestions' : 'Offline')
          setSuggestions(cached ?? [])
        }
      } finally {
        setLoadingSuggestions(false)
      }
    }, 220)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [username])

  const handleSubmit = (event) => {
    event.preventDefault()
    setSuggestionsVisible(false)
    onSearch(username)
  }

  const handleInputChange = (event) => {
    setUsername(event.target.value)
    setSuggestionsVisible(true)
    setHighlight(-1)
    setCurrentPage(1)
    setHasMore(false)
    setTotalCount(0)
  }

  const handleLoadMore = async () => {
    if (!hasMore || loadingSuggestions) return

    setLoadingSuggestions(true)
    setSuggestionError('')

    try {
      const nextPage = currentPage + 1
      const perPage = 50
      const response = await fetch(
        `https://api.github.com/search/users?q=${encodeURIComponent(username.trim())}&per_page=${perPage}&page=${nextPage}`
      )

      if (!response.ok) {
        if (response.status === 403) throw new Error('API rate limit exceeded')
        throw new Error('Could not load more suggestions')
      }

      const result = await response.json()
      const items = result.items ?? []
      const newNames = items.map((item) => item.login)
      setSuggestions((prev) => {
        const merged = Array.from(new Set([...prev, ...newNames]))
        return merged.filter((login) => login.toLowerCase().includes(username.trim().toLowerCase()))
      })
      setCurrentPage(nextPage)
      setHasMore(totalCount > nextPage * perPage)
    } catch (err) {
      setSuggestionError(err.message)
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const handleSelectSuggestion = (suggestion) => {
    setUsername(suggestion)
    setSuggestionsVisible(false)
    onSearch(suggestion)
  }

  const handleClear = () => {
    setUsername('')
    setSuggestions([])
    setSuggestionsVisible(false)
    setSuggestionError('')
  }

  const handleBlur = () => {
    window.setTimeout(() => setSuggestionsVisible(false), 120)
  }

  const handleKeyDown = (e) => {
    if (!suggestionsVisible) return
    const visibleLen = suggestions.length

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, visibleLen - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      if (highlight >= 0 && highlight < visibleLen) {
        e.preventDefault()
        handleSelectSuggestion(suggestions[highlight])
      }
    } else if (e.key === 'Escape') {
      setSuggestionsVisible(false)
    }
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <input
          type="text"
          value={username}
          placeholder="Enter GitHub username"
          onChange={handleInputChange}
          onFocus={() => setSuggestionsVisible(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />

        {username && (
          <button type="button" className="clear-btn" onClick={handleClear} aria-label="Clear">×</button>
        )}

        {suggestionsVisible && (
          <ul className="suggestions-list">
            {loadingSuggestions && <li className="suggestion-item suggestion-loading">Loading suggestions...</li>}

            {suggestionError && <li className="suggestion-item suggestion-error">{suggestionError}</li>}

            {!loadingSuggestions && !suggestionError && suggestions.length === 0 && (
              <li className="suggestion-item suggestion-error">No matches found</li>
            )}

            {!loadingSuggestions && !suggestionError && suggestions.map((s, i) => (
              <li
                key={s}
                className={"suggestion-item" + (i === highlight ? ' suggestion-active' : '')}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => handleSelectSuggestion(s)}
              >
                {s}
              </li>
            ))}

            {hasMore && !loadingSuggestions && !suggestionError && (
              <li className="suggestion-item suggestion-load-more">
                <button
                  type="button"
                  className="load-more-btn"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={handleLoadMore}
                >
                  Load more ({Math.min(50, totalCount - suggestions.length)} more)
                </button>
              </li>
            )}

            {totalCount > suggestions.length && (
              <li className="suggestion-item suggestion-count">Showing {suggestions.length} of {totalCount} results</li>
            )}
          </ul>
        )}
      </div>

      <button type="submit">Search</button>
    </form>
  )
}

export default SearchBar
