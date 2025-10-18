import { useState } from 'react'

function Signup({ onLogin, onSwitch }) {
  const [formData, setFormData] = useState({
    username: '',
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
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        // Show success message and switch to login
        setError('')
        alert('Account created successfully! Please login.')
        onSwitch()
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Signup failed. Try again.')
    }

    setLoading(false)
  }

  return (
    <div className="auth-form">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

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
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <p>
        Already have an account? 
        <button onClick={onSwitch} className="link-btn">Login</button>
      </p>
    </div>
  )
}

export default Signup
