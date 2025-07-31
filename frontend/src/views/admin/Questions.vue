<template>
  
  <div class="page-container">
    <div class="d-flex align-items-center mb-4">
      <router-link :to="{ name: 'admin.quizzes', params: { chapterId: quiz?.chapter_id || 0 } }" class="btn btn-outline-primary me-3">
        <i class="bi bi-arrow-left me-2"></i>Back to Quizzes
      </router-link>
      <h1 class="mb-0">Questions for {{ quiz?.title || 'Quiz' }}</h1>
    </div>

    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body p-4">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h5 class="mb-1">{{ quiz?.title }}</h5>
            <p class="text-muted mb-0">{{ quiz?.description || 'No description available' }}</p>
            <div class="d-flex flex-wrap mt-2">
              <div class="me-4">
                <i class="bi bi-alarm text-primary me-1"></i>
                <span>{{ quiz?.duration_minutes }} minutes</span>
              </div>
              <div class="me-4">
                <i class="bi bi-trophy text-primary me-1"></i>
                <span>Pass: {{ quiz?.passing_score }}%</span>
              </div>
            </div>
          </div>
          <button class="btn btn-success" @click="showAddModal">
            <i class="bi bi-plus-circle me-2"></i>Add Question
          </button>
        </div>
      </div>
    </div>



    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">Loading..</span>
      </div>
      <p class="mt-2">Loading questions.</p>
    </div>

    <!-- for no questions -->
    <div v-else-if="questions.length === 0" class="text-center py-5 bg-light rounded">
      <i class="bi bi-question-circle display-1 text-muted"></i>
      <h3 class="mt-3">No Questions Found</h3>
      <p class="text-muted">add your first question to this quiz.</p>
      <button class="btn btn-success mt-3" @click="showAddModal">
        <i class="bi bi-plus-circle me-2"></i> Add Question
      </button>
    </div>


    <div v-else>
      <div class="mb-4">
        <div class="d-flex justify-content-between align-items-center">
          <h2 class="h4">Questions List ({{ questions.length }})</h2>
          <div class="d-flex align-items-center">
            <button v-if="questions.length > 0" class="btn btn-outline-primary me-2" @click="reorderQuestions">
              <i class="bi bi-sort-numeric-down me-2"></i>Reorder Questions
            </button>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm mb-4" v-for="(question, index) in questions" :key="question.id">
        <div class="card-header bg-light py-3">
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <span class="badge bg-primary rounded-pill me-3">Q{{ index + 1 }}</span>
              <span class="text-muted small">{{ question.points }} {{ question.points === 1 ? 'point' : 'points' }}</span>
            </div>
            <div>
              <button class="btn btn-sm btn-outline-primary me-2" @click="editQuestion(question)">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(question)">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="card-body p-4">
          <h5>{{ question.text }}</h5>
          
          <div v-if="question.explanation" class="mb-3 p-3 bg-light rounded">
            <div class="mb-1 text-muted small">explanation:</div>
            <p class="mb-0">{{ question.explanation }}</p>
          </div>
          
          <div class="mt-4">
            <h6 class="mb-3">Choices:</h6>
            <ul class="list-group">
              <li 
                v-for="choice in question.choices" 
                :key="choice.id" 
                class="list-group-item d-flex align-items-center"
                :class="{ 'list-group-item-success': choice.is_correct }"
              >
                <i 
                  class="bi me-2" 
                  :class="{
                    'bi-check-circle-fill text-success': choice.is_correct,
                    'bi-circle text-muted': !choice.is_correct
                  }"
                ></i>
                {{ choice.text }}
                <span v-if="choice.is_correct" class="ms-auto badge bg-success">Correct Answer</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="questionModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Edit Question' : 'Add New Question' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveQuestion">
              <div class="mb-3">
                <label for="questionText" class="form-label">Question Text <span class="text-danger">*</span></label>
                <textarea 
                  class="form-control" 
                  id="questionText" 
                  v-model="questionForm.text" 
                  rows="3"
                  required
                  placeholder="Enter the question text"
                ></textarea>
              </div>
              
              <div class="mb-3">
                <label for="questionExplanation" class="form-label">Explanation (Optional)</label>
                <textarea 
                  class="form-control" 
                  id="questionExplanation" 
                  v-model="questionForm.explanation" 
                  rows="2"
                  placeholder="Provide an explanation for the correct answer"
                ></textarea>
                <small class="text-muted">This will be shown to users after they answer the question</small>
              </div>
              
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="questionPoints" class="form-label">Points <span class="text-danger">*</span></label>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="questionPoints" 
                    v-model="questionForm.points" 
                    min="1"
                    required
                    placeholder="1"
                  >
                </div>
                
                <div class="col-md-6">
                  <label for="questionOrder" class="form-label">Display Order (Optional)</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="questionOrder" 
                    v-model="questionForm.order" 
                    min="0"
                    placeholder="0"
                  >
                </div>
              </div>
              
              <h5 class="mb-3 mt-4">Choices <span class="text-danger">*</span></h5>
              <p class="text-muted small">at least 2 choices with one as correct.</p>
              
              <div class="choices-container">
                <div 
                  v-for="(choice, index) in questionForm.choices" 
                  :key="index"
                  class="choice-item mb-3 p-3 border rounded position-relative"
                >
                  <button 
                    type="button" 
                    class="btn-close position-absolute top-0 end-0 m-2" 
                    @click="removeChoice(index)"
                    :disabled="questionForm.choices.length <= 2"
                  ></button>
                  
                  <div class="mb-3">
                    <label :for="'choiceText' + index" class="form-label">Option {{ index + 1 }}</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      :id="'choiceText' + index" 
                      v-model="choice.text" 
                      required
                      placeholder="Enter choice text"
                    >
                  </div>
                  
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="radio" 
                      :id="'choiceCorrect' + index" 
                      :name="'correctChoice'" 
                      :value="index"
                      v-model="correctChoiceIndex"
                    >
                    <label class="form-check-label" :for="'choiceCorrect' + index">
                      mark as correct answer
                    </label>
                  </div>
                </div>
              </div>
              
              <button type="button" class="btn btn-outline-primary mb-4" @click="addChoice">
                <i class="bi bi-plus-circle me-2"></i>add Another Option
              </button>
              
              <div class="modal-footer px-0 pb-0">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-success" :disabled="submitting || !isFormValid">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isEditing ? 'Update Question' : 'Create Question' }}
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
            <p>Are you sure you want to delete this question?</p>
            <div class="p-2 border rounded bg-light">
              <strong>{{ questionToDelete?.text }}</strong>
            </div>
            <p class="text-danger mt-3">
              <i class="bi bi-exclamation-triangle me-2"></i>
              This action cannot be undone.
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="deleteQuestion" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
              Delete Question
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reorder Questions Modal -->
    <div class="modal fade" id="reorderModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Reorder Questions</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="text-muted mb-3">Drag and drop questions to change their order.</p>
            
            <ul class="list-group" id="sortable-questions">
              <li 
                v-for="(question, index) in reorderList" 
                :key="question.id"
                class="list-group-item d-flex align-items-center"
              >
                <i class="bi bi-grip-vertical me-3 text-secondary"></i>
                <span class="badge bg-primary rounded-pill me-2">{{ index + 1 }}</span>
                <div class="text-truncate">{{ question.text }}</div>
              </li>
            </ul>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveReordering" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
              Save Order
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { Modal } from 'bootstrap'

