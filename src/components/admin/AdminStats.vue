<template>
  <div class="stats">

    <!-- ── KPI Cards ──────────────────────────────────────── -->
    <div class="stats__kpi-grid">
      <div class="kpi-card">
        <span class="kpi-card__icon">🧾</span>
        <div>
          <p class="kpi-card__value">{{ history.todayCount }}</p>
          <p class="kpi-card__label">Commandes aujourd'hui</p>
        </div>
      </div>
      <div class="kpi-card kpi-card--green">
        <span class="kpi-card__icon">💰</span>
        <div>
          <p class="kpi-card__value">{{ history.todayRevenueFormatted }}</p>
          <p class="kpi-card__label">Chiffre d'affaires du jour</p>
        </div>
      </div>
      <div class="kpi-card kpi-card--blue">
        <span class="kpi-card__icon">🍽️</span>
        <div>
          <p class="kpi-card__value">{{ totalItemsToday }}</p>
          <p class="kpi-card__label">Articles vendus</p>
        </div>
      </div>
      <div class="kpi-card kpi-card--orange">
        <span class="kpi-card__icon">📦</span>
        <div>
          <p class="kpi-card__value">{{ pendingCount }}</p>
          <p class="kpi-card__label">En attente</p>
        </div>
      </div>
    </div>

    <!-- ── Graphique CA par heure ─────────────────────────── -->
    <div class="stats__card">
      <h3 class="stats__card-title">📈 Chiffre d'affaires par heure</h3>
      <div class="stats__chart-wrap">
        <Bar v-if="hasData" :data="hourlyChartData" :options="hourlyChartOptions" />
        <div v-else class="stats__no-data">Aucune commande aujourd'hui</div>
      </div>
    </div>

    <!-- ── Top plats du jour ──────────────────────────────── -->
    <div class="stats__card">
      <h3 class="stats__card-title">🏆 Plats les plus vendus aujourd'hui</h3>
      <div v-if="history.topItemsToday.length" class="stats__top-items">
        <div
          v-for="(item, i) in history.topItemsToday.slice(0, 8)"
          :key="item.name"
          class="top-item"
        >
          <span class="top-item__rank">{{ i + 1 }}</span>
          <div class="top-item__bar-wrap">
            <div class="top-item__name">{{ item.name }}</div>
            <div class="top-item__bar">
              <div
                class="top-item__bar-fill"
                :style="{
                  width: barWidth(item.qty) + '%',
                  background: BAR_COLORS[i % BAR_COLORS.length]
                }"
              />
            </div>
          </div>
          <div class="top-item__meta">
            <span class="top-item__qty">×{{ item.qty }}</span>
            <span class="top-item__revenue">{{ formatPrice(item.revenue) }}</span>
          </div>
        </div>
      </div>
      <div v-else class="stats__no-data">Aucun article vendu aujourd'hui</div>
    </div>

    <!-- ── Graphique donut statuts ────────────────────────── -->
    <div class="stats__card stats__card--half" v-if="history.todayOrders.length">
      <h3 class="stats__card-title">📊 Statuts des commandes</h3>
      <div class="stats__doughnut-wrap">
        <Doughnut :data="statusChartData" :options="doughnutOptions" />
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend, Title,
} from 'chart.js'
import { useOrderHistoryStore } from '@/stores/orderHistoryStore'
import { formatPrice } from '@/data/menuData.ts'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title)

const history = useOrderHistoryStore()

const BAR_COLORS = [
  '#e67e22','#c0392b','#f39c12','#27ae60',
  '#2980b9','#8e44ad','#16a085','#d35400',
]

// ── KPI calculés ────────────────────────────────────────────
const totalItemsToday = computed(() =>
  history.todayOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0), 0)
)

const pendingCount = computed(() =>
  history.todayOrders.filter(o => o.status === 'pending').length
)

const hasData = computed(() => history.todayRevenue > 0)

// ── Graphique CA par heure ───────────────────────────────────
const hourlyChartData = computed(() => {
  const active = history.revenueByHour.filter((_, i) => i >= 7 && i <= 23)
  return {
    labels: active.map(h => `${String(h.hour).padStart(2,'0')}h`),
    datasets: [{
      label: 'CA (FCFA)',
      data:  active.map(h => h.revenue),
      backgroundColor: active.map(h =>
        h.revenue > 0 ? 'rgba(230,126,34,0.8)' : 'rgba(255,255,255,0.05)'
      ),
      borderColor: active.map(h =>
        h.revenue > 0 ? '#e67e22' : 'rgba(255,255,255,0.1)'
      ),
      borderWidth: 1,
      borderRadius: 6,
    }],
  }
})

const hourlyChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: { parsed: { y: number } }) => ` ${formatPrice(ctx.parsed.y)}`,
      },
    },
  },
  scales: {
    x: {
      ticks: { color: 'rgba(255,255,255,0.45)', font: { size: 11 } },
      grid:  { color: 'rgba(255,255,255,0.05)' },
    },
    y: {
      ticks: {
        color: 'rgba(255,255,255,0.45)',
        font:  { size: 11 },
        callback: (v: number | string) => `${Number(v)/1000}k`,
      },
      grid: { color: 'rgba(255,255,255,0.07)' },
    },
  },
}

// ── Graphique donut statuts ──────────────────────────────────
const statusChartData = computed(() => {
  const counts = {
    pending:   history.todayOrders.filter(o => o.status === 'pending').length,
    confirmed: history.todayOrders.filter(o => o.status === 'confirmed').length,
    delivered: history.todayOrders.filter(o => o.status === 'delivered').length,
    cancelled: history.todayOrders.filter(o => o.status === 'cancelled').length,
  }
  return {
    labels: ['En attente','Confirmée','Livrée','Annulée'],
    datasets: [{
      data: [counts.pending, counts.confirmed, counts.delivered, counts.cancelled],
      backgroundColor: ['#f39c12','#27ae60','#2980b9','#e74c3c'],
      borderColor: '#1a0a03',
      borderWidth: 3,
    }],
  }
})

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { color: 'rgba(255,255,255,0.6)', padding: 16, font: { size: 12 } },
    },
  },
  cutout: '65%',
}

// ── Largeur barre top items ──────────────────────────────────
function barWidth(qty: number): number {
  const max = history.topItemsToday[0]?.qty ?? 1
  return Math.round((qty / max) * 100)
}
</script>

<style scoped>
.stats { display: flex; flex-direction: column; gap: 20px; }

/* KPI Grid */
.stats__kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.kpi-card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.kpi-card--green  { border-color: rgba(39,174,96,0.3);  background: rgba(39,174,96,0.07); }
.kpi-card--blue   { border-color: rgba(41,128,185,0.3); background: rgba(41,128,185,0.07); }
.kpi-card--orange { border-color: rgba(230,126,34,0.3); background: rgba(230,126,34,0.07); }

.kpi-card__icon { font-size: 1.8rem; flex-shrink: 0; }

.kpi-card__value {
  color: #fff;
  font-size: 1.3rem;
  font-weight: 900;
  margin: 0 0 2px;
  line-height: 1;
}

.kpi-card__label {
  color: rgba(255,255,255,0.45);
  font-size: 0.72rem;
  margin: 0;
}

/* Cards */
.stats__card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 18px;
  padding: 18px 20px;
}

.stats__card--half { max-width: 380px; }

.stats__card-title {
  color: rgba(255,255,255,0.8);
  font-size: 0.88rem;
  font-weight: 700;
  margin: 0 0 16px;
}

.stats__chart-wrap { height: 200px; }
.stats__doughnut-wrap { height: 220px; }

.stats__no-data {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.2);
  font-size: 0.85rem;
  font-style: italic;
}

/* Top Items */
.stats__top-items { display: flex; flex-direction: column; gap: 10px; }

.top-item {
  display: grid;
  grid-template-columns: 24px 1fr auto;
  align-items: center;
  gap: 10px;
}

.top-item__rank {
  width: 24px; height: 24px;
  border-radius: 50%;
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.5);
  font-size: 0.72rem;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.top-item__bar-wrap { display: flex; flex-direction: column; gap: 4px; }

.top-item__name {
  color: rgba(255,255,255,0.8);
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.top-item__bar {
  height: 6px;
  background: rgba(255,255,255,0.06);
  border-radius: 3px;
  overflow: hidden;
}

.top-item__bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
}

.top-item__meta { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }

.top-item__qty {
  color: #fff;
  font-size: 0.78rem;
  font-weight: 800;
}

.top-item__revenue {
  color: rgba(255,255,255,0.35);
  font-size: 0.68rem;
  white-space: nowrap;
}
</style>
