import { useState, useEffect } from 'react'
import Login from './components/Login'
import Signup from './components/Signup'
import QuizList from './components/QuizList'
import MyAttempts from './components/MyAttempts'
import TakeQuiz from './components/TakeQuiz'
import AdminPanel from './components/AdminPanel'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [currentView, setCurrentView] = useState('login')
  const [selectedQuiz, setSelectedQuiz] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
      setCurrentView('quizzes')
    }
  }, [])

  const handleLogin = (userData, token) => {
    setUser(userData)
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setCurrentView('quizzes')
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setCurrentView('login')
  }

  const startQuiz = (quiz) => {
    setSelectedQuiz(quiz)
    setCurrentView('quiz')
  }

  const backToQuizzes = () => {
    setSelectedQuiz(null)
    setCurrentView('quizzes')
  }

  return (
    <div className="app">
      <header>
        <h1>Tech Quiz App</h1>
        {user && (
          <div className="user-info">
            <span>Welcome, {user.username}</span>
            {user.role === 'admin' && (
              <button onClick={() => setCurrentView('admin')}>Admin Panel</button>
            )}
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </header>

      <main>
        {!user && currentView === 'login' && (
          <Login onLogin={handleLogin} onSwitch={() => setCurrentView('signup')} />
        )}
        
        {!user && currentView === 'signup' && (
          <Signup onLogin={handleLogin} onSwitch={() => setCurrentView('login')} />
        )}

        {user && currentView === 'quizzes' && (
          <>
            <div style={{display:'flex', gap:'10px', justifyContent:'center', marginBottom:'10px'}}>
              {user.role !== 'admin' && (
                <button onClick={() => setCurrentView('history')}>My Attempts</button>
              )}
            </div>
            <QuizList onStartQuiz={startQuiz} isAdmin={user.role === 'admin'} />
          </>
        )}
        {user && currentView === 'history' && user.role !== 'admin' && (
          <MyAttempts />
        )}

        {user && currentView === 'quiz' && selectedQuiz && (
          <TakeQuiz quiz={selectedQuiz} onBack={backToQuizzes} />
        )}

        {user && currentView === 'admin' && user.role === 'admin' && (
          <AdminPanel onBack={() => setCurrentView('quizzes')} />
        )}
      </main>
    </div>
  )
}

export default App