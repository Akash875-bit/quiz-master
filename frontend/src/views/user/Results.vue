<template>
  <div class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>My Results</h1>
      <div>
        <button 
          class="btn btn-success" 
          @click="exportResults" 
          :disabled="exportStatus.inProgress"
        >
          <i class="bi bi-download me-2"></i>
          <span v-if="!exportStatus.inProgress">Export CSV</span>
          <span v-else>
            <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            Exporting...
          </span>
        </button>
        <small class="d-block text-muted mt-1 text-end" v-if="exportStatus.inProgress">
          {{ exportStatus.status }}
        </small>
      </div>
    </div>
    
    
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading your results...</p>
    </div>
    
   
    <div v-else-if="scores.length === 0" class="text-center py-5 bg-light rounded">
      <i class="bi bi-emoji-neutral display-1 text-muted"></i>
      <h3 class="mt-3">No Quiz Results Yet</h3>
      <p class="text-muted">You haven't taken any quizzes yet. Start exploring subjects and complete quizzes to see your results here.</p>
      <router-link to="/subjects" class="btn btn-primary mt-2">Browse Subjects</router-link>
    </div>
    
   
    <div v-else>
      
      <div class="row mb-4">
        <div class="col-md-4 mb-3 mb-md-0">
          <div class="input-group">
            <span class="input-group-text bg-white">
              <i class="bi bi-search"></i>
            </span>
            <input 
              type="text" 
              v-model="searchQuery" 
              class="form-control" 
              placeholder="Search quizzes..." 
              aria-label="Search quizzes"
            >
          </div>
        </div>
        <div class="col-md-3 mb-3 mb-md-0">
          <select class="form-select" v-model="subjectFilter">
            <option value="">All Subjects</option>
            <option 
              v-for="subject in uniqueSubjects" 
              :key="subject.id" 
              :value="subject.id"
            >
              {{ subject.name }}
            </option>
          </select>
        </div>
        <div class="col-md-3 mb-3 mb-md-0">
          <select class="form-select" v-model="resultFilter">
            <option value="">All Results</option>
            <option value="passed">Passed Only</option>
            <option value="failed">Failed Only</option>
          </select>
        </div>
        <div class="col-md-2">
          <select class="form-select" v-model="sortBy">
            <option value="date">Date (Newest)</option>
            <option value="date_asc">Date (Oldest)</option>
            <option value="score">Score (Highest)</option>
            <option value="score_asc">Score (Lowest)</option>
          </select>
        </div>
      </div>
      
      <!-- Stats Cards -->
      <div class="row mb-4">
        <div class="col-md-3 col-sm-6 mb-3 mb-md-0">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="stat-icon rounded-circle bg-light mb-3 mx-auto">
                <i class="bi bi-check-circle-fill text-success"></i>
              </div>
              <h5 class="card-title">{{ stats.totalQuizzes }}</h5>
              <p class="card-text text-muted">Quizzes Taken</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-3 mb-md-0">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="stat-icon rounded-circle bg-light mb-3 mx-auto">
                <i class="bi bi-trophy-fill text-warning"></i>
              </div>
              <h5 class="card-title">{{ stats.passedQuizzes }}</h5>
              <p class="card-text text-muted">Quizzes Passed</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-3 mb-md-0">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="stat-icon rounded-circle bg-light mb-3 mx-auto">
                <i class="bi bi-bar-chart-fill text-primary"></i>
              </div>
              <h5 class="card-title">{{ stats.averageScore }}%</h5>
              <p class="card-text text-muted">Average Score</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-3 mb-md-0">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="stat-icon rounded-circle bg-light mb-3 mx-auto">
                <i class="bi bi-alarm-fill text-danger"></i>
              </div>
              <h5 class="card-title">{{ formatTime(stats.averageTime) }}</h5>
              <p class="card-text text-muted">Average Time</p>
            </div>
          </div>
        </div>
      </div>
      
      
      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Quiz</th>
                  <th>Subject</th>
                  <th>Score</th>
                  <th>Result</th>
                  <th>Time Taken</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="score in filteredScores" :key="score.id">
                  <td>{{ score.quiz_title }}</td>
                  <td>{{ score.subject_name }}</td>
                  <td>
                    <div class="d-flex align-items-center">
                      <div 
                        class="progress flex-grow-1 me-2" 
                        style="height: 8px; width: 80px;"
                      >
                        <div 
                          class="progress-bar" 
                          :class="{
                            'bg-success': score.score >= 80,
                            'bg-warning': score.score >= 60 && score.score < 80,
                            'bg-danger': score.score < 60
                          }"
                          :style="{ width: `${score.score}%` }"
                        ></div>
                      </div>
                      <span>{{ score.score }}%</span>
                    </div>
                  </td>
                  <td>
                    <span 
                      class="badge rounded-pill" 
                      :class="score.passed ? 'bg-success' : 'bg-danger'"
                    >
                      {{ score.passed ? 'Passed' : 'Failed' }}
                    </span>
                  </td>
                  <td>{{ formatTime(score.time_taken) }}</td>
                  <td>{{ formatDate(score.completed_at) }}</td>
                  <td>
                    <button 
                      class="btn btn-sm btn-outline-primary" 
                      @click="viewDetails(score)"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
   
    <div class="modal fade" id="resultModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Quiz Result: {{ selectedScore?.quiz_title }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedScore">
            <div class="card mb-4">
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <h6>Quiz Details</h6>
                    <ul class="list-unstyled">
                      <li><strong>Subject:</strong> {{ selectedScore.subject_name }}</li>
                      <li><strong>Chapter:</strong> {{ selectedScore.chapter_name }}</li>
                      <li><strong>Date Taken:</strong> {{ formatDate(selectedScore.completed_at) }}</li>
                      <li><strong>Time Spent:</strong> {{ formatTime(selectedScore.time_taken) }}</li>
                    </ul>
                  </div>
                  <div class="col-md-6">
                    <h6>Score Details</h6>
                    <ul class="list-unstyled">
                      <li>
                        <strong>Score:</strong> 
                        <span 
                          :class="{
                            'text-success': selectedScore.score >= 80,
                            'text-warning': selectedScore.score >= 60 && selectedScore.score < 80,
                            'text-danger': selectedScore.score < 60
                          }"
                        >
                          {{ selectedScore.score }}%
                        </span>
                      </li>
                      <li><strong>Correct Answers:</strong> {{ selectedScore.correct_answers }} / {{ selectedScore.total_questions }}</li>
                      <li>
                        <strong>Result:</strong> 
                        <span 
                          :class="selectedScore.passed ? 'text-success' : 'text-danger'"
                        >
                          {{ selectedScore.passed ? 'Passed' : 'Failed' }}
                        </span>
                      </li>
                      <li><strong>Passing Score:</strong> {{ selectedScore.passing_score }}%</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <h6>Questions and Answers</h6>
            <div class="accordion" v-if="selectedScore.answers">
              <div 
                class="accordion-item" 
                v-for="(answer, index) in selectedScore.answers" 
                :key="index"
              >
                <h2 class="accordion-header">
                  <button 
                    class="accordion-button collapsed" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    :data-bs-target="`#answer-${index}`"
                  >
                    <div class="d-flex align-items-center w-100">
                      <span 
                        class="badge rounded-pill me-2" 
                        :class="answer.is_correct ? 'bg-success' : 'bg-danger'"
                      >
                        {{ answer.is_correct ? 'Correct' : 'Incorrect' }}
                      </span>
                      <span>Question {{ index + 1 }}</span>
                    </div>
                  </button>
                </h2>
                <div 
                  :id="`answer-${index}`" 
                  class="accordion-collapse collapse"
                >
                  <div class="accordion-body">
                    <p><strong>{{ answer.question_text }}</strong></p>
                    <ul class="list-group">
                      <li 
                        v-for="(choice, choiceIndex) in answer.choices" 
                        :key="choiceIndex"
                        class="list-group-item"
                        :class="{
                          'list-group-item-success': choice.is_correct,
                          'list-group-item-danger': !choice.is_correct && choice.id === answer.selected_choice_id
                        }"
                      >
                        <div class="d-flex align-items-center">
                          <i 
                            class="bi me-2" 
                            :class="{
                              'bi-check-circle-fill text-success': choice.is_correct,
                              'bi-x-circle-fill text-danger': !choice.is_correct && choice.id === answer.selected_choice_id,
                              'bi-circle': choice.id !== answer.selected_choice_id && !choice.is_correct
                            }"
                          ></i>
                          {{ choice.text }}
                          <span class="ms-2" v-if="choice.id === answer.selected_choice_id">(Your answer)</span>
                        </div>
                      </li>
                    </ul>
                    <div class="mt-3" v-if="answer.explanation">
                      <p class="fw-bold mb-1">Explanation:</p>
                      <p class="mb-0">{{ answer.explanation }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { Modal } from 'bootstrap'
import api from '../../services/api'

const store = useStore()
const scores = ref([])
const loading = ref(true)
const searchQuery = ref('')
const subjectFilter = ref('')
const resultFilter = ref('')
const sortBy = ref('date')
const selectedScore = ref(null)
let resultModal = null



const exportStatus = ref({
  inProgress: false,
  taskId: null,
  checking: false,
  status: ''
})


const filteredScores = computed(() => {
  let filtered = scores.value
  
  
  if (subjectFilter.value) {
    filtered = filtered.filter(score => score.subject_id === subjectFilter.value)
  }
  
  
  if (resultFilter.value === 'passed') {
    filtered = filtered.filter(score => score.passed)
  } else if (resultFilter.value === 'failed') {
    filtered = filtered.filter(score => !score.passed)
  }
  
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(score =>
      score.quiz_title.toLowerCase().includes(query) ||
      score.subject_name.toLowerCase().includes(query) ||
      score.chapter_name.toLowerCase().includes(query)
    )
  }
  
  
  return filtered.sort((a, b) => {
    if (sortBy.value === 'date') {
      return new Date(b.completed_at) - new Date(a.completed_at)
    } else if (sortBy.value === 'date_asc') {
      return new Date(a.completed_at) - new Date(b.completed_at)
    } else if (sortBy.value === 'score') {
      return b.score - a.score
    } else if (sortBy.value === 'score_asc') {
      return a.score - b.score
    }
    return 0
  })
})


