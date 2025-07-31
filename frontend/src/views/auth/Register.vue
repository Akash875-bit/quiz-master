<template>
  <div class="register-page">
    <div class="register-background"></div>
    <div class="container">
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-lg-8 col-md-10">
          <div class="register-card">
            <div class="register-header text-center mb-4">
              <div class="logo-container mb-3">
                <img src="/quiz-logo.svg" alt="Quiz Master" height="48" class="me-2" />
                <span class="logo-text">Quiz Master</span>
              </div>
              <h1 class="register-title">Create Your Account</h1>
              <p class="register-subtitle">Join thousands of students learning with Quiz Master</p>
            </div>
            
            <form @submit.prevent="register" class="register-form">
              <div class="alert alert-danger alert-modern" v-if="error">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                {{ error }}
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-4">
                  <label for="first_name" class="form-label">First Name</label>
                  <input 
                    type="text" 
                    class="form-control input-modern" 
                    id="first_name" 
                    v-model="form.first_name" 
                    placeholder="Enter your first name"
                    required
                    autofocus
                  >
                </div>
                <div class="col-md-6 mb-4">
                  <label for="last_name" class="form-label">Last Name</label>
                  <input 
                    type="text" 
                    class="form-control input-modern" 
                    id="last_name" 
                    v-model="form.last_name" 
                    placeholder="Enter your last name"
                    required
                  >
                </div>
              </div>
              
              <div class="mb-4">
                <label for="username" class="form-label">Email Address</label>
                <div class="input-wrapper">
                  <i class="bi bi-envelope input-icon"></i>
                  <input 
                    type="email" 
                    class="form-control input-modern" 
                    id="username" 
                    v-model="form.email" 
                    placeholder="Enter your email address"
                    required
                  >
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-4">
                  <label for="qualification" class="form-label">Qualification</label>
                  <select 
                    class="form-select input-modern" 
                    id="qualification" 
                    v-model="form.qualification"
                  >
                    <option value="">Select your qualification</option>
                    <option value="High School">High School</option>
                    <option value="Bachelors">Bachelor Degree</option>
                    <option value="Masters">Master Degree</option>
                    <option value="PhD">PhD</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div class="col-md-6 mb-4">
                  <label for="dob" class="form-label">Date of Birth</label>
                  <input 
                    type="date" 
                    class="form-control input-modern" 
                    id="dob" 
                    v-model="form.dob"
                  >
                </div>
              </div>
              
              <div class="mb-4">
                <label for="password" class="form-label">Password</label>
                <div class="input-wrapper">
                  <i class="bi bi-lock input-icon"></i>
                  <input 
                    :type="showPassword ? 'text' : 'password'" 
                    class="form-control input-modern" 
                    id="password" 
                    v-model="form.password" 
                    placeholder="Create a strong password"
                    required
                  >
                  <button 
                    type="button" 
                    class="btn btn-link password-toggle" 
                    @click="toggleShowPassword"
                  >
                    <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                  </button>
                </div>
              </div>
              
              <div class="mb-4">
                <label for="password_confirmation" class="form-label">Confirm Password</label>
                <div class="input-wrapper">
                  <i class="bi bi-lock-fill input-icon"></i>
                  <input 
                    :type="showPassword ? 'text' : 'password'" 
                    class="form-control input-modern" 
                    id="password_confirmation" 
                    v-model="form.password_confirmation" 
                    placeholder="Confirm your password"
                    required
                  >
                </div>
                <div class="invalid-feedback" v-show="passwordsDoNotMatch">
                  Passwords do not match
                </div>
              </div>
              
              <div class="mb-4 form-check-modern">
                <input 
                  type="checkbox" 
                  class="form-check-input-modern" 
                  id="termsAgreed" 
                  v-model="form.terms_agreed"
                  required
                >
                <label class="form-check-label-modern" for="termsAgreed">
                  I agree to the <a href="#" class="link-modern">Terms of Service</a> and <a href="#" class="link-modern">Privacy Policy</a>
                </label>
              </div>
              
              <div class="d-grid mb-4">
                <button 
                  type="submit" 
                  class="btn btn-primary btn-modern" 
                  :disabled="isLoading || !isFormValid"
                >
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                  <span>Create Account</span>
                </button>
              </div>
              
              <div class="text-center">
                <p class="login-link">
                  Already have an account? 
                  <router-link :to="{ name: 'login' }" class="link-modern">Sign in</router-link>
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
import { ref, reactive, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'Register',
  
  setup() {
    const store = useStore()
    const router = useRouter()
    
    
    const form = reactive({
      first_name: '',
      last_name: '',
      email: '',
      qualification: '',
      dob: '',
      password: '',
      password_confirmation: '',
      terms_agreed: false
    })
    
    
    const isLoading = ref(false)
    const error = ref('')
    const showPassword = ref(false)
    
    
    const passwordsDoNotMatch = computed(() => {
      return form.password !== form.password_confirmation && form.password_confirmation !== ''
    })
    
    const isFormValid = computed(() => {
      return (
        form.first_name.trim() !== '' &&
        form.last_name.trim() !== '' &&
        form.email.trim() !== '' &&
        form.password !== '' &&
        form.password === form.password_confirmation &&
        form.terms_agreed
      )
    })
    
    
    const toggleShowPassword = () => {
      showPassword.value = !showPassword.value
    }
    
    const register = async () => {
      if (!isFormValid.value) {
        error.value = 'Please fill out all required fields correctly'
        return
      }
      
      error.value = ''
      isLoading.value = true
      
      try {
        
        const userData = {
          username: form.email,
          email: form.email,
          password: form.password,
          first_name: form.first_name,
          last_name: form.last_name,
          qualification: form.qualification || null,
          dob: form.dob || null
        }
        
        await store.dispatch('register', userData)
        
        
        router.push({ name: 'login' })
        
      } catch (err) {
        if (err.response && err.response.data && err.response.data.error) {
          error.value = err.response.data.error
        } else {
          error.value = 'Registration failed. Please try again.'
        }
      } finally {
        isLoading.value = false
      }
    }
    
    return {
      form,
      isLoading,
      error,
      showPassword,
      passwordsDoNotMatch,
      isFormValid,
      toggleShowPassword,
      register
    }
  }
}
</script>



<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  display: flex;
  align-items: center;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.register-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
}

.register-card {
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

.register-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.register-subtitle {
  color: #718096;
  font-size: 1rem;
  margin: 0;
}

.register-form {
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

.form-check-modern {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.form-check-input-modern {
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.125rem;
  border: 2px solid #e2e8f0;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.form-check-input-modern:checked {
  background-color: #667eea;
  border-color: #667eea;
}

.form-check-label-modern {
  color: #4a5568;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
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

.login-link {
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

.invalid-feedback {
  display: block;
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

@media (max-width: 768px) {
  .register-card {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }
  
  .register-title {
    font-size: 1.75rem;
  }
}
</style> 



