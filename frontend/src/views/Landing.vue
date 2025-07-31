<template>
  <div class="landing-page">
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top">
      <div class="container">
        <router-link to="/" class="navbar-brand d-flex align-items-center">
          <img src="/quiz-logo.svg" alt="Quiz Master" height="32" class="me-2" />
          <span class="fw-bold text-primary">Quiz Master</span>
        </router-link>
        
        <div class="navbar-nav ms-auto">
          <template v-if="!isAuthenticated">
            <router-link to="/login" class="nav-link me-3">Sign In</router-link>
            <router-link to="/register" class="btn btn-primary px-4">Get Started</router-link>
          </template>
          <template v-else>
            <router-link :to="isAdmin ? '/admin/dashboard' : '/dashboard'" class="btn btn-primary me-2">
              Dashboard
            </router-link>
            <button @click="handleLogout" class="btn btn-outline-secondary">
              Logout
            </button>
          </template>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-background"></div>
      <div class="container">
        <div class="row align-items-center min-vh-100 py-5">
          <div class="col-lg-6 mb-5 mb-lg-0">
            <div class="hero-content">
              <div class="badge bg-primary-soft text-primary px-3 py-2 rounded-pill mb-4">
                <i class="bi bi-star-fill me-2"></i>
                #1 Quiz Platform
              </div>
              <h1 class="hero-title mb-4">
                Master Your Knowledge with 
                <span class="text-gradient">Interactive Quizzes</span>
              </h1>
              <p class="hero-subtitle mb-5">
                Prepare for exams, test your skills, and track your progress with our comprehensive quiz platform. Join thousands of students excelling in their studies.
              </p>
              
              <div class="hero-actions" v-if="!isAuthenticated">
                <router-link to="/register" class="btn btn-primary btn-lg me-3">
                  <i class="bi bi-rocket-takeoff me-2"></i>
                  Start Learning Free
                </router-link>
                <router-link to="/login" class="btn btn-outline-primary btn-lg">
                  <i class="bi bi-box-arrow-in-right me-2"></i>
                  Sign In
                </router-link>
              </div>
              
              <div class="hero-actions" v-else>
                <router-link :to="isAdmin ? '/admin/dashboard' : '/dashboard'" class="btn btn-primary btn-lg me-3">
                  <i class="bi bi-speedometer2 me-2"></i>
                  Go to Dashboard
                </router-link>
                <button @click="handleLogout" class="btn btn-outline-primary btn-lg">
                  <i class="bi bi-box-arrow-right me-2"></i>
                  Logout
                </button>
              </div>

              <!-- Stats -->
              <div class="hero-stats mt-5">
                <div class="row">
                  <div class="col-4">
                    <div class="stat-item">
                      <h3 class="stat-number">10K+</h3>
                      <p class="stat-label">Students</p>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="stat-item">
                      <h3 class="stat-number">500+</h3>
                      <p class="stat-label">Quizzes</p>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="stat-item">
                      <h3 class="stat-number">95%</h3>
                      <p class="stat-label">Success Rate</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-lg-6">
            <div class="hero-image">
              <div class="floating-card card-1">
                <div class="card bg-white shadow-lg border-0 p-4">
                  <div class="d-flex align-items-center">
                    <div class="icon-circle bg-success-soft me-3">
                      <i class="bi bi-check-circle text-success"></i>
                    </div>
                    <div>
                      <h6 class="mb-1">Quiz Completed!</h6>
                      <small class="text-muted">Score: 95/100</small>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="floating-card card-2">
                <div class="card bg-white shadow-lg border-0 p-4">
                  <div class="d-flex align-items-center">
                    <div class="icon-circle bg-primary-soft me-3">
                      <i class="bi bi-trophy text-primary"></i>
                    </div>
                    <div>
                      <h6 class="mb-1">New Achievement!</h6>
                      <small class="text-muted">Quiz Master Level</small>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="hero-main-image">
                <img src="/quiz-hero-image.svg" alt="Quiz Master" class="img-fluid" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features py-5">
      <div class="container">
        <div class="row">
          <div class="col-lg-8 mx-auto text-center mb-5">
            <h2 class="section-title mb-4">Why Choose Quiz Master?</h2>
            <p class="section-subtitle">Everything you need to excel in your studies and track your progress effectively.</p>
          </div>
        </div>
        
        <div class="row g-4">
          <div class="col-md-4">
            <div class="feature-card">
              <div class="feature-icon bg-primary-soft">
                <i class="bi bi-lightning-charge text-primary"></i>
              </div>
              <h5 class="feature-title">Interactive Quizzes</h5>
              <p class="feature-description">Engage with dynamic quizzes designed to test your knowledge and improve retention.</p>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="feature-card">
              <div class="feature-icon bg-success-soft">
                <i class="bi bi-graph-up text-success"></i>
              </div>
              <h5 class="feature-title">Progress Tracking</h5>
              <p class="feature-description">Monitor your learning journey with detailed analytics and performance insights.</p>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="feature-card">
              <div class="feature-icon bg-warning-soft">
                <i class="bi bi-award text-warning"></i>
              </div>
              <h5 class="feature-title">Achievements</h5>
              <p class="feature-description">Earn badges and certificates as you complete quizzes and reach milestones.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container">
        <div class="cta-card">
          <div class="row align-items-center">
            <div class="col-lg-8">
              <h2 class="cta-title mb-3">Ready to Transform Your Learning?</h2>
              <p class="cta-subtitle mb-0">Join thousands of students who are already using Quiz Master to excel in their studies.</p>
            </div>
            <div class="col-lg-4 text-lg-end mt-4 mt-lg-0">
              <div v-if="!isAuthenticated">
                <router-link to="/register" class="btn btn-light btn-lg">
                  <i class="bi bi-rocket-takeoff me-2"></i>
                  Start Learning Now
                </router-link>
              </div>
              <div v-else>
                <router-link :to="isAdmin ? '/admin/dashboard' : '/dashboard'" class="btn btn-light btn-lg">
                  <i class="bi bi-speedometer2 me-2"></i>
                  Go to Dashboard
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default {
  name: 'LandingPage',
  
  setup() {
    const store = useStore();
    const router = useRouter();
    
    const isAuthenticated = computed(() => store.getters.isAuthenticated);
    const isAdmin = computed(() => store.getters.isAdmin);
    
    const handleLogout = async () => {
      try {
        store.dispatch('addNotification', {
          type: 'info',
          message: 'Logging you out...'
        });
        
        await store.dispatch('logout');
        
        store.dispatch('addNotification', {
          type: 'success',
          message: 'You have been successfully logged out'
        });
       
        setTimeout(() => {
          router.push({ name: 'login' });
        }, 300);
      } catch (error) {
        console.error('Logout error:', error);
        
        store.dispatch('addNotification', {
          type: 'error',
          message: 'There was a problem logging out'
        });
      }
    };
    
    return {
      isAuthenticated,
      isAdmin,
      handleLogout
    };
  }
};
</script>