const stats = computed(() => {
  const totalQuizzes = scores.value.length
  const passedQuizzes = scores.value.filter(s => s.passed).length
  
  let averageScore = 0
  if (totalQuizzes > 0) {
    averageScore = Math.round(scores.value.reduce((sum, s) => sum + s.score, 0) / totalQuizzes)
  }
  
  let averageTime = 0
  if (totalQuizzes > 0) {
    averageTime = Math.round(scores.value.reduce((sum, s) => sum + s.time_taken, 0) / totalQuizzes)
  }
  
  return {
    totalQuizzes,
    passedQuizzes,
    averageScore,
    averageTime
  }
})


const uniqueSubjects = computed(() => {
  const subjects = new Map()
  
  scores.value.forEach(score => {
    if (score.subject_id && !subjects.has(score.subject_id)) {
      subjects.set(score.subject_id, {
        id: score.subject_id,
        name: score.subject_name
      })
    }
  })
  
  return Array.from(subjects.values())
})


const fetchScores = async () => {
  loading.value = true
  
  try {
    const response = await api.scores.getAll()
    scores.value = response.data
  } catch (error) {
    console.error('Error fetching scores:', error)
    store.commit('ADD_NOTIFICATION', {
      type: 'error',
      message: 'Failed to load your quiz results. Please try again.'
    })
  } finally {
    loading.value = false
  }
}


