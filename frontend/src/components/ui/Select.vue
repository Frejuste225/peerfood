<template>
  <div class="select-group">
    <div class="select-wrapper">
      <select
        :id="id"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :class="[
          'select',
          {
            'select--error': hasError,
            'select--success': hasSuccess,
            'select--disabled': disabled
          }
        ]"
        @change="handleChange"
        @blur="handleBlur"
        @focus="handleFocus"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="getOptionValue(option)"
          :value="getOptionValue(option)"
        >
          {{ getOptionLabel(option) }}
        </option>
      </select>
      
      <label
        v-if="label"
        :for="id"
        :class="[
          'select-label',
          {
            'select-label--floating': floating,
            'select-label--focused': isFocused || hasValue
          }
        ]"
      >
        {{ label }}
        <span v-if="required" class="required-asterisk">*</span>
      </label>
      
      <div class="select-arrow">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      
      <div v-if="hasError || hasSuccess" class="select-status-icon">
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
    
    <div v-if="helpText || errorMessage || successMessage" class="select-help">
      <span v-if="errorMessage" class="select-help--error">{{ errorMessage }}</span>
      <span v-else-if="successMessage" class="select-help--success">{{ successMessage }}</span>
      <span v-else class="select-help--default">{{ helpText }}</span>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'Select',
  props: {
    id: {
      type: String,
      required: true
    },
    modelValue: {
      type: [String, Number],
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    options: {
      type: Array,
      required: true
    },
    optionValue: {
      type: String,
      default: 'value'
    },
    optionLabel: {
      type: String,
      default: 'label'
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
  emits: ['update:modelValue', 'blur', 'focus', 'change'],
  setup(props, { emit }) {
    const isFocused = ref(false)
    
    const hasValue = computed(() => {
      return props.modelValue !== '' && props.modelValue !== null && props.modelValue !== undefined
    })
    
    const hasError = computed(() => !!props.errorMessage)
    const hasSuccess = computed(() => !!props.successMessage)
    
    const getOptionValue = (option) => {
      return typeof option === 'object' ? option[props.optionValue] : option
    }
    
    const getOptionLabel = (option) => {
      return typeof option === 'object' ? option[props.optionLabel] : option
    }
    
    const handleChange = (event) => {
      const value = event.target.value
      emit('update:modelValue', value)
      emit('change', value)
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
      getOptionValue,
      getOptionLabel,
      handleChange,
      handleFocus,
      handleBlur
    }
  }
}
</script>

<style scoped>
.select-group {
  width: 100%;
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.select {
  width: 100%;
  padding: 1rem;
  padding-right: 3rem;
  border: 2px solid var(--gray-200);
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  transition: all 0.3s ease;
  outline: none;
  appearance: none;
  cursor: pointer;
}

.select:focus {
  border-color: var(--orange-300);
  box-shadow: 0 0 0 3px rgba(245, 129, 20, 0.1);
}

.select--error {
  border-color: var(--red-300);
}

.select--error:focus {
  border-color: var(--red-300);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.select--success {
  border-color: var(--green-300);
}

.select--success:focus {
  border-color: var(--green-300);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.select--disabled {
  background-color: var(--gray-100);
  cursor: not-allowed;
  opacity: 0.6;
}

.select-label {
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

.select-label--floating.select-label--focused,
.select:focus ~ .select-label--floating,
.select:not([value=""]) ~ .select-label--floating {
  top: 0;
  font-size: 0.875rem;
  color: var(--orange-300);
  transform: translateY(-50%);
}

.select-arrow {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
  width: 20px;
  height: 20px;
  pointer-events: none;
  transition: transform 0.3s ease;
}

.select:focus ~ .select-arrow {
  transform: translateY(-50%) rotate(180deg);
}

.select-status-icon {
  position: absolute;
  right: 3rem;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
}

.select--error .select-status-icon {
  color: var(--red-300);
}

.select--success .select-status-icon {
  color: var(--green-300);
}

.select-help {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.4;
}

.select-help--error {
  color: var(--red-300);
}

.select-help--success {
  color: var(--green-300);
}

.select-help--default {
  color: var(--gray-400);
}

.required-asterisk {
  color: var(--red-300);
  margin-left: 0.25rem;
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