<template>
  <MenuPage />
  <CartDrawer @proceed-to-order="checkoutOpen = true" />
  <CheckoutModal v-model="checkoutOpen" @order-sent="onOrderSent" />
  <AdminView v-model="adminOpen" />

  <!-- Bouton flottant Admin -->
  <button class="admin-fab" @click="adminOpen = true" title="Espace Admin">
    ⚙️
  </button>

  <!-- Toast confirmation commande -->
  <Transition name="toast">
    <div v-if="orderToastVisible" class="order-toast">
      🎉 Commande envoyée ! Belchiken vous contacte bientôt.
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MenuPage       from '@/components/MenuPage.vue'
import CartDrawer     from '@/components/CartDrawer.vue'
import CheckoutModal  from '@/components/CheckoutModal.vue'
import AdminView      from '@/components/admin/AdminView.vue'
import { useCartStore }         from '@/stores/cartStore'
import { useOrderHistoryStore } from '@/stores/orderHistoryStore'
import type { CustomerInfo }    from '@/composables/useOrderFormatter'

const cart    = useCartStore()
const history = useOrderHistoryStore()

const checkoutOpen      = ref(false)
const adminOpen         = ref(false)
const orderToastVisible = ref(false)

function onOrderSent(customer: CustomerInfo) {
  if (cart.selectedZone) {
    history.addOrder({
      customer,
      zone:        cart.selectedZone,
      items:       [...cart.items],
      subtotal:    cart.subtotal,
      deliveryFee: cart.deliveryFee,
      grandTotal:  cart.grandTotal,
    })
  }

  cart.clearCart()
  cart.closeCart()

  orderToastVisible.value = true
  setTimeout(() => { orderToastVisible.value = false }, 4000)
}
</script>

<style scoped>
.admin-fab {
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(8px);
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.2s;
  z-index: 50;
}
.admin-fab:hover { background: rgba(255,255,255,0.16); transform: scale(1.1); }

.order-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #25d366, #128c7e);
  color: #fff;
  padding: 14px 28px;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 700;
  z-index: 3000;
  box-shadow: 0 6px 28px rgba(37,211,102,0.35);
  white-space: nowrap;
  max-width: 90vw;
  text-align: center;
}

.toast-enter-active { transition: all 0.35s cubic-bezier(0.34,1.26,0.64,1); }
.toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>
