<template>
  <div>
    <div class="d-flex align-items-center mb-4">
      <router-link :to="{ name: 'admin.chapters', params: { subjectId: chapter?.subject_id || 0 } }" class="btn btn-outline-primary me-3">
        <i class="bi bi-arrow-left me-2"></i>Back to Chapters
      </router-link>
      <h1 class="mb-0">Quizzes for {{ chapter?.name || 'Chapter' }}</h1>
    </div>

    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body p-4">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h5 class="mb-1">{{ chapter?.name }}</h5>
            <p class="text-muted mb-0">{{ chapter?.description || 'No description available' }}</p>
          </div>
          <button class="btn btn-success" @click="showAddModal">
            <i class="bi bi-plus-circle me-2"></i>Add Quiz
          </button>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading quizzes...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="quizzes.length === 0" class="text-center py-5 bg-light rounded">
      <i class="bi bi-journal-check display-1 text-muted"></i>
      <h3 class="mt-3">No Quizzes Found</h3>
      <p class="text-muted">Get started by adding your first quiz to this chapter.</p>
      <button class="btn btn-success mt-3" @click="showAddModal">
        <i class="bi bi-plus-circle me-2"></i> Add Quiz
      </button>
    </div>

    <!-- Quizzes list -->
    <div v-else class="row g-4">
      <div v-for="quiz in quizzes" :key="quiz.id" class="col-lg-6">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-header bg-transparent border-0 pt-4 ps-4">
            <div class="d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <span 
                  class="badge rounded-pill me-2" 
                  :class="quiz.is_active ? 'bg-success' : 'bg-secondary'"
                >
                  {{ quiz.is_active ? 'Active' : 'Inactive' }}
                </span>
                <span v-if="quiz.is_available" class="badge bg-primary rounded-pill">Available</span>
                <span v-else class="badge bg-warning rounded-pill">Unavailable</span>
              </div>
              <div class="btn-group">
                <button class="btn btn-sm btn-outline-secondary me-1" @click="editQuiz(quiz)" title="Edit Quiz">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-primary me-1" @click="toggleQuizStatus(quiz)" title="Toggle Status">
                  <i class="bi" :class="quiz.is_active ? 'bi-toggle-off' : 'bi-toggle-on'"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(quiz)" title="Delete Quiz">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
            <h3 class="h5 mt-2">{{ quiz.title }}</h3>
          </div>
          <div class="card-body">
            <p class="text-muted">{{ quiz.description || 'No description provided.' }}</p>
            
            <div class="d-flex flex-wrap mt-3">
              <div class="me-4 mb-3">
                <div class="d-flex align-items-center">
                  <i class="bi bi-alarm text-primary me-2"></i>
                  <span>{{ quiz.duration_minutes }} minutes</span>
                </div>
              </div>
              <div class="me-4 mb-3">
                <div class="d-flex align-items-center">
                  <i class="bi bi-question-circle text-primary me-2"></i>
                  <span>{{ quiz.question_count || 0 }} questions</span>
                </div>
              </div>
              <div class="mb-3">
                <div class="d-flex align-items-center">
                  <i class="bi bi-trophy text-primary me-2"></i>
                  <span>Pass: {{ quiz.passing_score }}%</span>
                </div>
              </div>
            </div>
            
            <div class="border-top pt-3 mt-2">
              <div class="row">
                <div class="col-md-6 mb-2">
                  <div class="d-flex align-items-center">
                    <i class="bi bi-calendar-event text-muted me-2"></i>
                    <small class="text-muted">Start: {{ formatDate(quiz.start_date) || 'Anytime' }}</small>
                  </div>
                </div>
                <div class="col-md-6 mb-2">
                  <div class="d-flex align-items-center">
                    <i class="bi bi-calendar-x text-muted me-2"></i>
                    <small class="text-muted">End: {{ formatDate(quiz.end_date) || 'No deadline' }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="card-footer bg-transparent border-0 pb-4">
            <router-link :to="{ name: 'admin.questions', params: { quizId: quiz.id } }" class="btn btn-primary w-100">
              <i class="bi bi-pencil-square me-2"></i> Manage Questions
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Quiz Modal -->
    <div class="modal fade" id="quizModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Edit Quiz' : 'Add New Quiz' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveQuiz">
              <div class="row">
                <div class="col-md-12 mb-3">
                  <label for="quizTitle" class="form-label">Quiz Title <span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="quizTitle" 
                    v-model="quizForm.title" 
                    required
                    placeholder="e.g. Final Exam"
                  >
                </div>
                
                <div class="col-md-12 mb-3">
                  <label for="quizDescription" class="form-label">Description</label>
                  <textarea 
                    class="form-control" 
                    id="quizDescription" 
                    v-model="quizForm.description" 
                    rows="3"
                    placeholder="Provide a brief description of this quiz"
                  ></textarea>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="quizDuration" class="form-label">Duration (minutes) <span class="text-danger">*</span></label>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="quizDuration" 
                    v-model="quizForm.duration_minutes" 
                    min="1"
                    required
                    placeholder="30"
                  >
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="quizPassingScore" class="form-label">Passing Score (%) <span class="text-danger">*</span></label>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="quizPassingScore" 
                    v-model="quizForm.passing_score" 
                    min="1"
                    max="100"
                    required
                    placeholder="60"
                  >
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="quizStartDate" class="form-label">Start Date</label>
                  <input 
                    type="datetime-local" 
                    class="form-control" 
                    id="quizStartDate" 
                    v-model="quizForm.start_date"
                  >
                  <small class="text-muted">Leave blank for immediate availability</small>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="quizEndDate" class="form-label">End Date</label>
                  <input 
                    type="datetime-local" 
                    class="form-control" 
                    id="quizEndDate" 
                    v-model="quizForm.end_date"
                  >
                  <small class="text-muted">Leave blank for no expiration</small>
                </div>
                
                <div class="col-md-12 mb-3">
                  <div class="form-check form-switch">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      id="quizIsActive" 
                      v-model="quizForm.is_active"
                    >
                    <label class="form-check-label" for="quizIsActive">Quiz is active</label>
                  </div>
                  <small class="text-muted">Inactive quizzes won't be visible to users</small>
                </div>
              </div>
              
              <div class="modal-footer px-0 pb-0">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-success" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isEditing ? 'Update Quiz' : 'Create Quiz' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Delete</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete <strong>{{ quizToDelete?.title }}</strong>?</p>
            <p class="text-danger">
              <i class="bi bi-exclamation-triangle me-2"></i>
              This action cannot be undone. All questions and user attempts for this quiz will also be deleted.
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
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { Modal } from 'bootstrap'

export default {
  name: 'AdminQuizzes',
  
  setup() {
    const store = useStore()
    const route = useRoute()
    const chapterId = parseInt(route.params.chapterId)
    
    // Data
    const chapter = ref(null)
    const quizzes = ref([])
    const loading = ref(true)
    const submitting = ref(false)
    const isEditing = ref(false)
    const quizForm = ref({
      id: null,
      chapter_id: chapterId,
      title: '',
      description: '',
      duration_minutes: 30,
      passing_score: 60,
      is_active: true,
      start_date: '',
      end_date: ''
    })
    const quizToDelete = ref(null)
    
    // Modal references
    let quizModal = null
    let deleteModal = null
    
    // Computed
    const error = computed(() => store.getters.getError)
    
    // Lifecycle hooks
    onMounted(async () => {
      // Initialize Bootstrap modals
      quizModal = new Modal(document.getElementById('quizModal'))
      deleteModal = new Modal(document.getElementById('deleteModal'))
      
      await fetchChapter()
      await fetchQuizzes()
    })
    
    // Methods
    const fetchChapter = async () => {
      try {
        // Use store action instead of direct axios call
        const response = await store.dispatch('fetchChapter', chapterId)
        chapter.value = response
      } catch (error) {
        console.error('Error fetching chapter:', error)
      }
    }
    
    const fetchQuizzes = async () => {
      loading.value = true
      try {
        const response = await store.dispatch('fetchQuizzes', chapterId)
        quizzes.value = response
      } catch (error) {
        console.error('Error fetching quizzes:', error)
      } finally {
        loading.value = false
      }
    }
    
    const showAddModal = () => {
      resetForm()
      isEditing.value = false
      quizModal.show()
    }
    
    const editQuiz = (quiz) => {
      // Convert date strings to input format if they exist
      const formattedQuiz = { ...quiz }
      if (quiz.start_date) {
        formattedQuiz.start_date = formatDateForInput(quiz.start_date)
      }
      if (quiz.end_date) {
        formattedQuiz.end_date = formatDateForInput(quiz.end_date)
      }
      
      quizForm.value = formattedQuiz
      isEditing.value = true
      quizModal.show()
    }
    
    const saveQuiz = async () => {
      submitting.value = true
      
      try {
        console.log('Saving quiz:', quizForm.value);
        
        if (isEditing.value) {
          // Update existing quiz using store action
          await store.dispatch('updateQuiz', {
            id: quizForm.value.id,
            quiz: quizForm.value
          });
          
          // Show success notification
          store.dispatch('addNotification', {
            type: 'success',
            message: 'Quiz updated successfully!'
          });
        } else {
          // Create new quiz using store action
          await store.dispatch('createQuiz', {
            chapterId: chapterId,
            quiz: quizForm.value
          });
          
          // Show success notification
          store.dispatch('addNotification', {
            type: 'success',
            message: 'Quiz created successfully!'
          });
        }
        
        // Refresh quizzes and close modal
        await fetchQuizzes()
        quizModal.hide()
        
      } catch (error) {
        console.error('Error saving quiz:', error)
        
        // Handle different types of errors
        let errorMessage = 'Failed to save quiz. Please try again.';
        
        if (error.response) {
          if (error.response.status === 401) {
            errorMessage = 'Your session has expired. Please log in again.';
            // The token interceptor should handle redirecting to login
          } else if (error.response.data && error.response.data.error) {
            errorMessage = error.response.data.error;
          }
        }
        
        // Show error notification
        store.dispatch('addNotification', {
          type: 'danger',
          message: errorMessage
        });
      } finally {
        submitting.value = false
      }
    }
    
    const toggleQuizStatus = async (quiz) => {
      submitting.value = true
      
      try {
        const updatedQuiz = { ...quiz, is_active: !quiz.is_active }
        // Use store action instead of direct axios call
        await store.dispatch('updateQuiz', {
          id: quiz.id,
          quiz: updatedQuiz
        })
        await fetchQuizzes()
      } catch (error) {
        console.error('Error toggling quiz status:', error)
      } finally {
        submitting.value = false
      }
    }
    
    const confirmDelete = (quiz) => {
      quizToDelete.value = quiz
      deleteModal.show()
    }
    
    const deleteQuiz = async () => {
      if (!quizToDelete.value) return
      
      submitting.value = true
      
      try {
        // Use store action instead of direct axios call
        await store.dispatch('deleteQuiz', quizToDelete.value.id)
        await fetchQuizzes()
        deleteModal.hide()
      } catch (error) {
        console.error('Error deleting quiz:', error)
      } finally {
        submitting.value = false
        quizToDelete.value = null
      }
    }
    
    const resetForm = () => {
      quizForm.value = {
        id: null,
        chapter_id: chapterId,
        title: '',
        description: '',
        duration_minutes: 30,
        passing_score: 60,
        is_active: true,
        start_date: '',
        end_date: ''
      }
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return null
      
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
      return new Date(dateString).toLocaleDateString(undefined, options)
    }
    
    const formatDateForInput = (dateString) => {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      
      return `${year}-${month}-${day}T${hours}:${minutes}`
    }
    
    return {
      chapter,
      quizzes,
      loading,
      submitting,
      isEditing,
      quizForm,
      quizToDelete,
      error,
      showAddModal,
      editQuiz,
      saveQuiz,
      toggleQuizStatus,
      confirmDelete,
      deleteQuiz,
      formatDate
    }
  }
}
</script>

<style scoped>
.card {
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}
</style> 