import { useState } from 'react'
import { useApp } from '../context/AppContext'

function Signup({ onSwitch }) {
  const { signup, loading, error, clearError } = useApp()
  const [formData, setFormData] = useState({
    username: '',
    useremail: '',
    password: '',
    confirmPassword: ''
  })
  const [validationErrors, setValidationErrors] = useState({})
  const [success, setSuccess] = useState(false)

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
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required'
    } else if (formData.username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters'
    }
    
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
    
    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    setSuccess(false)
    
    if (!validateForm()) {
      return
    }

    try {
      await signup({
        username: formData.username.trim(),
        useremail: formData.useremail.trim(),
        password: formData.password
      })
      setSuccess(true)
      // Redirect to login after successful signup
      setTimeout(() => {
        onSwitch()
      }, 2000)
    } catch (err) {
      // Error is handled by context
      console.error('Signup error:', err)
    }
  }

  return (
    <div className="auth-form">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={validationErrors.username ? 'error-input' : ''}
            placeholder="Enter your username"
            autoComplete="username"
          />
          {validationErrors.username && (
            <div className="field-error">{validationErrors.username}</div>
          )}
        </div>

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
            autoComplete="new-password"
          />
          {validationErrors.password && (
            <div className="field-error">{validationErrors.password}</div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={validationErrors.confirmPassword ? 'error-input' : ''}
            placeholder="Confirm your password"
            autoComplete="new-password"
          />
          {validationErrors.confirmPassword && (
            <div className="field-error">{validationErrors.confirmPassword}</div>
          )}
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">Account created successfully! Redirecting to login...</div>}

        <button type="submit" disabled={loading || success} className={loading ? 'loading' : ''}>
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
