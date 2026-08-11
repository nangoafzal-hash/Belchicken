<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="checkout-backdrop"
        role="dialog"
        aria-modal="true"
        aria-label="Finaliser la commande"
        @click.self="$emit('update:modelValue', false)"
      >
        <Transition name="modal-slide">
          <div v-if="modelValue" class="checkout-modal">

            <!-- ── Header ──────────────────────────────── -->
            <div class="checkout__header">
              <div class="checkout__header-left">
                <span class="checkout__header-icon">📋</span>
                <div>
                  <h2 class="checkout__title">Finaliser la commande</h2>
                  <p class="checkout__subtitle">{{ cart.totalCount }} article{{ cart.totalCount > 1 ? 's' : '' }} · {{ cart.grandTotalFormatted }}</p>
                </div>
              </div>
              <button
                class="checkout__close"
                @click="$emit('update:modelValue', false)"
                aria-label="Fermer"
              >✕</button>
            </div>

            <!-- ── Corps ───────────────────────────────── -->
            <div class="checkout__body">

              <!-- Étape indicator -->
              <div class="checkout__steps">
                <div class="checkout__step" :class="{ active: step === 1, done: step > 1 }">
                  <span class="checkout__step-num">{{ step > 1 ? '✓' : '1' }}</span>
                  <span class="checkout__step-label">Vos infos</span>
                </div>
                <div class="checkout__step-line" />
                <div class="checkout__step" :class="{ active: step === 2 }">
                  <span class="checkout__step-num">2</span>
                  <span class="checkout__step-label">Aperçu</span>
                </div>
              </div>

              <!-- ─── ÉTAPE 1 : Formulaire ───────────── -->
              <div v-if="step === 1" class="checkout__form">

                <!-- Nom -->
                <div class="form-group" :class="{ 'form-group--error': errors.name }">
                  <label class="form-label">
                    Nom complet <span class="form-required">*</span>
                  </label>
                  <div class="form-input-wrap">
                    <span class="form-input-icon">👤</span>
                    <input
                      v-model="customer.name"
                      type="text"
                      class="form-input"
                      placeholder="Ex : Ouédraogo Issouf"
                      autocomplete="name"
                      @blur="touchField('name')"
                    />
                  </div>
                  <p v-if="errors.name" class="form-error">{{ errors.name }}</p>
                </div>

                <!-- Téléphone -->
                <div class="form-group" :class="{ 'form-group--error': errors.phone }">
                  <label class="form-label">
                    Téléphone <span class="form-required">*</span>
                  </label>
                  <div class="form-input-wrap">
                    <span class="form-input-icon">📱</span>
                    <input
                      v-model="customer.phone"
                      type="tel"
                      class="form-input"
                      placeholder="Ex : 70 00 00 00"
                      autocomplete="tel"
                      @blur="touchField('phone')"
                    />
                  </div>
                  <p v-if="errors.phone" class="form-error">{{ errors.phone }}</p>
                </div>

                <!-- Adresse -->
                <div class="form-group" :class="{ 'form-group--error': errors.address }">
                  <label class="form-label">
                    Adresse de livraison <span class="form-required">*</span>
                  </label>
                  <div class="form-input-wrap">
                    <span class="form-input-icon">📍</span>
                    <input
                      v-model="customer.address"
                      type="text"
                      class="form-input"
                      placeholder="Ex : Secteur 15, Rue 10.32"
                      autocomplete="street-address"
                      @blur="touchField('address')"
                    />
                  </div>
                  <p v-if="errors.address" class="form-error">{{ errors.address }}</p>
                </div>

                <!-- Repère local -->
                <div class="form-group">
                  <label class="form-label">
                    Repère local
                    <span class="form-optional">optionnel</span>
                  </label>
                  <div class="form-input-wrap">
                    <span class="form-input-icon">🏪</span>
                    <input
                      v-model="customer.landmark"
                      type="text"
                      class="form-input"
                      placeholder="Ex : Près du marché Rood Woko"
                    />
                  </div>
                </div>

                <!-- Note globale -->
                <div class="form-group">
                  <label class="form-label">
                    Note pour le livreur
                    <span class="form-optional">optionnel</span>
                  </label>
                  <div class="form-input-wrap form-input-wrap--textarea">
                    <span class="form-input-icon">📝</span>
                    <textarea
                      v-model="customer.note"
                      class="form-textarea"
                      placeholder="Ex : Appelez avant d'arriver, portail rouge..."
                      rows="2"
                      maxlength="200"
                    />
                  </div>
                  <p class="form-char-count">{{ customer.note?.length ?? 0 }}/200</p>
                </div>

                <!-- Récap zone livraison -->
                <div class="checkout__zone-recap">
                  <span class="checkout__zone-icon">🛵</span>
                  <div class="checkout__zone-info">
                    <p class="checkout__zone-name">{{ cart.selectedZone?.name }}</p>
                    <p class="checkout__zone-detail">
                      {{ formatPrice(cart.deliveryFee) }} · ⏱ {{ zoneDelay }}
                    </p>
                  </div>
                  <span class="checkout__zone-fee">{{ formatPrice(cart.deliveryFee) }}</span>
                </div>

              </div>

              <!-- ─── ÉTAPE 2 : Aperçu du message ───── -->
              <div v-if="step === 2" class="checkout__preview">
                <div class="preview__header">
                  <span>📱 Aperçu du message WhatsApp</span>
                  <button class="preview__copy-btn" @click="copyMessage">
                    {{ copied ? '✅ Copié !' : '📋 Copier' }}
                  </button>
                </div>
                <pre class="preview__message">{{ previewMessage }}</pre>
              </div>

            </div>

            <!-- ── Footer ──────────────────────────────── -->
            <div class="checkout__footer">

              <!-- Étape 1 → 2 -->
              <template v-if="step === 1">
                <button class="checkout__btn checkout__btn--secondary" @click="$emit('update:modelValue', false)">
                  Annuler
                </button>
                <button
                  class="checkout__btn checkout__btn--primary"
                  :disabled="!isFormValid"
                  @click="goToPreview"
                >
                  Aperçu du bon 👁️
                </button>
              </template>

              <!-- Étape 2 → WhatsApp -->
              <template v-if="step === 2">
                <button class="checkout__btn checkout__btn--secondary" @click="step = 1">
                  ← Modifier
                </button>
                <button class="checkout__btn checkout__btn--whatsapp" @click="sendToWhatsApp">
                  <svg viewBox="0 0 24 24" class="checkout__wa-icon" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Envoyer sur WhatsApp
                </button>
              </template>

            </div>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCartStore } from '@/stores/cartStore'
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  validateCustomer,
  type CustomerInfo,
  type FormErrors,
} from '@/composables/useOrderFormatter'
import { formatPrice } from '@/data/menuData.ts'
import { formatDelay } from '@/data/deliveryZones'

