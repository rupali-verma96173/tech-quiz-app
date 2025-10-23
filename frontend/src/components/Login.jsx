import { useState } from 'react'
import { useApp } from '../context/AppContext'

function Login({ onSwitch }) {
  const { login, loading, error, clearError } = useApp()
  const [formData, setFormData] = useState({
    useremail: '',
    password: ''
  })
  const [validationErrors, setValidationErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.useremail.trim()) {
      errors.useremail = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.useremail)) {
      errors.useremail = 'Please enter a valid email address'
    }
    
    if (!formData.password.trim()) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    
    if (!validateForm()) {
      return
    }

    try {
      await login(formData)
    } catch (err) {
      // Error is handled by context
      console.error('Login error:', err)
    }
  }

  return (
    <div className="auth-form">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="useremail">Email:</label>
          <input
            id="useremail"
            type="email"
            name="useremail"
            value={formData.useremail}
            onChange={handleChange}
            className={validationErrors.useremail ? 'error-input' : ''}
            placeholder="Enter your email"
            autoComplete="email"
          />
          {validationErrors.useremail && (
            <div className="field-error">{validationErrors.useremail}</div>
          )}
        </div>
        
        <div>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={validationErrors.password ? 'error-input' : ''}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          {validationErrors.password && (
            <div className="field-error">{validationErrors.password}</div>
          )}
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading} className={loading ? 'loading' : ''}>
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
