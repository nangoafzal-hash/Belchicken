import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { SAUCES, SPICE_OPTIONS, DRINK_SIZES, formatPrice } from '@/data/menuData.ts'
import { type DeliveryZone } from '@/data/deliveryZones'

// ── Types ────────────────────────────────────────────────────
export interface CartItem {
  cartItemId:  string
  id:          number
  name:        string
  image:       string
  category:    string
  quantity:    number
  unitPrice:   number
  totalPrice:  number
  spice:       string | null
  sauce:       string | null
  drinkSize:   string | null
  specialNote: string | null
}

export interface PersistedCart {
  items:        CartItem[]
  selectedZone: DeliveryZone | null
}

// ── Labels lisibles ──────────────────────────────────────────
export function getSpiceLabel(id: string | null): string {
  if (!id) return ''
  return SPICE_OPTIONS.find((s: { id: string; label: string }) => s.id === id)?.label ?? id
}

export function getSauceLabel(id: string | null): string {
  if (!id) return ''
  return SAUCES.find((s: { id: string; label: string }) => s.id === id)?.label ?? id
}

export function getSizeLabel(id: string | null): string {
  if (!id) return ''
  return DRINK_SIZES.find((s: { id: string; label: string }) => s.id === id)?.label ?? id
}

// ── LocalStorage ─────────────────────────────────────────────
const STORAGE_KEY = 'belchiken_cart_v2'

function loadFromStorage(): PersistedCart {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { items: [], selectedZone: null }
    const parsed = JSON.parse(raw) as PersistedCart
    return {
      items:        Array.isArray(parsed.items) ? parsed.items : [],
      selectedZone: parsed.selectedZone ?? null,
    }
  } catch {
    return { items: [], selectedZone: null }
  }
}

function saveToStorage(data: PersistedCart): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch { /* storage indisponible */ }
}

// ── Store ────────────────────────────────────────────────────
export const useCartStore = defineStore('cart', () => {

  const persisted = loadFromStorage()

  // ── State ──────────────────────────────────────────────────
  const items        = ref<CartItem[]>(persisted.items)
  const selectedZone = ref<DeliveryZone | null>(persisted.selectedZone)
  const isOpen       = ref(false)

  // ── Persistance auto ──────────────────────────────────────
  watch(
    () => ({ items: items.value, selectedZone: selectedZone.value }),
    (val) => saveToStorage(val),
    { deep: true }
  )

  // ── Getters ───────────────────────────────────────────────

  /** Nb total d'articles */
  const totalCount = computed(() =>
    items.value.reduce((sum, i) => sum + i.quantity, 0)
  )

  /** Sous-total articles */
  const subtotal = computed(() =>
    items.value.reduce((sum, i) => sum + i.totalPrice, 0)
  )

  /** Frais de livraison */
  const deliveryFee = computed(() => selectedZone.value?.fee ?? 0)

  /** Total à payer (articles + livraison) */
  const grandTotal = computed(() => subtotal.value + deliveryFee.value)

  // Formatés
  const subtotalFormatted  = computed(() => formatPrice(subtotal.value))
  const deliveryFormatted  = computed(() =>
    selectedZone.value ? formatPrice(deliveryFee.value) : 'À calculer'
  )
  const grandTotalFormatted = computed(() =>
    selectedZone.value ? formatPrice(grandTotal.value) : formatPrice(subtotal.value)
  )

  /** Panier vide ? */
  const isEmpty = computed(() => items.value.length === 0)

  // ── Actions ───────────────────────────────────────────────

  function addItem(payload: Omit<CartItem, 'totalPrice'> & { totalPrice?: number }) {
    const unitPrice  = payload.unitPrice
    const totalPrice = payload.totalPrice ?? unitPrice * payload.quantity
    items.value.push({
      cartItemId:  payload.cartItemId,
      id:          payload.id,
      name:        payload.name,
      image:       payload.image,
      category:    payload.category,
      quantity:    payload.quantity,
      unitPrice,
      totalPrice,
      spice:       payload.spice       ?? null,
      sauce:       payload.sauce       ?? null,
      drinkSize:   payload.drinkSize   ?? null,
      specialNote: payload.specialNote ?? null,
    })
    isOpen.value = true
  }

  function removeItem(cartItemId: string) {
    items.value = items.value.filter(i => i.cartItemId !== cartItemId)
  }

  function updateQuantity(cartItemId: string, quantity: number) {
    if (quantity <= 0) { removeItem(cartItemId); return }
    const item = items.value.find(i => i.cartItemId === cartItemId)
    if (!item) return
    item.quantity   = quantity
    item.totalPrice = item.unitPrice * quantity
  }

  function increment(cartItemId: string) {
    const item = items.value.find(i => i.cartItemId === cartItemId)
    if (!item) return
    item.quantity++
    item.totalPrice = item.unitPrice * item.quantity
  }

  function decrement(cartItemId: string) {
    const item = items.value.find(i => i.cartItemId === cartItemId)
    if (!item) return
    if (item.quantity <= 1) { removeItem(cartItemId); return }
    item.quantity--
    item.totalPrice = item.unitPrice * item.quantity
  }

  function clearCart() {
    items.value        = []
    selectedZone.value = null
  }

  /** Définir ou effacer la zone de livraison */
  function setDeliveryZone(zone: DeliveryZone | null) {
    selectedZone.value = zone
  }

  // Drawer
  function openCart()   { isOpen.value = true  }
  function closeCart()  { isOpen.value = false }
  function toggleCart() { isOpen.value = !isOpen.value }

  return {
    // State
    items,
    isOpen,
    selectedZone,
    // Getters
    totalCount,
    subtotal,
    deliveryFee,
    grandTotal,
    subtotalFormatted,
    deliveryFormatted,
    grandTotalFormatted,
    isEmpty,
    // Actions
    addItem,
    removeItem,
    updateQuantity,
    increment,
    decrement,
    clearCart,
    setDeliveryZone,
    openCart,
    closeCart,
    toggleCart,
  }
})
