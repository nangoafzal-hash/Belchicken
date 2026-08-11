<template>
  <nav class="cat-filter" role="navigation" aria-label="Filtrer par catégorie">
    <button
      v-for="cat in categories"
      :key="cat.id"
      class="cat-filter__btn"
      :class="{ 'cat-filter__btn--active': modelValue === cat.id }"
      :aria-pressed="modelValue === cat.id"
      @click="$emit('update:modelValue', cat.id)"
    >
      <span class="cat-filter__icon">{{ cat.icon }}</span>
      <span class="cat-filter__label">{{ cat.label }}</span>
    </button>
  </nav>
</template>

<script setup>
import { CATEGORIES } from '@/data/menuData.ts'

defineProps({
  modelValue: {
    type: String,
    required: true,
  },
})

defineEmits(['update:modelValue'])

const categories = CATEGORIES
</script>

<style scoped>
.cat-filter {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 4px 2px 12px;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.cat-filter::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.cat-filter__btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 18px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255,255,255,0.7);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  flex-shrink: 0;
  backdrop-filter: blur(6px);
}

.cat-filter__btn:hover {
  border-color: var(--color-primary, #e67e22);
  color: var(--color-primary, #e67e22);
  background: rgba(230, 126, 34, 0.12);
}

.cat-filter__btn--active {
  background: var(--color-primary, #e67e22);
  border-color: var(--color-primary, #e67e22);
  color: #fff;
  box-shadow: 0 4px 14px rgba(230, 126, 34, 0.35);
}

.cat-filter__btn--active:hover {
  background: var(--color-primary-dark, #cf6d17);
  border-color: var(--color-primary-dark, #cf6d17);
  color: #fff;
}

.cat-filter__icon {
  font-size: 1.1rem;
  line-height: 1;
}

.cat-filter__label {
  line-height: 1;
}

/* Responsive : réduit la taille sur mobile */
@media (max-width: 480px) {
  .cat-filter__btn {
    padding: 8px 14px;
    font-size: 0.8rem;
  }
}
</style>
