<template>
  <!-- Backdrop -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="item"
        class="modal-backdrop"
        role="dialog"
        aria-modal="true"
        :aria-label="`Personnaliser ${item.name}`"
        @click.self="close"
      >
        <Transition name="modal-slide">
          <div v-if="item" class="modal">

            <!-- Header -->
            <div class="modal__header">
              <img
                :src="item.image"
                :alt="item.name"
                class="modal__hero-img"
                @error="onImageError"
              />
              <div class="modal__header-overlay" />
              <button class="modal__close" @click="close" aria-label="Fermer">✕</button>
              <div class="modal__header-info">
                <h2 class="modal__title">{{ item.name }}</h2>
                <p class="modal__desc">{{ item.description }}</p>
              </div>
            </div>

            <!-- Body -->
            <div class="modal__body">

              <!-- ① Quantité -->
              <section class="modal__section">
                <h3 class="modal__section-title">Quantité</h3>
                <div class="qty-control">
                  <button
                    class="qty-control__btn"
                    :disabled="quantity <= 1"
                    @click="quantity--"
                    aria-label="Diminuer"
                  >−</button>
                  <span class="qty-control__value">{{ quantity }}</span>
                  <button
                    class="qty-control__btn"
                    @click="quantity++"
                    aria-label="Augmenter"
                  >+</button>
                </div>
              </section>

              <!-- ② Niveau d'épice -->
              <section v-if="item.hasSpice" class="modal__section">
                <h3 class="modal__section-title">
                  Niveau d'épice
                  <span class="modal__required">obligatoire</span>
                </h3>
                <div class="option-pills">
                  <button
                    v-for="opt in spiceOptions"
                    :key="opt.id"
                    class="option-pill"
                    :class="{ 'option-pill--active': selectedSpice === opt.id }"
                    @click="selectedSpice = opt.id"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </section>

              <!-- ③ Sauce -->
              <section v-if="item.hasSauce" class="modal__section">
                <h3 class="modal__section-title">
                  Sauce
                  <span class="modal__optional">optionnel</span>
                </h3>
                <div class="option-pills">
                  <button
                    v-for="sauce in sauces"
                    :key="sauce.id"
                    class="option-pill"
                    :class="{ 'option-pill--active': selectedSauce === sauce.id }"
                    @click="selectedSauce = sauce.id"
                  >
                    {{ sauce.label }}
                  </button>
                </div>
              </section>

              <!-- ④ Taille de boisson -->
              <section v-if="item.hasDrinkSize" class="modal__section">
                <h3 class="modal__section-title">
                  Taille
                  <span class="modal__required">obligatoire</span>
                </h3>
                <div class="size-options">
                  <button
                    v-for="size in drinkSizes"
                    :key="size.id"
                    class="size-option"
                    :class="{ 'size-option--active': selectedSize === size.id }"
                    @click="selectedSize = size.id"
                  >
                    <span class="size-option__label">{{ size.id }}</span>
                    <span class="size-option__desc">{{ size.label }}</span>
                    <span class="size-option__extra">
                      {{ size.extraPrice > 0 ? `+${size.extraPrice} FCFA` : 'inclus' }}
                    </span>
                  </button>
                </div>
              </section>

              <!-- ⑤ Note spéciale -->
              <section class="modal__section">
                <h3 class="modal__section-title">
                  Note spéciale
                  <span class="modal__optional">optionnel</span>
                </h3>
                <textarea
                  v-model="specialNote"
                  class="modal__textarea"
                  placeholder="Ex: sans oignon, bien cuit, sauce à part..."
                  rows="3"
                  maxlength="200"
                />
                <p class="modal__char-count">{{ specialNote.length }}/200</p>
              </section>

            </div>

            <!-- Footer sticky -->
            <div class="modal__footer">
              <div class="modal__total">
                <span class="modal__total-label">Total</span>
                <span class="modal__total-price">{{ formatPrice(totalPrice) }}</span>
              </div>
              <button
                class="modal__add-btn"
                :disabled="!isValid"
                @click="addToCart"
              >
                🛒 Ajouter au panier
              </button>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { SAUCES, SPICE_OPTIONS, DRINK_SIZES, formatPrice } from '@/data/menuData.ts'

