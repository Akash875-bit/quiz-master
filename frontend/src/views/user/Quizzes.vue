<template>
  <div class="page-container">
    <div class="d-flex align-items-center mb-4">
      <router-link :to="{ name: 'user.subjects' }" class="btn btn-outline-primary me-3">
        <i class="bi bi-arrow-left me-2"></i>Back to Subjects
      </router-link>
      <h1 class="mb-0">{{ subject?.name || 'Quizzes' }}</h1>
    </div>
    

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading....</span>
      </div>
      <p class="mt-2">Loading quizzes.</p>
    </div>
    

    <div v-else-if="chapters.length === 0" class="text-center py-5 bg-light rounded">
      <i class="bi bi-journal-x display-1 text-muted"></i>
      <h3 class="mt-3">No Chapters Available</h3>
      <p class="text-muted">There are no chapters available for this subject yet.</p>
      <router-link :to="{ name: 'user.subjects' }" class="btn btn-primary mt-3">
        <i class="bi bi-grid me-2"></i>Browse Other Subjects
      </router-link>
    </div>
    

    <div v-else>
      <div class="mb-4">
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4">
            <div class="d-flex align-items-center">
              <div class="subject-icon me-4">
                <img :src="subject.image_url || '/default-subject.svg'" alt="Subject Icon" class="img-fluid rounded" width="80">
              </div>
              <div>
                <h2 class="h4 mb-2">{{ subject.name }}</h2>
                <p class="mb-0">{{ subject.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="row" v-if="chapters.length > 0">
        <div class="col-12 mb-4" v-for="chapter in chapters" :key="chapter.id">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-light py-3">
              <div class="d-flex justify-content-between align-items-center">
                <h3 class="h5 mb-0">{{ chapter.name }}</h3>
                
                <div v-if="isAdmin" class="btn-group">
                  <button class="btn btn-sm btn-outline-secondary me-2" @click="editChapter(chapter)">
                    <i class="bi bi-pencil"></i> Edit
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="confirmDeleteChapter(chapter)">
                    <i class="bi bi-trash"></i> Delete
                  </button>
                </div>
              </div>
            </div>
            <div class="card-body p-4">
              <p v-if="chapter.description">{{ chapter.description }}</p>
              
              
              <div v-if="loadingChapters[chapter.id]" class="text-center py-3">
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="small mt-2">Loading quizzes...</p>
              </div>
              
              
              <div v-else-if="!chapterQuizzes[chapter.id] || chapterQuizzes[chapter.id].length === 0" class="text-center py-3 bg-light rounded">
                <i class="bi bi-clipboard-x text-muted h3"></i>
                <p class="mt-2 mb-0">No quizzes available for this chapter yet.</p>
              </div>
              
              
              <div v-else class="quizzes-list">
                <div class="row">
                  <div class="col-md-6 col-lg-4 mb-4" v-for="quiz in chapterQuizzes[chapter.id]" :key="quiz.id">
                    <div class="quiz-card h-100" :class="{ 'disabled': !isQuizAvailable(quiz) }">
                      <div class="card border-0 shadow-sm h-100">
                        <div class="card-body p-4">
                          <div class="d-flex justify-content-between align-items-start mb-3">
                            <h4 class="card-title h5">{{ quiz.title }}</h4>
                            <div class="d-flex align-items-center">
                              <span 
                                class="badge ms-2" 
                                :class="{
                                  'bg-success': isQuizAvailable(quiz),
                                  'bg-warning': isQuizUpcoming(quiz),
                                  'bg-danger': isQuizExpired(quiz)
                                }"
                              >
                                {{ getQuizStatusLabel(quiz) }}
                              </span>
                              
                              <div v-if="isAdmin" class="ms-2">
                                <button class="btn btn-sm btn-outline-secondary me-1" @click="editQuiz(quiz, chapter.id)" title="Edit Quiz">
                                  <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-primary me-1" @click="toggleQuizStatus(quiz)" title="Toggle Active Status">
                                  <i class="bi" :class="quiz.is_active ? 'bi-toggle-on' : 'bi-toggle-off'"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" @click="confirmDeleteQuiz(quiz)" title="Delete Quiz">
                                  <i class="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <p class="card-text">{{ quiz.description || 'No description available' }}</p>
                          
                          <div class="quiz-info">
                            <div class="d-flex align-items-center mb-2">
                              <i class="bi bi-alarm text-primary me-2"></i>
                              <span>{{ quiz.duration_minutes }} minutes</span>
                            </div>
                            <div class="d-flex align-items-center mb-2">
                              <i class="bi bi-question-circle text-primary me-2"></i>
                              <span>{{ quiz.question_count || '?' }} questions</span>
                            </div>
                            <div class="d-flex align-items-center mb-2">
                              <i class="bi bi-trophy text-primary me-2"></i>
                              <span>Pass: {{ quiz.passing_score }}%</span>
                            </div>
                            <div v-if="getLastAttempt(quiz.id)" class="d-flex align-items-center mb-2">
                              <i 
                                class="bi me-2" 
                                :class="{
                                  'bi-check-circle-fill text-success': getLastAttempt(quiz.id).passed,
                                  'bi-x-circle-fill text-danger': !getLastAttempt(quiz.id).passed
                                }"
                              ></i>
                              <span>
                                Last Attempt: {{ getLastAttempt(quiz.id).score }}% 
                                ({{ getLastAttempt(quiz.id).passed ? 'Passed' : 'Failed' }})
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="card-footer bg-white p-3">
                          <div class="d-flex justify-content-between align-items-center">
                            <span class="text-muted small">
                              <i class="bi bi-calendar me-1"></i>
                              <span v-if="quiz.start_date && quiz.end_date">
                                {{ formatDateRange(quiz.start_date, quiz.end_date) }}
                              </span>
                              <span v-else>Always available</span>
                            </span>
                            <router-link 
                              v-if="isQuizAvailable(quiz)" 
                              :to="{ name: 'user.takeQuiz', params: { quizId: quiz.id } }" 
                              class="btn btn-sm btn-success"
                            >
                              <i class="bi bi-play-fill me-1"></i>Start Quiz
                            </router-link>
                            <span v-else-if="isQuizExpired(quiz)" class="badge bg-danger">
                              <i class="bi bi-lock-fill me-1"></i>Expired
                            </span>
                            <span v-else-if="isQuizUpcoming(quiz)" class="badge bg-warning text-dark">
                              <i class="bi bi-hourglass-split me-1"></i>Coming Soon
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>


  <div class="modal fade" id="deleteChapterModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Confirm Delete Chapter</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete the chapter <strong>{{ chapterToDelete?.name }}</strong>?</p>
          <p class="text-danger">
            <i class="bi bi-exclamation-triangle me-2"></i>
            This action cannot be undone. All quizzes in this chapter will also be deleted.
          </p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-danger" @click="deleteChapter" :disabled="submitting">
            <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
            Delete Chapter
          </button>
        </div>
      </div>
    </div>
  </div>



  <div class="modal fade" id="deleteQuizModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Confirm Delete Quiz</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete the quiz <strong>{{ quizToDelete?.title }}</strong>?</p>
          <p class="text-danger">
            <i class="bi bi-exclamation-triangle me-2"></i>
            This action cannot be undone. All questions and user answers will also be deleted.
          </p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-danger" @click="deleteQuiz" :disabled="submitting">
            <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
            Delete Quiz
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { Modal } from 'bootstrap'

