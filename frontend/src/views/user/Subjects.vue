<template>
  <div class="container page-container">
    <h1 class="mb-4">Browse Subjects</h1>
    
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading.....</span>
      </div>
      <p class="mt-2">Loading subjects</p>
    </div>
    
    
    <div v-else-if="subjects.length === 0" class="text-center py-5 bg-light rounded">
      <i class="bi bi-journal-x display-1 text-muted"></i>
      <h3 class="mt-3">No Subjects Available</h3>
    </div>
    
    
    
    <div v-else class="row mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <span class="input-group-text bg-white">
            <i class="bi bi-search"></i>
          </span>
          <input 
            type="text" 
            v-model="searchQuery" 
            class="form-control" 
            placeholder="Search subjects..." 
            aria-label="Search subjects"
          >
        </div>
      </div>
    </div>
    
    

    <div class="row g-4">
      <div 
        v-for="subject in filteredSubjects" 
        :key="subject.id" 
        class="col-lg-4 col-md-6"
      >
        <div class="card subject-card h-100 border-0 shadow-sm">
          <div class="card-body p-4">
            <div class="d-flex align-items-center mb-3">
              <div class="subject-icon bg-light rounded-circle p-3 me-3">
                <i class="bi bi-book text-primary fs-4"></i>
              </div>
              <div class="d-flex justify-content-between align-items-center flex-grow-1">
                <h3 class="h5 mb-0">{{ subject.name }}</h3>
                <!-- Replace three-dot menu with direct buttons -->
                <div v-if="isAdmin" class="btn-group">
                  <button class="btn btn-sm btn-outline-secondary me-2" @click="editSubject(subject)">
                    <i class="bi bi-pencil"></i> Edit
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(subject)">
                    <i class="bi bi-trash"></i> Delete
                  </button>
                </div>
              </div>
            </div>
            
            <p class="text-muted">{{ subject.description || 'No description available' }}</p>
            
            <div class="d-flex align-items-center mb-3 small text-muted">
              <div class="me-3">
                <i class="bi bi-book me-1"></i>
                <span>{{ subject.chapters_count || 0 }} {{ subject.chapters_count === 1 ? 'Chapter' : 'Chapters' }}</span>
              </div>
              <div>
                <i class="bi bi-question-circle me-1"></i>
                <span>{{ subject.quizzes_count || 0 }} {{ subject.quizzes_count === 1 ? 'Quiz' : 'Quizzes' }}</span>
              </div>
            </div>
          </div>
          <div class="card-footer bg-white border-0 p-4 pt-0">
            <router-link 
              :to="{ name: 'user.quizzes', params: { subjectId: subject.id } }" 
              class="btn btn-primary w-100"
            >
              View Quizzes
            </router-link>
          </div>
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
          <p>Are you sure you want to delete <strong>{{ subjectToDelete?.name }}</strong>?</p>
          <p class="text-danger">
            <i class="bi bi-exclamation-triangle me-2"></i>
            This action cannot be undone. All chapters and quizzes associated with this subject will also be deleted.
          </p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-danger" @click="deleteSubject" :disabled="submitting">
            <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
            Delete Subject
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { Modal } from 'bootstrap'
import { useRouter } from 'vue-router'

export default {
  name: 'UserSubjects',
  
  setup() {
    const store = useStore()
    const router = useRouter()
    const subjects = ref([])
    const loading = ref(true)
    const searchQuery = ref('')
    const subjectToDelete = ref(null)
    const submitting = ref(false)
    
   
    let deleteModal = null
    
    
    const isAdmin = computed(() => store.getters.isAdmin)
    
    const filteredSubjects = computed(() => {
      if (!searchQuery.value) {
        return subjects.value
      }
      
      const query = searchQuery.value.toLowerCase()
      
      return subjects.value.filter(subject => 
        subject.name.toLowerCase().includes(query) || 
        (subject.description && subject.description.toLowerCase().includes(query))
      )
    })
    

    const fetchSubjects = async () => {
      loading.value = true
      
      try {
        const response = await store.dispatch('fetchSubjects')
        subjects.value = response
      } catch (error) {
        console.error('Error fetching subjects:', error)
      } finally {
        loading.value = false
      }
    }
    

    const confirmDelete = (subject) => {
      subjectToDelete.value = subject
      deleteModal.show()
    }


    const editSubject = (subject) => {
      store.commit('ADD_NOTIFICATION', {
        type: 'info',
        message: `Redirecting to edit subject "${subject.name}"`
      })
      
      router.push({ 
        name: 'admin.subjects',
        state: { editSubjectId: subject.id }
      })
    }
    

    const deleteSubject = async () => {
      if (!subjectToDelete.value) return
      
      submitting.value = true
      
      try {
        await store.dispatch('deleteSubject', subjectToDelete.value.id)
        await fetchSubjects()
        deleteModal.hide()
        
        store.commit('ADD_NOTIFICATION', {
          type: 'success',
          message: `Subject "${subjectToDelete.value.name}" was successfully deleted`
        })
      } catch (error) {
        console.error('err in deleting subject:', error)
        
        store.commit('ADD_NOTIFICATION', {
          type: 'error',
          message: error.response?.data?.error || 'Failed to delete subject'
        })
      } finally {
        submitting.value = false
        subjectToDelete.value = null
      }
    }
    
    onMounted(() => {
      deleteModal = new Modal(document.getElementById('deleteModal'))
      fetchSubjects()
    })
    


    onUnmounted(() => {
    })
    
    return {
      subjects,
      loading,
      searchQuery,
      filteredSubjects,
      isAdmin,
      confirmDelete,
      editSubject,
      deleteSubject,
      subjectToDelete,
      submitting
    }
  }
}
</script>




<style scoped>
.subject-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
}

.subject-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

.subject-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 