// ── Props & Emits ────────────────────────────────────────────
const props = defineProps<{ modelValue: boolean }>()
const emit  = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'order-sent', customer: CustomerInfo): void
}>()

const cart = useCartStore()

// ── State ────────────────────────────────────────────────────
const step   = ref(1)
const copied = ref(false)

const customer = ref<CustomerInfo>({
  name:     '',
  phone:    '',
  address:  '',
  landmark: '',
  note:     '',
})

const touched = ref<Set<string>>(new Set())

// ── Validation réactive ──────────────────────────────────────
const errors = computed<FormErrors>(() => {
  const all = validateCustomer(customer.value)
  const visible: FormErrors = {}
  if (touched.value.has('name')    && all.name)    visible.name    = all.name
  if (touched.value.has('phone')   && all.phone)   visible.phone   = all.phone
  if (touched.value.has('address') && all.address) visible.address = all.address
  return visible
})

const isFormValid = computed(() => {
  const e = validateCustomer(customer.value)
  return !e.name && !e.phone && !e.address
})

function touchField(field: string) {
  touched.value.add(field)
}

// ── Délai zone ───────────────────────────────────────────────
const zoneDelay = computed(() => {
  if (!cart.selectedZone) return ''
  return formatDelay(cart.selectedZone.minDelay, cart.selectedZone.maxDelay)
})

// ── Aperçu message ───────────────────────────────────────────
const previewMessage = computed(() => {
  if (!cart.selectedZone) return ''
  return buildWhatsAppMessage(cart.items, cart.selectedZone, customer.value)
})

