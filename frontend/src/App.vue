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

const toggleMobileMenu = () => {
  const navbar = document.querySelector('.navbar-modern');
  navbar.classList.toggle('mobile-menu-open');
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
    <nav class="navbar-modern">
      <div class="navbar-container">
        <!-- Left side - QuizMaster Logo -->
        <div class="navbar-brand-section">
          <router-link class="navbar-brand-modern" to="/">
            <span class="brand-text">QuizMaster</span>
          </router-link>
        </div>
        
        <!-- Center - Navigation Links (for authenticated users) -->
        <div class="navbar-menu-section" v-if="isAuthenticated">
          <div class="nav-links" v-if="!isAdmin">
            <router-link class="nav-link-modern" :to="{name: 'user.dashboard'}">
              <i class="bi bi-speedometer2 me-2"></i>
              Dashboard
            </router-link>
            <router-link class="nav-link-modern" :to="{name: 'user.subjects'}">
              <i class="bi bi-book me-2"></i>
              Subjects
            </router-link>
            <router-link class="nav-link-modern" :to="{name: 'user.results'}">
              <i class="bi bi-graph-up me-2"></i>
              My Results
            </router-link>
          </div>
          
          <div class="nav-links" v-else>
            <router-link class="nav-link-modern" :to="{name: 'admin.dashboard'}">
              <i class="bi bi-speedometer2 me-2"></i>
              Dashboard
            </router-link>
            <router-link class="nav-link-modern" :to="{name: 'admin.subjects'}">
              <i class="bi bi-book me-2"></i>
              Subjects
            </router-link>
            <router-link class="nav-link-modern" :to="{name: 'admin.users'}">
              <i class="bi bi-people me-2"></i>
              Users
            </router-link>
            <router-link class="nav-link-modern" :to="{name: 'admin.reports'}">
              <i class="bi bi-bar-chart me-2"></i>
              Reports
            </router-link>
          </div>
        </div>
        
        <!-- Right side - Auth Actions -->
        <div class="navbar-actions">
          <template v-if="!isAuthenticated">
            <router-link class="btn-auth btn-login" :to="{name: 'login'}">
              <i class="bi bi-box-arrow-in-right me-2"></i>
              Sign In
            </router-link>
            <router-link class="btn-auth btn-register" :to="{name: 'register'}">
              <i class="bi bi-person-plus me-2"></i>
              Get Started
            </router-link>
          </template>
          <template v-else>
            <div class="user-menu">
              <div class="user-info">
                <div class="user-avatar">
                  <i class="bi bi-person-circle"></i>
                </div>
                <span class="username">{{ user.username || 'User' }}</span>
                <i class="bi bi-chevron-down dropdown-arrow"></i>
              </div>
              <div class="user-dropdown">
                <router-link class="dropdown-item-modern" :to="isAdmin ? {name: 'admin.dashboard'} : {name: 'user.dashboard'}">
                  <i class="bi bi-speedometer2 me-2"></i>
                  Dashboard
                </router-link>
                <div class="dropdown-divider-modern"></div>
                <button class="dropdown-item-modern logout-btn" @click="logout">
                  <i class="bi bi-box-arrow-right me-2"></i>
                  Sign Out
                </button>
              </div>
            </div>
          </template>
        </div>
        
        <!-- Mobile Menu Toggle -->
        <button class="mobile-menu-toggle" @click="toggleMobileMenu">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
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

/* Modern Navbar Styles */
.navbar-modern {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  padding: 0.75rem 0;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 95%;
  width: 800px;
  min-width: 600px;
}

.navbar-modern:hover {
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  transform: translateX(-50%) translateY(-2px);
}

.navbar-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.navbar-brand-section {
  flex-shrink: 0;
}

.navbar-brand-modern {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #2d3748;
  font-weight: 700;
  font-size: 1.4rem;
  transition: all 0.3s ease;
}

.navbar-brand-modern:hover {
  color: #667eea;
  transform: translateY(-1px);
}

.brand-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
}

.navbar-menu-section {
  flex: 1;
  display: flex;
  justify-content: center;
}

.navbar-actions {
  flex-shrink: 0;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link-modern {
  color: #4a5568;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  position: relative;
}

.nav-link-modern:hover {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.nav-link-modern.router-link-active {
  color: #667eea;
  background: rgba(102, 126, 234, 0.15);
  font-weight: 600;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-auth {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  border: none;
  cursor: pointer;
}

.btn-login {
  color: #667eea;
  background: transparent;
  border: 2px solid #667eea;
}

.btn-login:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-register {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: 2px solid transparent;
}

.btn-register:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
}

.user-menu {
  position: relative;
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
}

.user-info:hover {
  background: rgba(102, 126, 234, 0.15);
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
}

.username {
  font-weight: 500;
  color: #2d3748;
}

.dropdown-arrow {
  color: #667eea;
  transition: transform 0.3s ease;
}

.user-menu:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
}

.user-menu:hover .user-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item-modern {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: #4a5568;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.dropdown-item-modern:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.dropdown-item-modern.logout-btn:hover {
  background: rgba(245, 101, 101, 0.1);
  color: #e53e3e;
}

.dropdown-divider-modern {
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
  margin: 0.5rem 0;
}

.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.hamburger-line {
  width: 24px;
  height: 2px;
  background: #4a5568;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.mobile-menu-toggle:hover .hamburger-line {
  background: #667eea;
}

/* Responsive Design */
@media (max-width: 768px) {
  .navbar-modern {
    top: 10px;
    max-width: 95%;
    width: auto;
    min-width: auto;
    border-radius: 25px;
    padding: 0.5rem 0;
  }
  
  .navbar-container {
    padding: 0 1rem;
    gap: 1rem;
  }
  
  .navbar-menu-section {
    display: none;
  }
  
  .navbar-actions {
    display: none;
  }
  
  .mobile-menu-toggle {
    display: flex;
  }
  
  .navbar-modern.mobile-menu-open {
    border-radius: 25px 25px 0 0;
    top: 10px;
  }
  
  .navbar-modern.mobile-menu-open .navbar-menu-section,
  .navbar-modern.mobile-menu-open .navbar-actions {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    padding: 1rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border-radius: 0 0 25px 25px;
  }
  
  .navbar-modern.mobile-menu-open .nav-links {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }
  
  .navbar-modern.mobile-menu-open .nav-link-modern {
    width: 100%;
    justify-content: center;
  }
  
  .navbar-modern.mobile-menu-open .navbar-actions {
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .navbar-modern.mobile-menu-open .btn-auth {
    width: 100%;
    justify-content: center;
  }
}

/* Remove margin since we now have a floating navbar */
main {
  margin-top: 0;
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





