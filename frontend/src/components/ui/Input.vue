<template>
  <div class="input-group">
    <div class="input-wrapper">
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="[
          'input',
          {
            'input--error': hasError,
            'input--success': hasSuccess,
            'input--disabled': disabled,
            'input--with-icon': $slots.icon
          }
        ]"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />
      
      <label
        v-if="label"
        :for="id"
        :class="[
          'input-label',
          {
            'input-label--floating': isFloating,
            'input-label--focused': isFocused || hasValue
          }
        ]"
      >
        {{ label }}
        <span v-if="required" class="required-asterisk">*</span>
      </label>
      
      <div v-if="$slots.icon" class="input-icon">
        <slot name="icon" />
      </div>
      
      <div v-if="hasError || hasSuccess" class="input-status-icon">
        <svg v-if="hasError" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <svg v-if="hasSuccess" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
    </div>
    
    <div v-if="helpText || errorMessage || successMessage" class="input-help">
      <span v-if="errorMessage" class="input-help--error">{{ errorMessage }}</span>
      <span v-else-if="successMessage" class="input-help--success">{{ successMessage }}</span>
      <span v-else class="input-help--default">{{ helpText }}</span>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'Input',
  props: {
    id: {
      type: String,
      required: true
    },
    modelValue: {
      type: [String, Number],
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    helpText: {
      type: String,
      default: ''
    },
    errorMessage: {
      type: String,
      default: ''
    },
    successMessage: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    floating: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'blur', 'focus'],
  setup(props, { emit }) {
    const isFocused = ref(false)
    
    const hasValue = computed(() => {
      return props.modelValue !== '' && props.modelValue !== null && props.modelValue !== undefined
    })
    
    const hasError = computed(() => !!props.errorMessage)
    const hasSuccess = computed(() => !!props.successMessage)
    const isFloating = computed(() => props.floating)
    
    const handleInput = (event) => {
      emit('update:modelValue', event.target.value)
    }
    
    const handleFocus = (event) => {
      isFocused.value = true
      emit('focus', event)
    }
    
    const handleBlur = (event) => {
      isFocused.value = false
      emit('blur', event)
    }
    
    return {
      isFocused,
      hasValue,
      hasError,
      hasSuccess,
      isFloating,
      handleInput,
      handleFocus,
      handleBlur
    }
  }
}
</script>

<style scoped>
.input-group {
  width: 100%;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input {
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--gray-200);
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  transition: all 0.3s ease;
  outline: none;
}

.input:focus {
  border-color: var(--orange-300);
  box-shadow: 0 0 0 3px rgba(245, 129, 20, 0.1);
}

.input--error {
  border-color: var(--red-300);
}

.input--error:focus {
  border-color: var(--red-300);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input--success {
  border-color: var(--green-300);
}

.input--success:focus {
  border-color: var(--green-300);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.input--disabled {
  background-color: var(--gray-100);
  cursor: not-allowed;
  opacity: 0.6;
}

.input--with-icon {
  padding-left: 3rem;
}

.input-label {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  padding: 0 0.5rem;
  color: var(--gray-400);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  font-size: 1rem;
}

.input-label--floating.input-label--focused,
.input:focus ~ .input-label--floating,
.input:not(:placeholder-shown) ~ .input-label--floating {
  top: 0;
  font-size: 0.875rem;
  color: var(--orange-300);
  transform: translateY(-50%);
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
  width: 20px;
  height: 20px;
}

.input-status-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
}

.input--error .input-status-icon {
  color: var(--red-300);
}

.input--success .input-status-icon {
  color: var(--green-300);
}

.input-help {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.4;
}

.input-help--error {
  color: var(--red-300);
}

.input-help--success {
  color: var(--green-300);
}

.input-help--default {
  color: var(--gray-400);
}

.required-asterisk {
  color: var(--red-300);
  margin-left: 0.25rem;
}

/* Animations */
.input:focus {
  animation: inputFocus 0.3s ease;
}

@keyframes inputFocus {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}
</style>