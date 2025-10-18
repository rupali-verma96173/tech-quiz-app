import { useState, useEffect } from 'react'

function TakeQuiz({ quiz, onBack }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const [fullQuiz, setFullQuiz] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/auth/quizzes/${quiz._id}`)
        const data = await response.json()
        if (data.success) {
          setFullQuiz(data.quiz)
        }
      } catch (err) {
        console.log('Failed to load quiz')
      }
      setLoading(false)
    }
    fetchQuiz()
  }, [quiz._id])

  const handleAnswerSelect = (questionIndex, selectedIndex) => {
    const newAnswers = [...answers]
    newAnswers[questionIndex] = selectedIndex
    setAnswers(newAnswers)
  }

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/auth/quizzes/${fullQuiz._id}/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          answers: answers.map((selectedIndex, questionIndex) => ({
            questionIndex,
            selectedIndex
          }))
        })
      })

      const data = await response.json()
      if (data.success) {
        setResult(data)
        setSubmitted(true)
      }
    } catch (err) {
      console.log('Failed to submit quiz')
    }
  }

  const nextQuestion = () => {
    if (fullQuiz && fullQuiz.questions && currentQuestion < fullQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  if (submitted && result) {
    return (
      <div className="quiz-result">
        <h2>Quiz Results</h2>
        <div className="score">
          <h3>Your Score: {result.score || 0}%</h3>
          <p>Correct Answers: {result.correct || 0} out of {result.total || 0}</p>
          <p>Marks Obtained: {result.correct || 0}/{result.total || 0}</p>
          {(result.score || 0) >= 70 ? (
            <p style={{color: 'green', fontWeight: 'bold'}}>🎉 Excellent! You passed!</p>
          ) : (result.score || 0) >= 50 ? (
            <p style={{color: 'orange', fontWeight: 'bold'}}>👍 Good attempt! Keep practicing!</p>
          ) : (
            <p style={{color: 'red', fontWeight: 'bold'}}>📚 Study more and try again!</p>
          )}
        </div>
        <button onClick={onBack}>Back to Quizzes</button>
      </div>
    )
  }

  if (loading) {
    return <div>Loading quiz...</div>
  }

  if (!fullQuiz || !fullQuiz.questions || fullQuiz.questions.length === 0) {
    return (
      <div className="take-quiz">
        <h2>Quiz not found or no questions available</h2>
        <button onClick={onBack}>Back to Quizzes</button>
      </div>
    )
  }

  const question = fullQuiz.questions[currentQuestion]

  return (
    <div className="take-quiz">
      <div className="quiz-header">
        <h2>{fullQuiz.title}</h2>
        <p>Question {currentQuestion + 1} of {fullQuiz.questions.length}</p>
      </div>

      <div className="question">
        <h3>{question.text}</h3>
        <div className="options">
          {question.options && question.options.map((option, index) => (
            <label key={index} className="option">
              <input
                type="radio"
                name={`question-${currentQuestion}`}
                value={index}
                checked={answers[currentQuestion] === index}
                onChange={() => handleAnswerSelect(currentQuestion, index)}
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      <div className="quiz-controls">
        <button onClick={prevQuestion} disabled={currentQuestion === 0}>
          Previous
        </button>
        
        {currentQuestion === fullQuiz.questions.length - 1 ? (
          <button onClick={handleSubmit} className="submit-btn">
            Submit Quiz
          </button>
        ) : (
          <button onClick={nextQuestion}>
            Next
          </button>
        )}
      </div>

      <button onClick={onBack} className="back-btn">Back to Quizzes</button>
    </div>
  )
}

export default TakeQuiz