export default {
  name: 'AdminQuestions',
  
  setup() {
    const store = useStore()
    const route = useRoute()
    const quizId = parseInt(route.params.quizId)
    
    // Data
    const quiz = ref(null)
    const questions = ref([])
    const loading = ref(true)
    const submitting = ref(false)
    const isEditing = ref(false)
    const questionForm = ref({
      id: null,
      quiz_id: quizId,
      text: '',
      explanation: '',
      points: 1,
      order: 0,
      choices: [
        { text: '', is_correct: true },
        { text: '', is_correct: false }
      ]
    })
    const questionToDelete = ref(null)
    const correctChoiceIndex = ref(0)
    const reorderList = ref([])
    
    let questionModal = null
    let deleteModal = null
    let reorderModal = null
    

    const error = computed(() => store.getters.getError)
    
    const isFormValid = computed(() => {
      return (
        questionForm.value.text.trim() !== '' && 
        questionForm.value.choices.length >= 2 &&
        correctChoiceIndex.value !== null
      )
    })
    

    onMounted(async () => {

      questionModal = new Modal(document.getElementById('questionModal'))
      deleteModal = new Modal(document.getElementById('deleteModal'))
      reorderModal = new Modal(document.getElementById('reorderModal'))
      
      await fetchQuiz()
      await fetchQuestions()
    })

    const fetchQuiz = async () => {
      try {
        const response = await store.dispatch('fetchQuiz', quizId)
        quiz.value = response
      } catch (error) {
        console.error('Error fetching quiz:', error)
      }
    }
    
    const fetchQuestions = async () => {
      loading.value = true
      try {
        const response = await store.dispatch('fetchQuestions', quizId)
        questions.value = response.sort((a, b) => a.order - b.order)
      } catch (error) {
        console.error('Error fetching questions:', error)
      } finally {
        loading.value = false
      }
    }
    
    const showAddModal = () => {
      resetForm()
      isEditing.value = false
      questionModal.show()
    }
    
    const editQuestion = (question) => {
      resetForm()
      
      questionForm.value = {
        id: question.id,
        quiz_id: quizId,
        text: question.text,
        explanation: question.explanation || '',
        points: question.points,
        order: question.order || 0,
        choices: question.choices ? [...question.choices] : []
      }

      correctChoiceIndex.value = questionForm.value.choices.findIndex(choice => choice.is_correct)
      
      isEditing.value = true
      questionModal.show()
    }
    
    const saveQuestion = async () => {
      submitting.value = true
      
      try {
        questionForm.value.choices.forEach((choice, index) => {
          choice.is_correct = index === correctChoiceIndex.value
        })
        
        if (isEditing.value) {
          await store.dispatch('updateQuestion', {
            id: questionForm.value.id,
            question: questionForm.value
          })
        } else {
          await store.dispatch('createQuestion', {
            quizId,
            question: questionForm.value
          })
        }
        await fetchQuestions()
        questionModal.hide()
      } catch (error) {
        console.error('Error saving question:', error)
      } finally {
        submitting.value = false
      }
    }
    
    const addChoice = () => {
      questionForm.value.choices.push({ text: '', is_correct: false })
    }
    
    const removeChoice = (index) => {
      if (questionForm.value.choices.length <= 2) return
      
      questionForm.value.choices.splice(index, 1)
      

      if (correctChoiceIndex.value === index) {
        correctChoiceIndex.value = 0 
      } else if (correctChoiceIndex.value > index) {
        correctChoiceIndex.value-- 
      }
    }
    
    const confirmDelete = (question) => {
      questionToDelete.value = question
      deleteModal.show()
    }
    
    const deleteQuestion = async () => {
      if (!questionToDelete.value) return
      
      submitting.value = true
      
      try {
        await store.dispatch('deleteQuestion', questionToDelete.value.id)
        await fetchQuestions()
        deleteModal.hide()
      } catch (error) {
        console.error('Error deleting question:', error)
      } finally {
        submitting.value = false
        questionToDelete.value = null
      }
    }
    
    const reorderQuestions = () => {
      reorderList.value = [...questions.value]
      reorderModal.show()
    }
    
    const saveReordering = async () => {
      submitting.value = true
      
      try {
        const updates = reorderList.value.map((question, index) => {
          return store.dispatch('updateQuestion', {
            id: question.id,
            question: {
              ...question,
              order: index
            }
          })
        })
        
        await Promise.all(updates)
        await fetchQuestions()
        reorderModal.hide()
      } catch (error) {
        console.error('Error updating question order:', error)
      } finally {
        submitting.value = false
      }
    }
    
    const resetForm = () => {
      questionForm.value = {
        id: null,
        quiz_id: quizId,
        text: '',
        explanation: '',
        points: 1,
        order: questions.value.length,
        choices: [
          { text: '', is_correct: true },
          { text: '', is_correct: false }
        ]
      }
      correctChoiceIndex.value = 0
    }
    
    return {
      quiz,
      questions,
      loading,
      submitting,
      isEditing,
      questionForm,
      questionToDelete,
      correctChoiceIndex,
      reorderList,
      error,
      isFormValid,
      showAddModal,
      editQuestion,
      saveQuestion,
      addChoice,
      removeChoice,
      confirmDelete,
      deleteQuestion,
      reorderQuestions,
      saveReordering
    }
  }
}
</script>



<style scoped>
.choices-container {
  max-height: 400px;
  overflow-y: auto;
}
.choice-item {
  background-color: #f8f9fa;
}
#sortable-questions .list-group-item {
  cursor: move;
}
</style> 

