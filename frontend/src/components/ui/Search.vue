<template>
  <div class="search-container">
    <div class="search-wrapper">
      <div class="search-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </div>
      
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        class="search-input"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown.enter="handleEnter"
        @keydown.escape="handleEscape"
      />
      
      <button
        v-if="searchQuery && clearable"
        @click="clearSearch"
        class="search-clear"
        type="button"
        aria-label="Effacer la recherche"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      
      <button
        v-if="showSearchButton"
        @click="handleSearch"
        class="search-button"
        type="button"
        :disabled="disabled || loading"
      >
        <span v-if="loading" class="search-spinner"></span>
        <span v-else>Rechercher</span>
      </button>
    </div>
    
    <div v-if="suggestions.length > 0 && showSuggestions" class="search-suggestions">
      <div
        v-for="(suggestion, index) in suggestions"
        :key="index"
        @click="selectSuggestion(suggestion)"
        :class="[
          'suggestion-item',
          { 'suggestion-item--highlighted': index === highlightedIndex }
        ]"
      >
        <div class="suggestion-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <span class="suggestion-text">{{ getSuggestionText(suggestion) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'Search',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Rechercher...'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    showSearchButton: {
      type: Boolean,
      default: false
    },
    suggestions: {
      type: Array,
      default: () => []
    },
    suggestionKey: {
      type: String,
      default: 'text'
    },
    debounceMs: {
      type: Number,
      default: 300
    }
  },
  emits: ['update:modelValue', 'search', 'suggestion-select', 'focus', 'blur'],
  setup(props, { emit }) {
    const searchQuery = ref(props.modelValue)
    const isFocused = ref(false)
    const showSuggestions = ref(false)
    const highlightedIndex = ref(-1)
    let debounceTimer = null
    
    const getSuggestionText = (suggestion) => {
      return typeof suggestion === 'object' ? suggestion[props.suggestionKey] : suggestion
    }
    
    const handleInput = () => {
      emit('update:modelValue', searchQuery.value)
      
      // Debounced search
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
      
      debounceTimer = setTimeout(() => {
        emit('search', searchQuery.value)
      }, props.debounceMs)
      
      showSuggestions.value = true
      highlightedIndex.value = -1
    }
    
    const handleFocus = (event) => {
      isFocused.value = true
      showSuggestions.value = props.suggestions.length > 0
      emit('focus', event)
    }
    
    const handleBlur = (event) => {
      isFocused.value = false
      // Delay hiding suggestions to allow for clicks
      setTimeout(() => {
        showSuggestions.value = false
      }, 200)
      emit('blur', event)
    }
    
    const handleEnter = () => {
      if (highlightedIndex.value >= 0 && props.suggestions[highlightedIndex.value]) {
        selectSuggestion(props.suggestions[highlightedIndex.value])
      } else {
        handleSearch()
      }
    }
    
    const handleEscape = () => {
      showSuggestions.value = false
      highlightedIndex.value = -1
    }
    
    const handleSearch = () => {
      emit('search', searchQuery.value)
      showSuggestions.value = false
    }
    
    const clearSearch = () => {
      searchQuery.value = ''
      emit('update:modelValue', '')
      emit('search', '')
      showSuggestions.value = false
    }
    
    const selectSuggestion = (suggestion) => {
      const text = getSuggestionText(suggestion)
      searchQuery.value = text
      emit('update:modelValue', text)
      emit('suggestion-select', suggestion)
      showSuggestions.value = false
    }
    
    // Watch for external changes to modelValue
    watch(() => props.modelValue, (newValue) => {
      searchQuery.value = newValue
    })
    
    return {
      searchQuery,
      isFocused,
      showSuggestions,
      highlightedIndex,
      getSuggestionText,
      handleInput,
      handleFocus,
      handleBlur,
      handleEnter,
      handleEscape,
      handleSearch,
      clearSearch,
      selectSuggestion
    }
  }
}
</script>

<style scoped>
.search-container {
  position: relative;
  width: 100%;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid var(--gray-200);
  border-radius: 12px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.search-wrapper:focus-within {
  border-color: var(--orange-300);
  box-shadow: 0 0 0 3px rgba(245, 129, 20, 0.1);
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: var(--gray-400);
  width: 20px;
  height: 20px;
  z-index: 1;
}

.search-input {
  flex: 1;
  padding: 1rem 1rem 1rem 3rem;
  border: none;
  outline: none;
  font-size: 1rem;
  background: transparent;
  color: var(--gray-500);
}

.search-input::placeholder {
  color: var(--gray-400);
}

.search-clear {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: var(--gray-400);
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

.search-clear:hover {
  background-color: var(--gray-100);
  color: var(--gray-500);
}

.search-button {
  padding: 0.75rem 1.5rem;
  background-color: var(--orange-300);
  color: white;
  border: none;
  border-left: 1px solid var(--gray-200);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-button:hover:not(:disabled) {
  background-color: var(--orange-400);
}

.search-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-spinner {
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

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid var(--gray-200);
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid var(--gray-100);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover,
.suggestion-item--highlighted {
  background-color: var(--gray-100);
}

.suggestion-icon {
  color: var(--gray-400);
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.suggestion-text {
  color: var(--gray-500);
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .search-button {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
  
  .search-input {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}
</style>