// ── Actions ──────────────────────────────────────────────────
function goToPreview() {
  // Marquer tous les champs comme touchés pour afficher les erreurs
  touched.value.add('name')
  touched.value.add('phone')
  touched.value.add('address')
  if (!isFormValid.value) return
  step.value = 2
}

async function copyMessage() {
  try {
    await navigator.clipboard.writeText(previewMessage.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2500)
  } catch {
    // fallback silencieux
  }
}

function sendToWhatsApp() {
  if (!cart.selectedZone || !isFormValid.value) return
  const url = buildWhatsAppUrl(previewMessage.value)
  window.open(url, '_blank', 'noopener,noreferrer')
  emit('order-sent', { ...customer.value })
  emit('update:modelValue', false)
}

// ── Reset à l'ouverture ──────────────────────────────────────
watch(() => props.modelValue, (val) => {
  if (val) {
    step.value     = 1
    copied.value   = false
    touched.value  = new Set()
    customer.value = { name: '', phone: '', address: '', landmark: '', note: '' }
  }
})

// ── Fermer avec Escape ───────────────────────────────────────
import { onMounted, onUnmounted } from 'vue'
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('update:modelValue', false)
}
onMounted(()  => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
/* ── Backdrop ─────────────────────────────────────────────── */
.checkout-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.65);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(4px);
}

/* ── Modal ────────────────────────────────────────────────── */
.checkout-modal {
  background: #1a0a03;
  border: 1px solid rgba(230,126,34,0.2);
  border-radius: 24px;
  width: 100%;
  max-width: 500px;
  max-height: 92dvh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 80px rgba(0,0,0,0.6);
  overflow: hidden;
}

/* ── Header ───────────────────────────────────────────────── */
.checkout__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 22px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  background: linear-gradient(135deg,#2a1208,#1a0a03);
  flex-shrink: 0;
}

.checkout__header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.checkout__header-icon { font-size: 1.5rem; }

.checkout__title {
  color: #fff;
  font-size: 1rem;
  font-weight: 800;
  margin: 0;
}

.checkout__subtitle {
  color: rgba(255,255,255,0.45);
  font-size: 0.75rem;
  margin: 0;
}

.checkout__close {
  width: 32px; height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.6);
  font-size: 0.85rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s, color 0.2s;
  font-family: inherit;
}
.checkout__close:hover { background: rgba(255,255,255,0.14); color:#fff; }

/* ── Steps ────────────────────────────────────────────────── */
.checkout__steps {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 16px 22px 8px;
  flex-shrink: 0;
}

.checkout__step {
  display: flex;
  align-items: center;
  gap: 7px;
}

.checkout__step-num {
  width: 26px; height: 26px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.4);
  font-size: 0.75rem;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}

