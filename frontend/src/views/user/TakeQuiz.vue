<template>
  <div class="page-container">
    
    <div v-if="quiz" class="mb-4">
      <div class="d-flex align-items-center mb-3">
        <router-link :to="{ name: 'user.quizzes', params: { subjectId: quiz.chapter?.subject_id || route.query.subjectId || 1 } }" class="btn btn-outline-primary me-3">
          <i class="bi bi-arrow-left me-2"></i>Back to Quizzes
        </router-link>
        <h1 class="mb-0 flex-grow-1">{{ quiz.title }}</h1>
        <div v-if="timeLeft && !quizSubmitted" class="quiz-timer ms-3">
          <div class="d-flex align-items-center">
            <i class="bi bi-clock text-danger me-2"></i>
            <div class="timer-display">{{ formatTime(timeLeft) }}</div>
          </div>
        </div>
      </div>
    </div>

    
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading quiz...</p>
    </div>

    
    <div v-else-if="!quizStarted && !quizSubmitted && quiz" class="card border-0 shadow-sm mb-4">
      <div class="card-body p-4">
        <h2 class="h4 mb-3">{{ quiz.title }}</h2>
        <p>{{ quiz.description }}</p>
        
        <div class="alert alert-info">
          <h4 class="h5"><i class="bi bi-info-circle me-2"></i>Instructions</h4>
          <ul class="mb-0">
            <li>This quiz contains <strong>{{ totalQuestions }}</strong> questions</li>
            <li>You have <strong>{{ quiz.duration_minutes }}</strong> minutes to complete the quiz</li>
            <li>The passing score is <strong>{{ quiz.passing_score }}%</strong></li>
            <li>Once you start, the timer cannot be paused</li>
            <li>You can review your answers before submitting</li>
          </ul>
        </div>

        <div class="d-flex justify-content-between align-items-center mt-4">
          <div>
            <p class="text-muted mb-0">
              <i class="bi bi-calendar me-2"></i>Available until: {{ formatDate(quiz.end_date) }}
            </p>
          </div>
          <button class="btn btn-success btn-lg" @click="startQuiz">
            <i class="bi bi-play-fill me-2"></i>Start Quiz
          </button>
        </div>
      </div>
    </div>

    
    <div v-else-if="quizStarted && !quizSubmitted && questions.length > 0" class="quiz-container">
      <div class="row">
        
        <div class="col-md-3 mb-4 mb-md-0">
          <div class="card border-0 shadow-sm sticky-top" style="top: 20px;">
            <div class="card-header bg-light">
              <h5 class="mb-0">Question Navigator</h5>
            </div>
            <div class="card-body">
              <div class="d-flex flex-wrap question-nav">
                <button 
                  v-for="(q, index) in questions" 
                  :key="q.id"
                  class="btn question-nav-btn m-1"
                  :class="{
                    'btn-primary': currentQuestionIndex === index,
                    'btn-outline-primary': currentQuestionIndex !== index,
                    'answered': userAnswers[q.id] !== undefined
                  }"
                  @click="goToQuestion(index)"
                >
                  {{ index + 1 }}
                </button>
              </div>
              <div class="mt-3">
                <div class="d-flex align-items-center mb-2">
                  <div class="nav-indicator answered me-2"></div>
                  <small>Answered ({{ answeredCount }})</small>
                </div>
                <div class="d-flex align-items-center">
                  <div class="nav-indicator unanswered me-2"></div>
                  <small>Unanswered ({{ totalQuestions - answeredCount }})</small>
                </div>
              </div>
            </div>
            <div class="card-footer bg-white">
              <button 
                class="btn btn-success w-100" 
                @click="showSubmitConfirmation = true"
                :disabled="submitting"
              >
                <i class="bi bi-check2-circle me-2"></i>Submit Quiz
              </button>
            </div>
          </div>
        </div>

        
        <div class="col-md-9">
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-light py-3">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Question {{ currentQuestionIndex + 1 }} of {{ totalQuestions }}</h5>
                <span class="badge bg-primary">{{ currentQuestion.points }} {{ currentQuestion.points === 1 ? 'point' : 'points' }}</span>
              </div>
            </div>
            <div class="card-body p-4">
              <h4 class="mb-4">{{ currentQuestion.text }}</h4>
              
              <div class="choices-list">
                <div 
                  v-for="choice in currentQuestion.choices" 
                  :key="choice.id"
                  class="choice-item mb-3"
                  :class="{ 'selected': userAnswers[currentQuestion.id] === choice.id }"
                  @click="selectAnswer(currentQuestion.id, choice.id)"
                >
                  <div class="form-check">
                    <input 
                      type="radio" 
                      class="form-check-input" 
                      :id="'choice-' + choice.id" 
                      :name="'question-' + currentQuestion.id" 
                      :checked="userAnswers[currentQuestion.id] === choice.id"
                      @change="selectAnswer(currentQuestion.id, choice.id)"
                    >
                    <label class="form-check-label w-100" :for="'choice-' + choice.id">{{ choice.text }}</label>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-footer bg-white py-3">
              <div class="d-flex justify-content-between">
                <button 
                  class="btn btn-outline-primary" 
                  @click="prevQuestion" 
                  :disabled="currentQuestionIndex === 0"
                >
                  <i class="bi bi-arrow-left me-2"></i>Previous
                </button>
                <button 
                  class="btn btn-primary" 
                  @click="nextQuestion" 
                  :disabled="currentQuestionIndex === questions.length - 1"
                >
                  Next<i class="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

   
    <div v-else-if="quizSubmitted && quizResult" class="card border-0 shadow-sm">
      <div class="card-body p-5 text-center">
        <div v-if="quizResult.passed" class="result-icon success mb-4">
          <i class="bi bi-trophy-fill display-1 text-success"></i>
        </div>
        <div v-else class="result-icon failed mb-4">
          <i class="bi bi-x-circle-fill display-1 text-danger"></i>
        </div>
        
        <h2 class="mb-4">{{ quizResult.passed ? 'Congratulations!' : 'Better Luck Next Time' }}</h2>
        
        <div class="result-stats mb-5">
          <div class="row justify-content-center">
            <div class="col-md-3 col-sm-6 mb-4 mb-md-0">
              <div class="card h-100 border-0 shadow-sm">
                <div class="card-body">
                  <h6 class="text-muted mb-1">Score</h6>
                  <h3 class="mb-0">{{ quizResult.score }}%</h3>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-4 mb-md-0">
              <div class="card h-100 border-0 shadow-sm">
                <div class="card-body">
                  <h6 class="text-muted mb-1">Passing Score</h6>
                  <h3 class="mb-0">{{ quiz.passing_score }}%</h3>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-4 mb-md-0">
              <div class="card h-100 border-0 shadow-sm">
                <div class="card-body">
                  <h6 class="text-muted mb-1">Correct</h6>
                  <h3 class="mb-0">{{ quizResult.correct_answers }} / {{ totalQuestions }}</h3>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-4 mb-md-0">
              <div class="card h-100 border-0 shadow-sm">
                <div class="card-body">
                  <h6 class="text-muted mb-1">Time Taken</h6>
                  <h3 class="mb-0">{{ formatTime(quizResult.time_taken) }}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="d-flex justify-content-center mt-4">
          <router-link :to="{ name: 'user.dashboard' }" class="btn btn-outline-primary me-3">
            <i class="bi bi-house me-2"></i>Go to Dashboard
          </router-link>
          <router-link :to="{ name: 'user.quizzes', params: { subjectId: quiz.chapter?.subject_id || route.query.subjectId || 1 } }" class="btn btn-primary">
            <i class="bi bi-list-check me-2"></i>Browse Other Quizzes
          </router-link>
        </div>
      </div>
    </div>

  
    <div class="modal fade" id="submitConfirmationModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Submit Quiz</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="text-center mb-4">
              <i class="bi bi-question-circle display-3 text-warning"></i>
            </div>
            <h4 class="text-center mb-3">Are you sure you want to submit?</h4>
            
            <div class="alert alert-info">
              <div class="d-flex align-items-center mb-2">
                <i class="bi bi-check-circle me-2"></i>
                <div>You've answered <strong>{{ answeredCount }} of {{ totalQuestions }}</strong> questions.</div>
              </div>
              <div v-if="totalQuestions - answeredCount > 0" class="d-flex align-items-center text-danger">
                <i class="bi bi-exclamation-triangle me-2"></i>
                <div>You have <strong>{{ totalQuestions - answeredCount }}</strong> unanswered question(s)!</div>
              </div>
            </div>
            
            <p>You still have <strong>{{ formatTime(timeLeft) }}</strong> remaining. Once submitted, you cannot modify your answers.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Continue Quiz</button>
            <button type="button" class="btn btn-success" @click="submitQuiz" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
              Submit Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watchEffect } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import api from '../../services/api'

