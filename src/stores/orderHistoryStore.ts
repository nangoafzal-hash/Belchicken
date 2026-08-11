// ============================================================
//  BELCHIKEN — Store historique des commandes (localStorage)
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartItem }     from '@/stores/cartStore'
import type { DeliveryZone } from '@/data/deliveryZones'
import type { CustomerInfo } from '@/composables/useOrderFormatter'
import { formatPrice }       from '@/data/menuData.ts'

// ── Types ────────────────────────────────────────────────────
export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled'

export interface Order {
  ref:         string
  createdAt:   string        // ISO string
  customer:    CustomerInfo
  zone:        DeliveryZone
  items:       CartItem[]
  subtotal:    number
  deliveryFee: number
  grandTotal:  number
  status:      OrderStatus
}

// ── Helpers localStorage ─────────────────────────────────────
const STORAGE_KEY = 'belchiken_orders'

function load(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Order[]) : []
  } catch { return [] }
}

function save(orders: Order[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(orders)) } catch { /* noop */ }
}

// ── Store ────────────────────────────────────────────────────
export const useOrderHistoryStore = defineStore('orderHistory', () => {

  const orders = ref<Order[]>(load())

  // ── Enregistrer une commande ────────────────────────────
  function addOrder(payload: Omit<Order, 'ref' | 'createdAt' | 'status'>) {
    const order: Order = {
      ...payload,
      ref:       `BK-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      createdAt: new Date().toISOString(),
      status:    'pending',
    }
    orders.value.unshift(order)   // plus récent en premier
    save(orders.value)
    return order
  }

  // ── Changer le statut ───────────────────────────────────
  function setStatus(ref: string, status: OrderStatus) {
    const o = orders.value.find(o => o.ref === ref)
    if (o) { o.status = status; save(orders.value) }
  }

  // ── Supprimer une commande ──────────────────────────────
  function removeOrder(ref: string) {
    orders.value = orders.value.filter(o => o.ref !== ref)
    save(orders.value)
  }

  // ── Vider l'historique ──────────────────────────────────
  function clearHistory() {
    orders.value = []
    save(orders.value)
  }

  // ── Commandes du jour ───────────────────────────────────
  const todayOrders = computed(() => {
    const today = new Date().toDateString()
    return orders.value.filter(o => new Date(o.createdAt).toDateString() === today)
  })

  // ── CA du jour (hors commandes annulées) ─────────────────
  const todayRevenue = computed(() =>
    todayOrders.value
      .filter(o => o.status !== 'cancelled')
      .reduce((s, o) => s + o.grandTotal, 0)
  )

  const todayRevenueFormatted = computed(() => formatPrice(todayRevenue.value))

  // ── Nombre de commandes du jour ──────────────────────────
  const todayCount = computed(() => todayOrders.value.length)

  // ── Plats les plus vendus aujourd'hui ────────────────────
  const topItemsToday = computed(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>()
    todayOrders.value
      .filter(o => o.status !== 'cancelled')
      .forEach(o => {
        o.items.forEach(item => {
          const existing = map.get(item.name)
          if (existing) {
            existing.qty     += item.quantity
            existing.revenue += item.totalPrice
          } else {
            map.set(item.name, {
              name:    item.name,
              qty:     item.quantity,
              revenue: item.totalPrice,
            })
          }
        })
      })
    return [...map.values()].sort((a, b) => b.qty - a.qty)
  })

  // ── CA par heure (pour graphique) ───────────────────────
  const revenueByHour = computed(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, revenue: 0 }))
    todayOrders.value
      .filter(o => o.status !== 'cancelled')
      .forEach(o => {
        const h = new Date(o.createdAt).getHours()
        hours[h].revenue += o.grandTotal
      })
    return hours
  })

  // ── Statut libellé ──────────────────────────────────────
  const STATUS_LABELS: Record<OrderStatus, string> = {
    pending:   '⏳ En attente',
    confirmed: '✅ Confirmée',
    delivered: '🛵 Livrée',
    cancelled: '❌ Annulée',
  }

  const STATUS_COLORS: Record<OrderStatus, string> = {
    pending:   '#f39c12',
    confirmed: '#27ae60',
    delivered: '#2980b9',
    cancelled: '#e74c3c',
  }

  return {
    orders,
    todayOrders,
    todayRevenue,
    todayRevenueFormatted,
    todayCount,
    topItemsToday,
    revenueByHour,
    STATUS_LABELS,
    STATUS_COLORS,
    addOrder,
    setStatus,
    removeOrder,
    clearHistory,
  }
})
