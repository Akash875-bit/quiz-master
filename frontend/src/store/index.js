import { createStore } from 'vuex'
import axios from 'axios'


const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})


axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('quiz_master_token')
  if (token) {
    console.log('📡 Adding token to request:', config.url, 'Token:', token.substring(0, 20) + '...')
    config.headers.Authorization = `Bearer ${token}`
  } else {
    console.log('📡 No token available for request:', config.url)
  }
  return config
}, error => {
  console.error('Request interceptor error:', error)
  return Promise.reject(error)
})


let isLoggingOut = false;


axiosInstance.interceptors.response.use(
  response => {
    console.log('✅ Request successful:', response.config.url, 'Status:', response.status);
    return response;
  },
  async error => {
    console.error('Response error:', error.response?.status || 'Network Error', error.config?.url || 'Unknown URL')
    const originalRequest = error.config;
    
    
         // Prevent infinite loops - if already retried or should ignore auth errors
     if (originalRequest._retry || originalRequest._ignoreAuthError) {
       console.log('🚫 Skipping token refresh - already retried or ignore auth error');
       return Promise.reject(error);
     }
    
    
    if (error.response && error.response.status === 401) {
      if (isLoggingOut) {
        console.log('Already logging out, skipping token refresh');
        return Promise.reject(error);
      }
      
      console.log('Unauthorized error, attempting token refresh')
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('quiz_master_refresh_token')
      if (refreshToken) {
        try {
          console.log('Checking refresh token status');
          
          if (store.state.isRefreshingToken) {
            console.log('🔄 Token refresh already in progress, waiting...');
            try {
              await store.state.refreshPromise;
              console.log('🔄 Existing token refresh completed, retrying request');
              
              const newToken = localStorage.getItem('quiz_master_token');
              if (newToken) {
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                console.log('🔄 Using refreshed token for retry:', newToken.substring(0, 20) + '...');
              } else {
                console.error('🔄 No token found after refresh, cannot retry');
                return Promise.reject(error);
              }
              
              return axiosInstance(originalRequest);
            } catch (err) {
              console.error('🔄 Existing token refresh failed, cannot retry request');
              return Promise.reject(error);
            }
          }
          
          store.commit('SET_TOKEN_REFRESHING', true);
          
          const refreshPromise = axios.post('/auth/refresh', {}, {
            baseURL: '/api',
            headers: {
              'Authorization': `Bearer ${refreshToken}`,
              'Content-Type': 'application/json'
            },
            _ignoreAuthError: true,
            timeout: 8000 
          });
          
          store.commit('SET_REFRESH_PROMISE', refreshPromise);
          
          const response = await refreshPromise;
          
          if (response.data && response.data.access_token) {
            console.log('🔄 Token refresh successful:', response.data);
            
            const newToken = response.data.access_token;
            store.commit('SET_TOKEN', newToken);
            
            if (response.data.refresh_token) {
              store.commit('SET_REFRESH_TOKEN', response.data.refresh_token);
            }
            
                         // Update axios instance headers
             axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
             
             // Update the original request headers
             originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
             
             // Keep the retry flag to prevent infinite loops
             // DO NOT clear originalRequest._retry
             
             store.commit('SET_TOKEN_REFRESHING', false);
             
             console.log('🔄 Retrying original request with new token:', originalRequest.url);
             console.log('🔄 New token being used:', newToken.substring(0, 20) + '...');
             
                          // Retry the original request with new token
             try {
               const retryResponse = await axiosInstance(originalRequest);
               console.log('✅ Retry successful with new token');
               return retryResponse;
             } catch (retryError) {
               console.error('❌ Retry failed even with new token:', retryError.response?.status);
               // If retry fails, don't try again - just reject
               store.commit('SET_TOKEN_REFRESHING', false);
               return Promise.reject(retryError);
             }
           } else {
             store.commit('SET_TOKEN_REFRESHING', false);
             throw new Error('Invalid token refresh response');
           }
        } catch (refreshError) {
          store.commit('SET_TOKEN_REFRESHING', false);
          
          console.error('Token refresh failed:', refreshError);
          
          if (refreshError.response && (refreshError.response.status === 401 || refreshError.response.status === 403)) {
            console.log('Authentication failed during token refresh, logging out');
            
            if (isLoggingOut) {
              return Promise.reject(refreshError);
            }
            isLoggingOut = true;
            
            store.commit('LOGOUT');
            delete axiosInstance.defaults.headers.common['Authorization'];
            
            store.commit('ADD_NOTIFICATION', {
              type: 'error',
              message: 'Your session has expired. Please log in again.'
            });
            
            setTimeout(() => {
              if (window.location) {
                window.location.href = '/login';
              }
              isLoggingOut = false;
            }, 100);
          } else {
            console.log('Network or server error during refresh, not logging out');
            store.commit('ADD_NOTIFICATION', {
              type: 'warning',
              message: 'There was a problem with the server. Please try again.'
            });
          }
          
          return Promise.reject(refreshError);
        }
      } else {
        console.log('No refresh token available, redirecting to login');
        
        if (isLoggingOut) {
          return Promise.reject(error);
        }
        isLoggingOut = true;
        
        store.commit('LOGOUT');
        delete axiosInstance.defaults.headers.common['Authorization'];
        
        store.commit('ADD_NOTIFICATION', {
          type: 'error',
          message: 'Your session has expired. Please log in again.'
        });
        
        setTimeout(() => {
          if (window.location) {
            window.location.href = '/login';
          }
          isLoggingOut = false;
        }, 100);
        
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
)



const store = createStore({
  state: {
    user: JSON.parse(localStorage.getItem('quiz_master_user') || 'null'),
    token: localStorage.getItem('quiz_master_token') || '',
    refreshToken: localStorage.getItem('quiz_master_refresh_token') || '',
    subjects: [],
    currentSubject: null,
    currentChapter: null,
    currentQuiz: null,
    scores: [],
    loading: false,
    error: null,
    notifications: [],
    isRefreshingToken: false,
    refreshPromise: null
  },
  
  getters: {
    isAuthenticated: state => !!state.token,
    isAdmin: state => state.user && state.user.role === 'admin',
    currentUser: state => state.user,
    getSubjects: state => state.subjects,
    getCurrentSubject: state => state.currentSubject,
    getCurrentChapter: state => state.currentChapter,
    getCurrentQuiz: state => state.currentQuiz,
    getScores: state => state.scores,
    isLoading: state => state.loading,
    getError: state => state.error,
    getNotifications: state => state.notifications
  },
  
  mutations: {
    SET_USER(state, user) {
      state.user = user
      localStorage.setItem('quiz_master_user', JSON.stringify(user))
    },
    SET_TOKEN(state, token) {
      state.token = token
      localStorage.setItem('quiz_master_token', token)
    },
    SET_REFRESH_TOKEN(state, refreshToken) {
      state.refreshToken = refreshToken
      localStorage.setItem('quiz_master_refresh_token', refreshToken)
    },
    SET_TOKEN_REFRESHING(state, status) {
      state.isRefreshingToken = status
      if (!status) {
        state.refreshPromise = null
      }
    },
    SET_REFRESH_PROMISE(state, promise) {
      state.refreshPromise = promise
    },
    LOGOUT(state) {
      state.user = null
      state.token = ''
      state.refreshToken = ''
      localStorage.removeItem('quiz_master_user')
      localStorage.removeItem('quiz_master_token')
      localStorage.removeItem('quiz_master_refresh_token')
    },
    SET_SUBJECTS(state, subjects) {
      state.subjects = subjects
    },
    SET_CURRENT_SUBJECT(state, subject) {
      state.currentSubject = subject
    },
    SET_CURRENT_CHAPTER(state, chapter) {
      state.currentChapter = chapter
    },
    SET_CURRENT_QUIZ(state, quiz) {
      state.currentQuiz = quiz
    },
    SET_SCORES(state, scores) {
      state.scores = scores
    },
    SET_LOADING(state, isLoading) {
      state.loading = isLoading
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    ADD_NOTIFICATION(state, notification) {
      const now = Date.now()
      const messageText = notification.message
      const notificationType = notification.type || 'info'
      
      console.log('ADD_NOTIFICATION called with:', messageText, 'Type:', notificationType)
      
      // AGGRESSIVE duplicate prevention - prevent ANY duplicate message
      const isDuplicate = state.notifications.some(n => {
        const isSameMessage = n.message === messageText
        const isSameType = n.type === notificationType
        const isWithinTimeWindow = (now - parseInt(n.id)) < 10000 // 10 second window
        
        return isSameMessage && isSameType && isWithinTimeWindow
      })
      
      if (isDuplicate) {
        console.log('🚫 DUPLICATE NOTIFICATION BLOCKED:', messageText)
        return
      }
      
      // Special handling for logout messages - block ANY logout message if one exists
      if (messageText.toLowerCase().includes('logged out') || messageText.toLowerCase().includes('logout')) {
        const hasAnyLogoutMessage = state.notifications.some(n => {
          const hasLogoutText = n.message.toLowerCase().includes('logged out') || n.message.toLowerCase().includes('logout')
          const isRecent = (now - parseInt(n.id)) < 10000
          return hasLogoutText && isRecent
        })
        
        if (hasAnyLogoutMessage) {
          console.log('🚫 LOGOUT NOTIFICATION BLOCKED (similar exists):', messageText)
          return
        }
      }
      
      // Limit to maximum 2 notifications at once
      if (state.notifications.length >= 2) {
        console.log('Removing oldest notification to make room')
        state.notifications.shift()
      }
      
      // Generate unique ID with milliseconds + random to prevent collisions
      const id = `${now}_${Math.random().toString(36).substr(2, 9)}`
      const newNotification = {
        id,
        message: messageText,
        type: notificationType,
        timestamp: new Date()
      }
      
      // Double-check that this ID doesn't already exist (shouldn't happen but just in case)
      const existingById = state.notifications.find(n => n.id === id)
      if (existingById) {
        console.error('🚨 CRITICAL: Duplicate ID detected!', id)
        return
      }
      
      state.notifications.push(newNotification)
      console.log('✅ NOTIFICATION ADDED:', messageText, 'ID:', id, 'Total notifications:', state.notifications.length)
      console.log('📋 Current notification IDs:', state.notifications.map(n => n.id))
      
      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        const index = state.notifications.findIndex(n => n.id === id)
        if (index !== -1) {
          state.notifications.splice(index, 1)
          console.log('⏰ NOTIFICATION AUTO-DISMISSED:', messageText)
        }
      }, 4000)
    },
    CLEAR_NOTIFICATION(state, id) {
      const index = state.notifications.findIndex(n => n.id === id)
      if (index !== -1) {
        state.notifications.splice(index, 1)
      }
    },
    CLEAR_ALL_NOTIFICATIONS(state) {
      state.notifications = []
    },
    RESET_AUTH_HEADER(state) {
    }
  },
  
  actions: {
    async login({ commit }, credentials) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        console.log('Attempting login with:', credentials.email);
        const response = await axiosInstance.post('/auth/login', credentials)
        
        if (!response.data.access_token || !response.data.refresh_token) {
          throw new Error('Invalid response from server - missing tokens');
        }
        
        console.log('Login successful, setting user and tokens');
        
        commit('SET_USER', response.data.user)
        commit('SET_TOKEN', response.data.access_token)
        commit('SET_REFRESH_TOKEN', response.data.refresh_token)
        
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
        
        commit('SET_LOADING', false)
        
        return response
      } catch (error) {
        console.error('Login failed:', error);
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data?.error || 'Login failed')
        throw error
      }
    },
    
    async register({ commit }, userData) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const apiData = {
          username: userData.username || userData.email,
          email: userData.email,
          password: userData.password,
          first_name: userData.first_name,
          last_name: userData.last_name,
          qualification: userData.qualification || null,
          dob: userData.dob || null
        }
        
        const response = await axiosInstance.post('/auth/register', apiData)
        
        commit('SET_LOADING', false)
        
        commit('ADD_NOTIFICATION', {
          message: 'Registration successful! Please log in with your credentials.',
          type: 'success'
        })
        
        return response.data
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data?.error || 'Registration failed')
        throw error
      }
    },
    
    async logout({ commit }) {
      console.log('🚪 LOGOUT ACTION CALLED - Starting logout process')
      commit('SET_LOADING', true)
      
      try {
        console.log('🚪 Executing logout action - clearing auth state');
        
        commit('LOGOUT')
        
        delete axiosInstance.defaults.headers.common['Authorization'];
        
        console.log('🚪 About to add logout success notification')
        commit('ADD_NOTIFICATION', {
          type: 'success',
          message: 'You have been logged out successfully'
        })
        
        commit('SET_LOADING', false)
        console.log('🚪 LOGOUT ACTION COMPLETED SUCCESSFULLY')
        
        return { success: true };
      } catch (error) {
        console.error('🚪 Logout error:', error)
        commit('SET_LOADING', false)
        
        commit('LOGOUT') 
        delete axiosInstance.defaults.headers.common['Authorization'];
        
        console.log('🚪 LOGOUT ACTION COMPLETED WITH ERROR')
        return { success: true, error };
      }
    },
    
    async checkAuth({ commit }) {
      try {
        console.log('Checking authentication status...');
        const token = localStorage.getItem('quiz_master_token');
        
        if (!token) {
          console.log('No token found, logging out');
          commit('LOGOUT');
          return null;
        }
        
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const response = await axiosInstance.get('/auth/user', {
          timeout: 5000,
          
          _ignoreAuthError: true
        });
        
        console.log('Auth check successful, user data:', response.data);
        
        commit('SET_USER', response.data);
        commit('SET_TOKEN', token);
        
        const refreshToken = localStorage.getItem('quiz_master_refresh_token');
        if (refreshToken) {
          commit('SET_REFRESH_TOKEN', refreshToken);
        }
        
        return response.data;
      } catch (error) {
        console.error('Authentication check failed:', error);
        
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.log('Auth token invalid, logging out');
          commit('LOGOUT');
        } else {
          console.error('Network error during auth check, keeping current auth state');
        }
        
        throw error;
      }
    },
    


    async fetchSubjects({ commit }) {
      commit('SET_LOADING', true)
      
      try {
        const response = await axiosInstance.get('/subjects')
        commit('SET_SUBJECTS', response.data)
        commit('SET_LOADING', false)
        return response.data
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data?.error || 'Failed to fetch subjects')
        throw error
      }
    },
    
    async fetchSubject({ commit }, subjectId) {
      commit('SET_LOADING', true)
      
      try {
        const response = await axiosInstance.get(`/subjects/${subjectId}`)
        commit('SET_CURRENT_SUBJECT', response.data)
        commit('SET_LOADING', false)
        return response.data
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data?.error || 'Failed to fetch subject')
        throw error
      }
    },
    
    async createSubject({ commit }, subject) {
      commit('SET_LOADING', true)
      
      try {
        console.log('Creating subject with data:', subject)
        console.log('Current auth token:', localStorage.getItem('quiz_master_token'))
        
        const response = await axiosInstance.post('/subjects', subject)
        
        console.log('Subject creation response:', response.data)
        
        commit('ADD_NOTIFICATION', {
          type: 'success',
          message: 'Subject created successfully!'
        })
        
        await this.dispatch('fetchSubjects')
        commit('SET_LOADING', false)
        return response.data
      } catch (error) {
        console.error('Subject creation error:', error.response || error)
        commit('SET_LOADING', false)
        
        const errorMessage = error.response?.data?.error || 'Failed to create subject'
        commit('SET_ERROR', errorMessage)
        
        commit('ADD_NOTIFICATION', {
          type: 'danger',
          message: errorMessage
        })
        
        throw error
      }
    },
    
    async updateSubject({ commit }, { id, subject }) {
      commit('SET_LOADING', true)
      
      try {
        const response = await axiosInstance.put(`/subjects/${id}`, subject)
        // Fetch updated subjects after updating
        await this.dispatch('fetchSubjects')
        commit('SET_LOADING', false)
        return response.data
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data?.error || 'Failed to update subject')
        throw error
      }
    },
    
    async deleteSubject({ commit }, id) {
      commit('SET_LOADING', true)
      
      try {
        const response = await axiosInstance.delete(`/subjects/${id}`)
        await this.dispatch('fetchSubjects')
        commit('SET_LOADING', false)
        return response.data
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data?.error || 'Failed to delete subject')
        throw error
      }
    },
    
    async fetchChapters({ commit }, subjectId) {
      commit('SET_LOADING', true)
      
      try {
        const response = await axiosInstance.get(`/subjects/${subjectId}/chapters`)
        commit('SET_LOADING', false)
        return response.data
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data?.error || 'Failed to fetch chapters')
        throw error
      }
    },
    
    async fetchChapter({ commit }, chapterId) {
      commit('SET_LOADING', true)
      
      try {
        const response = await axiosInstance.get(`/chapters/${chapterId}`)
        commit('SET_LOADING', false)
        return response.data
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data?.error || 'Failed to fetch chapter')
        throw error
      }
    },
    
    async createChapter({ commit }, { subjectId, chapter }) {
      commit('SET_LOADING', true);
      
      try {
        console.log('Creating chapter:', chapter);
        
        const response = await axiosInstance.post(`/subjects/${subjectId}/chapters`, chapter);
        
        commit('SET_LOADING', false);
        
        commit('ADD_NOTIFICATION', {
          type: 'success',
          message: 'Chapter created successfully'
        });
        
        return response.data;
      } catch (error) {
        commit('SET_LOADING', false);
        
        let errorMessage = 'Failed to create chapter';
        if (error.response) {
          if (error.response.status === 409) {
            errorMessage = 'A chapter with this name already exists';
          } else if (error.response.data && error.response.data.error) {
            errorMessage = error.response.data.error;
          }
        }
        
        commit('SET_ERROR', errorMessage);
        commit('ADD_NOTIFICATION', {
          type: 'error',
          message: errorMessage
        });
        
        throw error;
      }
    },
    
    async updateChapter({ commit }, { id, chapter }) {
      commit('SET_LOADING', true);
      
      try {
        console.log('Updating chapter:', id, chapter);
        
        const response = await axiosInstance.put(`/chapters/${id}`, chapter);
        
        commit('SET_LOADING', false);
        commit('ADD_NOTIFICATION', {
          type: 'success',
          message: 'Chapter updated successfully'
        });
        
        return response.data;
      } catch (error) {
        commit('SET_LOADING', false);
        
        let errorMessage = 'Failed to update chapter';
        if (error.response) {
          if (error.response.status === 409) {
            errorMessage = 'Another chapter with this name already exists';
          } else if (error.response.data && error.response.data.error) {
            errorMessage = error.response.data.error;
          }
        }
        
        commit('SET_ERROR', errorMessage);
        commit('ADD_NOTIFICATION', {
          type: 'error',
          message: errorMessage
        });
        
        throw error;
      }
    },
    
    async deleteChapter({ commit }, { id, subjectId }) {
      commit('SET_LOADING', true);
      
      try {
        console.log('Deleting chapter:', id);
        
        const response = await axiosInstance.delete(`/chapters/${id}`);
        
        commit('SET_LOADING', false);
        commit('ADD_NOTIFICATION', {
          type: 'success',
          message: response.data.message || 'Chapter successfully deleted'
        });
        
        return response.data;
      } catch (error) {
        commit('SET_LOADING', false);
        
        let errorMessage = 'Failed to delete chapter';
        
        if (error.response) {
          if (error.response.status === 400 && error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data && error.response.data.error) {
            errorMessage = error.response.data.error;
          }
        }
        
        commit('SET_ERROR', errorMessage);
        commit('ADD_NOTIFICATION', {
          type: 'error',
          message: errorMessage
        });
        
        throw error;
      }
    },
    
    
    async fetchQuizzes({ commit }, chapterId) {
      commit('SET_LOADING', true)
      
      try {
        const response = await axiosInstance.get(`/chapters/${chapterId}/quizzes`)
        commit('SET_LOADING', false)
        return response.data
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data?.error || 'Failed to fetch quizzes')
        throw error
      }
    },
    
    async fetchQuiz({ commit }, quizId) {
      commit('SET_LOADING', true)
      
      try {
        const response = await axiosInstance.get(`/quizzes/${quizId}`)
        commit('SET_CURRENT_QUIZ', response.data)
        commit('SET_LOADING', false)
        return response.data
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data?.error || 'Failed to fetch quiz')
        throw error
      }
    },
    
    async submitQuiz({ commit }, { quizId, answers, timeTaken }) {
      commit('SET_LOADING', true)
      
      try {
        const response = await axiosInstance.post(`/quizzes/${quizId}/submit`, {
          answers,
          time_taken: timeTaken
        })
        commit('SET_LOADING', false)
        return response.data
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data?.error || 'Failed to submit quiz')
        throw error
      }
    },
    
    async createQuiz({ commit }, { chapterId, quiz }) {
      commit('SET_LOADING', true);
      
      try {
        console.log('Creating quiz:', quiz);
        
        const response = await axiosInstance.post(`/chapters/${chapterId}/quizzes`, quiz);
        
        commit('SET_LOADING', false);
        commit('ADD_NOTIFICATION', {
          type: 'success',
          message: 'Quiz created successfully'
        });
        
        return response.data;
      } catch (error) {
        commit('SET_LOADING', false);
        
        let errorMessage = 'Failed to create quiz';
        if (error.response) {
          if (error.response.status === 409) {
            errorMessage = 'A quiz with this title already exists in this chapter';
          } else if (error.response.data && error.response.data.error) {
            errorMessage = error.response.data.error;
          }
        }
        
        commit('SET_ERROR', errorMessage);
        commit('ADD_NOTIFICATION', {
          type: 'error',
          message: errorMessage
        });
        
        throw error;
      }
    },
    
    async updateQuiz({ commit }, { id, quiz }) {
      commit('SET_LOADING', true);
      
      try {
        console.log('Updating quiz:', id, quiz);
        
        const response = await axiosInstance.put(`/quizzes/${id}`, quiz);
        
        commit('SET_LOADING', false);
        commit('ADD_NOTIFICATION', {
          type: 'success',
          message: 'Quiz updated successfully'
        });
        
        return response.data;
      } catch (error) {
        commit('SET_LOADING', false);
        
        let errorMessage = 'Failed to update quiz';
        if (error.response) {
          if (error.response.status === 409) {
            errorMessage = 'Another quiz with this title already exists in this chapter';
          } else if (error.response.data && error.response.data.error) {
            errorMessage = error.response.data.error;
          }
        }
        
        commit('SET_ERROR', errorMessage);
        commit('ADD_NOTIFICATION', {
          type: 'error',
          message: errorMessage
        });
        
        throw error;
      }
    },
    
    async deleteQuiz({ commit }, id) {
      commit('SET_LOADING', true);
      
      try {
        console.log('Deleting quiz:', id);
        
        const response = await axiosInstance.delete(`/quizzes/${id}`);
        
        commit('SET_LOADING', false);
        commit('ADD_NOTIFICATION', {
          type: 'success',
          message: response.data.message || 'Quiz successfully deleted'
        });
        
        return response.data;
      } catch (error) {
        commit('SET_LOADING', false);
        
        let errorMessage = 'Failed to delete quiz';
        
        if (error.response) {
          if (error.response.status === 400 && error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data && error.response.data.error) {
            errorMessage = error.response.data.error;
          }
        }
        
        commit('SET_ERROR', errorMessage);
        commit('ADD_NOTIFICATION', {
          type: 'error',
          message: errorMessage
        });
        
        throw error;
      }
    },
    
    async fetchQuestions({ commit }, quizId) {
      commit('SET_LOADING', true)
      
      try {
        const response = await axiosInstance.get(`/quizzes/${quizId}/questions`)
        commit('SET_LOADING', false)
        return response.data
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data?.error || 'Failed to fetch questions')
        throw error
      }
    },
    
    async createQuestion({ commit }, { quizId, question }) {
      commit('SET_LOADING', true)
      
      try {
        const response = await axiosInstance.post(`/quizzes/${quizId}/questions`, question)
        commit('SET_LOADING', false)
        return response.data
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data?.error || 'Failed to create question')
        throw error
      }
    },
    
    async updateQuestion({ commit }, { id, question }) {
      commit('SET_LOADING', true)
      
      try {
        const response = await axiosInstance.put(`/questions/${id}`, question)
        commit('SET_LOADING', false)
        return response.data
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data?.error || 'Failed to update question')
        throw error
      }
    },
    
    async deleteQuestion({ commit }, id) {
      commit('SET_LOADING', true)
      
      try {
        const response = await axiosInstance.delete(`/questions/${id}`)
        commit('SET_LOADING', false)
        return response.data
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data?.error || 'Failed to delete question')
        throw error
      }
    },
    
    // Score actions
    async fetchScores({ commit }) {
      commit('SET_LOADING', true)
      
      try {
        const response = await axiosInstance.get('/scores')
        commit('SET_SCORES', response.data)
        commit('SET_LOADING', false)
        return response.data
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data?.error || 'Failed to fetch scores')
        throw error
      }
    },
    
    async fetchUsers({ commit }) {
      commit('SET_LOADING', true)
      
      try {
        const response = await axiosInstance.get('/admin/users')
        commit('SET_LOADING', false)
        return response.data
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data?.error || 'Failed to fetch users')
        throw error
      }
    },
    
    async getUserStats({ commit }, userId) {
      commit('SET_LOADING', true)
      
      try {
        const response = await axiosInstance.get(`/admin/users/${userId}/stats`)
        commit('SET_LOADING', false)
        return response.data
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data?.error || 'Failed to fetch user statistics')
        throw error
      }
    },
    
    async toggleUserStatus({ commit }, { userId, isActive }) {
      commit('SET_LOADING', true)
      
      try {
        const response = await axiosInstance.put(`/admin/users/${userId}/status`, {
          is_active: isActive
        })
        commit('SET_LOADING', false)
        return response.data
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data?.error || 'Failed to update user status')
        throw error
      }
    },
    
    async exportUsers({ commit }) {
      commit('SET_LOADING', true)
      
      try {
        const response = await axiosInstance.post('/admin/users/export')
        commit('SET_LOADING', false)
        return response.data
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data?.error || 'Failed to export user data')
        throw error
      }
    },
    
    async fetchReports({ commit }, period) {
      commit('SET_LOADING', true)
      
      try {
        const response = await axiosInstance.get(`/admin/reports?period=${period}`)
        commit('SET_LOADING', false)
        return response.data
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data?.error || 'Failed to fetch reports')
        throw error
      }
    },
    
    async exportReports({ commit }) {
      commit('SET_LOADING', true)
      
      try {
        const response = await axiosInstance.get('/admin/reports/export')
        commit('SET_LOADING', false)
        return response.data
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data?.error || 'Failed to export reports')
        throw error
      }
    },
    
    
    async exportQuizData({ commit }) {
      commit('SET_LOADING', true)
      
      try {
        const response = await axiosInstance.post('/users/scores/export')
        commit('SET_LOADING', false)
        return response.data
      } catch (error) {
        commit('SET_LOADING', false)
        commit('SET_ERROR', error.response?.data?.error || 'Failed to export quiz data')
        throw error
      }
    },
    
    addNotification({ commit }, notification) {
      commit('ADD_NOTIFICATION', notification)
    },
    
    clearNotification({ commit }, id) {
      commit('CLEAR_NOTIFICATION', id)
    },
    
    clearAllNotifications({ commit }) {
      commit('CLEAR_ALL_NOTIFICATIONS')
    },
    
    resetAuthHeader() {
      delete axiosInstance.defaults.headers.common['Authorization']
    },
    
    async validateSession({ commit, state }) {
      if (!state.token) {
        return false;
      }
      
      try {
        const response = await axiosInstance.get('/auth/user', {
          timeout: 5000,
          _ignoreAuthError: true 
        });
        
        if (response.status === 200 && response.data) {
          commit('SET_USER', response.data);
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('Session validation failed:', error);
        
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.log('Session invalid, logging out');
          commit('LOGOUT');
          delete axiosInstance.defaults.headers.common['Authorization'];
          
          if (!error.config?.silent) {
            commit('ADD_NOTIFICATION', {
              type: 'error',
              message: 'Your session has expired. Please log in again.'
            });
          }
          
          return false;
        }
        return true;
      }
    },
  }
})

export default store 



