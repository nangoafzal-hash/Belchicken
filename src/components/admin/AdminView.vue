<template>
  <Teleport to="body">
    <Transition name="admin-fade">
      <div v-if="modelValue" class="admin-overlay">

        <!-- ── Écran de connexion ──────────────────────── -->
        <Transition name="login-slide" mode="out-in">
          <div v-if="!authenticated" key="login" class="admin-login">
            <div class="login-card">
              <div class="login-card__icon">
                <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:64px;height:64px;">
                  <circle cx="26" cy="26" r="26" fill="#c0392b"/>
                  <path d="M18 34 C14 28 16 20 21 17 C19 22 22 25 20 30 C23 26 24 21 27 18 C26 24 29 27 26 34Z" fill="#f39c12"/>
                  <path d="M34 34 C38 28 36 20 31 17 C33 22 30 25 32 30 C29 26 28 21 25 18 C26 24 23 27 26 34Z" fill="#f39c12"/>
                  <ellipse cx="26" cy="33" rx="9" ry="7" fill="#fff"/>
                  <circle cx="26" cy="22" r="5" fill="#fff"/>
                  <path d="M26 24 L24.2 25.5 L27.8 25.5Z" fill="#f39c12"/>
                  <circle cx="27.5" cy="21.5" r="1" fill="#c0392b"/>
                  <path d="M24 18 C24 15 26 14 26 17 C26 14 28 13 28 17 C28 14 30 14 29 17" stroke="#e74c3c" stroke-width="1.2" fill="none" stroke-linecap="round"/>
                </svg>
              </div>
              <h2 class="login-card__title">Espace Administrateur</h2>
              <p class="login-card__sub">Belchiken — Mode Caisse</p>

              <div class="login-form">
                <div class="login-input-wrap" :class="{ 'login-input-wrap--error': loginError }">
                  <span class="login-input-icon">🔑</span>
                  <input
                    v-model="password"
                    :type="showPwd ? 'text' : 'password'"
                    class="login-input"
                    placeholder="Mot de passe"
                    @keydown.enter="tryLogin"
                    ref="pwdInput"
                  />
                  <button class="login-eye" @click="showPwd = !showPwd">
                    {{ showPwd ? '🙈' : '👁️' }}
                  </button>
                </div>
                <p v-if="loginError" class="login-error">{{ loginError }}</p>

                <button class="login-btn" @click="tryLogin">
                  Accéder au tableau de bord →
                </button>

                <p class="login-hint">Mot de passe démo : <code>admin123</code></p>
              </div>

              <button class="login-back" @click="$emit('update:modelValue', false)">
                ← Retour au menu
              </button>
            </div>
          </div>

          <!-- ── Dashboard ─────────────────────────────── -->
          <div v-else key="dashboard" class="admin-dashboard">

            <!-- Sidebar -->
            <aside class="admin-sidebar">
              <div class="admin-sidebar__brand">
                <svg class="admin-sidebar__logo-svg" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                  <p class="admin-sidebar__name">Belchiken</p>
                  <p class="admin-sidebar__role">Admin · Caisse</p>
                </div>
              </div>

              <nav class="admin-nav">
                <button
                  v-for="tab in TABS"
                  :key="tab.id"
                  class="admin-nav__btn"
                  :class="{ 'admin-nav__btn--active': activeTab === tab.id }"
                  @click="activeTab = tab.id"
                >
                  <span class="admin-nav__icon">{{ tab.icon }}</span>
                  <span class="admin-nav__label">{{ tab.label }}</span>
                  <span v-if="tab.badge" class="admin-nav__badge">{{ tab.badge }}</span>
                </button>
              </nav>

              <div class="admin-sidebar__footer">
                <button class="admin-logout" @click="logout">
                  🚪 Déconnexion
                </button>
                <button class="admin-close" @click="$emit('update:modelValue', false)">
                  ✕ Fermer
                </button>
              </div>
            </aside>

            <!-- Contenu principal -->
            <main class="admin-main">
              <div class="admin-main__header">
                <div>
                  <h1 class="admin-main__title">{{ currentTab?.label }}</h1>
                  <p class="admin-main__date">{{ todayLabel }}</p>
                </div>
                <!-- Live clock -->
                <span class="admin-clock">{{ clock }}</span>
              </div>

              <div class="admin-main__content">
                <Transition name="tab-fade" mode="out-in">
                  <component :is="activeTab === 'stats' ? AdminStats : AdminOrders" :key="activeTab" />
                </Transition>
              </div>
            </main>

          </div>
        </Transition>

      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AdminStats  from '@/components/admin/AdminStats.vue'
