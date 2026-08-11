<template>
  <div class="orders">

    <!-- ── Barre de filtre ────────────────────────────────── -->
    <div class="orders__toolbar">
      <div class="orders__filters">
        <button
          v-for="f in FILTERS"
          :key="f.value"
          class="filter-btn"
          :class="{ 'filter-btn--active': activeFilter === f.value }"
          @click="activeFilter = f.value"
        >
          {{ f.label }}
          <span class="filter-btn__count">{{ countByStatus(f.value) }}</span>
        </button>
      </div>

      <button
        v-if="history.orders.length"
        class="orders__clear-btn"
        @click="confirmClear"
      >
        🗑️ Tout effacer
      </button>
    </div>

    <!-- ── Liste des commandes ────────────────────────────── -->
    <div v-if="filteredOrders.length" class="orders__list">
      <div
        v-for="order in filteredOrders"
        :key="order.ref"
        class="order-card"
        :class="`order-card--${order.status}`"
      >
        <!-- Header commande -->
        <div class="order-card__header">
          <div class="order-card__header-left">
            <span class="order-card__ref">{{ order.ref }}</span>
            <span
              class="order-card__status"
              :style="{ background: history.STATUS_COLORS[order.status] + '22', color: history.STATUS_COLORS[order.status], borderColor: history.STATUS_COLORS[order.status] + '44' }"
            >
              {{ history.STATUS_LABELS[order.status] }}
            </span>
          </div>
          <span class="order-card__time">{{ formatDate(order.createdAt) }}</span>
        </div>

        <!-- Infos client -->
        <div class="order-card__customer">
          <span>👤 <strong>{{ order.customer.name }}</strong></span>
          <span>📱 {{ order.customer.phone }}</span>
          <span>📍 {{ order.customer.address }}</span>
          <span v-if="order.customer.landmark">🏪 {{ order.customer.landmark }}</span>
        </div>

        <!-- Articles -->
        <div class="order-card__items">
          <div
            v-for="item in order.items"
            :key="item.cartItemId"
            class="order-item"
          >
            <span class="order-item__qty">×{{ item.quantity }}</span>
            <span class="order-item__name">{{ item.name }}</span>
            <span class="order-item__price">{{ formatPrice(item.totalPrice) }}</span>
          </div>
        </div>

        <!-- Footer financier -->
        <div class="order-card__footer">
          <div class="order-card__amounts">
            <span>🛵 {{ order.zone.name }} · {{ formatPrice(order.deliveryFee) }}</span>
            <span class="order-card__total">Total : <strong>{{ formatPrice(order.grandTotal) }}</strong></span>
          </div>

          <!-- Actions statut -->
          <div class="order-card__actions">
            <button
              v-for="s in STATUSES"
              :key="s.value"
              class="status-btn"
              :class="{ 'status-btn--active': order.status === s.value }"
              :style="order.status === s.value ? { background: history.STATUS_COLORS[s.value], borderColor: history.STATUS_COLORS[s.value] } : {}"
              @click="history.setStatus(order.ref, s.value)"
            >
              {{ s.label }}
            </button>

            <button class="status-btn status-btn--delete" @click="history.removeOrder(order.ref)" title="Supprimer">
              🗑️
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- Vide -->
    <div v-else class="orders__empty">
      <span class="orders__empty-icon">📭</span>
      <p>Aucune commande {{ activeFilter !== 'all' ? `"${activeFilter}"` : '' }}</p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useOrderHistoryStore, type OrderStatus } from '@/stores/orderHistoryStore'
import { formatPrice } from '@/data/menuData.ts'

const history = useOrderHistoryStore()

const FILTERS = [
  { value: 'all',       label: 'Toutes' },
  { value: 'pending',   label: '⏳ En attente' },
  { value: 'confirmed', label: '✅ Confirmées' },
  { value: 'delivered', label: '🛵 Livrées' },
  { value: 'cancelled', label: '❌ Annulées' },
] as const

const STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'pending',   label: '⏳' },
  { value: 'confirmed', label: '✅' },
  { value: 'delivered', label: '🛵' },
  { value: 'cancelled', label: '❌' },
]

const activeFilter = ref<'all' | OrderStatus>('all')

const filteredOrders = computed(() => {
  if (activeFilter.value === 'all') return history.orders
  return history.orders.filter(o => o.status === activeFilter.value)
})

function countByStatus(filter: string): number {
  if (filter === 'all') return history.orders.length
  return history.orders.filter(o => o.status === filter).length
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('fr-FR', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })
}

function confirmClear() {
  if (confirm('Effacer tout l\'historique des commandes ?')) {
    history.clearHistory()
  }
}
</script>

<style scoped>
.orders { display: flex; flex-direction: column; gap: 16px; }

/* Toolbar */
.orders__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.orders__filters { display: flex; gap: 6px; flex-wrap: wrap; }

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.55);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.filter-btn:hover { border-color: rgba(255,255,255,0.3); color: #fff; }
.filter-btn--active { background: var(--color-primary,#e67e22); border-color: var(--color-primary,#e67e22); color: #fff; }

.filter-btn__count {
  background: rgba(0,0,0,0.25);
  border-radius: 10px;
  padding: 1px 6px;
  font-size: 0.7rem;
}

.orders__clear-btn {
  background: rgba(231,76,60,0.12);
  border: 1px solid rgba(231,76,60,0.25);
  color: #e74c3c;
  border-radius: 20px;
  padding: 7px 14px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;
}
.orders__clear-btn:hover { background: rgba(231,76,60,0.22); }

/* Liste */
.orders__list { display: flex; flex-direction: column; gap: 12px; }

/* Carte commande */
.order-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  overflow: hidden;
  transition: border-color 0.2s;
}
.order-card--pending   { border-left: 3px solid #f39c12; }
.order-card--confirmed { border-left: 3px solid #27ae60; }
.order-card--delivered { border-left: 3px solid #2980b9; }
.order-card--cancelled { border-left: 3px solid #e74c3c; opacity: 0.65; }

.order-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 8px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.order-card__header-left { display: flex; align-items: center; gap: 10px; }

.order-card__ref {
  color: #fff;
  font-size: 0.85rem;
  font-weight: 800;
  font-family: 'Courier New', monospace;
}

.order-card__status {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid;
}

.order-card__time {
  color: rgba(255,255,255,0.3);
  font-size: 0.72rem;
}

.order-card__customer {
  padding: 10px 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.order-card__customer span {
  color: rgba(255,255,255,0.6);
  font-size: 0.78rem;
}

.order-card__customer strong { color: #fff; }

/* Articles */
.order-card__items {
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.order-item {
  display: grid;
  grid-template-columns: 28px 1fr auto;
  gap: 8px;
  align-items: center;
}

.order-item__qty {
  color: var(--color-primary,#e67e22);
  font-size: 0.78rem;
  font-weight: 700;
}

.order-item__name {
  color: rgba(255,255,255,0.75);
  font-size: 0.8rem;
}

.order-item__price {
  color: rgba(255,255,255,0.4);
  font-size: 0.75rem;
}

/* Footer */
.order-card__footer {
  padding: 10px 16px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.order-card__amounts {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.4);
}

.order-card__total { color: rgba(255,255,255,0.8); }
.order-card__total strong { color: var(--color-primary,#e67e22); }

.order-card__actions { display: flex; gap: 6px; align-items: center; }

.status-btn {
  width: 34px; height: 34px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.6);
  font-size: 0.85rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
  font-family: inherit;
}
.status-btn:hover { border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); }
.status-btn--active { color: #fff; }
.status-btn--delete { border-color: rgba(231,76,60,0.2); color: #e74c3c; }
.status-btn--delete:hover { background: rgba(231,76,60,0.15); }

/* Vide */
.orders__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 50px 20px;
  color: rgba(255,255,255,0.2);
  font-size: 0.88rem;
}
.orders__empty-icon { font-size: 2.5rem; opacity: 0.3; }
</style>
