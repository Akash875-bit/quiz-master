import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './style.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import axios from 'axios'

// Set base URL for API requests
axios.defaults.baseURL = 'http://localhost:5000/api'

// Create Axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Add JWT token to requests
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('quiz_master_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

// Handle token expiration
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    
    // If error is unauthorized and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('quiz_master_refresh_token')
        if (!refreshToken) {
          // No refresh token, redirect to login
          localStorage.removeItem('quiz_master_token')
          localStorage.removeItem('quiz_master_user')
          router.push('/login')
          return Promise.reject(error)
        }
        
        // Request new access token
        const response = await axios.post('/auth/refresh', {}, {
          headers: { Authorization: `Bearer ${refreshToken}` }
        })
        
        // Save new token and retry request
        localStorage.setItem('quiz_master_token', response.data.access_token)
        originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        // Refresh failed, logout
        localStorage.removeItem('quiz_master_token')
        localStorage.removeItem('quiz_master_user')
        localStorage.removeItem('quiz_master_refresh_token')
        router.push('/login')
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

// Create Vue app
const app = createApp(App)

// Register global properties
app.config.globalProperties.$axios = axiosInstance

// Use plugins
app.use(router)
app.use(store)

// Mount app
app.mount('#app')
