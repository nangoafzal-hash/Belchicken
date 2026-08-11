<template>
  <div class="delivery">

    <!-- ── Titre section ─────────────────────────────────── -->
    <div class="delivery__header">
      <span class="delivery__header-icon">🛵</span>
      <div>
        <h3 class="delivery__title">Zone de livraison</h3>
        <p class="delivery__subtitle">Ouagadougou et environs</p>
      </div>
    </div>

    <!-- ── Champ de recherche de zone ────────────────────── -->
    <div class="delivery__search-wrap">
      <span class="delivery__search-icon">📍</span>
      <input
        v-model="searchQuery"
        type="text"
        class="delivery__search"
        placeholder="Tapez votre quartier..."
        @focus="isOpen = true"
        @blur="onBlur"
        aria-label="Rechercher un quartier"
        autocomplete="off"
      />
      <button
        v-if="searchQuery || cart.selectedZone"
        class="delivery__clear"
        @mousedown.prevent="clearZone"
        aria-label="Effacer"
      >✕</button>
    </div>

    <!-- ── Dropdown des zones ─────────────────────────────── -->
    <Transition name="dropdown">
      <div v-if="isOpen && filteredZones.length" class="delivery__dropdown">
        <!-- Groupé par anneau -->
        <template v-for="ring in [1, 2, 3, 4]" :key="ring">
          <template v-if="zonesByRing(ring).length">
            <!-- Label anneau -->
            <div class="delivery__ring-label">
              <span
                class="delivery__ring-dot"
                :style="{ background: RING_COLORS[ring] }"
              />
              {{ RING_LABELS[ring] }} —
              <strong>{{ formatPrice(ringFee(ring)) }}</strong>
              · {{ ringDelay(ring) }}
            </div>
            <!-- Articles de la zone -->
            <button
              v-for="zone in zonesByRing(ring)"
              :key="zone.id"
              class="delivery__option"
              :class="{ 'delivery__option--active': cart.selectedZone?.id === zone.id }"
              @mousedown.prevent="selectZone(zone)"
            >
              <span class="delivery__option-name">{{ zone.name }}</span>
              <span v-if="zone.sector" class="delivery__option-sector">{{ zone.sector }}</span>
              <span
                class="delivery__option-fee"
                :style="{ color: RING_COLORS[ring] }"
              >
                {{ formatPrice(zone.fee) }}
              </span>
            </button>
          </template>
        </template>
      </div>
    </Transition>

    <!-- ── Zone sélectionnée — carte récap ───────────────── -->
    <Transition name="zone-card">
      <div
        v-if="cart.selectedZone && !isOpen"
        class="delivery__selected"
        :style="{ borderColor: RING_COLORS[cart.selectedZone.ring] + '55' }"
      >
        <!-- Indicateur anneau -->
        <div
          class="delivery__selected-ring"
          :style="{ background: RING_COLORS[cart.selectedZone.ring] }"
        >
          {{ RING_LABELS[cart.selectedZone.ring] }}
        </div>

        <div class="delivery__selected-body">
          <div class="delivery__selected-left">
            <p class="delivery__selected-name">📍 {{ cart.selectedZone.name }}</p>
            <p v-if="cart.selectedZone.sector" class="delivery__selected-sector">
              {{ cart.selectedZone.sector }}
            </p>
            <p class="delivery__selected-desc">{{ cart.selectedZone.description }}</p>
          </div>

          <div class="delivery__selected-right">
            <p class="delivery__selected-fee">
              {{ formatPrice(cart.selectedZone.fee) }}
            </p>
            <p class="delivery__selected-delay">
              ⏱ {{ formatDelay(cart.selectedZone.minDelay, cart.selectedZone.maxDelay) }}
            </p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Message si aucune zone sélectionnée ───────────── -->
    <p v-if="!cart.selectedZone && !isOpen" class="delivery__hint">
      Sélectionnez votre quartier pour calculer les frais de livraison
    </p>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  DELIVERY_ZONES_SORTED,
  RING_LABELS,
  RING_COLORS,
  formatDelay,
  type DeliveryZone,
} from '@/data/deliveryZones'
import { formatPrice } from '@/data/menuData.ts'
import { useCartStore } from '@/stores/cartStore'

const cart        = useCartStore()
const searchQuery = ref(cart.selectedZone?.name ?? '')
const isOpen      = ref(false)

// ── Filtrage par recherche ────────────────────────────────────
const filteredZones = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return DELIVERY_ZONES_SORTED
  return DELIVERY_ZONES_SORTED.filter(z =>
    z.name.toLowerCase().includes(q) ||
    (z.sector ?? '').toLowerCase().includes(q) ||
    z.description.toLowerCase().includes(q)
  )
})

// ── Zones par anneau (dans les résultats filtrés) ─────────────
function zonesByRing(ring: number): DeliveryZone[] {
  return filteredZones.value.filter(z => z.ring === ring)
}

