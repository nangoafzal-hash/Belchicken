<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="backdrop-fade">
      <div
        v-if="cart.isOpen"
        class="drawer-backdrop"
        @click="cart.closeCart()"
      />
    </Transition>

    <!-- Tiroir -->
    <Transition name="drawer-slide">
      <aside
        v-if="cart.isOpen"
        class="drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Votre panier"
      >

        <!-- ── Header ────────────────────────────────────── -->
        <div class="drawer__header">
          <div class="drawer__header-left">
            <span class="drawer__icon">🛒</span>
            <div>
              <h2 class="drawer__title">Mon Panier</h2>
              <p class="drawer__subtitle">
                {{ cart.totalCount }} article{{ cart.totalCount > 1 ? 's' : '' }}
              </p>
            </div>
          </div>
          <div class="drawer__header-right">
            <button
              v-if="!cart.isEmpty"
              class="drawer__clear-btn"
              @click="confirmClear"
              title="Vider le panier"
            >
              🗑️ Vider
            </button>
            <button class="drawer__close" @click="cart.closeCart()" aria-label="Fermer le panier">
              ✕
            </button>
          </div>
        </div>

        <!-- ── Corps : liste articles ────────────────────── -->
        <div class="drawer__body">

          <!-- Panier vide -->
          <div v-if="cart.isEmpty" class="drawer__empty">
            <span class="drawer__empty-icon">🍽️</span>
            <p class="drawer__empty-title">Votre panier est vide</p>
            <p class="drawer__empty-sub">Ajoutez des plats depuis le menu</p>
            <button class="drawer__browse-btn" @click="cart.closeCart()">
              Voir le menu →
            </button>
          </div>

          <!-- Liste des articles -->
          <TransitionGroup v-else name="item-list" tag="ul" class="drawer__list">
            <li
              v-for="item in cart.items"
              :key="item.cartItemId"
              class="cart-item"
            >
              <!-- Image -->
              <div class="cart-item__img-wrap">
                <img
                  :src="item.image"
                  :alt="item.name"
                  class="cart-item__img"
                  @error="onImgError"
                />
              </div>

              <!-- Infos -->
              <div class="cart-item__info">
                <p class="cart-item__name">{{ item.name }}</p>

                <!-- Options -->
                <div class="cart-item__options">
                  <span v-if="item.spice" class="cart-item__tag cart-item__tag--spice">
                    {{ getSpiceLabel(item.spice) }}
                  </span>
                  <span v-if="item.sauce && item.sauce !== 'aucune'" class="cart-item__tag">
                    {{ getSauceLabel(item.sauce) }}
                  </span>
                  <span v-if="item.drinkSize" class="cart-item__tag">
                    {{ getSizeLabel(item.drinkSize) }}
                  </span>
                </div>

                <p v-if="item.specialNote" class="cart-item__note">
                  📝 {{ item.specialNote }}
                </p>

                <!-- Prix unitaire -->
                <p class="cart-item__unit-price">
                  {{ formatPrice(item.unitPrice) }} / unité
                </p>
              </div>

              <!-- Contrôles quantité + suppression -->
              <div class="cart-item__controls">
                <!-- Prix total ligne -->
                <p class="cart-item__total">{{ formatPrice(item.totalPrice) }}</p>

                <!-- Quantité -->
                <div class="qty-row">
                  <button
                    class="qty-btn"
                    @click="cart.decrement(item.cartItemId)"
                    :aria-label="item.quantity === 1 ? 'Supprimer' : 'Diminuer'"
                  >
                    <span v-if="item.quantity === 1">🗑️</span>
                    <span v-else>−</span>
                  </button>
                  <span class="qty-value">{{ item.quantity }}</span>
                  <button
                    class="qty-btn"
                    @click="cart.increment(item.cartItemId)"
                    aria-label="Augmenter"
                  >+</button>
                </div>
              </div>
            </li>
          </TransitionGroup>
        </div>

        <!-- ── Footer : récap + CTA ──────────────────────── -->
        <div v-if="!cart.isEmpty" class="drawer__footer">

          <!-- Calculateur de livraison -->
          <DeliveryCalculator />

          <!-- Séparateur -->
          <div class="drawer__divider" />

          <!-- Récapitulatif des prix -->
          <div class="drawer__recap">
            <div class="drawer__recap-row">
              <span>Sous-total</span>
              <span>{{ cart.subtotalFormatted }}</span>
            </div>
            <div class="drawer__recap-row">
              <span>Livraison</span>
              <span
                :class="cart.selectedZone ? 'drawer__delivery-fee' : 'drawer__delivery-pending'"
              >
                {{ cart.deliveryFormatted }}
              </span>
            </div>
            <div class="drawer__recap-row drawer__recap-row--total">
              <span>Total à payer</span>
              <span class="drawer__total-price">{{ cart.grandTotalFormatted }}</span>
            </div>
          </div>

          <!-- Bouton commander -->
          <button
            class="drawer__order-btn"
            :class="{ 'drawer__order-btn--disabled': !cart.selectedZone }"
            :disabled="!cart.selectedZone"
            @click="$emit('proceed-to-order')"
          >
            Commander via WhatsApp 📲
          </button>

          <p v-if="!cart.selectedZone" class="drawer__order-note drawer__order-note--warn">
            ⚠️ Sélectionnez votre zone de livraison pour continuer
          </p>
          <p v-else class="drawer__order-note">
            Vous serez redirigé vers WhatsApp avec votre bon de commande
          </p>
        </div>

      </aside>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useCartStore, getSpiceLabel, getSauceLabel, getSizeLabel } from '@/stores/cartStore'
