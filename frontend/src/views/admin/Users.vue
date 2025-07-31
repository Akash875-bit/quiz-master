<template>
  <div class="container page-container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>User Management</h1>
      <button class="btn btn-success" @click="exportUsersCsv">
        <i class="bi bi-download me-2"></i>Export Users
      </button>
    </div>
    
    
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading.</span>
      </div>
      <p class="mt-2">Loading users.</p>
    </div>
    
    
    <div v-else>
      <div class="row mb-4">
        <div class="col-md-3 mb-4 mb-md-0">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="stat-icon rounded-circle bg-light mb-3 mx-auto">
                <i class="bi bi-people-fill text-primary"></i>
              </div>
              <h5 class="card-title">{{ users.length }}</h5>
              <p class="card-text text-muted">Total Users</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-4 mb-md-0">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="stat-icon rounded-circle bg-light mb-3 mx-auto">
                <i class="bi bi-person-check-fill text-success"></i>
              </div>
              <h5 class="card-title">{{ activeUsers }}</h5>
              <p class="card-text text-muted">Active Users</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-4 mb-md-0">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="stat-icon rounded-circle bg-light mb-3 mx-auto">
                <i class="bi bi-calendar-check text-info"></i>
              </div>
              <h5 class="card-title">{{ recentUsers }}</h5>
              <p class="card-text text-muted">New This Month</p>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-4 mb-md-0">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="stat-icon rounded-circle bg-light mb-3 mx-auto">
                <i class="bi bi-mortarboard-fill text-warning"></i>
              </div>
              <h5 class="card-title">{{ quizParticipants }}</h5>
              <p class="card-text text-muted">Quiz Participants</p>
            </div>
          </div>
        </div>
      </div>
      
      
      <div class="row mb-4">
        <div class="col-md-6 mb-3 mb-md-0">
          <div class="input-group">
            <span class="input-group-text bg-white">
              <i class="bi bi-search"></i>
            </span>
            <input 
              type="text" 
              v-model="searchQuery" 
              class="form-control" 
              placeholder="Search users by name or email" 
              aria-label="Search users"
            >
          </div>
        </div>
        <div class="col-md-3 mb-3 mb-md-0">
          <select class="form-select" v-model="statusFilter">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div class="col-md-3">
          <select class="form-select" v-model="sortBy">
            <option value="name">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="date">Join Date (Newest)</option>
            <option value="date_asc">Join Date (Oldest)</option>
            <option value="login">Last Login (Recent)</option>
          </select>
        </div>
      </div>
      
      
      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Registered On</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.id">
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="avatar-placeholder rounded-circle bg-light me-2">
                        <span>{{ getInitials(user.first_name, user.last_name) }}</span>
                      </div>
                      <div>
                        <div>{{ user.first_name }} {{ user.last_name }}</div>
                        <small class="text-muted">{{ user.role }}</small>
                      </div>
                    </div>
                  </td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span 
                      class="badge rounded-pill" 
                      :class="user.is_active ? 'bg-success' : 'bg-danger'"
                    >
                      {{ user.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>{{ formatDate(user.created_at) }}</td>
                  <td>{{ formatDate(user.last_login) || 'Never' }}</td>
                  <td>
                    <div class="btn-group">
                      <button 
                        class="btn btn-sm btn-outline-primary" 
                        @click="viewUserDetails(user)"
                      >
                        <i class="bi bi-eye"></i>
                      </button>
                      <button 
                        class="btn btn-sm" 
                        :class="user.is_active ? 'btn-outline-danger' : 'btn-outline-success'"
                        @click="toggleUserStatus(user)"
                      >
                        <i class="bi" :class="user.is_active ? 'bi-person-x' : 'bi-person-check'"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    

    <div class="modal fade" id="userDetailsModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content" v-if="selectedUser">
          <div class="modal-header">
            <h5 class="modal-title">User Details: {{ selectedUser.first_name }} {{ selectedUser.last_name }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <div class="mb-4">
                  <h6 class="fw-bold">Account Information</h6>
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item px-0 d-flex justify-content-between">
                      <span class="text-muted">User ID</span>
                      <span>{{ selectedUser.id }}</span>
                    </li>
                    <li class="list-group-item px-0 d-flex justify-content-between">
                      <span class="text-muted">Email</span>
                      <span>{{ selectedUser.email }}</span>
                    </li>
                    <li class="list-group-item px-0 d-flex justify-content-between">
                      <span class="text-muted">Role</span>
                      <span class="badge bg-primary">{{ selectedUser.role }}</span>
                    </li>
                    <li class="list-group-item px-0 d-flex justify-content-between">
                      <span class="text-muted">Status</span>
                      <span 
                        class="badge" 
                        :class="selectedUser.is_active ? 'bg-success' : 'bg-danger'"
                      >
                        {{ selectedUser.is_active ? 'Active' : 'Inactive' }}
                      </span>
                    </li>
                    <li class="list-group-item px-0 d-flex justify-content-between">
                      <span class="text-muted">Registered On</span>
                      <span>{{ formatDate(selectedUser.created_at) }}</span>
                    </li>
                    <li class="list-group-item px-0 d-flex justify-content-between">
                      <span class="text-muted">Last Login</span>
                      <span>{{ formatDate(selectedUser.last_login) || 'Never' }}</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-4">
                  <h6 class="fw-bold">Personal Information</h6>
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item px-0 d-flex justify-content-between">
                      <span class="text-muted">First Name</span>
                      <span>{{ selectedUser.first_name }}</span>
                    </li>
                    <li class="list-group-item px-0 d-flex justify-content-between">
                      <span class="text-muted">Last Name</span>
                      <span>{{ selectedUser.last_name }}</span>
                    </li>
                    <li class="list-group-item px-0 d-flex justify-content-between">
                      <span class="text-muted">Qualification</span>
                      <span>{{ selectedUser.qualification || 'Not specified' }}</span>
                    </li>
                    <li class="list-group-item px-0 d-flex justify-content-between">
                      <span class="text-muted">Date of Birth</span>
                      <span>{{ formatDate(selectedUser.dob) || 'Not specified' }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div class="mt-3">
              <h6 class="fw-bold">User Activity</h6>
              <div class="row">
                <div class="col-md-3 mb-3">
                  <div class="card border-0 shadow-sm">
                    <div class="card-body text-center py-3">
                      <h5 class="mb-0">{{ userStats.quizzesTaken || 0 }}</h5>
                      <small class="text-muted">Quizzes Taken</small>
                    </div>
                  </div>
                </div>
                <div class="col-md-3 mb-3">
                  <div class="card border-0 shadow-sm">
                    <div class="card-body text-center py-3">
                      <h5 class="mb-0">{{ userStats.quizzesPassed || 0 }}</h5>
                      <small class="text-muted">Quizzes Passed</small>
                    </div>
                  </div>
                </div>
                <div class="col-md-3 mb-3">
                  <div class="card border-0 shadow-sm">
                    <div class="card-body text-center py-3">
                      <h5 class="mb-0">{{ userStats.averageScore || 0 }}%</h5>
                      <small class="text-muted">Average Score</small>
                    </div>
                  </div>
                </div>
                <div class="col-md-3 mb-3">
                  <div class="card border-0 shadow-sm">
                    <div class="card-body text-center py-3">
                      <h5 class="mb-0">{{ formatDate(userStats.lastActivity) || 'Never' }}</h5>
                      <small class="text-muted">Last Activity</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button 
              type="button" 
              class="btn" 
              :class="selectedUser.is_active ? 'btn-danger' : 'btn-success'"
              @click="toggleUserStatus(selectedUser)"
            >
              {{ selectedUser.is_active ? 'Deactivate User' : 'Activate User' }}
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
import { Modal } from 'bootstrap'

export default {
  name: 'AdminUsers',
  
  setup() {
    const store = useStore()
    const users = ref([])
    const loading = ref(true)
    const searchQuery = ref('')
    const statusFilter = ref('')
    const sortBy = ref('name')
    const selectedUser = ref(null)
    const userStats = ref({})
    let userDetailsModal = null
    
    
    const filteredUsers = computed(() => {
      let result = [...users.value]
      
      // search feature related
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(user => 
          `${user.first_name} ${user.last_name}`.toLowerCase().includes(query) || 
          user.email.toLowerCase().includes(query)
        )
      }
      
      if (statusFilter.value === 'active') {
        result = result.filter(user => user.is_active)
      } else if (statusFilter.value === 'inactive') {
        result = result.filter(user => !user.is_active)
      }
      
      
      switch (sortBy.value) {
        case 'name':
          result.sort((a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`))
          break
        case 'name_desc':
          result.sort((a, b) => `${b.first_name} ${b.last_name}`.localeCompare(`${a.first_name} ${a.last_name}`))
          break
        case 'date':
          result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          break
        case 'date_asc':
          result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          break
        case 'login':
          result.sort((a, b) => {
            if (!a.last_login) return 1
            if (!b.last_login) return -1
            return new Date(b.last_login) - new Date(a.last_login)
          })
          break
      }
      
      return result
    })
    
    const activeUsers = computed(() => {
      return users.value.filter(user => user.is_active).length
    })
    
    const recentUsers = computed(() => {
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      
      return users.value.filter(user => {
        const createdAt = new Date(user.created_at)
        return createdAt > oneMonthAgo
      }).length
    })
    
    const quizParticipants = computed(() => {
      
      return users.value.filter(user => user.quiz_count && user.quiz_count > 0).length
    })
    
    
    const fetchUsers = async () => {
      loading.value = true
      
      try {
        const response = await store.dispatch('fetchUsers')
        users.value = response
      } catch (error) {
        console.error('Error fetching users:', error)
        store.dispatch('addNotification', {
          message: 'Failed to load users. Please try again.',
          type: 'error'
        })
      } finally {
        loading.value = false
      }
    }
    
    const viewUserDetails = async (user) => {
      selectedUser.value = user
      
      
      try {
        const stats = await store.dispatch('getUserStats', user.id)
        userStats.value = stats
      } catch (error) {
        console.error('Error fetching user stats:', error)
        userStats.value = {}
      }
      
      userDetailsModal.show()
    }
    
    const toggleUserStatus = async (user) => {
      try {
        const newStatus = !user.is_active
        await store.dispatch('toggleUserStatus', {
          userId: user.id,
          isActive: newStatus
        })
        
        
        const index = users.value.findIndex(u => u.id === user.id)
        if (index !== -1) {
          users.value[index].is_active = newStatus
        }
        
       
        if (selectedUser.value && selectedUser.value.id === user.id) {
          selectedUser.value.is_active = newStatus
        }
        
        store.dispatch('addNotification', {
          message: `User ${newStatus ? 'activated' : 'deactivated'} successfully.`,
          type: 'success'
        })
      } catch (error) {
        console.error('Error toggling user status:', error)
        store.dispatch('addNotification', {
          message: 'Failed to update user status. Please try again.',
          type: 'error'
        })
      }
    }
    

    const exportUsersCsv = async () => {
      try {
        await store.dispatch('exportUsers')
        
        store.dispatch('addNotification', {
          message: 'Users export started. You will receive an email with the file shortly.',
          type: 'success'
        })
      } catch (error) {
        console.error('Error exporting users:', error)
        store.dispatch('addNotification', {
          message: 'Failed to export users. Please try again.',
          type: 'error'
        })
      }
    }
    
    const getInitials = (firstName, lastName) => {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return null
      
      const options = { year: 'numeric', month: 'short', day: 'numeric' }
      return new Date(dateString).toLocaleDateString(undefined, options)
    }
    
    
    onMounted(() => {
      fetchUsers()
      userDetailsModal = new Modal(document.getElementById('userDetailsModal'))
    })
    
    return {
      users,
      loading,
      searchQuery,
      statusFilter,
      sortBy,
      selectedUser,
      userStats,
      filteredUsers,
      activeUsers,
      recentUsers, 
      quizParticipants,
      viewUserDetails,
      toggleUserStatus,
      exportUsersCsv,
      getInitials,
      formatDate
    }
  }
}
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

.avatar-placeholder {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #0d6efd;
}
</style> 



