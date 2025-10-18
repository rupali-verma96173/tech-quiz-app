import { useEffect, useState } from 'react'

function MyAttempts() {
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/auth/me/attempts', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.success) setAttempts(data.attempts)
      } catch (e) {
        // ignore
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return <div>Loading history...</div>

  return (
    <div className="quiz-list">
      <h2>My Attempts</h2>
      {attempts.length === 0 ? (
        <p>No attempts yet</p>
      ) : (
        attempts.map(a => (
          <div key={a._id} className="quiz-item">
            <h4>{a.quizId?.title}</h4>
            <p>Technology: {a.quizId?.technology}</p>
            <p>Score: {a.score}% ({a.correctCount}/{a.total})</p>
            <p>Date: {new Date(a.createdAt).toLocaleString()}</p>
          </div>
        ))
      )}
    </div>
  )
}

export default MyAttempts


