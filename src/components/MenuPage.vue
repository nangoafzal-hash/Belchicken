<template>
  <div class="menu-page">

    <!-- ── Hero / Header ───────────────────────────────────── -->
    <header class="menu-header">
      <div class="menu-header__inner">
        <div class="menu-header__brand">
          <svg class="menu-header__logo-svg" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="26" cy="26" r="26" fill="#c0392b"/>
            <path d="M18 34 C14 28 16 20 21 17 C19 22 22 25 20 30 C23 26 24 21 27 18 C26 24 29 27 26 34Z" fill="#f39c12"/>
            <path d="M34 34 C38 28 36 20 31 17 C33 22 30 25 32 30 C29 26 28 21 25 18 C26 24 23 27 26 34Z" fill="#f39c12"/>
            <ellipse cx="26" cy="33" rx="9" ry="7" fill="#fff"/>
            <circle cx="26" cy="22" r="5" fill="#fff"/>
            <path d="M26 24 L24.2 25.5 L27.8 25.5Z" fill="#f39c12"/>
            <circle cx="27.5" cy="21.5" r="1" fill="#c0392b"/>
            <path d="M24 18 C24 15 26 14 26 17 C26 14 28 13 28 17 C28 14 30 14 29 17" stroke="#e74c3c" stroke-width="1.2" fill="none" stroke-linecap="round"/>
          </svg>
          <div>
            <p class="menu-header__eyebrow">Belchiken</p>
            <h1 class="menu-header__title">Poulet Frit</h1>
          </div>
        </div>

        <div class="menu-header__actions">
          <button type="button" class="menu-header__nav" @click="scrollToMenu">Menu</button>
          <button class="cart-bubble" @click="cart.toggleCart()" aria-label="Ouvrir le panier">
            <span class="cart-bubble__icon">🛒</span>
            <span v-if="cart.totalCount > 0" class="cart-bubble__badge">{{ cart.totalCount }}</span>
          </button>
        </div>
      </div>
    </header>

    <Transition name="hero-fade" appear>
      <section class="menu-hero">
        <div class="menu-hero__visual" :style="{ backgroundImage: heroBackground }"></div>
        <div class="menu-hero__content">
          <div class="menu-hero__badge">
            <span>🚀 Livraison rapide</span>
          </div>
          <div class="menu-hero__headline">
            <h2 class="menu-hero__title">{{ heroSlide.title }}</h2>
            <h3 class="menu-hero__title menu-hero__title--accent">{{ heroSlide.accent }}</h3>
          </div>
          <p class="menu-hero__subtitle">{{ heroSlide.subtitle }}</p>
          <div class="menu-hero__actions">
            <button class="hero-cta" @click="scrollToMenu">
              Commander maintenant <span aria-hidden="true">→</span>
            </button>
            <button class="hero-pill" @click="scrollToMenu">Voir le menu</button>
          </div>
          <div class="hero-indicators">
            <button
              v-for="(slide, index) in heroSlides"
              :key="index"
              :class="['hero-indicator', { 'hero-indicator--active': heroIndex === index }]"
              @click="heroIndex = index"
              type="button"
              aria-label="Changer l'image du hero"
            />
          </div>
          <div class="menu-hero__stats">
            <div class="stat-pill">⏱ 25–35 min</div>
            <div class="stat-pill">📍 Ouaga centre</div>
          </div>
        </div>
      </section>
    </Transition>

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

    <template v-if="filteredItems.length > 0">
      <!-- ── Grille des articles ─────────────────────────────── -->
      <main
        ref="menuSection"
        :class="['menu-grid', { 'menu-grid--visible': menuVisible }]"
      >
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

      <section class="menu-footer">
        <div class="menu-footer__block">
          <p class="menu-footer__lead">Livraison ultra rapide • Plus de plats, plus de saveurs • Paiement simple</p>
          <p class="menu-footer__description">Commandez votre poulet frit premium, vos burgers croustillants et vos accompagnements gourmands, le tout livré chaud chez vous.</p>
        </div>
      </section>
    </template>

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

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { MENU_ITEMS } from '@/data/menuData.ts'
import { useCartStore } from '@/stores/cartStore'
import MenuCard from '@/components/MenuCard.vue'
import CategoryFilter from '@/components/CategoryFilter.vue'
import CustomizeModal from '@/components/CustomizeModal.vue'

