import { useState, useEffect } from 'react'

function AdminPanel({ onBack }) {
  const [quizzes, setQuizzes] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    technology: '',
    isPublished: false,
    questions: []
  })

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/auth/admin/quizzes', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setQuizzes(data.quizzes)
      }
    } catch (err) {
      console.log('Failed to load quizzes')
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, {
        text: '',
        options: ['', '', '', ''],
        correctIndex: 0
      }]
    })
  }

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...formData.questions]
    newQuestions[index][field] = value
    setFormData({ ...formData, questions: newQuestions })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      const url = editingQuiz ? 
        `/api/auth/admin/quizzes/${editingQuiz._id}` :
        '/api/auth/admin/quizzes'
      
      const method = editingQuiz ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        setShowForm(false)
        setEditingQuiz(null)
        setFormData({ title: '', technology: '', isPublished: false, questions: [] })
        fetchQuizzes()
      }
    } catch (err) {
      console.log('Failed to save quiz')
    }
  }

  const editQuiz = async (quiz) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/auth/admin/quizzes/${quiz._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      
      if (data.success) {
        setEditingQuiz(data.quiz)
        setFormData({
          title: data.quiz.title || '',
          technology: data.quiz.technology || '',
          isPublished: data.quiz.isPublished || false,
          questions: data.quiz.questions || []
        })
        setShowForm(true)
      }
    } catch (err) {
      console.log('Failed to load quiz details')
    }
  }

  const deleteQuiz = async (quizId) => {
    if (window.confirm('Delete this quiz?')) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/auth/admin/quizzes/${quizId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          fetchQuizzes()
        }
      } catch (err) {
        console.log('Failed to delete quiz')
      }
    }
  }

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      
      <div className="admin-controls">
        <button onClick={() => setShowForm(true)}>Create New Quiz</button>
        <button onClick={onBack}>Back to Quizzes</button>
      </div>

      {showForm && (
        <div className="quiz-form">
          <h3>{editingQuiz ? 'Edit Quiz' : 'Create Quiz'}</h3>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Title:</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label>Technology:</label>
              <input
                type="text"
                name="technology"
                value={formData.technology}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label>
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleInputChange}
                />
                Published
              </label>
            </div>

            <div className="questions">
              <h4>Questions:</h4>
              {formData.questions && formData.questions.map((question, qIndex) => (
                <div key={qIndex} className="question-form">
                  <input
                    type="text"
                    placeholder="Question text"
                    value={question.text || ''}
                    onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                    required
                  />
                  
                  {question.options && question.options.map((option, oIndex) => (
                    <input
                      key={oIndex}
                      type="text"
                      placeholder={`Option ${oIndex + 1}`}
                      value={option || ''}
                      onChange={(e) => {
                        const newOptions = [...question.options]
                        newOptions[oIndex] = e.target.value
                        updateQuestion(qIndex, 'options', newOptions)
                      }}
                      required
                    />
                  ))}
                  
                  <select
                    value={question.correctIndex || 0}
                    onChange={(e) => updateQuestion(qIndex, 'correctIndex', parseInt(e.target.value))}
                  >
                    {question.options && question.options.map((_, index) => (
                      <option key={index} value={index}>Correct: Option {index + 1}</option>
                    ))}
                  </select>
                </div>
              ))}
              
              <button type="button" onClick={addQuestion}>Add New Question</button>
            </div>

            <div className="form-controls">
              <button type="submit">Save Quiz</button>
              <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="quizzes-list">
        <h3>All Quizzes</h3>
        {quizzes.map(quiz => (
          <div key={quiz._id} className="quiz-item">
            <h4>{quiz.title}</h4>
            <p>Technology: {quiz.technology}</p>
            <p>Status: {quiz.isPublished ? 'Published' : 'Draft'}</p>
            <div className="quiz-actions">
              <button onClick={() => editQuiz(quiz)}>Edit</button>
              <button onClick={() => deleteQuiz(quiz._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminPanel
