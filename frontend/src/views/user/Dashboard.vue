<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import api from '../../services/api';

const router = useRouter();
const store = useStore();
const userScores = ref([]);
const subjects = ref([]);
const activeQuizzes = ref([]);
const isLoading = ref(true);
const loadingQuizzes = ref(true);
const stats = ref({
  completed: 0,
  passed: 0,
  average_score: 0,
  avg_time_seconds: 0
});
const user = ref(JSON.parse(localStorage.getItem('quiz_master_user') || '{}'));


const recentAttempts = computed(() => {
  return userScores.value.slice(0, 5); 
});

const activeQuizCount = computed(() => {
  return activeQuizzes.value.length;
});

const pendingCount = computed(() => {
  const now = new Date();
  return activeQuizzes.value.filter(quiz => {
    const startDate = quiz.start_date ? new Date(quiz.start_date) : null;
    return startDate && startDate > now;
  }).length;
});


const fetchData = async () => {
  isLoading.value = true;
  loadingQuizzes.value = true;
  
  try {
    
    const scoresResponse = await api.scores.getAll();
    userScores.value = scoresResponse.data;
    
   
    const statsResponse = await api.dashboard.getStats();
    stats.value = statsResponse.data;
    
    
    const subjectsResponse = await api.subjects.getAll();
    subjects.value = subjectsResponse.data;
    
    
    await fetchActiveQuizzes();
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    store.commit('ADD_NOTIFICATION', {
      type: 'error',
      message: 'Failed to load dashboard data. Please try again.'
    });
  } finally {
    isLoading.value = false;
  }
};


const fetchActiveQuizzes = async () => {
  loadingQuizzes.value = true;
  
  try {
    const activeQuizzesList = [];
    
    
    for (const subject of subjects.value) {
      const chaptersResponse = await api.subjects.getChapters(subject.id);
      const chapters = chaptersResponse.data;
      
      for (const chapter of chapters) {
        const quizzesResponse = await api.chapters.getQuizzes(chapter.id);
        const quizzes = quizzesResponse.data;
        
        
        quizzes.forEach(quiz => {
          activeQuizzesList.push({
            ...quiz,
            subject_name: subject.name,
            chapter_name: chapter.name
          });
        });
      }
    }
    
   

    const now = new Date();
    activeQuizzes.value = activeQuizzesList.filter(quiz => {
      const startDate = quiz.start_date ? new Date(quiz.start_date) : null;
      const endDate = quiz.end_date ? new Date(quiz.end_date) : null;
      
      return quiz.is_active && 
             (!startDate || startDate <= now) && 
             (!endDate || endDate >= now);
    });
    
  } catch (error) {
    console.error('Error fetching active quizzes:', error);
  } finally {
    loadingQuizzes.value = false;
  }
};


