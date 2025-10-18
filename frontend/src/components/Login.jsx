import { useState } from 'react'

function Login({ onLogin, onSwitch }) {
  const [formData, setFormData] = useState({
    useremail: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        onLogin(data.userResult, data.token)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Login failed. Try again.')
    }

    setLoading(false)
  }

  return (
    <div className="auth-form">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="useremail"
            value={formData.useremail}
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p>
        Don't have an account? 
        <button onClick={onSwitch} className="link-btn">Sign up</button>
      </p>
    </div>
  )
}

export default Login