export default {
  name: 'TakeQuiz',
  
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    const quizId = parseInt(route.params.quizId)
    
    
    const quiz = ref(null)
    const questions = ref([])
    const loading = ref(true)
    const submitting = ref(false)
    const quizStarted = ref(false)
    const quizSubmitted = ref(false)
    const currentQuestionIndex = ref(0)
    const userAnswers = ref({})
    const timeLeft = ref(0)
    const timerInterval = ref(null)
    const startTime = ref(null)
    const showSubmitConfirmation = ref(false)
    const submitConfirmationModal = ref(null)
    const quizResult = ref(null)
    
    
    const currentQuestion = computed(() => {
      return questions.value[currentQuestionIndex.value] || {}
    })
    
    const totalQuestions = computed(() => {
      return questions.value.length
    })
    
    const answeredCount = computed(() => {
      return Object.keys(userAnswers.value).length
    })
    
    
    const fetchQuiz = async () => {
      loading.value = true
      try {
        const response = await api.quizzes.get(quizId)
        quiz.value = response.data
      } catch (error) {
        console.error('Error fetching quiz:', error)
        store.commit('ADD_NOTIFICATION', {
          type: 'error',
          message: 'Failed to load quiz. Please try again.'
        })
        
        router.push({ name: 'user.quizzes', params: { subjectId: route.query.subjectId || 1 } })
      } finally {
        loading.value = false
      }
    }
    
    const fetchQuestions = async () => {
      try {
        const response = await api.quizzes.getQuestions(quizId)
        questions.value = response.data
      } catch (error) {
        console.error('Error fetching questions:', error)
        store.commit('ADD_NOTIFICATION', {
          type: 'error',
          message: 'Failed to load quiz questions. Please try again.'
        })
      }
    }
    
    const startQuiz = async () => {
      loading.value = true
      try {
        
        if (questions.value.length === 0) {
          await fetchQuestions()
        }
        
        if (questions.value.length === 0) {
          throw new Error('No questions available for this quiz')
        }
        
        
        const response = await api.quizzes.startAttempt(quizId)
        
        
        timeLeft.value = quiz.value.duration_minutes * 60
        startTime.value = new Date()
        
        
        startTimer()
        
      
        quizStarted.value = true
        loading.value = false
      } catch (error) {
        console.error('Error starting quiz:', error)
        loading.value = false
        
        let errorMessage = 'Failed to start quiz. Please try again.';
        if (error.response && error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        }
        
        store.commit('ADD_NOTIFICATION', {
          type: 'error',
          message: errorMessage
        })
      }
    }
    
    const startTimer = () => {
      timerInterval.value = setInterval(() => {
        if (timeLeft.value > 0) {
          timeLeft.value -= 1
        } else {
          clearInterval(timerInterval.value)
          submitQuiz()
        }
      }, 1000)
    }
    
    const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
    
    const selectAnswer = (questionId, choiceId) => {
      userAnswers.value = {
        ...userAnswers.value,
        [questionId]: choiceId
      }
    }
    
    const nextQuestion = () => {
      if (currentQuestionIndex.value < questions.value.length - 1) {
        currentQuestionIndex.value++
      }
    }
    
    const prevQuestion = () => {
      if (currentQuestionIndex.value > 0) {
        currentQuestionIndex.value--
      }
    }
    
    const goToQuestion = (index) => {
      currentQuestionIndex.value = index
    }
    
    const submitQuiz = async () => {
      submitting.value = true
      
      try {
        let timeTaken = 0
        if (startTime.value) {
          const endTime = new Date()
          timeTaken = Math.floor((endTime - startTime.value) / 1000)
        } else {
          timeTaken = (quiz.value.duration_minutes * 60) - timeLeft.value
        }
        
        const answers = Object.entries(userAnswers.value).map(([questionId, choiceId]) => ({
          question_id: parseInt(questionId),
          choice_id: choiceId
        }))
        
        const response = await api.quizzes.submitQuiz(quizId, {
          answers,
          time_taken: timeTaken
        })
        
        clearInterval(timerInterval.value)
        
        quizResult.value = response.data
        
        if (submitConfirmationModal.value) {
          submitConfirmationModal.value.hide()
        }
        
        quizSubmitted.value = true
      
        store.commit('ADD_NOTIFICATION', {
          type: 'success',
          message: `Quiz submitted successfully! You scored ${Math.round(response.data.score)}%.`
        })
        
      } catch (error) {
        console.error('Error submitting quiz:', error)
        
        let errorMessage = 'Failed to submit quiz. Please try again.';
        if (error.response && error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        }
        
        store.commit('ADD_NOTIFICATION', {
          type: 'error',
          message: errorMessage
        })
      } finally {
        submitting.value = false
      }
    }
    
    onMounted(async () => {
      await fetchQuiz()
      submitConfirmationModal.value = new Modal(document.getElementById('submitConfirmationModal'))
      

      watchEffect(() => {
        if (showSubmitConfirmation.value) {
          submitConfirmationModal.value.show()
          showSubmitConfirmation.value = false
        }
      })
    })
    
    onBeforeUnmount(() => {
      if (timerInterval.value) {
        clearInterval(timerInterval.value)
      }
    })
    
    return {
      quiz,
      questions,
      loading,
      submitting,
      quizStarted,
      quizSubmitted,
      currentQuestionIndex,
      userAnswers,
      timeLeft,
      showSubmitConfirmation,
      quizResult,
      
     
      currentQuestion,
      totalQuestions,
      answeredCount,
      startQuiz,
      formatTime,
      formatDate,
      selectAnswer,
      nextQuestion,
      prevQuestion,
      goToQuestion,
      submitQuiz
    }
  }
}
</script>

<style scoped>
.quiz-timer {
  font-weight: bold;
  font-size: 1.2rem;
  color: #dc3545;
}

.question-nav {
  max-width: 220px;
}

.question-nav-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.question-nav-btn.answered {
  position: relative;
}

.question-nav-btn.answered::after {
  content: '';
  position: absolute;
  bottom: 3px;
  right: 3px;
  width: 10px;
  height: 10px;
  background: #198754;
  border-radius: 50%;
}

.nav-indicator {
  width: 15px;
  height: 15px;
  border-radius: 50%;
}

.nav-indicator.answered {
  background: #198754;
}

.nav-indicator.unanswered {
  background: #dee2e6;
  border: 1px solid #ced4da;
}

.choice-item {
  padding: 15px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.choice-item:hover {
  background-color: #f8f9fa;
  border-color: #6c757d;
}

.choice-item.selected {
  background-color: #e8f4fc;
  border-color: #0d6efd;
}

.result-icon {
  display: inline-block;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-icon.success {
  background-color: #d1e7dd;
}

.result-icon.failed {
  background-color: #f8d7da;
}
</style> 