const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatTime = (seconds) => {
  if (!seconds) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const getScoreClass = (score) => {
  if (score >= 90) return 'excellent';
  if (score >= 80) return 'good';
  if (score >= 70) return 'average';
  return 'poor';
};


const exportQuizData = async () => {
  try {
    await api.scores.exportCsv();
    store.commit('ADD_NOTIFICATION', {
      type: 'success',
      message: 'Quiz data export initiated! You will receive an email with the CSV file shortly.'
    });
  } catch (error) {
    console.error('Error exporting quiz data:', error);
    store.commit('ADD_NOTIFICATION', {
      type: 'error',
      message: 'Failed to export quiz data. Please try again later.'
    });
  }
};



onMounted(fetchData);




</script>

<template>
  <div class="dashboard-page">
    <div class="container py-5">
      <div class="dashboard-header mb-5">
        <h1 class="dashboard-title">Dashboard</h1>
        <p class="dashboard-subtitle">Track your progress and manage your learning journey</p>
      </div>
      
      <!-- Welcome Section -->
      <div class="welcome-card mb-5">
        <div class="welcome-content">
          <div class="welcome-text">
            <h2 class="welcome-title">Welcome back, {{ user.first_name }}! 👋</h2>
            <p class="welcome-message">
              You have <strong>{{ activeQuizCount }}</strong> active {{ activeQuizCount === 1 ? 'quiz' : 'quizzes' }} available to take.
              {{ pendingCount > 0 ? `And <strong>${pendingCount}</strong> ${pendingCount === 1 ? 'quiz' : 'quizzes'} coming soon.` : '' }}
            </p>
            <div class="welcome-actions">
              <router-link to="/subjects" class="btn btn-primary btn-modern">
                <i class="bi bi-play-circle me-2"></i>
                Start Learning
              </router-link>
              <router-link to="/results" class="btn btn-outline-primary btn-modern">
                <i class="bi bi-graph-up me-2"></i>
                View Results
              </router-link>
            </div>
          </div>
          <div class="welcome-image">
            <img src="/quiz-hero-image.svg" alt="Welcome" class="img-fluid">
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid mb-5">
        <div class="stat-card">
          <div class="stat-icon bg-success-soft">
            <i class="bi bi-check-circle-fill text-success"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ stats.completed || 0 }}</h3>
            <p class="stat-label">Quizzes Completed</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon bg-warning-soft">
            <i class="bi bi-trophy-fill text-warning"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ stats.passed || 0 }}</h3>
            <p class="stat-label">Quizzes Passed</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon bg-primary-soft">
            <i class="bi bi-bar-chart-fill text-primary"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ stats.average_score || 0 }}%</h3>
            <p class="stat-label">Average Score</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon bg-danger-soft">
            <i class="bi bi-alarm-fill text-danger"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ formatTime(stats.avg_time_seconds || 0) }}</h3>
            <p class="stat-label">Average Time</p>
          </div>
        </div>
      </div>
    
      
      <!-- Content Grid -->
      <div class="content-grid">
        <div class="content-card">
          <div class="card-header-modern">
            <h4 class="card-title-modern">Available Quizzes</h4>
            <router-link to="/subjects" class="btn btn-outline-primary btn-sm-modern">View All</router-link>
          </div>
          <div class="card-body-modern">
            <div v-if="loadingQuizzes" class="loading-state">
              <div class="spinner-modern"></div>
              <p class="loading-text">Loading quizzes...</p>
            </div>
            
            <div v-else-if="activeQuizzes.length === 0" class="empty-state">
              <div class="empty-icon">
                <i class="bi bi-clipboard-x"></i>
              </div>
              <p class="empty-text">No quizzes available right now</p>
            </div>
            
            <div v-else class="quiz-list">
              <div v-for="quiz in activeQuizzes.slice(0, 5)" :key="quiz.id" class="quiz-item-modern">
                <div class="quiz-content">
                  <h6 class="quiz-title">{{ quiz.title }}</h6>
                  <div class="quiz-subtitle">{{ quiz.subject_name }} • {{ quiz.chapter_name }}</div>
                  <div class="quiz-meta">
                    <div class="meta-item">
                      <i class="bi bi-alarm"></i>
                      <span>{{ quiz.duration_minutes }} min</span>
                    </div>
                    <div class="meta-item">
                      <i class="bi bi-question-circle"></i>
                      <span>{{ quiz.question_count || '?' }} questions</span>
                    </div>
                  </div>
                </div>
                <router-link :to="{ name: 'user.takeQuiz', params: { quizId: quiz.id } }" class="btn btn-success btn-sm-modern">
                  Start
                </router-link>
              </div>
              
              <div v-if="activeQuizzes.length > 5" class="view-more">
                <router-link to="/subjects" class="link-modern">
                  View {{ activeQuizzes.length - 5 }} more quizzes
                </router-link>
              </div>
            </div>
          </div>
        </div>
        
        <div class="content-card">
          <div class="card-header-modern">
            <h4 class="card-title-modern">Recent Attempts</h4>
            <router-link to="/results" class="btn btn-outline-primary btn-sm-modern">View All</router-link>
          </div>
          <div class="card-body-modern">
            <div v-if="recentAttempts.length === 0" class="empty-state">
              <div class="empty-icon">
                <i class="bi bi-graph-up"></i>
              </div>
              <p class="empty-text">No quiz attempts yet</p>
              <router-link to="/subjects" class="btn btn-primary btn-sm-modern">
                Take Your First Quiz
              </router-link>
            </div>
            
            <div v-else class="attempt-list">
              <div v-for="attempt in recentAttempts" :key="attempt.id" class="attempt-item-modern">
                <div class="attempt-content">
                  <h6 class="attempt-title">{{ attempt.quiz_title }}</h6>
                  <div class="attempt-subtitle">{{ attempt.subject_name }} • {{ attempt.chapter_name }}</div>
                  <div class="attempt-meta">
                    <div class="meta-item">
                      <i class="bi bi-calendar"></i>
                      <span>{{ formatDate(attempt.completed_at) }}</span>
                    </div>
                    <div class="meta-item">
                      <i class="bi bi-clock"></i>
                      <span>{{ formatTime(attempt.time_taken_seconds) }}</span>
                    </div>
                  </div>
                </div>
                <div class="attempt-score">
                  <span class="score-badge" :class="getScoreClass(attempt.score)">
                    {{ attempt.score }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<style scoped>
.dashboard-page {
  background: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.dashboard-header {
  text-align: center;
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.dashboard-subtitle {
  color: #718096;
  font-size: 1.1rem;
  margin: 0;
}

/* Welcome Card */
.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  padding: 3rem 2rem;
  color: white;
  position: relative;
  overflow: hidden;
}

.welcome-card::before {
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

.welcome-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}

.welcome-text {
  flex: 1;
}

.welcome-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.welcome-message {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
}

.welcome-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.welcome-image {
  flex-shrink: 0;
  margin-left: 2rem;
}

.welcome-image img {
  max-width: 200px;
  height: auto;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon i {
  font-size: 1.75rem;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.5rem 0;
}

.stat-label {
  color: #718096;
  font-size: 0.9rem;
  margin: 0;
  font-weight: 500;
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

.bg-danger-soft {
  background-color: rgba(220, 53, 69, 0.1) !important;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.content-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.card-header-modern {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
}

.card-title-modern {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.card-body-modern {
  padding: 2rem;
}

/* Buttons */
.btn-modern {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-modern:hover {
  transform: translateY(-2px);
  text-decoration: none;
}

.btn-primary.btn-modern {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-primary.btn-modern:hover {
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-outline-primary.btn-modern {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline-primary.btn-modern:hover {
  background: #667eea;
  color: white;
}

.btn-sm-modern {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 3rem 1rem;
}

.spinner-modern {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #718096;
  font-size: 0.9rem;
  margin: 0;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 3rem;
  color: #cbd5e0;
  margin-bottom: 1rem;
}

.empty-text {
  color: #718096;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

/* Quiz List */
.quiz-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.quiz-item-modern {
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.quiz-item-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.quiz-content {
  flex: 1;
}

.quiz-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 0.5rem 0;
}

.quiz-subtitle {
  color: #718096;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
}

.quiz-meta {
  display: flex;
  gap: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #718096;
  font-size: 0.8rem;
}

.meta-item i {
  width: 16px;
  text-align: center;
}

/* Attempt List */
.attempt-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.attempt-item-modern {
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.attempt-item-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.attempt-content {
  flex: 1;
}

.attempt-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 0.5rem 0;
}

.attempt-subtitle {
  color: #718096;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
}

.attempt-meta {
  display: flex;
  gap: 1rem;
}

.attempt-score {
  flex-shrink: 0;
}

.score-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.score-badge.excellent {
  background: #c6f6d5;
  color: #22543d;
}

.score-badge.good {
  background: #fef5e7;
  color: #744210;
}

.score-badge.average {
  background: #fed7d7;
  color: #c53030;
}

.score-badge.poor {
  background: #fed7d7;
  color: #c53030;
}

/* Links */
.link-modern {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.link-modern:hover {
  color: #764ba2;
  text-decoration: none;
}

.view-more {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-title {
    font-size: 2rem;
  }
  
  .welcome-content {
    flex-direction: column;
    text-align: center;
  }
  
  .welcome-image {
    margin-left: 0;
    margin-top: 2rem;
  }
  
  .welcome-actions {
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .quiz-item-modern,
  .attempt-item-modern {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .quiz-meta,
  .attempt-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style> 




