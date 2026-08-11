<template>
  <article class="menu-card" @click="handleClick">
    <!-- Badge -->
    <span
      v-if="item.badge"
      class="menu-card__badge"
      :style="{ backgroundColor: item.badgeColor }"
    >
      {{ item.badge }}
    </span>

    <!-- Image -->
    <div class="menu-card__img-wrapper">
      <img
        :src="item.image"
        :alt="item.name"
        class="menu-card__img"
        loading="lazy"
        @error="onImageError"
      />
      <div class="menu-card__img-overlay" />
    </div>

    <!-- Contenu -->
    <div class="menu-card__body">
      <h3 class="menu-card__name">{{ item.name }}</h3>
      <p class="menu-card__desc">{{ item.description }}</p>

      <!-- Inclus dans le combo -->
      <ul v-if="item.includes?.length" class="menu-card__includes">
        <li v-for="inc in item.includes" :key="inc">✓ {{ inc }}</li>
      </ul>

      <!-- Footer : prix + bouton -->
      <div class="menu-card__footer">
        <span class="menu-card__price">{{ formatPrice(item.price) }}</span>

        <button
          class="menu-card__btn"
          :class="{ 'menu-card__btn--customize': item.customizable }"
          @click.stop="handleClick"
        >
          <span v-if="item.customizable">✏️ Personnaliser</span>
          <span v-else>🛒 Ajouter</span>
        </button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { formatPrice } from '@/data/menuData.ts'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['open-modal', 'add-to-cart'])

function handleClick() {
  if (props.item.customizable) {
    emit('open-modal', props.item)
  } else {
    emit('add-to-cart', { ...props.item, quantity: 1 })
  }
}

function onImageError(e) {
  e.target.src = 'https://placehold.co/400x260/e67e22/fff?text=Belchiken'
}
</script>

<style scoped>
.menu-card {
  position: relative;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.35);
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  display: flex;
  flex-direction: column;
}

.menu-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(230, 126, 34, 0.3);
  border-color: rgba(230, 126, 34, 0.35);
}

/* ── Badge ── */
.menu-card__badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

/* ── Image ── */
.menu-card__img-wrapper {
  position: relative;
  width: 100%;
  height: 190px;
  overflow: hidden;
}

.menu-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.menu-card:hover .menu-card__img {
  transform: scale(1.06);
}

.menu-card__img-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 60%);
}

/* ── Body ── */
.menu-card__body {
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  background: rgba(20, 10, 4, 0.55);
}

.menu-card__name {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  line-height: 1.3;
}

.menu-card__desc {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Includes (combos) ── */
.menu-card__includes {
  list-style: none;
  padding: 0;
  margin: 4px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.menu-card__includes li {
  font-size: 0.72rem;
  color: #27ae60;
  font-weight: 600;
  background: #eafaf1;
  padding: 2px 8px;
  border-radius: 20px;
}

/* ── Footer ── */
.menu-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.menu-card__price {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--color-primary, #e67e22);
}

.menu-card__btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 14px;
  border: none;
  border-radius: 24px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease;
  background: var(--color-primary, #e67e22);
  color: #fff;
}

.menu-card__btn:hover {
  background: var(--color-primary-dark, #cf6d17);
  transform: scale(1.04);
}

.menu-card__btn--customize {
  background: #fff;
  color: var(--color-primary, #e67e22);
  border: 2px solid var(--color-primary, #e67e22);
}

.menu-card__btn--customize:hover {
  background: var(--color-primary, #e67e22);
  color: #fff;
}
</style>
