<template>
  <div class="menu-page">

    <!-- ── Hero / Header ───────────────────────────────────── -->
    <header class="menu-header">
      <div class="menu-header__inner">
        <div class="menu-header__brand">
          <!-- Logo SVG Belchiken -->
          <svg class="menu-header__logo-svg" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <!-- Fond rond rouge foncé -->
            <circle cx="26" cy="26" r="26" fill="#c0392b"/>
            <!-- Flamme gauche -->
            <path d="M18 34 C14 28 16 20 21 17 C19 22 22 25 20 30 C23 26 24 21 27 18 C26 24 29 27 26 34Z" fill="#f39c12"/>
            <!-- Flamme droite -->
            <path d="M34 34 C38 28 36 20 31 17 C33 22 30 25 32 30 C29 26 28 21 25 18 C26 24 23 27 26 34Z" fill="#f39c12"/>
            <!-- Corps poulet stylisé -->
            <ellipse cx="26" cy="33" rx="9" ry="7" fill="#fff"/>
            <!-- Tête -->
            <circle cx="26" cy="22" r="5" fill="#fff"/>
            <!-- Bec -->
            <path d="M26 24 L24.2 25.5 L27.8 25.5Z" fill="#f39c12"/>
            <!-- Oeil -->
            <circle cx="27.5" cy="21.5" r="1" fill="#c0392b"/>
            <!-- Crête -->
            <path d="M24 18 C24 15 26 14 26 17 C26 14 28 13 28 17 C28 14 30 14 29 17" stroke="#e74c3c" stroke-width="1.2" fill="none" stroke-linecap="round"/>
          </svg>
          <div>
            <h1 class="menu-header__title">Belchiken</h1>
            <p class="menu-header__tagline">Le meilleur poulet frit de Ouaga</p>
          </div>
        </div>

        <!-- Bouton panier (mini) -->
        <button class="cart-bubble" @click="cart.toggleCart()" aria-label="Voir le panier">
          <span class="cart-bubble__icon">🛒</span>
          <span v-if="cart.totalCount > 0" class="cart-bubble__badge">{{ cart.totalCount }}</span>
        </button>
      </div>
    </header>

    <!-- ── Barre de recherche ──────────────────────────────── -->
    <div class="search-bar-wrapper">
      <div class="search-bar">
        <span class="search-bar__icon">🔍</span>
        <input
          v-model="searchQuery"
          type="search"
          class="search-bar__input"
          placeholder="Rechercher un plat..."
          aria-label="Rechercher dans le menu"
        />
        <button
          v-if="searchQuery"
          class="search-bar__clear"
          @click="searchQuery = ''"
          aria-label="Effacer la recherche"
        >✕</button>
      </div>
    </div>

    <!-- ── Filtres catégories ──────────────────────────────── -->
    <div class="filter-wrapper">
      <CategoryFilter v-model="activeCategory" />
    </div>

    <!-- ── Résultat / compteur ─────────────────────────────── -->
    <div class="menu-page__meta">
      <p class="menu-page__count">
        <span v-if="filteredItems.length > 0">
          {{ filteredItems.length }} article{{ filteredItems.length > 1 ? 's' : '' }}
        </span>
        <span v-else class="menu-page__empty-text">Aucun résultat pour « {{ searchQuery }} »</span>
      </p>
    </div>

    <!-- ── Grille des articles ─────────────────────────────── -->
    <main class="menu-grid" v-if="filteredItems.length > 0">
      <TransitionGroup name="card-list" tag="div" class="menu-grid__inner">
        <MenuCard
          v-for="item in filteredItems"
          :key="item.id"
          :item="item"
          @open-modal="openModal"
          @add-to-cart="addToCart"
        />
      </TransitionGroup>
    </main>

    <!-- ── État vide ───────────────────────────────────────── -->
    <div v-else class="menu-empty">
      <span class="menu-empty__icon">🔍</span>
      <p class="menu-empty__title">Aucun plat trouvé</p>
      <p class="menu-empty__sub">Essayez un autre mot-clé ou une autre catégorie.</p>
      <button class="menu-empty__reset" @click="resetFilters">Voir tout le menu</button>
    </div>

    <!-- ── Modal de personnalisation ──────────────────────── -->
    <CustomizeModal
      :item="modalItem"
      @close="modalItem = null"
      @add-to-cart="addToCart"
    />

    <!-- ── Toast notification ─────────────────────────────── -->
    <Transition name="toast">
      <div v-if="toastVisible" class="toast" role="status">
        ✅ {{ toastMessage }}
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { MENU_ITEMS } from '@/data/menuData.ts'
import { useCartStore } from '@/stores/cartStore'
import MenuCard from '@/components/MenuCard.vue'
import CategoryFilter from '@/components/CategoryFilter.vue'
import CustomizeModal from '@/components/CustomizeModal.vue'

const cart = useCartStore()

// ── State ────────────────────────────────────────────────────
const activeCategory = ref('all')
const searchQuery    = ref('')
const modalItem      = ref(null)
const toastVisible   = ref(false)
const toastMessage   = ref('')
let toastTimer       = null

// ── Filtrage dynamique ───────────────────────────────────────
const filteredItems = computed(() => {
  let items = MENU_ITEMS

  if (activeCategory.value !== 'all') {
    items = items.filter(i => i.category === activeCategory.value)
  }

  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    items = items.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q)
    )
  }

  return items
})

