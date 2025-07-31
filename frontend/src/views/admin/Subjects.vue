<template>
  <div class="page-container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Subject Management</h1>
      <button class="btn btn-success" @click="showAddModal">
        <i class="bi bi-plus-circle me-2"></i> Add Subject
      </button>
    </div>

    
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">Loading..</span>
      </div>
      <p class="mt-2">Loading subjects..</p>
    </div>

    
    <div v-else-if="subjects.length === 0" class="text-center py-5 bg-light rounded">
      <i class="bi bi-journal-x display-1 text-muted"></i>
      <h3 class="mt-3">No Subjects Found</h3>
      <p class="text-muted">Add first subject</p>
      <button class="btn btn-success mt-3" @click="showAddModal">
        <i class="bi bi-plus-circle me-2"></i> Add Subject
      </button>
    </div>

    
    <div v-else class="row g-4">
      <div v-for="subject in subjects" :key="subject.id" class="col-md-6 col-lg-4">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-header bg-transparent border-0 pt-4 ps-4">
            <div class="d-flex justify-content-between align-items-center">
              <h3 class="h5 mb-0">{{ subject.name }}</h3>
              <div class="btn-group">
                <button class="btn btn-sm btn-outline-secondary me-2" @click="editSubject(subject)">
                  <i class="bi bi-pencil"></i> Edit
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(subject)">
                  <i class="bi bi-trash"></i> Delete
                </button>
              </div>
            </div>
          </div>
          <div class="card-body">
            <p class="text-muted">{{ subject.description || 'No description provided.' }}</p>
            <div class="d-flex align-items-center mb-3">
              <i class="bi bi-calendar3 text-muted me-2"></i>
              <small class="text-muted">Created: {{ formatDate(subject.created_at) }}</small>
            </div>
            <div v-if="subject.chapters && subject.chapters.length > 0">
              <div class="mb-2 text-muted">
                <i class="bi bi-book me-2"></i>
                <span>{{ subject.chapters.length }} {{ subject.chapters.length === 1 ? 'Chapter' : 'Chapters' }}</span>
              </div>
            </div>
          </div>
          <div class="card-footer bg-transparent border-0 pb-4">
            <router-link :to="{ name: 'admin.chapters', params: { subjectId: subject.id } }" class="btn btn-primary w-100">
              <i class="bi bi-list-ul me-2"></i> Manage Chapters
            </router-link>
          </div>
        </div>
      </div>
    </div>

    
    <div class="modal fade" id="subjectModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Edit Subject' : 'Add New Subject' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveSubject">
              <div class="mb-3">
                <label for="subjectName" class="form-label">Subject Name <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="subjectName" 
                  v-model="subjectForm.name" 
                  required
                  placeholder="e.g. Mathematics"
                >
              </div>
              <div class="mb-3">
                <label for="subjectDescription" class="form-label">Description</label>
                <textarea 
                  class="form-control" 
                  id="subjectDescription" 
                  v-model="subjectForm.description" 
                  rows="3"
                  placeholder="Provide a brief description of this subject"
                ></textarea>
              </div>
              <div class="mb-3">
                <label for="subjectImage" class="form-label">Image URL</label>
                <input 
                  type="url" 
                  class="form-control" 
                  id="subjectImage" 
                  v-model="subjectForm.image_url" 
                  placeholder="https://example.com/image.jpg"
                >
                <small class="text-muted">Enter a URL for the subject image (optional)</small>
              </div>
              <div class="modal-footer px-0 pb-0">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-success" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isEditing ? 'Update Subject' : 'Create Subject' }}
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
  </div>
</template>



<script>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { Modal } from 'bootstrap'
import { useRouter } from 'vue-router'

export default {
  name: 'AdminSubjects',
  
  setup() {
    const store = useStore()
    const router = useRouter()
    const subjects = ref([])
    const loading = ref(true)
    const submitting = ref(false)
    const isEditing = ref(false)
    const subjectForm = ref({
      id: null,
      name: '',
      description: '',
      image_url: ''
    })
    const subjectToDelete = ref(null)
    
   
    let subjectModal = null
    let deleteModal = null
    
    
    const error = computed(() => store.getters.getError)
    
    onMounted(async () => {
      
      subjectModal = new Modal(document.getElementById('subjectModal'))
      deleteModal = new Modal(document.getElementById('deleteModal'))
      
      await fetchSubjects()
      
      
      if (router.currentRoute.value.state && router.currentRoute.value.state.editSubjectId) {
        const editSubjectId = router.currentRoute.value.state.editSubjectId
        const subjectToEdit = subjects.value.find(s => s.id === editSubjectId)
        
        if (subjectToEdit) {
          console.log('Opening edit modal for subject:', subjectToEdit)
          editSubject(subjectToEdit)
          
          
          const newState = { ...router.currentRoute.value.state }
          delete newState.editSubjectId
          router.replace({ ...router.currentRoute.value, state: Object.keys(newState).length > 0 ? newState : null })
        }
      }
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
    
    const showAddModal = () => {
      resetForm()
      isEditing.value = false
      subjectModal.show()
    }
    
    const editSubject = (subject) => {
      subjectForm.value = { ...subject }
      isEditing.value = true
      subjectModal.show()
    }
    
    const saveSubject = async () => {
      submitting.value = true
      
      try {
        console.log('Saving subject with data:', subjectForm.value)
        
        if (isEditing.value) {
          
          await store.dispatch('updateSubject', {
            id: subjectForm.value.id,
            subject: subjectForm.value
          })
        } else {
          
          await store.dispatch('createSubject', subjectForm.value)
        }
        
        
        await fetchSubjects()
        subjectModal.hide()
        
      } catch (error) {
        console.error('Error saving subject:', error)
        
        alert(`Failed to save subject: ${error.response?.data?.error || error.message || 'Unknown error'}`)
      } finally {
        submitting.value = false
      }
    }
    
    const confirmDelete = (subject) => {
      subjectToDelete.value = subject
      deleteModal.show()
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
        console.error('Error deleting subject:', error)
        
        let errorMessage = 'Failed to delete subject';
        if (error.response && error.response.status === 400) {
          errorMessage = `Cannot delete subject "${subjectToDelete.value.name}" because it has existing chapters. Please delete all chapters first.`;
        } else if (error.response && error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        }
        
        store.commit('ADD_NOTIFICATION', {
          type: 'error',
          message: errorMessage
        })
      } finally {
        submitting.value = false
        subjectToDelete.value = null
      }
    }
    
    const resetForm = () => {
      subjectForm.value = {
        id: null,
        name: '',
        description: '',
        image_url: ''
      }
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      
      const options = { year: 'numeric', month: 'short', day: 'numeric' }
      return new Date(dateString).toLocaleDateString(undefined, options)
    }
    
    return {
      subjects,
      loading,
      submitting,
      isEditing,
      subjectForm,
      subjectToDelete,
      error,
      showAddModal,
      editSubject,
      saveSubject,
      confirmDelete,
      deleteSubject,
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




