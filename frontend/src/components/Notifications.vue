<template>
  <div class="notifications-container position-fixed top-0 end-0 p-3" style="z-index: 1500;">
    <div 
      v-for="notification in displayedNotifications" 
      :key="notification.id" 
      class="toast show border-0 mb-2" 
      :class="getNotificationClass(notification.type)"
      role="alert" 
      aria-live="assertive" 
      aria-atomic="true"
      style="min-width: 300px;"
    >
      <div class="d-flex align-items-center">
        <div class="toast-body d-flex align-items-center">
          <i :class="getNotificationIcon(notification.type)" class="me-2"></i>
          <span>{{ notification.message }}</span>
        </div>
        <button 
          type="button" 
          class="btn-close me-2" 
          :class="notification.type === 'warning' || notification.type === 'info' ? 'btn-close-dark' : 'btn-close-white'"
          @click="dismissNotification(notification.id)"
          aria-label="Close"
        ></button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'Notifications',
  
  setup() {
    const store = useStore();
    
    // Use a ref to control when we actually update the displayed notifications
    const displayedNotifications = ref([]);
    
    const notifications = computed(() => {
      return store.getters.getNotifications;
    });
    
    // Watch for changes and update displayed notifications only when necessary
    watch(notifications, (newNotifications) => {
      console.log('🔔 NOTIFICATIONS COMPONENT - Notifications changed:', newNotifications.length, newNotifications.map(n => ({id: n.id, message: n.message, type: n.type})));
      
      // Only update if the notifications actually changed (not just a re-render)
      const currentIds = displayedNotifications.value.map(n => n.id).sort();
      const newIds = newNotifications.map(n => n.id).sort();
      
      if (JSON.stringify(currentIds) !== JSON.stringify(newIds)) {
        console.log('🔄 UPDATING DISPLAYED NOTIFICATIONS');
        displayedNotifications.value = [...newNotifications];
      } else {
        console.log('⏭️ SKIPPING UPDATE - Same notifications');
      }
    }, { immediate: true, deep: true });
    
    const getNotificationClass = (type) => {
      switch (type) {
        case 'success':
          return 'text-bg-success';
        case 'warning':
          return 'text-bg-warning';
        case 'error':
          return 'text-bg-danger';
        case 'info':
        default:
          return 'text-bg-primary';
      }
    };
    
    const getNotificationIcon = (type) => {
      switch (type) {
        case 'success':
          return 'bi bi-check-circle-fill';
        case 'warning':
          return 'bi bi-exclamation-triangle-fill';
        case 'error':
          return 'bi bi-x-circle-fill';
        case 'info':
        default:
          return 'bi bi-info-circle-fill';
      }
    };
    
    const dismissNotification = (id) => {
      store.dispatch('clearNotification', id);
    };
    
    return {
      displayedNotifications,
      getNotificationClass,
      getNotificationIcon,
      dismissNotification
    };
  }
};
</script>

<style scoped>
.notifications-container {
  max-width: 350px;
  pointer-events: none; /* Allow clicks to pass through container */
  top: 100px !important; /* Move below the floating navbar */
}

.toast {
  opacity: 1 !important;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease-out;
  pointer-events: auto; /* But allow clicks on individual toasts */
  margin-bottom: 1rem !important; /* Increased spacing between notifications */
  position: relative;
  z-index: 1050;
  /* Remove any default Bootstrap toast styling that might add icons */
  background-image: none !important;
  /* Ensure no overlap by setting explicit positioning */
  display: block !important;
  width: 100% !important;
}

.toast:last-child {
  margin-bottom: 0.5rem !important; /* Small margin for last notification */
}

.toast-body {
  padding: 0.75rem;
  /* Ensure no pseudo-elements or background images */
  background-image: none !important;
}

.toast-body::before,
.toast-body::after {
  display: none !important; /* Remove any pseudo-element icons */
}

/* Ensure only our custom icon shows */
.toast-body i {
  font-size: 1rem;
  flex-shrink: 0;
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

@keyframes fadeOut {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Ensure proper stacking order with higher z-index values */
.toast:nth-child(1) { z-index: 1060; }
.toast:nth-child(2) { z-index: 1059; }
.toast:nth-child(3) { z-index: 1058; }
.toast:nth-child(4) { z-index: 1057; }
.toast:nth-child(5) { z-index: 1056; }

/* Notification animations and stacking complete */
</style> 