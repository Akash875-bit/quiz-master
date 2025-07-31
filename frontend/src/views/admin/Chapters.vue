<template>
  <div class="page-container">
    <div class="d-flex align-items-center mb-4">
      <router-link :to="{ name: 'admin.subjects' }" class="btn btn-outline-primary me-3">
        <i class="bi bi-arrow-left me-2"></i>Back to Subjects
      </router-link>
      <h1 class="mb-0">Chapters for {{ subject?.name || 'Subject' }}</h1>
    </div>

    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body p-4">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h5 class="mb-1">{{ subject?.name }}</h5>
            <p class="text-muted mb-0">{{ subject?.description || 'No description available' }}</p>
          </div>
          <button class="btn btn-success" @click="showAddModal">
            <i class="bi bi-plus-circle me-2"></i>Add Chapter
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">Loading..</span>
      </div>
      <p class="mt-2">Loading chapters.</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="chapters.length === 0" class="text-center py-5 bg-light rounded">
      <i class="bi bi-book display-1 text-muted"></i>
      <h3 class="mt-3">No Chapters Found</h3>
      <p class="text-muted">Add your first chapter to this subject.</p>
      <button class="btn btn-success mt-3" @click="showAddModal">
        <i class="bi bi-plus-circle me-2"></i> Add Chapter
      </button>
    </div>
    <div v-else class="row g-4">
      <div v-for="chapter in chapters" :key="chapter.id" class="col-md-6 col-xl-4">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-header bg-transparent border-0 pt-4 ps-4">
            <div class="d-flex justify-content-between align-items-center">
              <span class="badge bg-primary rounded-pill">Chapter {{ chapter.order || '#' }}</span>
              <div class="btn-group">
                <button class="btn btn-sm btn-outline-secondary me-2" @click="editChapter(chapter)">
                  <i class="bi bi-pencil"></i> Edit
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(chapter)">
                  <i class="bi bi-trash"></i> Delete
                </button>
              </div>
            </div>
            <h3 class="h5 mt-2">{{ chapter.name }}</h3>
          </div>
          <div class="card-body">
            <p class="text-muted">{{ chapter.description || 'No description provided.' }}</p>
            <div v-if="chapter.quizzes && chapter.quizzes.length > 0">
              <div class="mb-2 text-muted">
                <i class="bi bi-question-circle me-2"></i>
                <span>{{ chapter.quizzes.length }} {{ chapter.quizzes.length === 1 ? 'Quiz' : 'Quizzes' }}</span>
              </div>
            </div>
          </div>
          <div class="card-footer bg-transparent border-0 pb-4">
            <router-link :to="{ name: 'admin.quizzes', params: { chapterId: chapter.id } }" class="btn btn-primary w-100">
              <i class="bi bi-journals me-2"></i> Manage Quizzes
            </router-link>
          </div>
        </div>
      </div>
    </div>
    <div class="modal fade" id="chapterModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Edit Chapter' : 'Add New Chapter' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveChapter">
              <div class="mb-3">
                <label for="chapterName" class="form-label">Chapter Name <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="chapterName" 
                  v-model="chapterForm.name" 
                  required
                  placeholder="e.g. Introduction to Algebra"
                >
              </div>
              <div class="mb-3">
                <label for="chapterDescription" class="form-label">Description</label>
                <textarea 
                  class="form-control" 
                  id="chapterDescription" 
                  v-model="chapterForm.description" 
                  rows="3"
                  placeholder="Provide a brief description of this chapter"
                ></textarea>
              </div>
              <div class="mb-3">
                <label for="chapterOrder" class="form-label">Order</label>
                <input 
                  type="number" 
                  class="form-control" 
                  id="chapterOrder" 
                  v-model="chapterForm.order" 
                  min="1"
                  placeholder="1"
                >
                <small class="text-muted">Determines the order in which chapters are displayed</small>
              </div>
              <div class="modal-footer px-0 pb-0">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-success" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isEditing ? 'Update Chapter' : 'Create Chapter' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Delete</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete <strong>{{ chapterToDelete?.name }}</strong>?</p>
            <p class="text-danger">
              <i class="bi bi-exclamation-triangle me-2"></i>
              This action cannot be undone. All quizzes and questions associated with this chapter will also be deleted.
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
  </div>
</template>



<script>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { Modal } from 'bootstrap'