// ── Premier tarif de l'anneau (tous identiques) ───────────────
function ringFee(ring: number): number {
  return filteredZones.value.find(z => z.ring === ring)?.fee ?? 0
}

function ringDelay(ring: number): string {
  const z = filteredZones.value.find(z => z.ring === ring)
  return z ? formatDelay(z.minDelay, z.maxDelay) : ''
}

// ── Sélectionner une zone ─────────────────────────────────────
function selectZone(zone: DeliveryZone) {
  cart.setDeliveryZone(zone)
  searchQuery.value = zone.name
  isOpen.value      = false
}

// ── Effacer la zone ───────────────────────────────────────────
function clearZone() {
  cart.setDeliveryZone(null)
  searchQuery.value = ''
  isOpen.value      = false
}

// ── Fermer le dropdown au blur (avec délai pour mousedown) ────
function onBlur() {
  setTimeout(() => { isOpen.value = false }, 150)
}
</script>

<style scoped>
.delivery {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ── Header ─────────────────────────────────────────────── */
.delivery__header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.delivery__header-icon {
  font-size: 1.4rem;
}

.delivery__title {
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  margin: 0;
}

.delivery__subtitle {
  color: rgba(255,255,255,0.4);
  font-size: 0.72rem;
  margin: 0;
}

/* ── Champ recherche ────────────────────────────────────── */
.delivery__search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 12px;
  padding: 0 12px;
  gap: 8px;
  transition: border-color 0.2s;
}

.delivery__search-wrap:focus-within {
  border-color: var(--color-primary, #e67e22);
  background: rgba(230,126,34,0.06);
}

.delivery__search-icon {
  font-size: 1rem;
  flex-shrink: 0;
  opacity: 0.6;
}

.delivery__search {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  color: #fff;
  font-size: 0.88rem;
  padding: 12px 0;
  font-family: inherit;
}

.delivery__search::placeholder {
  color: rgba(255,255,255,0.3);
}

.delivery__clear {
  background: none;
  border: none;
  color: rgba(255,255,255,0.35);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
  font-family: inherit;
}

.delivery__clear:hover { color: #fff; }

/* ── Dropdown ────────────────────────────────────────────── */
.delivery__dropdown {
  background: #160b03;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  overflow: hidden;
  max-height: 260px;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  scrollbar-width: thin;
  scrollbar-color: rgba(230,126,34,0.3) transparent;
}

/* Label anneau */
.delivery__ring-label {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px 4px;
  font-size: 0.7rem;
  color: rgba(255,255,255,0.4);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: rgba(255,255,255,0.03);
  border-top: 1px solid rgba(255,255,255,0.06);
}

.delivery__ring-label:first-child {
  border-top: none;
}

.delivery__ring-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Option individuelle */
.delivery__option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
  text-align: left;
}

.delivery__option:hover {
  background: rgba(230,126,34,0.1);
}

.delivery__option--active {
  background: rgba(230,126,34,0.15);
}

.delivery__option-name {
  flex: 1;
  color: rgba(255,255,255,0.85);
  font-size: 0.85rem;
  font-weight: 600;
}

.delivery__option-sector {
  color: rgba(255,255,255,0.3);
  font-size: 0.72rem;
}

.delivery__option-fee {
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}

/* ── Zone sélectionnée ───────────────────────────────────── */
.delivery__selected {
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04);
  overflow: hidden;
}

.delivery__selected-ring {
  padding: 4px 12px;
  font-size: 0.68rem;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.delivery__selected-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px 12px;
  gap: 10px;
}

.delivery__selected-left { flex: 1; }

.delivery__selected-name {
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  margin: 0 0 2px;
}

.delivery__selected-sector {
  color: rgba(255,255,255,0.4);
  font-size: 0.72rem;
  margin: 0 0 2px;
}

.delivery__selected-desc {
  color: rgba(255,255,255,0.35);
  font-size: 0.72rem;
  margin: 0;
  font-style: italic;
}

.delivery__selected-right {
  text-align: right;
  flex-shrink: 0;
}

.delivery__selected-fee {
  color: var(--color-primary, #e67e22);
  font-size: 1.05rem;
  font-weight: 900;
  margin: 0 0 3px;
}

.delivery__selected-delay {
  color: rgba(255,255,255,0.4);
  font-size: 0.72rem;
  margin: 0;
}

/* ── Hint ────────────────────────────────────────────────── */
.delivery__hint {
  color: rgba(255,255,255,0.25);
  font-size: 0.75rem;
  text-align: center;
  margin: 0;
  font-style: italic;
  padding: 4px 0;
}

/* ── Transitions ─────────────────────────────────────────── */
.dropdown-enter-active { transition: all 0.2s ease; }
.dropdown-leave-active { transition: all 0.15s ease; }
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.zone-card-enter-active { transition: all 0.25s ease; }
.zone-card-leave-active { transition: all 0.15s ease; }
.zone-card-enter-from, .zone-card-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
