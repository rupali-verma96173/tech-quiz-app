import { useState, useEffect } from 'react'

function QuizList({ onStartQuiz, isAdmin }) {
  const [quizzes, setQuizzes] = useState([])
  const [technologies, setTechnologies] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetchTechnologies()
    fetchQuizzes()
  }, [filter])

  const fetchTechnologies = async () => {
    try {
      const response = await fetch('/api/auth/quizzes/technologies')
      const data = await response.json()
      if (data.success) {
        setTechnologies(data.technologies)
      }
    } catch (err) {
      console.log('Failed to load technologies')
    }
  }

  const fetchQuizzes = async () => {
    try {
      const url = filter ? 
        `/api/auth/quizzes?tech=${filter}` : 
        '/api/auth/quizzes'
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        // Only show published quizzes to users
        const publishedQuizzes = data.quizzes.filter(quiz => quiz.isPublished)
        console.log('Published quizzes:', publishedQuizzes)
        setQuizzes(publishedQuizzes)
      }
    } catch (err) {
      console.log('Failed to load quizzes')
    }
    setLoading(false)
  }

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
  }

  if (loading) return <div>Loading quizzes...</div>

  return (
    <div className="quiz-list">
      <h2>Available Quizzes</h2>
      
      <div className="filter">
        <label>Filter by technology:</label>
        <select value={filter} onChange={handleFilterChange}>
          <option value="">All</option>
          {technologies.map(tech => (
            <option key={tech} value={tech}>{tech}</option>
          ))}
        </select>
      </div>

      <div className="quizzes">
        {quizzes.length === 0 ? (
          <div style={{textAlign: 'center', padding: '40px'}}>
            <p style={{fontSize: '18px', color: '#666'}}>No published quizzes available</p>
            <p style={{fontSize: '14px', color: '#999'}}>Check back later or contact admin to publish quizzes</p>
          </div>
        ) : (
          quizzes.map(quiz => (
            <div key={quiz._id} className="quiz-card">
              <h3>{quiz.title}</h3>
              <p>Technology: {quiz.technology}</p>
              <p>Created: {new Date(quiz.createdAt).toLocaleDateString()}</p>
              {!isAdmin && (
                <button onClick={() => onStartQuiz(quiz)}>
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
