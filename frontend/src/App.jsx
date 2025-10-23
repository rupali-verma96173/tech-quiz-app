import { useState, useEffect } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Login from './components/Login'
import Signup from './components/Signup'
import UserDashboard from './components/UserDashboard'
import AdminDashboard from './components/AdminDashboard'
import TakeQuiz from './components/TakeQuiz'
import './App.css'

// Main App Component with Context
function AppContent() {
  const { user, loading, error, clearError, logout } = useApp()
  const [currentView, setCurrentView] = useState('login')
  const [selectedQuiz, setSelectedQuiz] = useState(null)

  useEffect(() => {
    if (user) {
      // Redirect based on user role
      if (user.role === 'admin') {
        setCurrentView('admin-dashboard')
      } else {
        setCurrentView('user-dashboard')
      }
    } else {
      setCurrentView('login')
    }
  }, [user])

  // Clear error when view changes
  useEffect(() => {
    clearError()
  }, [currentView, clearError])

  const handleLogout = async () => {
    try {
      await logout()
      setCurrentView('login')
    } catch (err) {
      console.error('Logout error:', err)
      // Force logout even if API call fails
      setCurrentView('login')
    }
  }

  const startQuiz = (quiz) => {
    setSelectedQuiz(quiz)
    setCurrentView('quiz')
  }

  const backToDashboard = () => {
    setSelectedQuiz(null)
    if (user?.role === 'admin') {
      setCurrentView('admin-dashboard')
    } else {
      setCurrentView('user-dashboard')
    }
  }

  // Show loading spinner
  if (loading && !user) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header>
        <h1>Tech Quiz App</h1>
        {user && (
          <div className="user-info">
            <span>Welcome, {user.username}</span>
            <span className="user-role">({user.role === 'admin' ? 'Administrator' : 'User'})</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </header>

      <main>
        {/* Global Error Display */}
        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {/* Authentication Views */}
        {!user && currentView === 'login' && (
          <Login onSwitch={() => setCurrentView('signup')} />
        )}
        
        {!user && currentView === 'signup' && (
          <Signup onSwitch={() => setCurrentView('login')} />
        )}

        {/* User Dashboard */}
        {user && currentView === 'user-dashboard' && user.role !== 'admin' && (
          <UserDashboard />
        )}

        {/* Admin Dashboard */}
        {user && currentView === 'admin-dashboard' && user.role === 'admin' && (
          <AdminDashboard />
        )}

        {/* Quiz Taking View */}
        {user && currentView === 'quiz' && selectedQuiz && (
          <TakeQuiz quiz={selectedQuiz} onBack={backToDashboard} />
        )}
      </main>
    </div>
  )
}

// App with Provider Wrapper
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App