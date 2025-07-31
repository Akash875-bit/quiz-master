



<template>
  <div class="admin-dashboard">
    <div class="container admin-container">
      <div class="dashboard-header mb-5">
        <h1 class="dashboard-title">Admin Dashboard</h1>
        <p class="dashboard-subtitle">Manage your quiz platform and monitor performance</p>
      </div>

      <div v-if="isLoading" class="loading-container">
        <div class="spinner-modern"></div>
        <p class="loading-text">Loading dashboard data...</p>
      </div>

      <div v-else>
        <!-- Stats Overview -->
        <div class="stats-overview mb-5">
          <div class="stat-card">
            <div class="stat-icon bg-success-soft">
              <i class="bi bi-book text-success"></i>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ stats.totalSubjects }}</h3>
              <p class="stat-label">Total Subjects</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon bg-primary-soft">
              <i class="bi bi-collection text-primary"></i>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ stats.totalChapters }}</h3>
              <p class="stat-label">Total Chapters</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon bg-warning-soft">
              <i class="bi bi-question-circle text-warning"></i>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ stats.totalQuizzes }}</h3>
              <p class="stat-label">Total Quizzes</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon bg-info-soft">
              <i class="bi bi-play-circle text-info"></i>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ stats.activeQuizzes }}</h3>
              <p class="stat-label">Active Quizzes</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions mb-5">
          <h3 class="section-title">Quick Actions</h3>
          <div class="actions-grid">
            <router-link to="/admin/subjects" class="action-card">
              <div class="action-icon bg-success-soft">
                <i class="bi bi-plus-circle text-success"></i>
              </div>
              <h4 class="action-title">Add Subject</h4>
              <p class="action-description">Create a new subject for your curriculum</p>
            </router-link>

            <router-link :to="{name: 'admin.subjects'}" class="action-card">
              <div class="action-icon bg-primary-soft">
                <i class="bi bi-plus-circle text-primary"></i>
              </div>
              <h4 class="action-title">Create Quiz</h4>
              <p class="action-description">Start by selecting a subject, then create quizzes</p>
            </router-link>

            <router-link :to="{name: 'admin.users'}" class="action-card">
              <div class="action-icon bg-warning-soft">
                <i class="bi bi-people text-warning"></i>
              </div>
              <h4 class="action-title">Manage Users</h4>
              <p class="action-description">View and manage user accounts</p>
            </router-link>

            <router-link :to="{name: 'admin.reports'}" class="action-card">
              <div class="action-icon bg-info-soft">
                <i class="bi bi-graph-up text-info"></i>
              </div>
              <h4 class="action-title">View Reports</h4>
              <p class="action-description">Analyze quiz performance and results</p>
            </router-link>
          </div>
        </div>

        <!-- Recent Quizzes -->
        <div class="recent-section">
          <div class="section-header">
            <h3 class="section-title">Recent Quizzes</h3>
            <router-link :to="{name: 'admin.subjects'}" class="btn btn-outline-primary btn-sm-modern">View All</router-link>
          </div>
          
          <div class="quiz-grid">
            <div v-for="quiz in recentQuizzes" :key="quiz.id" class="quiz-card">
              <div class="quiz-header">
                <h5 class="quiz-title">{{ quiz.title }}</h5>
                <span class="quiz-status" :class="quiz.is_active ? 'active' : 'inactive'">
                  {{ quiz.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div class="quiz-meta">
                <div class="meta-item">
                  <i class="bi bi-book"></i>
                  <span>{{ quiz.subjectName }}</span>
                </div>
                <div class="meta-item">
                  <i class="bi bi-collection"></i>
                  <span>{{ quiz.chapterName }}</span>
                </div>
                <div class="meta-item">
                  <i class="bi bi-calendar"></i>
                  <span>{{ formatDate(quiz.date_of_quiz) }}</span>
                </div>
              </div>
              <div class="quiz-actions">
                <router-link :to="{ name: 'admin.questions', params: { quizId: quiz.id } }" class="btn btn-primary btn-sm-modern">
                  Manage Questions
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { subjectService, chapterService, quizService } from '../../services/api';

const stats = ref({
  totalSubjects: 0,
  totalChapters: 0,
  totalQuizzes: 0,
  activeQuizzes: 0
});

const recentQuizzes = ref([]);
const isLoading = ref(true);

const fetchStats = async () => {
  isLoading.value = true;
  try {
    const subjectsResponse = await subjectService.getAll();
    stats.value.totalSubjects = subjectsResponse.data.length;
    let chaptersCount = 0;
    let quizzesCount = 0;
    let activeQuizzesCount = 0;
    const today = new Date().toISOString().split('T')[0];
    
    for (const subject of subjectsResponse.data) {
      const chaptersResponse = await chapterService.getAll(subject.id);
      chaptersCount += chaptersResponse.data.length;
      
      for (const chapter of chaptersResponse.data) {
        const quizzesResponse = await quizService.getAll(chapter.id);
        quizzesCount += quizzesResponse.data.length;
  
        const active = quizzesResponse.data.filter(quiz => {
          return quiz.is_active === true || quiz.is_active === 1;
        });
        activeQuizzesCount += active.length;
        

        quizzesResponse.data.forEach(quiz => {
          recentQuizzes.value.push({
            ...quiz,
            subjectName: subject.name,
            chapterName: chapter.name
          });
        });
      }
    }
    
    stats.value.totalChapters = chaptersCount;
    stats.value.totalQuizzes = quizzesCount;
    stats.value.activeQuizzes = activeQuizzesCount;
    
 
    recentQuizzes.value.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    recentQuizzes.value = recentQuizzes.value.slice(0, 5);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

onMounted(fetchStats);
</script>

<style scoped>
.admin-dashboard {
  background: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.admin-container {
  padding-top: 120px !important;
  padding-bottom: 3rem !important;
  padding-left: 1rem;
  padding-right: 1rem;
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

/* Loading State */
.loading-container {
  text-align: center;
  padding: 4rem 1rem;
}

.spinner-modern {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
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
  font-size: 1rem;
  margin: 0;
}

/* Stats Overview */
.stats-overview {
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

.bg-info-soft {
  background-color: rgba(23, 162, 184, 0.1) !important;
}

/* Quick Actions */
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 1.5rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  text-align: center;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
}

.action-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.action-icon i {
  font-size: 1.75rem;
}

.action-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 0.75rem 0;
}

.action-description {
  color: #718096;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
}

/* Recent Section */
.recent-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.quiz-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.quiz-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.quiz-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.quiz-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
  flex: 1;
}

.quiz-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  flex-shrink: 0;
  margin-left: 1rem;
}

.quiz-status.active {
  background: #c6f6d5;
  color: #22543d;
}

.quiz-status.inactive {
  background: #fed7d7;
  color: #c53030;
}

.quiz-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #718096;
  font-size: 0.85rem;
}

.meta-item i {
  width: 16px;
  text-align: center;
}

.quiz-actions {
  display: flex;
  justify-content: flex-end;
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

/* Responsive */
@media (max-width: 768px) {
  .dashboard-title {
    font-size: 2rem;
  }
  
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .quiz-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .quiz-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .quiz-status {
    margin-left: 0;
  }
}
</style> 