export default {
  name: 'UserQuizzes',
  
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    
    const subject = ref(null)
    const chapters = ref([])
    const loading = ref(true)
    const chapterQuizzes = reactive({})
    const loadingChapters = reactive({})
    const userQuizAttempts = ref([])
    const chapterToDelete = ref(null)
    const quizToDelete = ref(null)
    const submitting = ref(false)
    
    
    let deleteChapterModal = null;
    let deleteQuizModal = null;
    
    
    const isAdmin = computed(() => store.getters.isAdmin)
    
    
    const fetchSubject = async (subjectId) => {
      try {
        const response = await store.dispatch('fetchSubject', subjectId)
        subject.value = response
      } catch (error) {
        console.error('Error fetching subject:', error)
      }
    }
    
    const fetchChapters = async () => {
      const subjectId = route.params.subjectId
      loading.value = true
      
      try {
        const response = await store.dispatch('fetchChapters', subjectId)
        chapters.value = response
        
      
        chapters.value.forEach(chapter => {
          fetchQuizzes(chapter.id)
        })
      } catch (error) {
        console.error('Error fetching chapters:', error)
      } finally {
        loading.value = false
      }
    }
    
    const fetchQuizzes = async (chapterId) => {
      loadingChapters[chapterId] = true
      
      try {
        const response = await store.dispatch('fetchQuizzes', chapterId)
        chapterQuizzes[chapterId] = response
      } catch (error) {
        console.error(`Error fetching quizzes for chapter ${chapterId}:`, error)
      } finally {
        loadingChapters[chapterId] = false
      }
    }
    
    const fetchUserAttempts = async () => {
      try {
        const response = await store.dispatch('fetchScores')
        userQuizAttempts.value = response
      } catch (error) {
        console.error('Error fetching user quiz attempts:', error)
      }
    }
    
    const isQuizAvailable = (quiz) => {
      if (!quiz.is_active) return false
      
      const now = new Date()
      
      
      if (quiz.start_date) {
        const startDate = new Date(quiz.start_date)
        if (now < startDate) return false
      }
      
      
      if (quiz.end_date) {
        const endDate = new Date(quiz.end_date)
        if (now > endDate) return false
      }
      
      return true
    }
    
    const isQuizUpcoming = (quiz) => {
      if (!quiz.is_active) return false
      
      const now = new Date()
      
      if (quiz.start_date) {
        const startDate = new Date(quiz.start_date)
        return now < startDate
      }
      
      return false
    }
    
    const isQuizExpired = (quiz) => {
      if (!quiz.is_active) return false
      
      const now = new Date()
      
      if (quiz.end_date) {
        const endDate = new Date(quiz.end_date)
        return now > endDate
      }
      
      return false
    }
    
    const getQuizStatusLabel = (quiz) => {
      if (!quiz.is_active) return 'Inactive'
      if (isQuizUpcoming(quiz)) return 'Upcoming'
      if (isQuizExpired(quiz)) return 'Expired'
      return 'Available'
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return null
      
      const options = { year: 'numeric', month: 'short', day: 'numeric' }
      return new Date(dateString).toLocaleDateString(undefined, options)
    }
    
    const formatDateRange = (startDate, endDate) => {
      const start = formatDate(startDate)
      const end = formatDate(endDate)
      
      if (start && end) {
        return `${start} - ${end}`
      } else if (start) {
        return `From ${start}`
      } else if (end) {
        return `Until ${end}`
      }
      
      return 'Always available'
    }
    
    const getLastAttempt = (quizId) => {
      const attempts = userQuizAttempts.value.filter(
        attempt => attempt.quiz_id === quizId
      )
      
      if (attempts.length === 0) return null
      
      
      return attempts.sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))[0]
    }
    
    const confirmDeleteChapter = (chapter) => {
      chapterToDelete.value = chapter;
      deleteChapterModal.show();
    }
    
    const deleteChapter = async () => {
      if (!chapterToDelete.value) return;
      
      submitting.value = true;
      
      try {
        await store.dispatch('deleteChapter', { 
          id: chapterToDelete.value.id, 
          subjectId: subject.value.id 
        });
        await fetchChapters();
        
        store.commit('ADD_NOTIFICATION', {
          type: 'success',
          message: `Chapter "${chapterToDelete.value.name}" was successfully deleted`
        });
        
        deleteChapterModal.hide();
      } catch (error) {
        console.error('Error deleting chapter:', error);
        
        // Show error notification
        store.commit('ADD_NOTIFICATION', {
          type: 'error',
          message: error.response?.data?.error || 'Failed to delete chapter'
        });
      } finally {
        submitting.value = false;
        chapterToDelete.value = null;
      }
    }
    
    const confirmDeleteQuiz = (quiz) => {
      quizToDelete.value = quiz;
      deleteQuizModal.show();
    }
    
    const deleteQuiz = async () => {
      if (!quizToDelete.value) return;
      
      submitting.value = true;
      
      try {
        await store.dispatch('deleteQuiz', quizToDelete.value.id);
        await fetchQuizzes(quizToDelete.value.chapter_id);
        
        store.commit('ADD_NOTIFICATION', {
          type: 'success',
          message: `Quiz "${quizToDelete.value.title}" was successfully deleted`
        });
        

        deleteQuizModal.hide();
      } catch (error) {
        console.error('Error deleting quiz:', error);
        
        store.commit('ADD_NOTIFICATION', {
          type: 'error',
          message: error.response?.data?.error || 'Failed to delete quiz'
        });
      } finally {
        submitting.value = false;
        quizToDelete.value = null;
      }
    }
    
    const toggleQuizStatus = async (quiz) => {
      try {
        const updatedQuiz = { ...quiz, is_active: !quiz.is_active };
        
        await store.dispatch('updateQuiz', {
          id: quiz.id,
          quiz: updatedQuiz
        });
        
        await fetchQuizzes(quiz.chapter_id);
        
        store.commit('ADD_NOTIFICATION', {
          type: 'success',
          message: `Quiz "${quiz.title}" has been ${updatedQuiz.is_active ? 'activated' : 'deactivated'}`
        });
      } catch (error) {
        console.error('Error toggling quiz status:', error);
        
        store.commit('ADD_NOTIFICATION', {
          type: 'error',
          message: error.response?.data?.error || 'Failed to update quiz status'
        });
      }
    }
    
    const editChapter = (chapter) => {
      store.commit('ADD_NOTIFICATION', {
        type: 'info',
        message: `Redirecting to edit chapter "${chapter.name}"`
      })
      
      router.push({ 
        name: 'admin.chapters', 
        params: { subjectId: subject.value.id },
        state: { editChapterId: chapter.id }
      })
    }
    
    const editQuiz = (quiz, chapterId) => {
      store.commit('ADD_NOTIFICATION', {
        type: 'info',
        message: `Redirecting to edit quiz "${quiz.title}"`
      })
      

      router.push({ 
        name: 'admin.quizzes', 
        params: { chapterId: chapterId }
      })
    }
    
    onMounted(async () => {
      const subjectId = route.params.subjectId
      
      await Promise.all([
        fetchSubject(subjectId),
        fetchChapters(),
        fetchUserAttempts()
      ])
      
      deleteChapterModal = new Modal(document.getElementById('deleteChapterModal'));
      deleteQuizModal = new Modal(document.getElementById('deleteQuizModal'));
    })
    
    watch(() => route.params.subjectId, async (newSubjectId, oldSubjectId) => {
      if (newSubjectId && newSubjectId !== oldSubjectId) {
        await Promise.all([
          fetchSubject(newSubjectId),
          fetchChapters()
        ])
      }
    })
    
    return {
      subject,
      chapters,
      loading,
      chapterQuizzes,
      loadingChapters,
      userQuizAttempts,
      chapterToDelete,
      quizToDelete,
      submitting,
      isAdmin,
      
      isQuizAvailable,
      isQuizUpcoming,
      isQuizExpired,
      getQuizStatusLabel,
      formatDate,
      formatDateRange,
      getLastAttempt,
      confirmDeleteChapter,
      deleteChapter,
      confirmDeleteQuiz,
      deleteQuiz,
      toggleQuizStatus,
      editChapter,
      editQuiz
    }
  }
}
</script>

<style scoped>
.quiz-card.disabled {
  opacity: 0.7;
}

.quiz-card .card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.quiz-card:not(.disabled) .card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

.nav-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.quiz-info i {
  width: 20px;
  text-align: center;
}
</style> 