<style scoped>
.landing-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow-x: hidden;
}

/* Navigation */
.navbar {
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  z-index: 1000;
}

.navbar-brand {
  font-size: 1.5rem;
  text-decoration: none;
}

/* Hero Section */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%);
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 2rem;
}

.text-gradient {
  background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  line-height: 1.6;
  opacity: 0.9;
  max-width: 500px;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
}

.btn-outline-primary {
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.btn-outline-primary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  color: white;
}

/* Hero Stats */
.hero-stats {
  margin-top: 3rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  color: #ffeaa7;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
  margin: 0;
}

/* Hero Image */
.hero-image {
  position: relative;
  z-index: 2;
}

.hero-main-image {
  position: relative;
  z-index: 1;
}

.floating-card {
  position: absolute;
  z-index: 2;
  animation: float 6s ease-in-out infinite;
}

.card-1 {
  top: 20%;
  left: -10%;
  animation-delay: 0s;
}

.card-2 {
  bottom: 30%;
  right: -10%;
  animation-delay: 3s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(1deg); }
}

.icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

/* Utility Classes */
.bg-primary-soft {
  background-color: rgba(102, 126, 234, 0.1) !important;
}

.bg-success-soft {
  background-color: rgba(40, 167, 69, 0.1) !important;
}

.bg-warning-soft {
  background-color: rgba(255, 193, 7, 0.1) !important;
}

/* Features Section */
.features {
  padding: 6rem 0;
  background: #f8f9fa;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #718096;
  max-width: 600px;
  margin: 0 auto;
}

.feature-card {
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 100%;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  font-size: 2rem;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
}

.feature-description {
  color: #718096;
  line-height: 1.6;
  margin: 0;
}

/* CTA Section */
.cta {
  padding: 6rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.cta::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
}

.cta-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 25px;
  padding: 4rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 2;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
}

.cta-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

.btn-light {
  background: white;
  color: #667eea;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
}

.btn-light:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.4);
  color: #667eea;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .hero-actions {
    flex-direction: column;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .cta-title {
    font-size: 2rem;
  }
  
  .cta-card {
    padding: 2rem;
  }
  
  .floating-card {
    display: none;
  }
}

@media (max-width: 576px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .feature-card {
    padding: 2rem 1rem;
  }
}
</style> 