const cart = useCartStore()
const menuSection = ref<HTMLElement | null>(null)

const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1600&q=80',
    title: 'Poulet frit premium',
    accent: 'Livré chaud, croustillant et prêt à dévorer',
    subtitle: 'Commandez votre box de poulet frit, accompagnements et sauces. Livraison rapide dans Ouagadougou.',
  },
  {
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450f859349?auto=format&fit=crop&w=1600&q=80',
    title: 'Croustillant à souhait',
    accent: 'Un goût qui fond dans la bouche',
    subtitle: 'Savourez des morceaux dorés, servis avec nos sauces maison.',
  },
  {
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=1600&q=80',
    title: 'Saveurs épicées',
    accent: 'Un punch gourmand pour chaque commande',
    subtitle: 'Ajoutez du piquant, du croustillant et de la générosité à votre repas.',
  },
  {
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1600&q=80',
    title: 'Box à partager',
    accent: 'Idéal pour les repas entre amis',
    subtitle: 'Plus de plats, plus de plaisir avec des portions généreuses.',
  },
]
const heroIndex = ref(0)
const heroSlide = computed(() => heroSlides[heroIndex.value])
const menuVisible = ref(true)
let heroTimer: ReturnType<typeof setInterval> | null = null
let observer: IntersectionObserver | null = null

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

function scrollToMenu() {
  menuSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const heroBackground = computed(
  () => `linear-gradient(180deg, rgba(10, 10, 10, 0.05), rgba(0, 0, 0, 0.1)), url("${heroSlide.value.image}")`
)

function startHeroRotation() {
  heroTimer = setInterval(() => {
    heroIndex.value = (heroIndex.value + 1) % heroSlides.length
  }, 10000)
}

function setupMenuObserver() {
  if (!menuSection.value) return
  observer = new IntersectionObserver(
    ([entry]) => { menuVisible.value = entry.isIntersecting },
    { threshold: 0.2 }
  )
  observer.observe(menuSection.value)
}

onMounted(() => {
  startHeroRotation()
  setupMenuObserver()
})

onUnmounted(() => {
  if (heroTimer) clearInterval(heroTimer)
  if (observer && menuSection.value) observer.unobserve(menuSection.value)
})

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
  font-size: 1.3rem;
  font-weight: 900;
  margin: 0;
  letter-spacing: -0.5px;
}

.menu-header__eyebrow {
  color: rgba(255,255,255,0.7);
  font-size: 0.8rem;
  margin: 0 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.menu-header__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-header__nav {
  background: rgba(255,255,255,0.18);
  color: #23110a;
  border: none;
  border-radius: 999px;
  padding: 10px 18px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.menu-header {
  background: rgba(8, 8, 8, 0.95);
  backdrop-filter: blur(12px);
}

.menu-header__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.menu-header__actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.menu-header__nav {
  background: rgba(255,255,255,0.06);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.12);
  padding: 10px 18px;
}

.menu-header__nav:hover,
.menu-header__nav:focus {
  background: rgba(255,255,255,0.12);
  transform: translateY(-1px);
}

.cart-bubble {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  min-height: 52px;
  border: none;
  border-radius: 999px;
  padding: 0 16px;
  background: linear-gradient(135deg, #ff4f6d, #ffb347);
  color: #111;
  font-weight: 800;
  box-shadow: 0 18px 40px rgba(255, 84, 105, 0.22);
  cursor: pointer;
}

.cart-bubble__icon {
  font-size: 1.05rem;
}

.menu-hero {
  margin: 20px calc(50vw - 50%) 0;
  width: 100vw;
  min-height: 44vh;
  position: relative;
  background: #111;
  border-radius: 0 0 32px 32px;
  overflow: hidden;
  box-shadow: 0 28px 90px rgba(0,0,0,0.28);
  padding-bottom: 26px;
}

.menu-hero__visual {
  min-height: inherit;
  background-color: #141414;
  background-repeat: no-repeat;
  background-position: center center;
}

.hero-indicators {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.hero-indicator {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.65);
  background: rgba(255,255,255,0.2);
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.hero-indicator--active {
  background: #ff8a5c;
  transform: scale(1.2);
  box-shadow: 0 0 0 4px rgba(255, 138, 92, 0.12);
}

.menu-grid {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.55s ease, transform 0.55s ease;
}

.menu-grid--visible {
  opacity: 1;
  transform: translateY(0);
}

.menu-hero__visual {
  background-size: cover;
  background-position: center;
  min-height: 100%;
  position: absolute;
  inset: 0;
  transition: background-image 0.9s ease;
  filter: saturate(1.18) contrast(1.08) brightness(1.16);
}

.menu-hero__content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 22px;
  padding: 42px 32px 32px;
  max-width: min(900px, 92vw);
}

.menu-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(255, 88, 109, 0.05), transparent 26%),
              radial-gradient(circle at bottom left, rgba(255, 182, 63, 0.05), transparent 20%),
              linear-gradient(180deg, rgba(0,0,0,0.00), rgba(0,0,0,0.08));
  z-index: 1;
}

