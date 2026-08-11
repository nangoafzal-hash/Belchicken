// ============================================================
//  BELCHIKEN — Générateur de message WhatsApp
//  Transforme le panier + infos client en texte formaté
// ============================================================

import { getSpiceLabel, getSauceLabel, getSizeLabel } from '@/stores/cartStore'
import { formatPrice }   from '@/data/menuData.ts'
import { formatDelay }   from '@/data/deliveryZones'
import type { CartItem } from '@/stores/cartStore'
import type { DeliveryZone } from '@/data/deliveryZones'

// ── Numéro WhatsApp de l'établissement ───────────────────────
// Format international sans + ni espaces : 226XXXXXXXX
export const WHATSAPP_NUMBER = '22656826882'

// ── Interface client ─────────────────────────────────────────
export interface CustomerInfo {
  name:      string
  phone:     string
  address:   string
  landmark:  string   // repère local (ex: "Près du marché Rood Woko")
  note?:     string   // note globale optionnelle
}

// ── Formatage du message ─────────────────────────────────────
export function buildWhatsAppMessage(
  items:    CartItem[],
  zone:     DeliveryZone,
  customer: CustomerInfo,
): string {
  const now       = new Date()
  const dateStr   = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  const timeStr   = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const orderRef  = `BK-${Date.now().toString(36).toUpperCase().slice(-6)}`

  const lines: string[] = []

  // ── En-tête ──────────────────────────────────────────────
  lines.push('🍗 *BELCHIKEN — Nouvelle Commande*')
  lines.push(`📋 Réf : *${orderRef}*`)
  lines.push(`🕐 ${dateStr} à ${timeStr}`)
  lines.push('─────────────────────────')

  // ── Informations client ──────────────────────────────────
  lines.push('👤 *CLIENT*')
  lines.push(`• Nom : ${customer.name}`)
  lines.push(`• Tél : ${customer.phone}`)
  lines.push(`• Adresse : ${customer.address}`)
  if (customer.landmark) {
    lines.push(`• Repère : ${customer.landmark}`)
  }
  lines.push('─────────────────────────')

  // ── Articles commandés ───────────────────────────────────
  lines.push('🛒 *COMMANDE*')
  lines.push('')

  items.forEach((item, index) => {
    lines.push(`*${index + 1}. ${item.name}* × ${item.quantity}`)

    // Options de personnalisation
    const opts: string[] = []
    if (item.spice)                        opts.push(getSpiceLabel(item.spice))
    if (item.sauce && item.sauce !== 'aucune') opts.push(getSauceLabel(item.sauce))
    if (item.drinkSize)                    opts.push(getSizeLabel(item.drinkSize))

    if (opts.length) {
      lines.push(`   ↳ ${opts.join(' · ')}`)
    }
    if (item.specialNote) {
      lines.push(`   📝 ${item.specialNote}`)
    }

    lines.push(`   💰 ${formatPrice(item.unitPrice)} × ${item.quantity} = *${formatPrice(item.totalPrice)}*`)
    lines.push('')
  })

  lines.push('─────────────────────────')

  // ── Récapitulatif financier ──────────────────────────────
  const subtotal   = items.reduce((s, i) => s + i.totalPrice, 0)
  const grandTotal = subtotal + zone.fee

  lines.push('💵 *RÉCAPITULATIF*')
  lines.push(`• Sous-total articles : ${formatPrice(subtotal)}`)
  lines.push(`• Zone : ${zone.name} (${zone.sector ?? ''})`)
  lines.push(`• Frais de livraison  : ${formatPrice(zone.fee)}`)
  lines.push(`• Délai estimé        : ${formatDelay(zone.minDelay, zone.maxDelay)}`)
  lines.push('')
  lines.push(`🏷️ *TOTAL À PAYER : ${formatPrice(grandTotal)}*`)
  lines.push('─────────────────────────')

  // ── Note globale client ──────────────────────────────────
  if (customer.note?.trim()) {
    lines.push(`📌 *Note : ${customer.note.trim()}*`)
    lines.push('─────────────────────────')
  }

  // ── Pied de message ──────────────────────────────────────
  lines.push('_Merci de confirmer la commande par retour de message._')
  lines.push('_Belchiken — Le meilleur poulet frit de Ouaga 🍗_')

  return lines.join('\n')
}

// ── Construction de l'URL WhatsApp ───────────────────────────
export function buildWhatsAppUrl(message: string): string {
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`
}

// ── Validation du formulaire client ─────────────────────────
export interface FormErrors {
  name?:    string
  phone?:   string
  address?: string
}

export function validateCustomer(customer: CustomerInfo): FormErrors {
  const errors: FormErrors = {}

  if (!customer.name.trim()) {
    errors.name = 'Le nom est obligatoire'
  } else if (customer.name.trim().length < 2) {
    errors.name = 'Le nom est trop court'
  }

  const phoneClean = customer.phone.replace(/[\s\-().+]/g, '')
  if (!phoneClean) {
    errors.phone = 'Le numéro de téléphone est obligatoire'
  } else if (!/^\d{8,15}$/.test(phoneClean)) {
    errors.phone = 'Numéro invalide (8 à 15 chiffres)'
  }

  if (!customer.address.trim()) {
    errors.address = 'L\'adresse de livraison est obligatoire'
  } else if (customer.address.trim().length < 5) {
    errors.address = 'Adresse trop courte, soyez plus précis'
  }

  return errors
}
