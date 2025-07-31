<template>
  <div class="login-page">
    <div class="login-background"></div>
    <div class="container">
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-lg-5 col-md-7">
          <div class="login-card">
            <div class="login-header text-center mb-4">
              <div class="logo-container mb-3">
                <img src="/quiz-logo.svg" alt="Quiz Master" height="48" class="me-2" />
                <span class="logo-text">Quiz Master</span>
              </div>
              <h1 class="login-title">Welcome Back</h1>
              <p class="login-subtitle">Sign in to continue your learning journey</p>
            </div>
            
            <form @submit.prevent="login" class="login-form">
              <div class="alert alert-danger alert-modern" v-if="error">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                {{ error }}
              </div>
              
              <div class="form-group mb-4">
                <label for="email" class="form-label">Email Address</label>
                <div class="input-wrapper">
                  <i class="bi bi-envelope input-icon"></i>
                  <input 
                    type="email" 
                    class="form-control input-modern" 
                    id="email" 
                    v-model="email" 
                    placeholder="Enter your email address"
                    required
                    autofocus
                  >
                </div>
              </div>
              
              <div class="form-group mb-4">
                <label for="password" class="form-label">Password</label>
                <div class="input-wrapper">
                  <i class="bi bi-lock input-icon"></i>
                  <input 
                    :type="showPassword ? 'text' : 'password'" 
                    class="form-control input-modern" 
                    id="password" 
                    v-model="password" 
                    placeholder="Enter your password"
                    required
                  >
                  <button 
                    class="btn btn-link password-toggle" 
                    type="button"
                    @click="togglePasswordVisibility"
                  >
                    <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                  </button>
                </div>
              </div>
              
              <div class="d-grid mb-4">
                <button 
                  type="submit" 
                  class="btn btn-primary btn-modern" 
                  :disabled="isLoading"
                >
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  <span>{{ isLoading ? 'Signing in...' : 'Sign In' }}</span>
                </button>
              </div>
              
              <div class="text-center">
                <p class="register-link">
                  Don't have an account? 
                  <router-link :to="{ name: 'register' }" class="link-modern">
                    Create one here
                  </router-link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'

export default {
  name: 'LoginView',
  
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    
    const email = ref('')
    const password = ref('')
    const showPassword = ref(false)
    const error = ref(null)
    const isLoading = ref(false)
    
    const redirectPath = computed(() => route.query.redirect || 
      (store.getters.isAdmin ? '/admin/dashboard' : '/dashboard'))
    
    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value
    }
    
    const login = async () => {
      error.value = null
      isLoading.value = true
      
      try {
        await store.dispatch('login', {
          email: email.value,
          password: password.value
        })
        
        
        router.push(redirectPath.value)
      } catch (err) {
        error.value = err.response?.data?.error || 'Login failed. Please check your credentials.'
      } finally {
        isLoading.value = false
      }
    }
    
    return {
      email,
      password,
      showPassword,
      error,
      isLoading,
      togglePasswordVisibility,
      login
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  display: flex;
  align-items: center;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 3rem 2.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 2;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: #718096;
  font-size: 1rem;
  margin: 0;
}

.login-form {
  margin-top: 2rem;
}

.form-label {
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  z-index: 2;
}

.input-modern {
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.input-modern:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  outline: none;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  border: none;
  background: none;
  z-index: 2;
}

.password-toggle:hover {
  color: #667eea;
}

.btn-modern {
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-modern:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-modern:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.alert-modern {
  border-radius: 12px;
  border: none;
  background: #fed7d7;
  color: #c53030;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.register-link {
  color: #718096;
  margin: 0;
}

.link-modern {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.link-modern:hover {
  color: #764ba2;
}

@media (max-width: 768px) {
  .login-card {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }
  
  .login-title {
    font-size: 1.75rem;
  }
}
</style> 



