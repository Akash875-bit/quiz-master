<script setup>
import { ref, computed, onMounted, provide } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import Notifications from './components/Notifications.vue';
import axios from 'axios';

const router = useRouter();
const store = useStore();
const isAuthenticated = ref(!!localStorage.getItem('quiz_master_token'));
const user = ref(JSON.parse(localStorage.getItem('quiz_master_user') || '{}'));
const currentYear = computed(() => new Date().getFullYear());


provide('isAuthenticated', isAuthenticated);
provide('currentUser', user);

const isAdmin = computed(() => {
  return user.value && user.value.role === 'admin';
});

const menuItems = computed(() => {
  if (isAdmin.value) {
    return [
      { name: 'Dashboard', route: { name: 'admin.dashboard' }, icon: 'bi-speedometer2' },
      { name: 'Subjects', route: { name: 'admin.subjects' }, icon: 'bi-book' },
      { name: 'Users', route: { name: 'admin.users' }, icon: 'bi-people' }
    ];
  } else {
    return [
      { name: 'Dashboard', route: { name: 'user.dashboard' }, icon: 'bi-speedometer2' },
      { name: 'Subjects', route: { name: 'user.subjects' }, icon: 'bi-book' },
    ];
  }
});

const logout = async () => {
  try {
    console.log('Logging out user...');
    
   
    store.dispatch('addNotification', {
      type: 'info',
      message: 'Logging you out...'
    });
    
 
    await store.dispatch('logout');
    
   
    localStorage.removeItem('quiz_master_token');
    localStorage.removeItem('quiz_master_refresh_token');
    localStorage.removeItem('quiz_master_user');
    
    
    isAuthenticated.value = false;
    user.value = {};
    
    
    store.dispatch('resetAuthHeader');
    
    
    store.dispatch('addNotification', {
      type: 'success',
      message: 'You have been successfully logged out'
    });
    
    console.log('User logged out, redirecting to login page');
    
    setTimeout(() => {
      router.push({ name: 'login' });
    }, 300);
  } catch (error) {
    console.error('Error during logout:', error);
    
    
    store.dispatch('addNotification', {
      type: 'error',
      message: 'There was a problem logging out'
    });
    
    
    localStorage.removeItem('quiz_master_token');
    localStorage.removeItem('quiz_master_refresh_token');
    localStorage.removeItem('quiz_master_user');
    isAuthenticated.value = false;
    user.value = {};
    store.dispatch('resetAuthHeader');
    
    
    setTimeout(() => {
      router.push({ name: 'login' });
    }, 300);
  }
};


const syncAuthState = () => {
  const token = localStorage.getItem('quiz_master_token');
  const userJson = localStorage.getItem('quiz_master_user');
  
  isAuthenticated.value = !!token;
  user.value = userJson ? JSON.parse(userJson) : {};
  
  console.log(`Auth state synced: Authenticated=${isAuthenticated.value}`);
};


onMounted(async () => {
  
  window.addEventListener('storage', (event) => {
    if (event.key === 'quiz_master_token' || event.key === 'quiz_master_user') {
      syncAuthState();
    }
  });

  
  const token = localStorage.getItem('quiz_master_token');
  if (token) {
    try {
      console.log('Validating session with backend...');
      
      
      const isValid = await store.dispatch('validateSession');
      
      if (isValid) {
        
        isAuthenticated.value = true;
        user.value = store.getters.currentUser;
        console.log('User session is valid:', user.value);
        
        
        const currentToken = localStorage.getItem('quiz_master_token');
        if (currentToken) {
          console.log('Setting auth header for future requests');
          axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
        }
      } else {
        console.log('Session is invalid, user needs to login again');
        isAuthenticated.value = false;
        user.value = {};
        
        
        localStorage.removeItem('quiz_master_token');
        localStorage.removeItem('quiz_master_refresh_token');
        localStorage.removeItem('quiz_master_user');
      }
    } catch (err) {
      console.error('Session validation error:', err);
      
      
      console.log('Error during session validation, using existing auth state');
      
      
      syncAuthState();
    }
  } else {
    console.log('No token found, user is not authenticated');
    isAuthenticated.value = false;
    user.value = {};
  }
});
</script>

