import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import QuizList from './QuizList'
import AdminPanel from './AdminPanel'
import TakeQuiz from './TakeQuiz'

function AdminDashboard() {
  const { user, fetchAdminQuizzes, quizzes, loading } = useApp()
  const [currentView, setCurrentView] = useState('admin-panel')
  const [selectedQuiz, setSelectedQuiz] = useState(null)

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminQuizzes()
    }
  }, [user, fetchAdminQuizzes])

  const startQuiz = (quiz) => {
    setSelectedQuiz(quiz)
    setCurrentView('quiz')
  }

  const backToAdmin = () => {
    setSelectedQuiz(null)
    setCurrentView('admin-panel')
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <p>Welcome, {user?.username}! Manage your quizzes and system.</p>
      </div>

      <div className="dashboard-nav">
        <button 
          onClick={() => setCurrentView('admin-panel')}
          className={currentView === 'admin-panel' ? 'active' : ''}
        >
          Manage Quizzes
        </button>
        <button 
          onClick={() => setCurrentView('quizzes')}
          className={currentView === 'quizzes' ? 'active' : ''}
        >
          View All Quizzes
        </button>
      </div>

      <div className="dashboard-content">
        {currentView === 'admin-panel' && (
          <div className="admin-panel-section">
            <AdminPanel onBack={() => setCurrentView('quizzes')} />
          </div>
        )}

        {currentView === 'quizzes' && (
          <div className="quizzes-section">
            <h3>All Quizzes</h3>
            <QuizList onStartQuiz={startQuiz} isAdmin={true} />
          </div>
        )}

        {currentView === 'quiz' && selectedQuiz && (
          <div className="quiz-section">
            <TakeQuiz quiz={selectedQuiz} onBack={backToAdmin} />
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