import AdminOrders from '@/components/admin/AdminOrders.vue'
import { useOrderHistoryStore } from '@/stores/orderHistoryStore'

// ── Props / Emits ────────────────────────────────────────────
defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

// ── Auth (démo — mot de passe en clair) ──────────────────────
const ADMIN_PASSWORD = 'admin123'
const authenticated  = ref(false)
const password       = ref('')
const showPwd        = ref(false)
const loginError     = ref('')
const pwdInput       = ref<HTMLInputElement | null>(null)

function tryLogin() {
  if (password.value === ADMIN_PASSWORD) {
    authenticated.value = true
    loginError.value    = ''
  } else {
    loginError.value = 'Mot de passe incorrect'
    password.value   = ''
    pwdInput.value?.focus()
  }
}

function logout() {
  authenticated.value = false
  password.value      = ''
}

// ── Onglets ──────────────────────────────────────────────────
const history  = useOrderHistoryStore()
const activeTab = ref('stats')

const TABS = computed(() => [
  { id: 'stats',  icon: '📊', label: 'Statistiques', badge: null },
  { id: 'orders', icon: '🧾', label: 'Commandes',    badge: history.todayOrders.filter(o => o.status === 'pending').length || null },
])

const currentTab = computed(() => TABS.value.find(t => t.id === activeTab.value))

// ── Date + horloge ───────────────────────────────────────────
const todayLabel = computed(() =>
  new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
)

const clock = ref('')
let clockTimer: ReturnType<typeof setInterval>

function updateClock() {
  clock.value = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

onMounted(() => { updateClock(); clockTimer = setInterval(updateClock, 1000) })
onUnmounted(() => clearInterval(clockTimer))
</script>

<style scoped>
/* ── Overlay ────────────────────────────────────────────── */
.admin-overlay {
  position: fixed;
  inset: 0;
  z-index: 600;
  background: #0e0603;
  display: flex;
  overflow: hidden;
}

/* ── Login ──────────────────────────────────────────────── */
.admin-login {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0e0603;
  padding: 20px;
}

.login-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  padding: 40px 36px;
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.6);
}

.login-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 4px 12px rgba(192,57,43,0.4));
}

.login-card__title {
  color: #fff;
  font-size: 1.2rem;
  font-weight: 800;
  margin: 0;
  text-align: center;
}

.login-card__sub {
  color: rgba(255,255,255,0.35);
  font-size: 0.8rem;
  margin: 0;
}

.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}

.login-input-wrap {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  padding: 0 14px;
  gap: 10px;
  transition: border-color 0.2s;
}

