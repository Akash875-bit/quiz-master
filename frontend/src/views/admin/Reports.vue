<template>
  <div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h2 mb-0">Analytics Dashboard</h1>
      <div class="d-flex gap-3">
        <div class="btn-group">
          <button 
            class="btn btn-outline-primary" 
            :class="{ active: period === '7days' }"
            @click="changePeriod('7days')"
          >
            Last 7 Days
          </button>
          <button 
            class="btn btn-outline-primary" 
            :class="{ active: period === '30days' }"
            @click="changePeriod('30days')"
          >
            Last 30 Days
          </button>
          <button 
            class="btn btn-outline-primary" 
            :class="{ active: period === '90days' }"
            @click="changePeriod('90days')"
          >
            Last 90 Days
          </button>
        </div>
        <button class="btn btn-primary" @click="exportReport">
          <i class="bi bi-download me-2"></i>Export
        </button>
      </div>
    </div>

   
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading..</span>
      </div>
      <p class="mt-2">Loading analytics..</p>
    </div>

   
    <div v-else>
      
      <div class="row g-4 mb-4">
        <div class="col-md-3">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <p class="text-muted mb-1">Total Users</p>
                  <h3 class="mb-1">{{ reports.overview.totalUsers }}</h3>
                  <small :class="getChangeClass(reports.overview.userGrowth)">
                    <i :class="getChangeIcon(reports.overview.userGrowth)"></i>
                    {{ reports.overview.userGrowth }}% from previous period
                  </small>
                </div>
                <div class="icon-bg bg-primary bg-opacity-10 rounded p-2">
                  <i class="bi bi-people text-primary fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>




        <div class="col-md-3">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <p class="text-muted mb-1">Quiz Attempts</p>
                  <h3 class="mb-1">{{ reports.overview.totalQuizzes }}</h3>
                  <small :class="getChangeClass(reports.overview.quizGrowth)">
                    <i :class="getChangeIcon(reports.overview.quizGrowth)"></i>
                    {{ reports.overview.quizGrowth }}% from previous period
                  </small>
                </div>
                <div class="icon-bg bg-success bg-opacity-10 rounded p-2">
                  <i class="bi bi-journal-check text-success fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <p class="text-muted mb-1">Average Score</p>
                  <h3 class="mb-1">{{ reports.overview.avgScore }}%</h3>
                  <small :class="getChangeClass(reports.overview.avgScoreChange)">
                    <i :class="getChangeIcon(reports.overview.avgScoreChange)"></i>
                    {{ reports.overview.avgScoreChange }}% from previous period
                  </small>
                </div>
                <div class="icon-bg bg-info bg-opacity-10 rounded p-2">
                  <i class="bi bi-graph-up text-info fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <p class="text-muted mb-1">Pass Rate</p>
                  <h3 class="mb-1">{{ reports.overview.passRate }}%</h3>
                  <small :class="getChangeClass(reports.overview.passRateChange)">
                    <i :class="getChangeIcon(reports.overview.passRateChange)"></i>
                    {{ reports.overview.passRateChange }}% from previous period
                  </small>
                </div>
                <div class="icon-bg bg-warning bg-opacity-10 rounded p-2">
                  <i class="bi bi-award text-warning fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      <div class="row g-4 mb-4">
        <div class="col-md-8">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white">
              <h5 class="card-title mb-0">User Activity</h5>
            </div>
            <div class="card-body">
              <canvas ref="userActivityChart" height="300"></canvas>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white">
              <h5 class="card-title mb-0">Subject Performance</h5>
            </div>
            <div class="card-body">
              <canvas ref="subjectPerformanceChart" height="300"></canvas>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0">Top Subjects</h5>
          <a href="#" class="text-decoration-none">View All</a>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Attempts</th>
                  <th>Avg. Score</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="subject in reports.topSubjects" :key="subject.id">
                  <td><strong>{{ subject.name }}</strong></td>
                  <td>{{ subject.attempts }}</td>
                  <td>{{ subject.avgScore }}%</td>
                  <td>
                    <span :class="getChangeClass(subject.trend)">
                      <i :class="getChangeIcon(subject.trend)"></i>
                      {{ subject.trend }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="row g-4 mb-4">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white">
              <h5 class="card-title mb-0">Top Users by Score</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Avg. Score</th>
                      <th>Quizzes</th>
                      <th>Last Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in reports.topUsersByScore" :key="user.id">
                      <td>{{ user.firstName }} {{ user.lastName }}</td>
                      <td>{{ user.avgScore }}%</td>
                      <td>{{ user.quizzesTaken }}</td>
                      <td>{{ formatDate(user.lastActivity) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white">
              <h5 class="card-title mb-0">Top Quizzes</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Quiz</th>
                      <th>Attempts</th>
                      <th>Avg. Score</th>
                      <th>Pass Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="quiz in reports.topQuizzes" :key="quiz.id">
                      <td>{{ quiz.title }}</td>
                      <td>{{ quiz.attempts }}</td>
                      <td>{{ quiz.avgScore }}%</td>
                      <td>{{ quiz.passRate }}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white">
          <h5 class="card-title mb-0">Most Active Users</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div v-for="user in reports.topUsersByActivity" :key="user.id" class="col-md-3 mb-4">
              <div class="card h-100 border-0 shadow-sm">
                <div class="card-body text-center">
                  <div 
                    class="user-avatar rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center bg-primary text-white"
                  >
                    {{ getUserInitials(user) }}
                  </div>
                  <h5 class="mb-1">{{ user.firstName }} {{ user.lastName }}</h5>
                  <p class="text-muted mb-2">{{ user.quizzesTaken }} quizzes taken</p>
                  <div class="d-flex justify-content-center small">
                    <div class="me-3">
                      <i class="bi bi-graph-up-arrow text-success me-1"></i>
                      {{ user.avgScore }}%
                    </div>
                    <div>
                      <i class="bi bi-award text-warning me-1"></i>
                      {{ user.quizzesPassed }} passed
                    </div>
                  </div>
                </div>
                <div class="card-footer bg-white text-center border-0">
                  <small class="text-muted">Last active: {{ formatDate(user.lastActivity) }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useStore } from 'vuex'
import Chart from 'chart.js/auto'

export default {
  name: 'ReportsAdmin',
  setup() {
    const store = useStore()
    const loading = ref(true)
    const period = ref('30days')
    const reports = ref({
      overview: {
        totalUsers: 0,
        totalQuizzes: 0,
        passRate: 0,
        avgScore: 0,
        userGrowth: 0,
        quizGrowth: 0,
        passRateChange: 0,
        avgScoreChange: 0
      },
      topSubjects: [],
      topQuizzes: [],
      topUsersByScore: [],
      topUsersByActivity: [],
      analytics: {
        userActivity: {
          labels: [],
          newUsers: [],
          quizAttempts: []
        },
        subjectPerformance: {
          labels: [],
          avgScores: [],
          passRates: []
        }
      }
    })
    
    
    const userActivityChart = ref(null)
    const subjectPerformanceChart = ref(null)
    let userActivityChartInstance = null
    let subjectPerformanceChartInstance = null
    
    onMounted(async () => {
      await fetchReports()
    })
    
    onBeforeUnmount(() => {
      if (userActivityChartInstance) {
        userActivityChartInstance.destroy()
      }
      
      if (subjectPerformanceChartInstance) {
        subjectPerformanceChartInstance.destroy()
      }
    })
    

    watch(period, async () => {
      await fetchReports()
    })
    
    const fetchReports = async () => {
      loading.value = true
      try {
        const response = await store.dispatch('fetchReports', period.value)
        reports.value = response
        
        nextTick(() => {
          initUserActivityChart()
          initSubjectPerformanceChart()
        })
      } catch (error) {
        console.error('Error fetching reports:', error)
        store.dispatch('addNotification', {
          type: 'danger',
          message: 'Failed to load analytics data. Please try again.'
        })
      } finally {
        loading.value = false
      }
    }
    
    const initUserActivityChart = () => {
      const ctx = userActivityChart.value.getContext('2d')
      if (userActivityChartInstance) {
        userActivityChartInstance.destroy()
      }
      
      userActivityChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: reports.value.analytics.userActivity.labels,
          datasets: [
            {
              label: 'New Users',
              data: reports.value.analytics.userActivity.newUsers,
              borderColor: '#0d6efd',
              backgroundColor: 'rgba(13, 110, 253, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: 'Quiz Attempts',
              data: reports.value.analytics.userActivity.quizAttempts,
              borderColor: '#198754',
              backgroundColor: 'rgba(25, 135, 84, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              mode: 'index',
              intersect: false,
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                drawBorder: false
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      })
    }
    
    const initSubjectPerformanceChart = () => {
      const ctx = subjectPerformanceChart.value.getContext('2d')
      if (subjectPerformanceChartInstance) {
        subjectPerformanceChartInstance.destroy()
      }
      
      subjectPerformanceChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: reports.value.analytics.subjectPerformance.labels,
          datasets: [
            {
              label: 'Avg. Score',
              data: reports.value.analytics.subjectPerformance.avgScores,
              backgroundColor: 'rgba(13, 110, 253, 0.7)',
            },
            {
              label: 'Pass Rate',
              data: reports.value.analytics.subjectPerformance.passRates,
              backgroundColor: 'rgba(25, 135, 84, 0.7)',
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              grid: {
                drawBorder: false
              },
              ticks: {
                callback: (value) => `${value}%`
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      })
    }
    
    const exportReport = async () => {
      try {
        store.dispatch('addNotification', {
          type: 'info',
          message: 'Report export started. You will be notified when it completes.'
        })
        
        await store.dispatch('exportReports')
        
        store.dispatch('addNotification', {
          type: 'success',
          message: 'Report export initiated successfully. You will receive a download link shortly.'
        })
      } catch (error) {
        console.error('Error exporting report:', error)
        store.dispatch('addNotification', {
          type: 'danger',
          message: 'Failed to export report. Please try again.'
        })
      }
    }
    
    const changePeriod = (newPeriod) => {
      period.value = newPeriod
    }
    
    const getChangeClass = (value) => {
      if (value > 0) return 'text-success'
      if (value < 0) return 'text-danger'
      return 'text-muted'
    }
    
    const getChangeIcon = (value) => {
      if (value > 0) return 'bi bi-arrow-up'
      if (value < 0) return 'bi bi-arrow-down'
      return 'bi bi-dash'
    }
    
    const getUserInitials = (user) => {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date)
    }
    
    return {
      loading,
      period,
      reports,
      userActivityChart,
      subjectPerformanceChart,
      changePeriod,
      exportReport,
      getChangeClass,
      getChangeIcon,
      getUserInitials,
      formatDate
    }
  }
}
</script>

<style scoped>
.card {
  transition: all 0.2s ease-in-out;
}
.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1) !important;
}
.table-hover tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.05);
}
.user-avatar {
  width: 64px;
  height: 64px;
  font-size: 24px;
  font-weight: 500;
}
.icon-bg {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 