import { formatPrice } from '@/data/menuData.ts'
import DeliveryCalculator from '@/components/DeliveryCalculator.vue'

const cart = useCartStore()

defineEmits(['proceed-to-order'])

function confirmClear() {
  if (confirm('Vider tout le panier ?')) {
    cart.clearCart()
  }
}

function onImgError(e: Event) {
  (e.target as HTMLImageElement).src =
    'https://placehold.co/80x80/2a1208/e67e22?text=BK'
}
</script>

<style scoped>
/* ── Backdrop ───────────────────────────────────────────── */
.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 200;
  backdrop-filter: blur(2px);
}

/* ── Tiroir ─────────────────────────────────────────────── */
.drawer {
  position: fixed;
  top: 0;
  right: 0;
  height: 100dvh;
  width: min(420px, 100vw);
  background: #1e0e06;
  border-left: 1px solid rgba(230, 126, 34, 0.2);
  z-index: 201;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 40px rgba(0, 0, 0, 0.5);
}

/* ── Header ─────────────────────────────────────────────── */
.drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
  background: linear-gradient(135deg, #2a1208 0%, #1e0e06 100%);
}

.drawer__header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.drawer__icon {
  font-size: 1.6rem;
}

.drawer__title {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0;
}

.drawer__subtitle {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.78rem;
  margin: 0;
}

.drawer__header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.drawer__clear-btn {
  background: rgba(231, 76, 60, 0.15);
  border: 1px solid rgba(231, 76, 60, 0.3);
  color: #e74c3c;
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  font-family: inherit;
}

.drawer__clear-btn:hover {
  background: rgba(231, 76, 60, 0.28);
}

.drawer__close {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;
  font-family: inherit;
}

.drawer__close:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

/* ── Panier vide ────────────────────────────────────────── */
.drawer__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 10px;
  padding: 40px 20px;
  text-align: center;
}

.drawer__empty-icon {
  font-size: 3.5rem;
  opacity: 0.3;
}

.drawer__empty-title {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
}

.drawer__empty-sub {
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.83rem;
  margin: 0;
}

