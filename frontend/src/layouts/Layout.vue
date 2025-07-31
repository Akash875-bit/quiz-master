<template>
  <div class="app-container">

    <main>
      <router-view />
    </main>
    
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1500;">
      <div 
        v-for="notification in notifications" 
        :key="notification.id" 
        class="toast show align-items-center border-0" 
        :class="getNotificationClass(notification.type)"
        role="alert" 
        aria-live="assertive" 
        aria-atomic="true"
        style="min-width: 300px;"
      >
        <div class="d-flex">
          <div class="toast-body">
            <i :class="getNotificationIcon(notification.type)" class="me-2"></i>
            {{ notification.message }}
          </div>
          <button 
            type="button" 
            class="btn-close me-2 m-auto" 
            @click="dismissNotification(notification.id)"
          ></button>
        </div>
      </div>
    </div>
  </div>
</template>



<script>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'MainLayout',
  
  setup() {
    const store = useStore()
    
    const notifications = computed(() => {
      return store.getters.getNotifications
    })
    
    const getNotificationClass = (type) => {
      switch (type) {
        case 'success':
          return 'text-bg-success'
        case 'warning':
          return 'text-bg-warning'
        case 'error':
          return 'text-bg-danger'
        case 'info':
        default:
          return 'text-bg-primary'
      }
    }
    
    const getNotificationIcon = (type) => {
      switch (type) {
        case 'success':
          return 'bi bi-check-circle-fill'
        case 'warning':
          return 'bi bi-exclamation-triangle-fill'
        case 'error':
          return 'bi bi-x-circle-fill'
        case 'info':
        default:
          return 'bi bi-info-circle-fill'
      }
    }
    
    const dismissNotification = (id) => {
      store.dispatch('clearNotification', id)
    }
    
    return {
      notifications,
      getNotificationClass,
      getNotificationIcon,
      dismissNotification
    }
  }
}
</script>

<style>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex-grow: 1;
}

.toast {
  opacity: 1 !important;
}

.toast-container .toast {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
</style> 