.menu-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 999px;
  background: rgba(255,69,120,0.16);
  border: 1px solid rgba(255,255,255,0.14);
  color: #fff;
  font-size: 0.96rem;
  font-weight: 700;
  width: fit-content;
}

.menu-hero__headline {
  display: grid;
  gap: 6px;
}

.menu-hero__title {
  color: #fff;
  font-size: clamp(3rem, 5vw, 4.4rem);
  font-weight: 900;
  line-height: 0.95;
  margin: 0;
}

.menu-hero__title--accent {
  background: linear-gradient(90deg, #ff4f6d, #ffb347);
  -webkit-background-clip: text;
  color: transparent;
  font-size: clamp(3rem, 5vw, 4.4rem);
}

.menu-hero__subtitle {
  color: rgba(255,255,255,0.72);
  font-size: 1.05rem;
  line-height: 1.7;
  max-width: 560px;
  margin: 0;
}

.menu-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-cta,
.hero-pill {
  border: none;
  border-radius: 999px;
  padding: 16px 26px;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease, opacity 0.16s ease;
}

.hero-cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #ff4977 0%, #ffb347 55%, #ffd05b 100%);
  color: #111;
  box-shadow: 0 20px 44px rgba(255, 76, 113, 0.32);
}

.hero-cta:hover {
  transform: translateY(-2px);
  opacity: 0.95;
}

.hero-pill {
  background: rgba(255,255,255,0.08);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.14);
}

.hero-pill:hover {
  transform: translateY(-2px);
  background: rgba(255,255,255,0.12);
}

.hero-pill:hover {
  transform: translateY(-2px);
  background: rgba(255,255,255,0.18);
}

.menu-hero__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}

.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 999px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
}

.menu-hero__title {
  max-width: 680px;
}

.menu-hero__badge {
  display: grid;
  gap: 10px;
  padding: 20px;
  border-radius: 22px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
}

.menu-hero__badge span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.08);
  color: #fff;
  border-radius: 18px;
  padding: 10px 14px;
  font-size: 0.88rem;
}

.menu-footer {
  max-width: 1100px;
  margin: 20px auto 0;
  padding: 20px 24px;
  background: rgba(15, 15, 15, 0.92);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px;
  box-shadow: 0 18px 50px rgba(0,0,0,0.22);
}

.menu-footer__block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.menu-footer__lead {
  margin: 0;
  color: #fff;
  font-size: 1rem;
  font-weight: 800;
}

.menu-footer__description {
  margin: 0;
  color: rgba(255,255,255,0.72);
  line-height: 1.7;
}

.highlight-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-primary);
}

.highlight-card strong {
  display: block;
  margin-bottom: 10px;
  font-size: 1rem;
}

.highlight-card p {
  margin: 0;
  color: rgba(255,255,255,0.8);
  font-size: 0.9rem;
  line-height: 1.5;
}

.highlight-card--pulse {
  animation: highlight-pulse 3.5s ease-in-out infinite;
}

@keyframes highlight-pulse {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.hero-fade-enter-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.hero-fade-enter-from {
  opacity: 0;
  transform: translateY(22px);
}

.hero-fade-enter-to {
  opacity: 1;
  transform: translateY(0);
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