export default {
  name: 'AdminChapters',
  
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    const subjectId = parseInt(route.params.subjectId)
    const subject = ref(null)
    const chapters = ref([])
    const loading = ref(true)
    const submitting = ref(false)
    const isEditing = ref(false)
    const chapterForm = ref({
      id: null,
      subject_id: subjectId,
      name: '',
      description: '',
      order: 1
    })
    const chapterToDelete = ref(null)

    let chapterModal = null
    let deleteModal = null
    const error = computed(() => store.getters.getError)
    onMounted(async () => {
      chapterModal = new Modal(document.getElementById('chapterModal'))
      deleteModal = new Modal(document.getElementById('deleteModal'))
      
      await fetchSubject()
      await fetchChapters()
      
      if (router.currentRoute.value.state && router.currentRoute.value.state.editChapterId) {
        const editChapterId = router.currentRoute.value.state.editChapterId
        const chapterToEdit = chapters.value.find(c => c.id === editChapterId)
        
        if (chapterToEdit) {
          console.log('Opening edit modal for chapter:', chapterToEdit)
          editChapter(chapterToEdit)
          const newState = { ...router.currentRoute.value.state }
          delete newState.editChapterId
          router.replace({ ...router.currentRoute.value, state: Object.keys(newState).length > 0 ? newState : null })
        }
      }
    })
    

    const fetchSubject = async () => {
      try {
        const response = await store.dispatch('fetchSubject', subjectId)
        subject.value = response
      } catch (error) {
        console.error('Error fetching subject:', error)
      }
    }
    
    const fetchChapters = async () => {
      loading.value = true
      try {
        const response = await store.dispatch('fetchChapters', subjectId)
        chapters.value = response
      } catch (error) {
        console.error('Error fetching chapters:', error)
      } finally {
        loading.value = false
      }
    }
    
    const showAddModal = () => {
      resetForm()
      isEditing.value = false
      chapterModal.show()
    }

               
    
    const editChapter = (chapter) => {
      chapterForm.value = { ...chapter }
      isEditing.value = true
      chapterModal.show()
    }
    
    const saveChapter = async () => {
      if (submitting.value) {
        console.log('Submission already in progress, ignoring duplicate submit');
        return;
      }                 
      
      submitting.value = true;
      
      try {
        console.log('Saving chapter:', chapterForm.value);
        
        const formData = { ...chapterForm.value };
        store.commit('SET_ERROR', null);
  
        let response;
        if (isEditing.value) {
          response = await store.dispatch('updateChapter', {
            id: formData.id,
            chapter: formData
          });
        } else {
          response = await store.dispatch('createChapter', {
            subjectId: subjectId,
            chapter: formData
          });
        }
        
        console.log('Save successful:', response);
        
        await fetchChapters();
        
        chapterModal.hide();
        resetForm();
        
      } catch (error) {
        console.error('Error saving chapter:', error);
        
        if (error.response) {
          console.log(`Server returned ${error.response.status} status`);
        } else if (error.request) {
          console.log('No response received from server');
        } else {
          console.log('Error setting up request:', error.message);
        }
      } finally {
        console.log('Resetting submission state');
        submitting.value = false;
      }
    };
    
    const confirmDelete = (chapter) => {
      chapterToDelete.value = chapter
      deleteModal.show()
    }
    
    const deleteChapter = async () => {
      if (!chapterToDelete.value) return;
      
      if (submitting.value) {
        console.log('Submission already in progress, ignoring duplicate delete');
        return;
      }
      
      submitting.value = true;
      
      try {
        console.log('Deleting chapter:', chapterToDelete.value.id);
        
        store.commit('SET_ERROR', null);
        
        await store.dispatch('deleteChapter', {
          id: chapterToDelete.value.id,
          subjectId: subjectId
        });
        
        console.log('Delete successful');
        
        await fetchChapters();
        deleteModal.hide();
        chapterToDelete.value = null;
        
      } catch (error) {
        console.error('Error deleting chapter:', error);
        
        if (error.response) {
          console.log(`Server returned ${error.response.status} status`);
        } else if (error.request) {
          console.log('No response received from server');
        } else {
          console.log('Error setting up request:', error.message);
        }
      } finally {
        console.log('Resetting submission state');
        submitting.value = false;
      }
    };
    


    const resetForm = () => {
      chapterForm.value = {
        id: null,
        subject_id: subjectId,
        name: '',
        description: '',
        order: chapters.value.length + 1
      }
    }
    
    return {
      subject,
      chapters,
      loading,
      submitting,
      isEditing,
      chapterForm,
      chapterToDelete,
      error,
      showAddModal,
      editChapter,
      saveChapter,
      confirmDelete,
      deleteChapter
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


