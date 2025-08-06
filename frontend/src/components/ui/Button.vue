<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'btn',
      `btn--${variant}`,
      `btn--${size}`,
      {
        'btn--loading': loading,
        'btn--icon-only': iconOnly,
        'btn--full-width': fullWidth
      }
    ]"
    @click="handleClick"
  >
    <span v-if="loading" class="btn__spinner"></span>
    <slot v-if="!loading" name="icon" />
    <span v-if="!iconOnly && !loading" class="btn__text">
      <slot />
    </span>
  </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    type: {
      type: String,
      default: 'button',
      validator: (value) => ['button', 'submit', 'reset'].includes(value)
    },
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'outline-primary', 'outline-secondary'].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    iconOnly: {
      type: Boolean,
      default: false
    },
    fullWidth: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  setup(props, { emit }) {
    const handleClick = (event) => {
      if (!props.disabled && !props.loading) {
        emit('click', event)
      }
    }
    
    return {
      handleClick
    }
  }
}
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
  overflow: hidden;
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.25);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

/* Variants */
.btn--primary {
  background-color: var(--orange-300);
  color: white;
  border-color: var(--orange-300);
}

.btn--primary:hover:not(:disabled) {
  background-color: var(--orange-400);
  border-color: var(--orange-400);
  transform: translateY(-1px);
}

.btn--secondary {
  background-color: var(--gray-300);
  color: var(--gray-500);
  border-color: var(--gray-300);
}

.btn--secondary:hover:not(:disabled) {
  background-color: var(--gray-400);
  border-color: var(--gray-400);
}

.btn--success {
  background-color: var(--green-300);
  color: white;
  border-color: var(--green-300);
}

.btn--success:hover:not(:disabled) {
  background-color: var(--green-400);
  border-color: var(--green-400);
}

.btn--danger {
  background-color: var(--red-300);
  color: white;
  border-color: var(--red-300);
}

.btn--danger:hover:not(:disabled) {
  background-color: var(--red-400);
  border-color: var(--red-400);
}

.btn--outline-primary {
  background-color: transparent;
  color: var(--orange-300);
  border-color: var(--orange-300);
}

.btn--outline-primary:hover:not(:disabled) {
  background-color: var(--orange-300);
  color: white;
}

/* Sizes */
.btn--small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn--medium {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.btn--large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

/* Modifiers */
.btn--icon-only {
  padding: 0.75rem;
  width: auto;
  aspect-ratio: 1;
}

.btn--full-width {
  width: 100%;
}

.btn--loading {
  pointer-events: none;
}

.btn__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.btn__text {
  white-space: nowrap;
}

/* Ripple effect */
.btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn:active::after {
  width: 300px;
  height: 300px;
}
</style>