// ── Modal ────────────────────────────────────────────────────
function openModal(item) {
  modalItem.value = item
}

// ── Panier ───────────────────────────────────────────────────
function addToCart(cartItem) {
  cart.addItem(cartItem)
  showToast(`"${cartItem.name}" ajouté au panier !`)
}

// ── Reset filtres ─────────────────────────────────────────────
function resetFilters() {
  activeCategory.value = 'all'
  searchQuery.value    = ''
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg) {
  toastMessage.value = msg
  toastVisible.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastVisible.value = false
  }, 2800)
}
</script>

<style scoped>
.menu-page {
  min-height: 100dvh;
  background: transparent;
  padding-bottom: 40px;
}

/* ── Header ───────────────────────────────────────────────── */
.menu-header {
  background: linear-gradient(135deg, var(--color-primary, #e67e22) 0%, var(--color-primary-dark, #cf6d17) 100%);
  padding: 20px 0 28px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 16px rgba(230, 126, 34, 0.3);
}

.menu-header__inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.menu-header__brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-header__logo-svg {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.25));
}

.menu-header__title {
  color: #fff;
  font-size: 1.6rem;
  font-weight: 900;
  margin: 0;
  letter-spacing: -0.5px;
  text-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

.menu-header__tagline {
  color: rgba(255,255,255,0.85);
  font-size: 0.78rem;
  margin: 0;
  font-weight: 500;
}

/* ── Bouton panier ────────────────────────────────────────── */
.cart-bubble {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(4px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  transition: background 0.2s, transform 0.2s;
  color: #fff;
}

.cart-bubble:hover {
  background: rgba(255,255,255,0.35);
  transform: scale(1.08);
}

.cart-bubble__badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #e74c3c;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 800;
  min-width: 18px;
  height: 18px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid #fff;
}

/* ── Barre de recherche ───────────────────────────────────── */
.search-bar-wrapper {
  max-width: 1100px;
  margin: 28px auto 0;
  padding: 0 20px;
}

.search-bar {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 14px;
  padding: 0 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  gap: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: border-color 0.2s;
}

.search-bar:focus-within {
  border-color: var(--color-primary, #e67e22);
}

.search-bar__icon {
  font-size: 1.1rem;
  opacity: 0.5;
  flex-shrink: 0;
}

.search-bar__input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.95rem;
  color: #fff;
  padding: 14px 0;
  background: transparent;
  font-family: inherit;
}

.search-bar__input::placeholder {
  color: rgba(255,255,255,0.35);
}

.search-bar__clear {
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255,255,255,0.4);
  font-size: 1rem;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.search-bar__clear:hover {
  color: #fff;
}

/* ── Filtres ──────────────────────────────────────────────── */
.filter-wrapper {
  max-width: 1100px;
  margin: 16px auto 0;
  padding: 0 20px;
}

/* ── Meta (compteur) ──────────────────────────────────────── */
.menu-page__meta {
  max-width: 1100px;
  margin: 8px auto 0;
  padding: 0 20px;
}

.menu-page__count {
  font-size: 0.82rem;
  color: rgba(255,255,255,0.45);
  margin: 0;
  font-weight: 500;
}

.menu-page__empty-text {
  color: #e74c3c;
}

/* ── Grille ───────────────────────────────────────────────── */
.menu-grid {
  max-width: 1100px;
  margin: 14px auto 0;
  padding: 0 20px;
}

.menu-grid__inner {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

/* ── État vide ────────────────────────────────────────────── */
.menu-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 10px;
}

.menu-empty__icon {
  font-size: 3rem;
  opacity: 0.4;
}

.menu-empty__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: rgba(255,255,255,0.85);
  margin: 0;
}

.menu-empty__sub {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.45);
  margin: 0;
}

.menu-empty__reset {
  margin-top: 8px;
  padding: 10px 24px;
  border: 2px solid var(--color-primary, #e67e22);
  border-radius: 24px;
  background: transparent;
  color: var(--color-primary, #e67e22);
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.menu-empty__reset:hover {
  background: var(--color-primary, #e67e22);
  color: #fff;
}

/* ── Toast ────────────────────────────────────────────────── */
.toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  background: #1a1a1a;
  color: #fff;
  padding: 12px 22px;
  border-radius: 30px;
  font-size: 0.88rem;
  font-weight: 600;
  z-index: 2000;
  box-shadow: 0 6px 24px rgba(0,0,0,0.25);
  white-space: nowrap;
}

.toast-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.26, 0.64, 1); }
.toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from   { opacity: 0; transform: translateX(-50%) translateY(20px); }
.toast-leave-to     { opacity: 0; transform: translateX(-50%) translateY(20px); }

/* ── Animation grille ─────────────────────────────────────── */
.card-list-enter-active {
  transition: all 0.3s ease;
}
.card-list-leave-active {
  transition: all 0.2s ease;
  position: absolute;
}
.card-list-enter-from {
  opacity: 0;
  transform: scale(0.92) translateY(12px);
}
.card-list-leave-to {
  opacity: 0;
  transform: scale(0.92);
}

/* ── Responsive ───────────────────────────────────────────── */
@media (max-width: 480px) {
  .menu-header__title      { font-size: 1.3rem; }
  .menu-header__logo-svg   { width: 42px; height: 42px; }

  .menu-grid__inner {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
}

@media (max-width: 360px) {
  .menu-grid__inner {
    grid-template-columns: 1fr;
  }
}
</style>