.checkout__step.active .checkout__step-num {
  background: var(--color-primary,#e67e22);
  border-color: var(--color-primary,#e67e22);
  color: #fff;
}

.checkout__step.done .checkout__step-num {
  background: #27ae60;
  border-color: #27ae60;
  color: #fff;
}

.checkout__step-label {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.35);
  font-weight: 600;
}

.checkout__step.active .checkout__step-label { color: #fff; }
.checkout__step.done  .checkout__step-label  { color: #27ae60; }

.checkout__step-line {
  flex: 1;
  height: 1px;
  background: rgba(255,255,255,0.1);
  margin: 0 12px;
}

/* ── Corps scrollable ─────────────────────────────────────── */
.checkout__body {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(230,126,34,0.3) transparent;
}

/* ── Formulaire ───────────────────────────────────────────── */
.checkout__form {
  padding: 8px 22px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group { display: flex; flex-direction: column; gap: 6px; }

.form-label {
  color: rgba(255,255,255,0.75);
  font-size: 0.82rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
}

.form-required { color: #e74c3c; font-size: 0.85rem; }

.form-optional {
  font-size: 0.68rem;
  font-weight: 600;
  color: rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.07);
  padding: 2px 7px;
  border-radius: 10px;
}

.form-input-wrap {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  padding: 0 14px;
  gap: 10px;
  transition: border-color 0.2s, background 0.2s;
}

.form-input-wrap:focus-within {
  border-color: var(--color-primary,#e67e22);
  background: rgba(230,126,34,0.05);
}

.form-group--error .form-input-wrap {
  border-color: rgba(231,76,60,0.6);
}

.form-input-wrap--textarea { align-items: flex-start; padding-top: 12px; }

.form-input-icon { font-size: 1rem; flex-shrink: 0; opacity: 0.55; }

.form-input {
  flex: 1;
  border: none; outline: none;
  background: transparent;
  color: #fff;
  font-size: 0.9rem;
  padding: 13px 0;
  font-family: inherit;
}

.form-input::placeholder { color: rgba(255,255,255,0.25); }

.form-textarea {
  flex: 1;
  border: none; outline: none;
  background: transparent;
  color: #fff;
  font-size: 0.88rem;
  padding: 0;
  font-family: inherit;
  resize: none;
  line-height: 1.5;
}

.form-textarea::placeholder { color: rgba(255,255,255,0.25); }

.form-error {
  color: #e74c3c;
  font-size: 0.75rem;
  margin: 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}
.form-error::before { content: '⚠ '; }

.form-char-count {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.25);
  text-align: right;
  margin: 0;
}

/* ── Récap zone ───────────────────────────────────────────── */
.checkout__zone-recap {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(230,126,34,0.08);
  border: 1px solid rgba(230,126,34,0.2);
  border-radius: 14px;
  padding: 12px 16px;
}

.checkout__zone-icon { font-size: 1.3rem; }

.checkout__zone-info { flex: 1; }

.checkout__zone-name {
  color: #fff;
  font-size: 0.88rem;
  font-weight: 700;
  margin: 0 0 2px;
}

.checkout__zone-detail {
  color: rgba(255,255,255,0.4);
  font-size: 0.72rem;
  margin: 0;
}

.checkout__zone-fee {
  color: var(--color-primary,#e67e22);
  font-weight: 800;
  font-size: 0.95rem;
}

/* ── Prévisualisation ─────────────────────────────────────── */
.checkout__preview {
  padding: 12px 22px 16px;
}

.preview__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  color: rgba(255,255,255,0.6);
  font-size: 0.8rem;
  font-weight: 600;
}

.preview__copy-btn {
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.7);
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  font-family: inherit;
}
.preview__copy-btn:hover { background: rgba(255,255,255,0.14); color: #fff; }

.preview__message {
  background: #0e0603;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px;
  padding: 16px;
  font-size: 0.78rem;
  line-height: 1.7;
  color: rgba(255,255,255,0.75);
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'Courier New', monospace;
  max-height: 340px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(230,126,34,0.3) transparent;
}

/* ── Footer ───────────────────────────────────────────────── */
.checkout__footer {
  padding: 14px 22px 20px;
  border-top: 1px solid rgba(255,255,255,0.07);
  display: flex;
  gap: 10px;
  flex-shrink: 0;
  background: rgba(10,4,0,0.5);
}

.checkout__btn {
  flex: 1;
  padding: 14px;
  border-radius: 30px;
  border: none;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}

.checkout__btn--secondary {
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.7);
}
.checkout__btn--secondary:hover { background: rgba(255,255,255,0.12); color: #fff; }

.checkout__btn--primary {
  background: var(--color-primary,#e67e22);
  color: #fff;
}
.checkout__btn--primary:hover:not(:disabled) { background: var(--color-primary-dark,#cf6d17); }
.checkout__btn--primary:disabled { background: #444; cursor: not-allowed; opacity: 0.5; }

.checkout__btn--whatsapp {
  background: linear-gradient(135deg,#25d366 0%,#128c7e 100%);
  color: #fff;
  flex: 2;
}
.checkout__btn--whatsapp:hover { opacity: 0.92; transform: scale(1.02); }

.checkout__wa-icon {
  width: 18px; height: 18px;
  flex-shrink: 0;
}

/* ── Transitions ──────────────────────────────────────────── */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.modal-slide-enter-active { transition: transform 0.3s cubic-bezier(0.34,1.26,0.64,1), opacity 0.3s ease; }
.modal-slide-leave-active { transition: transform 0.2s ease, opacity 0.2s ease; }
.modal-slide-enter-from, .modal-slide-leave-to { transform: scale(0.94) translateY(16px); opacity: 0; }
</style>
