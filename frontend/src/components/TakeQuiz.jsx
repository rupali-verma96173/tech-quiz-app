import { useState, useEffect, useCallback } from 'react'

/**
 * TakeQuiz Component - Handles quiz taking functionality
 * 
 * This component manages the quiz taking process including:
 * - Loading quiz questions
 * - Answer selection and navigation
 * - Submission and result display
 * - Error handling for various edge cases
 * 
 * @param {Object} quiz - Quiz object with basic info
 * @param {Function} onBack - Callback to return to quiz list
 */
function TakeQuiz({ quiz, onBack }) {
  // State management
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const [fullQuiz, setFullQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const [startTime] = useState(Date.now())

  // Timer effect to track time spent
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [startTime])

  // Load quiz details with comprehensive error handling
  useEffect(() => {
    const loadQuiz = async () => {
      if (!quiz?._id) {
        setError('Invalid quiz selected')
        setLoading(false)
        return
      }

      try {
        setError(null)
        const response = await fetch(`/api/auth/quizzes/${quiz._id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Quiz not found or has been removed')
          } else if (response.status === 403) {
            throw new Error('This quiz is not available to the public')
          } else if (response.status === 400) {
            throw new Error('Invalid quiz format')
          } else {
            throw new Error('Unable to load quiz. Please try again.')
          }
        }

        const data = await response.json()
        
        if (data.success && data.quiz) {
          // Validate quiz structure
          if (!data.quiz.questions || data.quiz.questions.length === 0) {
            throw new Error('This quiz has no questions available')
          }
          
          setFullQuiz(data.quiz)
          // Initialize answers array
          setAnswers(new Array(data.quiz.questions.length).fill(null))
        } else {
          throw new Error(data.message || 'Failed to load quiz')
        }
      } catch (err) {
        console.error('Quiz loading error:', err)
        setError(err.message || 'Something went wrong while loading the quiz')
      } finally {
        setLoading(false)
      }
    }

    loadQuiz()
  }, [quiz._id])

  // Handle answer selection with validation
  const handleAnswerSelect = useCallback((questionIndex, selectedIndex) => {
    if (questionIndex < 0 || questionIndex >= answers.length) {
      console.warn('Invalid question index:', questionIndex)
      return
    }
    
    const newAnswers = [...answers]
    newAnswers[questionIndex] = selectedIndex
    setAnswers(newAnswers)
  }, [answers])

  // Submit quiz with comprehensive error handling
  const handleSubmit = async () => {
    if (!fullQuiz) {
      setError('Quiz data is not available')
      return
    }

    // Check if user has answered any questions
    const answeredQuestions = answers.filter(answer => answer !== null && answer !== undefined)
    if (answeredQuestions.length === 0) {
      setError('Please answer at least one question before submitting')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('You must be logged in to submit a quiz')
      }

      // Prepare answers array with validation
      const validAnswers = answers
        .map((selectedIndex, questionIndex) => {
          if (selectedIndex !== null && selectedIndex !== undefined) {
            return {
              questionIndex,
              selectedIndex: parseInt(selectedIndex)
            }
          }
          return null
        })
        .filter(answer => answer !== null)

      const response = await fetch(`/api/auth/quizzes/${fullQuiz._id}/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          answers: validAnswers
        })
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Your session has expired. Please login again.')
        } else if (response.status === 403) {
          throw new Error('You are not authorized to take this quiz')
        } else if (response.status === 404) {
          throw new Error('Quiz not found or has been removed')
        } else if (response.status === 429) {
          throw new Error('Please wait before attempting this quiz again')
        } else if (response.status === 400) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Invalid quiz submission')
        } else {
          throw new Error('Unable to submit quiz. Please try again.')
        }
      }

      const data = await response.json()
      
      if (data.success) {
        setResult({
          ...data,
          timeSpent: Math.floor((Date.now() - startTime) / 1000)
        })
        setSubmitted(true)
      } else {
        throw new Error(data.message || 'Quiz submission failed')
      }
    } catch (err) {
      console.error('Quiz submission error:', err)
      setError(err.message || 'Failed to submit quiz. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Navigation functions with bounds checking
  const nextQuestion = useCallback(() => {
    if (fullQuiz?.questions && currentQuestion < fullQuiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }, [fullQuiz, currentQuestion])

  const prevQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }, [currentQuestion])

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate progress percentage
  const progressPercentage = fullQuiz ? ((currentQuestion + 1) / fullQuiz.questions.length) * 100 : 0

  // Show loading state
  if (loading) {
    return (
      <div className="take-quiz">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading quiz questions...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error && !submitted) {
    return (
      <div className="take-quiz">
        <div className="error-state">
          <h2>⚠️ Unable to Load Quiz</h2>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button onClick={() => window.location.reload()} className="retry-btn">
              Try Again
            </button>
            <button onClick={onBack} className="back-btn">
              Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show results
  if (submitted && result) {
    const getPerformanceMessage = (score) => {
      if (score >= 90) return { message: "🎉 Outstanding! You're a quiz master!", color: "#10b981" }
      if (score >= 80) return { message: "🌟 Excellent work! Well done!", color: "#3b82f6" }
      if (score >= 70) return { message: "👍 Great job! You passed!", color: "#f59e0b" }
      if (score >= 60) return { message: "📚 Good effort! Keep studying!", color: "#f59e0b" }
      return { message: "💪 Don't give up! Practice makes perfect!", color: "#ef4444" }
    }

    const performance = getPerformanceMessage(result.score || 0)

    return (
      <div className="quiz-result">
        <div className="result-header">
          <h2>🎯 Quiz Complete!</h2>
          <p className="quiz-title">{fullQuiz?.title}</p>
        </div>
        
        <div className="score-display">
          <div className="score-circle">
            <span className="score-percentage">{result.score || 0}%</span>
          </div>
          <div className="score-details">
            <h3>Your Results</h3>
            <div className="score-breakdown">
              <div className="score-item">
                <span className="label">Correct Answers:</span>
                <span className="value">{result.correct || 0} / {result.total || 0}</span>
              </div>
              <div className="score-item">
                <span className="label">Time Taken:</span>
                <span className="value">{formatTime(result.timeSpent || 0)}</span>
              </div>
              <div className="score-item">
                <span className="label">Performance:</span>
                <span className="value" style={{ color: performance.color }}>
                  {performance.message}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="result-actions">
          <button onClick={onBack} className="back-to-quizzes-btn">
            Back to Quizzes
          </button>
        </div>
      </div>
    )
  }

  // Validate quiz data
  if (!fullQuiz || !fullQuiz.questions || fullQuiz.questions.length === 0) {
    return (
      <div className="take-quiz">
        <div className="error-state">
          <h2>❌ Quiz Unavailable</h2>
          <p>This quiz has no questions or is not properly configured.</p>
          <button onClick={onBack} className="back-btn">
            Back to Quizzes
          </button>
        </div>
      </div>
    )
  }

  const question = fullQuiz.questions[currentQuestion]
  const isLastQuestion = currentQuestion === fullQuiz.questions.length - 1
  const answeredQuestions = answers.filter(answer => answer !== null && answer !== undefined).length

  return (
    <div className="take-quiz">
      {/* Quiz Header with Progress */}
      <div className="quiz-header">
        <div className="quiz-title-section">
          <h2>{fullQuiz.title}</h2>
          <p className="quiz-subtitle">Technology: {fullQuiz.technology}</p>
        </div>
        
        <div className="quiz-progress">
          <div className="progress-info">
            <span>Question {currentQuestion + 1} of {fullQuiz.questions.length}</span>
            <span>Time: {formatTime(timeSpent)}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {/* Question Section */}
      <div className="question-section">
        <div className="question">
          <h3>{question.text}</h3>
          <div className="options">
            {question.options && question.options.map((option, index) => (
              <label key={index} className={`option ${answers[currentQuestion] === index ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name={`question-${currentQuestion}`}
                  value={index}
                  checked={answers[currentQuestion] === index}
                  onChange={() => handleAnswerSelect(currentQuestion, index)}
                />
                <span className="option-text">{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="quiz-controls">
        <div className="nav-buttons">
          <button 
            onClick={prevQuestion} 
            disabled={currentQuestion === 0}
            className="nav-btn prev-btn"
          >
            ← Previous
          </button>
          
          {isLastQuestion ? (
            <button 
              onClick={handleSubmit} 
              disabled={submitting || answeredQuestions === 0}
              className="submit-btn"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button 
              onClick={nextQuestion}
              className="nav-btn next-btn"
            >
              Next →
            </button>
          )}
        </div>

        <div className="quiz-stats">
          <span>Answered: {answeredQuestions} / {fullQuiz.questions.length}</span>
        </div>
      </div>

      {/* Back Button */}
      <div className="quiz-footer">
        <button onClick={onBack} className="back-btn">
          ← Back to Quizzes
        </button>
      </div>
    </div>
  )
}

export default TakeQuiz