const viewDetails = (score) => {
  selectedScore.value = score
  resultModal.show()
}


const exportResults = async () => {
  if (exportStatus.value.inProgress) {
    store.commit('ADD_NOTIFICATION', {
      type: 'info',
      message: 'An export is already in progress. Please wait for it to complete.'
    })
    return
  }

  
  exportStatus.value = {
    inProgress: true,
    taskId: null,
    checking: false,
    status: 'Starting export...'
  }

  try {
    const response = await api.scores.exportCsv()
    exportStatus.value.taskId = response.data.task_id
    exportStatus.value.status = 'Export in progress...'
    
    
    store.commit('ADD_NOTIFICATION', {
      type: 'info',
      message: 'Quiz results export started! You will receive an email with the CSV file shortly.'
    })
    
    
    checkExportStatus()
  } catch (error) {
    console.error('Error exporting results:', error)
    exportStatus.value.inProgress = false
    exportStatus.value.status = 'Export failed'
    
    store.commit('ADD_NOTIFICATION', {
      type: 'error',
      message: 'Failed to export quiz results. Please try again later.'
    })
  }
}


const checkExportStatus = async () => {
  if (!exportStatus.value.taskId || exportStatus.value.checking) {
    return
  }

  exportStatus.value.checking = true

  try {
    const response = await api.scores.checkExportStatus(exportStatus.value.taskId)
    
    
    exportStatus.value.status = response.data.status
    
    if (['SUCCESS', 'FAILURE'].includes(response.data.state)) {
      exportStatus.value.inProgress = false
      
      if (response.data.state === 'SUCCESS') {
        store.commit('ADD_NOTIFICATION', {
          type: 'success',
          message: 'Quiz results export completed! Check your email for the CSV file.'
        })
      } else {
        store.commit('ADD_NOTIFICATION', {
          type: 'error',
          message: 'Quiz results export failed. Please try again later.'
        })
      }
    } else {
      setTimeout(checkExportStatus, 2000)
    }
  } catch (error) {
    console.error('Error checking export status:', error)
    
    
    if (error.response && error.response.status === 404) {
      exportStatus.value.status = 'Waiting for task to be processed...'
      setTimeout(checkExportStatus, 5000)
    } else {
      
      exportStatus.value.inProgress = false
      exportStatus.value.status = 'Error checking status'
      
      store.commit('ADD_NOTIFICATION', {
        type: 'error',
        message: 'Error tracking export status. The export may still complete in the background.'
      })
    }
  } finally {
    exportStatus.value.checking = false
  }
}


const formatTime = (seconds) => {
  if (!seconds) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}


const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchScores()
  resultModal = new Modal(document.getElementById('resultModal'))
})
</script>

<style scoped>
.stat-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon i {
  font-size: 1.75rem;
}

.accordion-button:not(.collapsed) {
  background-color: rgba(13, 110, 253, 0.1);
  color: #0d6efd;
  font-weight: 500;
}
</style> 








