<template>
  <Transition name="alert" appear>
    <div
      v-if="visible"
      :class="[
        'alert',
        `alert--${variant}`,
        {
          'alert--dismissible': dismissible,
          'alert--with-icon': showIcon
        }
      ]"
      role="alert"
    >
      <div v-if="showIcon" class="alert__icon">
        <slot name="icon">
          <svg v-if="variant === 'success'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <svg v-else-if="variant === 'error'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <svg v-else-if="variant === 'warning'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <path d="M12 9v4"/>
            <path d="m12 17 .01 0"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
        </slot>
      </div>
      
      <div class="alert__content">
        <div v-if="title" class="alert__title">{{ title }}</div>
        <div class="alert__message">
          <slot>{{ message }}</slot>
        </div>
      </div>
      
      <button
        v-if="dismissible"
        @click="dismiss"
        class="alert__dismiss"
        aria-label="Fermer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  </Transition>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'Alert',
  props: {
    variant: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
    },
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      default: ''
    },
    dismissible: {
      type: Boolean,
      default: false
    },
    showIcon: {
      type: Boolean,
      default: true
    },
    autoClose: {
      type: Boolean,
      default: false
    },
    duration: {
      type: Number,
      default: 5000
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const visible = ref(true)
    
    const dismiss = () => {
      visible.value = false
      setTimeout(() => {
        emit('close')
      }, 300)
    }
    
    onMounted(() => {
      if (props.autoClose && props.duration > 0) {
        setTimeout(() => {
          dismiss()
        }, props.duration)
      }
    })
    
    return {
      visible,
      dismiss
    }
  }
}
</script>

<style scoped>
.alert {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  border: 1px solid;
  margin-bottom: 1rem;
  position: relative;
}

.alert--success {
  background-color: #f0fdf4;
  border-color: #bbf7d0;
  color: #166534;
}

.alert--error {
  background-color: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.alert--warning {
  background-color: #fffbeb;
  border-color: #fed7aa;
  color: #d97706;
}

.alert--info {
  background-color: #eff6ff;
  border-color: #bfdbfe;
  color: #2563eb;
}

.alert__icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}

.alert__content {
  flex: 1;
  min-width: 0;
}

.alert__title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.alert__message {
  line-height: 1.5;
}

.alert__dismiss {
  flex-shrink: 0;
  background: none;
  border: none;
  color: currentColor;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert__dismiss:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.alert__dismiss svg {
  width: 16px;
  height: 16px;
}

/* Animations */
.alert-enter-active,
.alert-leave-active {
  transition: all 0.3s ease;
}

.alert-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.alert-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>