const props = defineProps({
  item: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'add-to-cart'])

// ── State local ──────────────────────────────────────────────
const quantity    = ref(1)
const selectedSpice = ref('doux')
const selectedSauce = ref('ketchup')
const selectedSize  = ref('S')
const specialNote   = ref('')

const sauces      = SAUCES
const spiceOptions = SPICE_OPTIONS
const drinkSizes  = DRINK_SIZES

// ── Reset quand un nouvel article s'ouvre ────────────────────
watch(() => props.item, (newItem) => {
  if (!newItem) return
  quantity.value     = 1
  selectedSpice.value = 'doux'
  selectedSauce.value = 'ketchup'
  selectedSize.value  = 'S'
  specialNote.value   = ''
})

// ── Prix total calculé ───────────────────────────────────────
const totalPrice = computed(() => {
  if (!props.item) return 0
  const sizeExtra = props.item.hasDrinkSize
    ? (DRINK_SIZES.find(s => s.id === selectedSize.value)?.extraPrice ?? 0)
    : 0
  return (props.item.price + sizeExtra) * quantity.value
})

// ── Validation (épice obligatoire si applicable) ─────────────
const isValid = computed(() => {
  if (!props.item) return false
  if (props.item.hasSpice && !selectedSpice.value) return false
  if (props.item.hasDrinkSize && !selectedSize.value) return false
  return true
})

// ── Actions ──────────────────────────────────────────────────
function addToCart() {
  if (!isValid.value) return
  emit('add-to-cart', {
    ...props.item,
    quantity:     quantity.value,
    spice:        props.item.hasSpice    ? selectedSpice.value : null,
    sauce:        props.item.hasSauce    ? selectedSauce.value : null,
    drinkSize:    props.item.hasDrinkSize ? selectedSize.value : null,
    specialNote:  specialNote.value.trim() || null,
    unitPrice:    props.item.price + (
      props.item.hasDrinkSize
        ? (DRINK_SIZES.find(s => s.id === selectedSize.value)?.extraPrice ?? 0)
        : 0
    ),
    totalPrice: totalPrice.value,
    cartItemId: `${props.item.id}-${Date.now()}`,
  })
  close()
}

function close() {
  emit('close')
}

function onImageError(e) {
  e.target.src = 'https://placehold.co/600x220/e67e22/fff?text=Belchiken'
}

// Fermer avec Escape
import { onMounted, onUnmounted } from 'vue'
function handleKeydown(e) {
  if (e.key === 'Escape') close()
}
onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
/* ── Backdrop ─────────────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
  backdrop-filter: blur(3px);
}

@media (min-width: 640px) {
  .modal-backdrop {
    align-items: center;
    padding: 20px;
  }
}

/* ── Modal ────────────────────────────────────────────────── */
.modal {
  background: #fff;
  width: 100%;
  max-width: 520px;
  max-height: 92dvh;
  border-radius: 24px 24px 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.2);
}

@media (min-width: 640px) {
  .modal {
    border-radius: 24px;
    max-height: 88dvh;
  }
}

/* ── Header ───────────────────────────────────────────────── */
.modal__header {
  position: relative;
  height: 200px;
  flex-shrink: 0;
}

.modal__hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal__header-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 60%);
}

.modal__close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  border: none;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  transition: background 0.2s;
  z-index: 2;
}

.modal__close:hover {
  background: #fff;
}

.modal__header-info {
  position: absolute;
  bottom: 14px;
  left: 16px;
  right: 16px;
  z-index: 2;
}

.modal__title {
  color: #fff;
  font-size: 1.2rem;
  font-weight: 800;
  margin: 0 0 4px;
  text-shadow: 0 1px 4px rgba(0,0,0,0.4);
}

.modal__desc {
  color: rgba(255,255,255,0.85);
  font-size: 0.8rem;
  margin: 0;
  line-height: 1.4;
}

/* ── Body scrollable ──────────────────────────────────────── */
.modal__body {
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  scrollbar-width: thin;
  scrollbar-color: #ddd transparent;
}

