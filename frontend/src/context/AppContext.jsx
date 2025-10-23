import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react'

// Initial state
const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  quizzes: [],
  technologies: [],
  currentQuiz: null,
  attempts: []
}

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_QUIZZES: 'SET_QUIZZES',
  SET_TECHNOLOGIES: 'SET_TECHNOLOGIES',
  SET_CURRENT_QUIZ: 'SET_CURRENT_QUIZ',
  SET_ATTEMPTS: 'SET_ATTEMPTS',
  ADD_ATTEMPT: 'ADD_ATTEMPT'
}

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload }
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false }
    
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null }
    
    case ActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      }
    
    case ActionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        currentQuiz: null,
        error: null
      }
    
    case ActionTypes.SET_QUIZZES:
      return { ...state, quizzes: action.payload, loading: false }
    
    case ActionTypes.SET_TECHNOLOGIES:
      return { ...state, technologies: action.payload }
    
    case ActionTypes.SET_CURRENT_QUIZ:
      return { ...state, currentQuiz: action.payload }
    
    case ActionTypes.SET_ATTEMPTS:
      return { ...state, attempts: action.payload }
    
    case ActionTypes.ADD_ATTEMPT:
      return { ...state, attempts: [action.payload, ...state.attempts] }
    
    default:
      return state
  }
}

// Create context
const AppContext = createContext()

// Custom hook to use context
export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

// API base URL
const API_BASE_URL = 'http://localhost:4000/api/auth'

// API helper functions
const apiCall = async (url, options = {}) => {
  const token = localStorage.getItem('token')
  const defaultHeaders = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`
  }
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: { ...defaultHeaders, ...options.headers }
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred')
  }
  
  return data
}

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (token && user) {
      try {
        dispatch({
          type: ActionTypes.LOGIN_SUCCESS,
          payload: {
            user: JSON.parse(user),
            token
          }
        })
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }, [])

  // Memoized action creators to prevent infinite loops
  const setLoading = useCallback((loading) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: loading })
  }, [])
  
  const setError = useCallback((error) => {
    dispatch({ type: ActionTypes.SET_ERROR, payload: error })
  }, [])
  
  const clearError = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_ERROR })
  }, [])
  
  const login = useCallback(async (credentials) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true })
    try {
      const data = await apiCall('/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      })
      
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      dispatch({
        type: ActionTypes.LOGIN_SUCCESS,
        payload: { user: data.user, token: data.token }
      })
      
      return data
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message })
      throw error
    }
  }, [])
  
  const signup = useCallback(async (userData) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true })
    try {
      const data = await apiCall('/signup', {
        method: 'POST',
        body: JSON.stringify(userData)
      })
      
      // After successful signup, automatically log the user in
      if (data.success && data.user) {
        // Generate a token for the new user (this would typically be done by the backend)
        // For now, we'll redirect to login after successful signup
        dispatch({ type: ActionTypes.SET_LOADING, payload: false })
        return data
      }
      
      dispatch({ type: ActionTypes.SET_LOADING, payload: false })
      return data
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message })
      throw error
    }
  }, [])
  
  const logout = useCallback(async () => {
    try {
      // Try to call logout API if backend is available
      const token = localStorage.getItem('token')
      if (token) {
        try {
          await apiCall('/logout', { method: 'POST' })
        } catch (error) {
          // If backend is not available, continue with local logout
          console.warn('Backend not available, performing local logout')
        }
      }
    } catch (error) {
      // Continue with local logout even if API call fails
      console.warn('Logout API failed, performing local logout')
    } finally {
      // Always perform local logout
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      dispatch({ type: ActionTypes.LOGOUT })
    }
  }, [])
  
  const fetchQuizzes = useCallback(async (techFilter = null) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true })
    try {
      const url = techFilter ? `/quizzes?tech=${techFilter}` : '/quizzes'
      const data = await apiCall(url)
      dispatch({ type: ActionTypes.SET_QUIZZES, payload: data.quizzes })
      return data.quizzes
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message })
      throw error
    }
  }, [])
  
  const fetchTechnologies = useCallback(async () => {
    try {
      const data = await apiCall('/quizzes/technologies')
      dispatch({ type: ActionTypes.SET_TECHNOLOGIES, payload: data.technologies })
      return data.technologies
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message })
      throw error
    }
  }, [])
  
  const fetchQuiz = useCallback(async (quizId) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true })
    try {
      const data = await apiCall(`/quizzes/${quizId}`)
      dispatch({ type: ActionTypes.SET_CURRENT_QUIZ, payload: data.quiz })
      return data.quiz
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message })
      throw error
    }
  }, [])
  
  const submitAttempt = useCallback(async (quizId, answers) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true })
    try {
      const data = await apiCall(`/quizzes/${quizId}/attempt`, {
        method: 'POST',
        body: JSON.stringify({ answers })
      })
      
      dispatch({ type: ActionTypes.ADD_ATTEMPT, payload: {
        _id: data.attemptId,
        quizId,
        score: data.score,
        correctCount: data.correct,
        total: data.total,
        createdAt: new Date().toISOString()
      }})
      
      dispatch({ type: ActionTypes.SET_LOADING, payload: false })
      return data
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message })
      throw error
    }
  }, [])
  
  const fetchAttempts = useCallback(async () => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true })
    try {
      const data = await apiCall('/me/attempts')
      dispatch({ type: ActionTypes.SET_ATTEMPTS, payload: data.attempts })
      return data.attempts
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message })
      throw error
    }
  }, [])
  
  // Admin actions
  const fetchAdminQuizzes = useCallback(async (techFilter = null) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true })
    try {
      const url = techFilter ? `/admin/quizzes?tech=${techFilter}` : '/admin/quizzes'
      const data = await apiCall(url)
      dispatch({ type: ActionTypes.SET_QUIZZES, payload: data.quizzes })
      return data.quizzes
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message })
      throw error
    }
  }, [])
  
  const createQuiz = useCallback(async (quizData) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true })
    try {
      const data = await apiCall('/admin/quizzes', {
        method: 'POST',
        body: JSON.stringify(quizData)
      })
      
      dispatch({ type: ActionTypes.SET_LOADING, payload: false })
      return data.quiz
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message })
      throw error
    }
  }, [])
  
  const updateQuiz = useCallback(async (quizId, quizData) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true })
    try {
      const data = await apiCall(`/admin/quizzes/${quizId}`, {
        method: 'PUT',
        body: JSON.stringify(quizData)
      })
      
      dispatch({ type: ActionTypes.SET_LOADING, payload: false })
      return data.quiz
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message })
      throw error
    }
  }, [])
  
  const deleteQuiz = useCallback(async (quizId) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true })
    try {
      await apiCall(`/admin/quizzes/${quizId}`, {
        method: 'DELETE'
      })
      
      dispatch({ type: ActionTypes.SET_LOADING, payload: false })
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message })
      throw error
    }
  }, [])

  // Memoized actions object
  const actions = useMemo(() => ({
    setLoading,
    setError,
    clearError,
    login,
    signup,
    logout,
    fetchQuizzes,
    fetchTechnologies,
    fetchQuiz,
    submitAttempt,
    fetchAttempts,
    fetchAdminQuizzes,
    createQuiz,
    updateQuiz,
    deleteQuiz
  }), [
    setLoading,
    setError,
    clearError,
    login,
    signup,
    logout,
    fetchQuizzes,
    fetchTechnologies,
    fetchQuiz,
    submitAttempt,
    fetchAttempts,
    fetchAdminQuizzes,
    createQuiz,
    updateQuiz,
    deleteQuiz
  ])

  const value = {
    ...state,
    ...actions
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}