.login-input-wrap:focus-within { border-color: var(--color-primary,#e67e22); }
.login-input-wrap--error       { border-color: #e74c3c; }

.login-input-icon { font-size: 1rem; opacity: 0.5; }

.login-input {
  flex: 1;
  border: none; outline: none;
  background: transparent;
  color: #fff;
  font-size: 0.95rem;
  padding: 13px 0;
  font-family: inherit;
}

.login-eye {
  background: none; border: none;
  cursor: pointer; font-size: 1rem;
  padding: 4px; color: rgba(255,255,255,0.4);
  font-family: inherit;
}

.login-error {
  color: #e74c3c;
  font-size: 0.78rem;
  font-weight: 600;
  margin: 0;
  text-align: center;
}

.login-btn {
  width: 100%;
  padding: 13px;
  border-radius: 30px;
  border: none;
  background: var(--color-primary,#e67e22);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  font-family: inherit;
}
.login-btn:hover { background: var(--color-primary-dark,#cf6d17); }

.login-hint {
  color: rgba(255,255,255,0.25);
  font-size: 0.72rem;
  text-align: center;
  margin: 0;
}
.login-hint code {
  background: rgba(255,255,255,0.08);
  padding: 2px 7px;
  border-radius: 6px;
  color: var(--color-primary,#e67e22);
}

.login-back {
  background: none; border: none;
  color: rgba(255,255,255,0.3);
  font-size: 0.8rem;
  cursor: pointer;
  margin-top: 4px;
  font-family: inherit;
  transition: color 0.2s;
}
.login-back:hover { color: rgba(255,255,255,0.7); }

/* ── Dashboard layout ───────────────────────────────────── */
.admin-dashboard {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* Sidebar */
.admin-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #160a02;
  border-right: 1px solid rgba(255,255,255,0.07);
  display: flex;
  flex-direction: column;
  padding: 20px 0;
}

.admin-sidebar__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  margin-bottom: 16px;
}

.admin-sidebar__logo-svg {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.admin-sidebar__name {
  color: #fff;
  font-size: 0.9rem;
  font-weight: 800;
  margin: 0;
}

.admin-sidebar__role {
  color: rgba(255,255,255,0.3);
  font-size: 0.68rem;
  margin: 0;
}

.admin-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 12px;
}

.admin-nav__btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.5);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  font-family: inherit;
}
.admin-nav__btn:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.85); }
.admin-nav__btn--active { background: rgba(230,126,34,0.15); color: var(--color-primary,#e67e22); }

.admin-nav__icon { font-size: 1.1rem; flex-shrink: 0; }
.admin-nav__label { flex: 1; }

.admin-nav__badge {
  background: #e74c3c;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 800;
  min-width: 18px; height: 18px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  padding: 0 5px;
}

.admin-sidebar__footer {
  padding: 16px 12px 0;
  border-top: 1px solid rgba(255,255,255,0.06);
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.admin-logout, .admin-close {
  padding: 9px 14px;
  border-radius: 10px;
  border: none;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;
  text-align: left;
}

.admin-logout {
  background: rgba(231,76,60,0.1);
  color: #e74c3c;
}
.admin-logout:hover { background: rgba(231,76,60,0.2); }

.admin-close {
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.4);
}
.admin-close:hover { background: rgba(255,255,255,0.1); color: #fff; }

/* Main */
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-main__header {
  padding: 20px 28px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.admin-main__title {
  color: #fff;
  font-size: 1.2rem;
  font-weight: 800;
  margin: 0 0 2px;
}

.admin-main__date {
  color: rgba(255,255,255,0.3);
  font-size: 0.75rem;
  margin: 0;
  text-transform: capitalize;
}

.admin-clock {
  color: var(--color-primary,#e67e22);
  font-size: 1.1rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  font-family: 'Courier New', monospace;
}

.admin-main__content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 28px 32px;
  scrollbar-width: thin;
  scrollbar-color: rgba(230,126,34,0.3) transparent;
}

/* ── Transitions ─────────────────────────────────────────── */
.admin-fade-enter-active, .admin-fade-leave-active { transition: opacity 0.25s ease; }
.admin-fade-enter-from, .admin-fade-leave-to { opacity: 0; }

.login-slide-enter-active, .login-slide-leave-active { transition: all 0.3s ease; }
.login-slide-enter-from { opacity: 0; transform: translateY(20px); }
.login-slide-leave-to   { opacity: 0; transform: translateY(-20px); }

.tab-fade-enter-active, .tab-fade-leave-active { transition: all 0.2s ease; }
.tab-fade-enter-from, .tab-fade-leave-to { opacity: 0; transform: translateX(10px); }

/* ── Responsive mobile ───────────────────────────────────── */
@media (max-width: 640px) {
  .admin-sidebar { width: 60px; }
  .admin-sidebar__brand, .admin-sidebar__name,
  .admin-sidebar__role, .admin-nav__label,
  .admin-logout, .admin-close { display: none; }
  .admin-nav__btn { justify-content: center; padding: 12px; }
  .admin-main__content { padding: 16px; }
  .admin-main__header { padding: 16px; }
}
</style>
