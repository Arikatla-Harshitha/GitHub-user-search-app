import { useEffect, useState } from 'react'
import SearchBar from './components/SearchBar.jsx'
import UserCard from './components/UserCard.jsx'
import Loader from './components/Loader.jsx'

function App() {
  const [username, setUsername] = useState('')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode)
    return () => document.body.classList.remove('dark')
  }, [darkMode])

  useEffect(() => {
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  const fetchGitHubUser = async (username) => {
    setLoading(true)
    setError('')
    setUser(null)

    try {
      const response = await fetch(`https://api.github.com/users/${username}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found. Try another username.')
        }
        throw new Error('Something went wrong. Please try again.')
      }

      const userData = await response.json()
      setUser(userData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (searchUsername) => {
    if (!searchUsername.trim()) {
      setError('Please enter a GitHub username.')
      return
    }
    fetchGitHubUser(searchUsername.trim())
  }

  return (
    <div className={darkMode ? 'app dark' : 'app'}>
      <div className="container">
        <header className="header">
          <div>
            <h1>GitHub User Search</h1>
            <p>Search GitHub profiles and view user details instantly.</p>
          </div>
          <button className="theme-toggle" onClick={() => setDarkMode((prev) => !prev)}>
            {darkMode ? 'Switch to Light' : 'Switch to Dark'}
          </button>
        </header>

        <SearchBar
          username={username}
          setUsername={setUsername}
          onSearch={handleSearch}
        />

        {!isOnline && (
          <p className="message">You are offline — search will use cached suggestions if available.</p>
        )}

        {loading && <Loader />}

        {error && <p className="message error">{error}</p>}

        {user && !loading && !error && <UserCard user={user} />}
      </div>
    </div>
  )
}

export default App