<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <router-link class="navbar-brand" to="/">
          <strong>Quiz Master</strong>
        </router-link>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          

          <ul class="navbar-nav me-auto" v-if="!isAuthenticated">
            <li class="nav-item">
              <router-link class="nav-link" to="/">Home</router-link>
            </li>
          </ul>
          
          

          <ul class="navbar-nav me-auto" v-else-if="!isAdmin">
            <li class="nav-item">
              <router-link class="nav-link" :to="{name: 'user.dashboard'}">Dashboard</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" :to="{name: 'user.subjects'}">Subjects</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" :to="{name: 'user.results'}">My Results</router-link>
            </li>
          </ul>
          
          
          <ul class="navbar-nav me-auto" v-else>
            <li class="nav-item">
              <router-link class="nav-link" :to="{name: 'admin.dashboard'}">Dashboard</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" :to="{name: 'admin.subjects'}">Subjects</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" :to="{name: 'admin.users'}">Users</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" :to="{name: 'admin.reports'}">Reports</router-link>
            </li>
          </ul>
          
          

          <ul class="navbar-nav ms-auto">
            <template v-if="!isAuthenticated">
              <li class="nav-item">
                <router-link class="nav-link" :to="{name: 'login'}">
                  <i class="bi bi-box-arrow-in-right me-1"></i> Login
                </router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" :to="{name: 'register'}">
                  <i class="bi bi-person-plus me-1"></i> Register
                </router-link>
              </li>
            </template>
            <template v-else>
              
              <li class="nav-item me-2">
                <button @click="logout" class="btn btn-outline-light">
                  <i class="bi bi-box-arrow-right me-1"></i> Logout
                </button>
              </li>
              

              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                  <i class="bi bi-person-circle me-1"></i> {{ user.username || 'User' }}
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <router-link class="dropdown-item" :to="isAdmin ? {name: 'admin.dashboard'} : {name: 'user.dashboard'}">
                      <i class="bi bi-person me-2"></i> {{ isAdmin ? 'Dashboard' : 'Dashboard' }}
                    </router-link>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="logout">
                      <i class="bi bi-box-arrow-right me-2"></i> Logout
                    </a>
                  </li>
                </ul>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </nav>
    
    <main>
      <router-view />
    </main>
    
   
    <Notifications />
    
    <footer class="footer-modern">
      <div class="container">
        <div class="footer-content">
          <div class="footer-main">
            <div class="footer-brand">
              <h3 class="footer-title">Quiz Master</h3>
              <p class="footer-subtitle">Empowering Learning Through Interactive Quizzes</p>
            </div>
            <div class="footer-info">
              <p class="footer-author">
                Made with <span class="heart">❤️</span> by Akash Kumar Prasad (23F3000442)
              </p>
              <p class="footer-copyright">&copy; {{ currentYear }} Quiz Master. All rights reserved.</p>
            </div>
          </div>
          <div class="footer-divider"></div>
          <div class="footer-bottom">
            <div class="footer-links">
              <a href="#" class="footer-link">Privacy Policy</a>
              <span class="footer-separator">•</span>
              <a href="#" class="footer-link">Terms of Service</a>
              <span class="footer-separator">•</span>
              <a href="#" class="footer-link">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
@import 'bootstrap-icons/font/bootstrap-icons.css';

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1 0 auto;
  width: 100%;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

.navbar-brand {
  font-weight: 700;
}

.nav-link {
  font-weight: 500;
}

.dropdown-item:active {
  background-color: #007bff;
}
h1, h2, h3, h4, h5, h6, p, label, span, a, button, input, select, textarea {
  white-space: normal !important;
  word-wrap: break-word;
}
.card-header h2, 
.card-header p {
  text-align: center;
}
.form-label {
  text-align: left !important;
  width: 100%;
  display: block;
}

/* Modern Footer Styles */
.footer-modern {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 0 1.5rem;
  margin-top: auto;
  position: relative;
  overflow: hidden;
}

.footer-modern::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
}

.footer-content {
  position: relative;
  z-index: 2;
}

.footer-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 2rem;
}

.footer-brand {
  flex: 1;
  min-width: 300px;
}

.footer-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer-subtitle {
  font-size: 0.95rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
}

.footer-info {
  flex: 1;
  min-width: 300px;
  text-align: right;
}

.footer-author {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.footer-author .heart {
  display: inline-block;
  animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.footer-copyright {
  font-size: 0.9rem;
  opacity: 0.8;
  margin: 0;
}

.footer-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  margin: 1.5rem 0;
}

.footer-bottom {
  text-align: center;
}

.footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.footer-link {
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 400;
  transition: all 0.3s ease;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.footer-link:hover {
  color: white;
  background: rgba(255,255,255,0.1);
  transform: translateY(-1px);
}

.footer-separator {
  color: rgba(255,255,255,0.5);
  font-size: 0.8rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .footer-main {
    flex-direction: column;
    text-align: center;
  }
  
  .footer-info {
    text-align: center;
  }
  
  .footer-links {
    gap: 0.5rem;
  }
  
  .footer-separator {
    display: none;
  }
  
  .footer-link {
    margin: 0 0.25rem;
  }
}
</style>





