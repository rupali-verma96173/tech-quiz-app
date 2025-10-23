import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import QuizList from './QuizList'
import MyAttempts from './MyAttempts'
import TakeQuiz from './TakeQuiz'

function UserDashboard() {
  const { user, fetchQuizzes, fetchAttempts, quizzes, attempts, loading } = useApp()
  const [currentView, setCurrentView] = useState('quizzes')
  const [selectedQuiz, setSelectedQuiz] = useState(null)

  useEffect(() => {
    if (user && user.role !== 'admin') {
      fetchQuizzes()
      fetchAttempts()
    }
  }, [user, fetchQuizzes, fetchAttempts])

  const startQuiz = (quiz) => {
    setSelectedQuiz(quiz)
    setCurrentView('quiz')
  }

  const backToQuizzes = () => {
    setSelectedQuiz(null)
    setCurrentView('quizzes')
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h2>Welcome to your Dashboard, {user?.username}!</h2>
        <p>Choose what you'd like to do:</p>
      </div>

      <div className="dashboard-nav">
        <button 
          onClick={() => setCurrentView('quizzes')}
          className={currentView === 'quizzes' ? 'active' : ''}
        >
          Browse Quizzes
        </button>
        <button 
          onClick={() => setCurrentView('attempts')}
          className={currentView === 'attempts' ? 'active' : ''}
        >
          My Attempts ({attempts?.length || 0})
        </button>
      </div>

      <div className="dashboard-content">
        {currentView === 'quizzes' && (
          <div className="quizzes-section">
            <h3>Available Quizzes</h3>
            <QuizList onStartQuiz={startQuiz} isAdmin={false} />
          </div>
        )}

        {currentView === 'attempts' && (
          <div className="attempts-section">
            <h3>Your Quiz Attempts</h3>
            <MyAttempts />
          </div>
        )}

        {currentView === 'quiz' && selectedQuiz && (
          <div className="quiz-section">
            <TakeQuiz quiz={selectedQuiz} onBack={backToQuizzes} />
          </div>
        )}
      </div>
    </div>
  )
}

export default UserDashboard
