import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

/**
 * QuizList Component
 * 
 * Displays a list of available quizzes with filtering capabilities.
 * Supports both regular users and admin users with different views.
 * 
 * @param {Function} onStartQuiz - Callback function when user starts a quiz
 * @param {boolean} isAdmin - Whether the current user is an admin
 */
function QuizList({ onStartQuiz, isAdmin }) {
  // Context API integration for state management
  const { 
    quizzes, 
    technologies, 
    loading, 
    error, 
    fetchQuizzes, 
    fetchTechnologies, 
    clearError 
  } = useApp()

  // Local state for filter management
  const [filter, setFilter] = useState('')

  /**
   * Effect hook to load data when component mounts or filter changes
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        clearError()
        await Promise.all([
          fetchTechnologies(),
          fetchQuizzes(filter)
        ])
      } catch (err) {
        console.error('Error loading quiz data:', err)
      }
    }

    loadData()
  }, [filter]) // Removed function dependencies to prevent infinite loops

  /**
   * Handles technology filter change
   * @param {Event} e - Change event from select element
   */
  const handleFilterChange = (e) => {
    setFilter(e.target.value)
  }

  /**
   * Handles quiz start action
   * @param {Object} quiz - Quiz object to start
   */
  const handleStartQuiz = (quiz) => {
    if (onStartQuiz) {
      onStartQuiz(quiz)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="quiz-list">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading quizzes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz-list">
      <h2>Available Quizzes</h2>
      
      {/* Error display */}
      {error && (
        <div className="error">
          {error}
        </div>
      )}
      
      {/* Technology filter */}
      <div className="filter">
        <label htmlFor="tech-filter">Filter by technology:</label>
        <select 
          id="tech-filter"
          value={filter} 
          onChange={handleFilterChange}
          disabled={loading}
        >
          <option value="">All Technologies</option>
          {technologies.map(tech => (
            <option key={tech} value={tech}>
              {tech}
            </option>
          ))}
        </select>
      </div>

      {/* Quiz grid */}
      <div className="quizzes">
        {quizzes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No quizzes available</h3>
            <p>
              {filter 
                ? `No quizzes found for "${filter}" technology`
                : 'No published quizzes available'
              }
            </p>
            <p className="empty-subtitle">
              {isAdmin 
                ? 'Create some quizzes to get started'
                : 'Check back later or contact admin to publish quizzes'
              }
            </p>
          </div>
        ) : (
          quizzes.map(quiz => (
            <div key={quiz._id} className="quiz-card">
              <div className="quiz-header">
                <h3>{quiz.title}</h3>
                <span className="quiz-tech">{quiz.technology}</span>
              </div>
              
              <div className="quiz-meta">
                <p className="quiz-date">
                  📅 Created: {new Date(quiz.createdAt).toLocaleDateString()}
                </p>
                <p className="quiz-questions">
                  ❓ {quiz.questions?.length || 0} questions
                </p>
              </div>
              
              {!isAdmin && (
                <button 
                  onClick={() => handleStartQuiz(quiz)}
                  className="start-quiz-btn"
                  disabled={loading}
                >
                  Start Quiz
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default QuizList