.drawer__browse-btn {
  margin-top: 12px;
  padding: 10px 24px;
  border-radius: 24px;
  border: 2px solid var(--color-primary, #e67e22);
  background: transparent;
  color: var(--color-primary, #e67e22);
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.drawer__browse-btn:hover {
  background: var(--color-primary, #e67e22);
  color: #fff;
}

/* ── Body scrollable ────────────────────────────────────── */
.drawer__body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(230, 126, 34, 0.3) transparent;
  display: flex;
  flex-direction: column;
}

/* ── Liste articles ─────────────────────────────────────── */
.drawer__list {
  list-style: none;
  padding: 0 16px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
}

/* ── Article individuel ─────────────────────────────────── */
.cart-item {
  display: grid;
  grid-template-columns: 72px 1fr auto;
  gap: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 12px;
  align-items: start;
  transition: background 0.2s;
}

.cart-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

/* Image */
.cart-item__img-wrap {
  width: 72px;
  height: 72px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
}

.cart-item__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Infos */
.cart-item__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.cart-item__name {
  color: #fff;
  font-size: 0.88rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
}

.cart-item__options {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.cart-item__tag {
  font-size: 0.68rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  background: rgba(230, 126, 34, 0.18);
  color: #f0a05a;
  border: 1px solid rgba(230, 126, 34, 0.25);
}

.cart-item__tag--spice {
  background: rgba(231, 76, 60, 0.18);
  color: #f08070;
  border-color: rgba(231, 76, 60, 0.25);
}

.cart-item__note {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-item__unit-price {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.35);
  margin: 0;
}

/* Contrôles */
.cart-item__controls {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
  min-width: 80px;
}

.cart-item__total {
  color: var(--color-primary, #e67e22);
  font-size: 0.9rem;
  font-weight: 800;
  margin: 0;
  white-space: nowrap;
}

/* Quantité inline */
.qty-row {
  display: flex;
  align-items: center;
  gap: 0;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  overflow: hidden;
}

.qty-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  color: var(--color-primary, #e67e22);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  font-family: inherit;
}

.qty-btn:hover {
  background: rgba(230, 126, 34, 0.2);
}

.qty-value {
  min-width: 24px;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 800;
  color: #fff;
}

/* ── Footer ─────────────────────────────────────────────── */
.drawer__footer {
  padding: 16px 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
  background: rgba(20, 8, 2, 0.6);
}

.drawer__recap {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.drawer__recap-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.55);
}

.drawer__recap-row--delivery {
  font-size: 0.78rem;
}

.drawer__delivery-pending {
  font-style: italic;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.75rem;
}

.drawer__delivery-fee {
  color: #27ae60;
  font-weight: 700;
  font-size: 0.85rem;
}

.drawer__divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
  margin: 4px 0;
}

.drawer__recap-row--total {
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
}

.drawer__total-price {
  color: var(--color-primary, #e67e22);
  font-size: 1.2rem;
  font-weight: 900;
}

.drawer__order-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 30px;
  background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
  color: #fff;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  letter-spacing: 0.3px;
  font-family: inherit;
}

.drawer__order-btn:hover:not(:disabled) {
  opacity: 0.92;
  transform: scale(1.02);
}

.drawer__order-btn--disabled,
.drawer__order-btn:disabled {
  background: linear-gradient(135deg, #555 0%, #333 100%);
  cursor: not-allowed;
  opacity: 0.6;
}

.drawer__order-note {
  text-align: center;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.3);
  margin: 8px 0 0;
}

.drawer__order-note--warn {
  color: #f39c12;
  font-weight: 600;
}

/* ── Transitions ────────────────────────────────────────── */
.backdrop-fade-enter-active,
.backdrop-fade-leave-active { transition: opacity 0.25s ease; }
.backdrop-fade-enter-from,
.backdrop-fade-leave-to     { opacity: 0; }

.drawer-slide-enter-active  { transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1); }
.drawer-slide-leave-active  { transition: transform 0.25s ease; }
.drawer-slide-enter-from,
.drawer-slide-leave-to      { transform: translateX(100%); }

.item-list-enter-active     { transition: all 0.28s ease; }
.item-list-leave-active     { transition: all 0.2s ease; position: absolute; width: calc(100% - 32px); }
.item-list-enter-from       { opacity: 0; transform: translateX(20px); }
.item-list-leave-to         { opacity: 0; transform: translateX(20px); }
.item-list-move             { transition: transform 0.28s ease; }
</style>