/* ── Sections ─────────────────────────────────────────────── */
.modal__section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal__section-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal__required {
  font-size: 0.7rem;
  font-weight: 600;
  color: #fff;
  background: #e74c3c;
  padding: 2px 8px;
  border-radius: 10px;
}

.modal__optional {
  font-size: 0.7rem;
  font-weight: 600;
  color: #888;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 10px;
}

/* ── Quantité ─────────────────────────────────────────────── */
.qty-control {
  display: flex;
  align-items: center;
  gap: 0;
  background: #f6f6f6;
  border-radius: 30px;
  width: fit-content;
  overflow: hidden;
  border: 2px solid #e8e8e8;
}

.qty-control__btn {
  width: 42px;
  height: 42px;
  border: none;
  background: transparent;
  font-size: 1.3rem;
  font-weight: 700;
  cursor: pointer;
  color: var(--color-primary, #e67e22);
  transition: background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-control__btn:disabled {
  color: #ccc;
  cursor: default;
}

.qty-control__btn:not(:disabled):hover {
  background: #ffe9d4;
}

.qty-control__value {
  min-width: 36px;
  text-align: center;
  font-size: 1rem;
  font-weight: 800;
  color: #1a1a1a;
}

/* ── Pills (épice & sauce) ────────────────────────────────── */
.option-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.option-pill {
  padding: 8px 16px;
  border-radius: 24px;
  border: 2px solid #e8e8e8;
  background: #fff;
  font-size: 0.83rem;
  font-weight: 600;
  color: #555;
  cursor: pointer;
  transition: all 0.18s ease;
}

.option-pill:hover {
  border-color: var(--color-primary, #e67e22);
  color: var(--color-primary, #e67e22);
}

.option-pill--active {
  background: var(--color-primary, #e67e22);
  border-color: var(--color-primary, #e67e22);
  color: #fff;
}

/* ── Taille boisson ───────────────────────────────────────── */
.size-options {
  display: flex;
  gap: 10px;
}

.size-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 12px 8px;
  border-radius: 14px;
  border: 2px solid #e8e8e8;
  background: #fff;
  cursor: pointer;
  transition: all 0.18s ease;
}

.size-option:hover {
  border-color: var(--color-primary, #e67e22);
}

.size-option--active {
  border-color: var(--color-primary, #e67e22);
  background: #fff8f2;
}

.size-option__label {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--color-primary, #e67e22);
}

.size-option__desc {
  font-size: 0.7rem;
  color: #666;
  text-align: center;
}

.size-option__extra {
  font-size: 0.72rem;
  font-weight: 700;
  color: #27ae60;
}

/* ── Textarea ─────────────────────────────────────────────── */
.modal__textarea {
  width: 100%;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 0.85rem;
  font-family: inherit;
  color: #333;
  resize: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.modal__textarea:focus {
  outline: none;
  border-color: var(--color-primary, #e67e22);
}

.modal__char-count {
  font-size: 0.72rem;
  color: #aaa;
  text-align: right;
  margin: 0;
}

/* ── Footer sticky ────────────────────────────────────────── */
.modal__footer {
  padding: 14px 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  background: #fff;
  flex-shrink: 0;
}

.modal__total {
  display: flex;
  flex-direction: column;
}

.modal__total-label {
  font-size: 0.72rem;
  color: #888;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modal__total-price {
  font-size: 1.3rem;
  font-weight: 900;
  color: var(--color-primary, #e67e22);
}

.modal__add-btn {
  flex: 1;
  padding: 14px 20px;
  border: none;
  border-radius: 30px;
  background: var(--color-primary, #e67e22);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}

.modal__add-btn:hover:not(:disabled) {
  background: var(--color-primary-dark, #cf6d17);
  transform: scale(1.02);
}

.modal__add-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* ── Transitions ──────────────────────────────────────────── */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-slide-enter-active,
.modal-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.34, 1.26, 0.64, 1);
}
.modal-slide-enter-from,
.modal-slide-leave-to {
  transform: translateY(60px);
}

@media (min-width: 640px) {
  .modal-slide-enter-from,
  .modal-slide-leave-to {
    transform: scale(0.92) translateY(20px);
  }
}
</style>
