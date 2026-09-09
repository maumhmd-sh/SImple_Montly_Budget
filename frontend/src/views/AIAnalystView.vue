<script setup>

import {
  computed,
  onMounted,
  ref
} from 'vue'

import {
  getFinancialAnalysis
} from '../services/aiAnalystService'


// ============================================================================
// STATE
// ============================================================================

const loading = ref(false)

const error = ref('')

const analysisData = ref(null)


// ============================================================================
// MONTH
// ============================================================================

const selectedMonth = ref(
  new Date()
    .toISOString()
    .slice(0, 7)
)


// ============================================================================
// MONTH LABEL
// ============================================================================

const monthLabel = computed(() => {

  if (!selectedMonth.value) {
    return ''
  }

  const [year, month] =
    selectedMonth.value.split('-')

  const date =
    new Date(
      Number(year),
      Number(month) - 1,
      1
    )

  return date.toLocaleDateString(
    'id-ID',
    {
      month: 'long',
      year: 'numeric'
    }
  )

})


// ============================================================================
// COMPUTED DATA
// ============================================================================

const health = computed(() => {

  return (
    analysisData.value?.financial_health ||
    {
      score: 0,
      label: 'Belum dianalisis',
      breakdown: {
        cashflow: 0,
        expense_control: 0,
        saving_rate: 0,
        budget: 0,
        liquidity: 0
      },
      max_score: {
        cashflow: 25,
        expense_control: 20,
        saving_rate: 25,
        budget: 15,
        liquidity: 15
      }
    }
  )

})


const metrics = computed(() => {

  return (
    analysisData.value?.metrics ||
    {
      total_income: 0,
      total_expense: 0,
      net_cashflow: 0,
      expense_rate: 0,
      saving_rate: 0,
      cashflow_margin: 0,
      total_balance: 0
    }
  )

})


const ai = computed(() => {

  return (
    analysisData.value?.analysis ||
    {}
  )

})


const risks = computed(() => {

  return Array.isArray(ai.value.risks)
    ? ai.value.risks
    : []

})


const opportunities = computed(() => {

  return Array.isArray(
    ai.value.opportunities
  )
    ? ai.value.opportunities
    : []

})


const recommendations = computed(() => {

  return Array.isArray(
    ai.value.recommendations
  )
    ? ai.value.recommendations
    : []

})


const highlights = computed(() => {

  return Array.isArray(
    ai.value.highlights
  )
    ? ai.value.highlights
    : []

})


// ============================================================================
// SCORE CLASS
// ============================================================================

const healthClass = computed(() => {

  const score =
    Number(health.value.score || 0)

  if (score >= 90) {
    return 'excellent'
  }

  if (score >= 80) {
    return 'healthy'
  }

  if (score >= 70) {
    return 'fair'
  }

  if (score >= 60) {
    return 'warning'
  }

  return 'danger'

})


// ============================================================================
// SCORE CIRCUMFERENCE
// ============================================================================

const scoreOffset = computed(() => {

  const score =
    Math.max(
      0,
      Math.min(
        100,
        Number(health.value.score || 0)
      )
    )

  const circumference =
    2 * Math.PI * 52

  return (
    circumference -
    (
      score / 100
    ) * circumference
  )

})


// ============================================================================
// FORMAT MONEY
// ============================================================================

function formatMoney(value) {

  return new Intl.NumberFormat(
    'id-ID',
    {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }
  ).format(
    Number(value || 0)
  )

}


// ============================================================================
// FORMAT NUMBER
// ============================================================================

function formatNumber(value) {

  return new Intl.NumberFormat(
    'id-ID'
  ).format(
    Number(value || 0)
  )

}


// ============================================================================
// LOAD AI
// ============================================================================

async function loadAnalysis() {

  loading.value = true

  error.value = ''

  try {

    const response =
      await getFinancialAnalysis(
        selectedMonth.value
      )

    analysisData.value =
      response

  } catch (err) {

    console.error(
      'AI ANALYST ERROR:',
      err
    )

    error.value =
      err?.response?.data?.message ||
      'Gagal mengambil analisis AI.'

  } finally {

    loading.value = false

  }

}


// ============================================================================
// CHANGE MONTH
// ============================================================================

function changeMonth(offset) {

  const [
    year,
    month
  ] =
    selectedMonth.value
      .split('-')
      .map(Number)

  const date =
    new Date(
      year,
      month - 1 + offset,
      1
    )

  selectedMonth.value =
    `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`

  loadAnalysis()

}


// ============================================================================
// INITIAL LOAD
// ============================================================================

onMounted(() => {

  loadAnalysis()

})

</script>


<template>

  <div class="ai-page">

    <!-- ================================================================ -->
    <!-- HEADER -->
    <!-- ================================================================ -->

    <div class="ai-header">

      <div>

        <div class="ai-eyebrow">
          <span class="sparkle">
            ✦
          </span>

          AI FINANCIAL ANALYST

          <span class="beta-badge">
            BETA
          </span>
        </div>

        <h1>
          Financial Intelligence
        </h1>

        <p>
          Analisis cerdas kondisi keuangan
          berdasarkan aktivitas finansialmu.
        </p>

      </div>


      <!-- MONTH CONTROL -->

      <div class="month-control">

        <button
          class="month-arrow"
          type="button"
          @click="changeMonth(-1)"
          :disabled="loading"
        >
          <i class="bi bi-chevron-left"></i>
        </button>


        <div class="month-current">

          <small>
            PERIODE ANALISIS
          </small>

          <strong>
            {{ monthLabel }}
          </strong>

        </div>


        <button
          class="month-arrow"
          type="button"
          @click="changeMonth(1)"
          :disabled="loading"
        >
          <i class="bi bi-chevron-right"></i>
        </button>

      </div>

    </div>


    <!-- ================================================================ -->
    <!-- ERROR -->
    <!-- ================================================================ -->

    <div
      v-if="error"
      class="ai-error"
    >

      <div class="error-icon">
        <i class="bi bi-exclamation-triangle-fill"></i>
      </div>

      <div>

        <strong>
          Analisis gagal dimuat
        </strong>

        <p>
          {{ error }}
        </p>

      </div>

      <button
        type="button"
        class="retry-button"
        @click="loadAnalysis"
      >
        Coba Lagi
      </button>

    </div>


    <!-- ================================================================ -->
    <!-- LOADING -->
    <!-- ================================================================ -->

    <div
      v-if="loading"
      class="ai-loading"
    >

      <div class="ai-loader">

        <div class="loader-orbit">
          <span></span>
        </div>

        <i class="bi bi-stars"></i>

      </div>

      <h3>
        AI sedang menganalisis...
      </h3>

      <p>
        Mengolah cashflow, pengeluaran,
        tabungan, budget, dan kesehatan
        finansialmu.
      </p>

    </div>


    <!-- ================================================================ -->
    <!-- CONTENT -->
    <!-- ================================================================ -->

    <template
      v-if="!loading && analysisData"
    >

      <!-- ============================================================ -->
      <!-- HERO -->
      <!-- ============================================================ -->

      <section class="health-hero">

        <div class="health-score-wrapper">

          <svg
            class="score-ring"
            viewBox="0 0 120 120"
          >

            <circle
              class="score-track"
              cx="60"
              cy="60"
              r="52"
            />

            <circle
              class="score-progress"
              :class="healthClass"
              cx="60"
              cy="60"
              r="52"
              :style="{
                strokeDashoffset:
                  scoreOffset
              }"
            />

          </svg>


          <div class="score-value">

            <strong>
              {{ health.score }}
            </strong>

            <span>
              /100
            </span>

          </div>

        </div>


        <div class="health-info">

          <div class="health-label">
            FINANCIAL HEALTH
          </div>

          <h2>
            {{ health.label }}
          </h2>

          <p>
            {{
              ai.executive_summary ||
              'Analisis keuangan tersedia.'
            }}
          </p>

          <div class="health-meta">

            <span>
              <i class="bi bi-stars"></i>
              Powered by AI
            </span>

            <span>
              <i class="bi bi-calendar3"></i>
              {{ monthLabel }}
            </span>

          </div>

        </div>


        <div class="hero-headline">

          <span>
            INSIGHT UTAMA
          </span>

          <strong>
            {{
              ai.headline ||
              'Kondisi keuangan berhasil dianalisis.'
            }}
          </strong>

        </div>

      </section>


      <!-- ============================================================ -->
      <!-- SCORE BREAKDOWN -->
      <!-- ============================================================ -->

      <section class="section-block">

        <div class="section-heading">

          <div>

            <span>
              HEALTH BREAKDOWN
            </span>

            <h3>
              Dari mana score ini berasal?
            </h3>

          </div>

          <i class="bi bi-speedometer2"></i>

        </div>


        <div class="score-grid">


          <!-- CASHFLOW -->

          <div class="score-card">

            <div class="score-card-top">

              <div class="score-icon cashflow">
                <i class="bi bi-graph-up-arrow"></i>
              </div>

              <span>
                Cashflow
              </span>

              <strong>
                {{ health.breakdown.cashflow }}
                /
                {{ health.max_score.cashflow }}
              </strong>

            </div>

            <div class="score-bar">

              <div
                :style="{
                  width:
                    (
                      health.breakdown.cashflow /
                      health.max_score.cashflow
                    ) * 100 + '%'
                }"
              ></div>

            </div>

          </div>


          <!-- EXPENSE -->

          <div class="score-card">

            <div class="score-card-top">

              <div class="score-icon expense">
                <i class="bi bi-receipt"></i>
              </div>

              <span>
                Expense Control
              </span>

              <strong>
                {{ health.breakdown.expense_control }}
                /
                {{ health.max_score.expense_control }}
              </strong>

            </div>

            <div class="score-bar">

              <div
                :style="{
                  width:
                    (
                      health.breakdown.expense_control /
                      health.max_score.expense_control
                    ) * 100 + '%'
                }"
              ></div>

            </div>

          </div>


          <!-- SAVINGS -->

          <div class="score-card">

            <div class="score-card-top">

              <div class="score-icon savings">
                <i class="bi bi-piggy-bank"></i>
              </div>

              <span>
                Saving Rate
              </span>

              <strong>
                {{ health.breakdown.saving_rate }}
                /
                {{ health.max_score.saving_rate }}
              </strong>

            </div>

            <div class="score-bar">

              <div
                :style="{
                  width:
                    (
                      health.breakdown.saving_rate /
                      health.max_score.saving_rate
                    ) * 100 + '%'
                }"
              ></div>

            </div>

          </div>


          <!-- BUDGET -->

          <div class="score-card">

            <div class="score-card-top">

              <div class="score-icon budget">
                <i class="bi bi-wallet2"></i>
              </div>

              <span>
                Budget
              </span>

              <strong>
                {{ health.breakdown.budget }}
                /
                {{ health.max_score.budget }}
              </strong>

            </div>

            <div class="score-bar">

              <div
                :style="{
                  width:
                    (
                      health.breakdown.budget /
                      health.max_score.budget
                    ) * 100 + '%'
                }"
              ></div>

            </div>

          </div>


          <!-- LIQUIDITY -->

          <div class="score-card">

            <div class="score-card-top">

              <div class="score-icon liquidity">
                <i class="bi bi-droplet-half"></i>
              </div>

              <span>
                Liquidity
              </span>

              <strong>
                {{ health.breakdown.liquidity }}
                /
                {{ health.max_score.liquidity }}
              </strong>

            </div>

            <div class="score-bar">

              <div
                :style="{
                  width:
                    (
                      health.breakdown.liquidity /
                      health.max_score.liquidity
                    ) * 100 + '%'
                }"
              ></div>

            </div>

          </div>

        </div>

      </section>


      <!-- ============================================================ -->
      <!-- METRICS -->
      <!-- ============================================================ -->

      <section class="metric-grid">

        <div class="metric-card">

          <div class="metric-icon income">
            <i class="bi bi-arrow-down-left"></i>
          </div>

          <span>
            Pemasukan
          </span>

          <strong>
            {{ formatMoney(metrics.total_income) }}
          </strong>

          <small>
            Bulan ini
          </small>

        </div>


        <div class="metric-card">

          <div class="metric-icon expense">
            <i class="bi bi-arrow-up-right"></i>
          </div>

          <span>
            Pengeluaran
          </span>

          <strong>
            {{ formatMoney(metrics.total_expense) }}
          </strong>

          <small>
            {{ metrics.expense_rate }}% dari pemasukan
          </small>

        </div>


        <div class="metric-card">

          <div class="metric-icon saving">
            <i class="bi bi-piggy-bank"></i>
          </div>

          <span>
            Saving Rate
          </span>

          <strong>
            {{ metrics.saving_rate }}%
          </strong>

          <small>
            {{ formatMoney(metrics.net_cashflow) }}
            cashflow
          </small>

        </div>


        <div class="metric-card">

          <div class="metric-icon balance">
            <i class="bi bi-wallet2"></i>
          </div>

          <span>
            Saldo
          </span>

          <strong>
            {{ formatMoney(metrics.total_balance) }}
          </strong>

          <small>
            Saldo seluruh account
          </small>

        </div>

      </section>


      <!-- ============================================================ -->
      <!-- AI INSIGHT -->
      <!-- ============================================================ -->

      <section class="content-grid">

        <div class="glass-card insight-card">

          <div class="card-title">

            <div class="title-icon">
              <i class="bi bi-stars"></i>
            </div>

            <div>

              <span>
                AI INSIGHT
              </span>

              <h3>
                Posisi Keuangan
              </h3>

            </div>

          </div>


          <p class="large-text">
            {{
              ai.financial_position?.assessment ||
              'Belum tersedia.'
            }}
          </p>


          <div class="insight-list">

            <div>
              <span>
                Cashflow
              </span>

              <strong>
                {{
                  ai.financial_position?.cashflow_quality ||
                  '-'
                }}
              </strong>
            </div>

            <div>
              <span>
                Spending
              </span>

              <strong>
                {{
                  ai.financial_position?.spending_control ||
                  '-'
                }}
              </strong>
            </div>

            <div>
              <span>
                Liquidity
              </span>

              <strong>
                {{
                  ai.financial_position?.liquidity ||
                  '-'
                }}
              </strong>
            </div>

          </div>

        </div>


        <!-- CASHFLOW -->

        <div class="glass-card">

          <div class="card-title">

            <div class="title-icon blue">
              <i class="bi bi-activity"></i>
            </div>

            <div>

              <span>
                CASHFLOW
              </span>

              <h3>
                Arus Keuangan
              </h3>

            </div>

          </div>


          <p class="large-text">
            {{
              ai.cashflow_analysis?.assessment ||
              '-'
            }}
          </p>


          <div class="mini-insight">

            <span>
              Faktor utama
            </span>

            <p>
              {{
                ai.cashflow_analysis?.key_driver ||
                '-'
              }}
            </p>

          </div>

        </div>

      </section>


      <!-- ============================================================ -->
      <!-- HIGHLIGHTS / RISKS -->
      <!-- ============================================================ -->

      <section class="content-grid">


        <div class="glass-card">

          <div class="card-title">

            <div class="title-icon green">
              <i class="bi bi-check2-circle"></i>
            </div>

            <div>

              <span>
                HIGHLIGHTS
              </span>

              <h3>
                Yang sudah berjalan baik
              </h3>

            </div>

          </div>


          <div
            v-if="highlights.length"
            class="item-list"
          >

            <div
              v-for="(item, index) in highlights"
              :key="index"
              class="list-item positive"
            >

              <div class="list-dot">
                <i class="bi bi-check-lg"></i>
              </div>

              <div>

                <strong>
                  {{ item.title }}
                </strong>

                <p>
                  {{ item.description }}
                </p>

              </div>

            </div>

          </div>


          <div
            v-else
            class="empty-insight"
          >
            Belum ada highlight.
          </div>

        </div>


        <div class="glass-card">

          <div class="card-title">

            <div class="title-icon warning">
              <i class="bi bi-shield-exclamation"></i>
            </div>

            <div>

              <span>
                RISKS
              </span>

              <h3>
                Hal yang perlu diperhatikan
              </h3>

            </div>

          </div>


          <div
            v-if="risks.length"
            class="item-list"
          >

            <div
              v-for="(item, index) in risks"
              :key="index"
              class="list-item"
            >

              <div
                class="severity"
                :class="item.severity"
              >
                {{ item.severity }}
              </div>

              <div>

                <strong>
                  {{ item.title }}
                </strong>

                <p>
                  {{ item.description }}
                </p>

              </div>

            </div>

          </div>


          <div
            v-else
            class="empty-insight"
          >
            Tidak ada risiko yang teridentifikasi.
          </div>

        </div>

      </section>


      <!-- ============================================================ -->
      <!-- RECOMMENDATIONS -->
      <!-- ============================================================ -->

      <section class="recommendation-card">

        <div class="recommendation-header">

          <div>

            <span>
              AI RECOMMENDATIONS
            </span>

            <h3>
              Langkah yang disarankan
            </h3>

          </div>

          <div class="recommendation-icon">
            <i class="bi bi-lightbulb"></i>
          </div>

        </div>


        <div
          v-if="recommendations.length"
          class="recommendation-list"
        >

          <div
            v-for="(
              item,
              index
            ) in recommendations"
            :key="index"
            class="recommendation-item"
          >

            <div class="recommendation-number">
              {{ String(index + 1).padStart(2, '0') }}
            </div>

            <div class="recommendation-content">

              <div class="recommendation-top">

                <strong>
                  {{ item.action }}
                </strong>

                <span
                  class="priority"
                  :class="item.priority"
                >
                  {{ item.priority }}
                </span>

              </div>

              <p>
                {{ item.reason }}
              </p>

              <small>
                <i class="bi bi-arrow-right"></i>

                {{ item.expected_impact }}
              </small>

            </div>

          </div>

        </div>


        <div
          v-else
          class="empty-insight"
        >
          Belum ada rekomendasi.
        </div>

      </section>


      <!-- ============================================================ -->
      <!-- OUTLOOK -->
      <!-- ============================================================ -->

      <section class="outlook-card">

        <div class="outlook-icon">
          <i class="bi bi-stars"></i>
        </div>

        <div>

          <span>
            FINANCIAL OUTLOOK
          </span>

          <h3>
            {{
              ai.outlook?.assessment ||
              'Belum tersedia.'
            }}
          </h3>

          <p>
            {{
              ai.outlook?.next_month_focus ||
              '-'
            }}
          </p>

        </div>

      </section>


      <!-- ============================================================ -->
      <!-- FOOTER -->
      <!-- ============================================================ -->

      <div class="ai-footer">

        <span>
          <i class="bi bi-info-circle"></i>

          Analisis AI bersifat informatif
          dan menggunakan data finansial
          yang tersedia pada aplikasi.
        </span>


        <button
          type="button"
          @click="loadAnalysis"
          :disabled="loading"
        >

          <i class="bi bi-arrow-clockwise"></i>

          Analisis Ulang

        </button>

      </div>

    </template>

  </div>

</template>


<style scoped>

/* ========================================================================== */
/* PAGE */
/* ========================================================================== */

.ai-page {
  min-height: 100%;
  padding: 28px;
}


/* ========================================================================== */
/* HEADER */
/* ========================================================================== */

.ai-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}

.ai-eyebrow {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .16em;
  color: var(--bs-primary);
}

.sparkle {
  font-size: 18px;
}

.beta-badge {
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(13, 110, 253, .1);
  border: 1px solid rgba(13, 110, 253, .2);
  font-size: 9px;
  letter-spacing: .08em;
}

.ai-header h1 {
  margin: 7px 0 5px;
  font-size: clamp(28px, 3vw, 40px);
  font-weight: 800;
  letter-spacing: -.04em;
}

.ai-header p {
  margin: 0;
  color: var(--bs-secondary-color);
}


/* ========================================================================== */
/* MONTH */
/* ========================================================================== */

.month-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.month-arrow {
  width: 42px;
  height: 42px;
  border: 1px solid var(--bs-border-color);
  border-radius: 12px;
  background: var(--bs-body-bg);
  color: var(--bs-body-color);
  transition: .2s;
}

.month-arrow:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: var(--bs-primary);
}

.month-arrow:disabled {
  opacity: .5;
}

.month-current {
  min-width: 155px;
  padding: 8px 16px;
  text-align: center;
}

.month-current small {
  display: block;
  margin-bottom: 2px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .12em;
  color: var(--bs-secondary-color);
}

.month-current strong {
  font-size: 14px;
}


/* ========================================================================== */
/* HEALTH HERO */
/* ========================================================================== */

.health-hero {
  display: grid;
  grid-template-columns: 160px 1fr minmax(240px, 360px);
  align-items: center;
  gap: 30px;
  padding: 30px;
  border: 1px solid var(--bs-border-color);
  border-radius: 24px;
  background:
    linear-gradient(
      135deg,
      rgba(13, 110, 253, .07),
      transparent 50%
    ),
    var(--bs-body-bg);
  box-shadow: 0 12px 35px rgba(0,0,0,.04);
  margin-bottom: 30px;
}

.health-score-wrapper {
  position: relative;
  width: 140px;
  height: 140px;
}

.score-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.score-track,
.score-progress {
  fill: none;
  stroke-width: 9;
}

.score-track {
  stroke: var(--bs-border-color);
}

.score-progress {
  stroke-linecap: round;
  stroke-dasharray: 326.73;
  transition:
    stroke-dashoffset 1s ease;
}

.score-progress.excellent,
.score-progress.healthy {
  stroke: #20c997;
}

.score-progress.fair {
  stroke: #ffc107;
}

.score-progress.warning {
  stroke: #fd7e14;
}

.score-progress.danger {
  stroke: #dc3545;
}

.score-value {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.score-value strong {
  font-size: 42px;
  line-height: 1;
  font-weight: 850;
}

.score-value span {
  margin-top: 4px;
  color: var(--bs-secondary-color);
  font-size: 12px;
}

.health-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .14em;
  color: var(--bs-primary);
}

.health-info h2 {
  margin: 5px 0 10px;
  font-size: 28px;
  font-weight: 800;
}

.health-info p {
  max-width: 680px;
  margin: 0;
  line-height: 1.7;
  color: var(--bs-secondary-color);
}

.health-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 16px;
  color: var(--bs-secondary-color);
  font-size: 12px;
}

.health-meta span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.hero-headline {
  padding: 20px;
  border-radius: 17px;
  background: rgba(13, 110, 253, .06);
  border: 1px solid rgba(13, 110, 253, .12);
}

.hero-headline span {
  display: block;
  margin-bottom: 8px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .13em;
  color: var(--bs-secondary-color);
}

.hero-headline strong {
  display: block;
  line-height: 1.5;
  font-size: 15px;
}


/* ========================================================================== */
/* SECTION */
/* ========================================================================== */

.section-block {
  margin-bottom: 30px;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-heading span,
.card-title span,
.recommendation-header span,
.outlook-card span {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .14em;
  color: var(--bs-primary);
}

.section-heading h3 {
  margin: 4px 0 0;
  font-size: 19px;
  font-weight: 750;
}

.section-heading > i {
  font-size: 23px;
  opacity: .5;
}


/* ========================================================================== */
/* SCORE GRID */
/* ========================================================================== */

.score-grid {
  display: grid;
  grid-template-columns:
    repeat(5, minmax(0, 1fr));
  gap: 14px;
}

.score-card {
  padding: 18px;
  border: 1px solid var(--bs-border-color);
  border-radius: 17px;
  background: var(--bs-body-bg);
}

.score-card-top {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
}

.score-card-top > span {
  font-size: 12px;
  font-weight: 650;
}

.score-card-top > strong {
  font-size: 12px;
}

.score-icon,
.metric-icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: rgba(13, 110, 253, .1);
  color: var(--bs-primary);
}

.score-icon.cashflow {
  background: rgba(32, 201, 151, .12);
  color: #20c997;
}

.score-icon.expense {
  background: rgba(13, 110, 253, .1);
  color: #0d6efd;
}

.score-icon.savings {
  background: rgba(111, 66, 193, .1);
  color: #6f42c1;
}

.score-icon.budget {
  background: rgba(255, 193, 7, .13);
  color: #d39e00;
}

.score-icon.liquidity {
  background: rgba(13, 202, 240, .12);
  color: #0dcaf0;
}

.score-bar {
  height: 5px;
  margin-top: 17px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--bs-tertiary-bg);
}

.score-bar div {
  height: 100%;
  border-radius: inherit;
  background: var(--bs-primary);
}


/* ========================================================================== */
/* METRICS */
/* ========================================================================== */

.metric-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 30px;
}

.metric-card {
  padding: 20px;
  border: 1px solid var(--bs-border-color);
  border-radius: 18px;
  background: var(--bs-body-bg);
}

.metric-card span {
  display: block;
  margin-top: 15px;
  font-size: 11px;
  color: var(--bs-secondary-color);
}

.metric-card strong {
  display: block;
  margin-top: 4px;
  font-size: 20px;
  font-weight: 800;
}

.metric-card small {
  display: block;
  margin-top: 5px;
  color: var(--bs-secondary-color);
}

.metric-icon.income {
  color: #198754;
  background: rgba(25,135,84,.1);
}

.metric-icon.expense {
  color: #dc3545;
  background: rgba(220,53,69,.1);
}

.metric-icon.saving {
  color: #6f42c1;
  background: rgba(111,66,193,.1);
}

.metric-icon.balance {
  color: #0d6efd;
  background: rgba(13,110,253,.1);
}


/* ========================================================================== */
/* CONTENT GRID */
/* ========================================================================== */

.content-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 18px;
}

.glass-card {
  padding: 23px;
  border: 1px solid var(--bs-border-color);
  border-radius: 20px;
  background: var(--bs-body-bg);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 13px;
  background: rgba(13,110,253,.1);
  color: var(--bs-primary);
}

.title-icon.blue {
  background: rgba(13,110,253,.1);
  color: #0d6efd;
}

.title-icon.green {
  background: rgba(25,135,84,.1);
  color: #198754;
}

.title-icon.warning {
  background: rgba(255,193,7,.13);
  color: #b88600;
}

.card-title h3 {
  margin: 3px 0 0;
  font-size: 17px;
  font-weight: 750;
}

.large-text {
  margin: 20px 0;
  line-height: 1.7;
  color: var(--bs-secondary-color);
}

.insight-list {
  display: grid;
  gap: 10px;
}

.insight-list > div {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 12px 0;
  border-top: 1px solid var(--bs-border-color);
}

.insight-list span {
  color: var(--bs-secondary-color);
  font-size: 12px;
}

.insight-list strong {
  max-width: 65%;
  text-align: right;
  font-size: 12px;
}

.mini-insight {
  padding: 15px;
  border-radius: 13px;
  background: var(--bs-tertiary-bg);
}

.mini-insight span {
  font-size: 10px;
  font-weight: 700;
  color: var(--bs-secondary-color);
}

.mini-insight p {
  margin: 5px 0 0;
  line-height: 1.6;
  font-size: 12px;
}


/* ========================================================================== */
/* LIST */
/* ========================================================================== */

.item-list {
  margin-top: 22px;
}

.list-item {
  display: flex;
  align-items: flex-start;
  gap: 13px;
  padding: 15px 0;
  border-top: 1px solid var(--bs-border-color);
}

.list-dot {
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(25,135,84,.1);
  color: #198754;
}

.list-item strong {
  display: block;
  font-size: 13px;
}

.list-item p {
  margin: 4px 0 0;
  color: var(--bs-secondary-color);
  line-height: 1.55;
  font-size: 12px;
}

.severity {
  flex: 0 0 auto;
  padding: 5px 8px;
  border-radius: 7px;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
}

.severity.low {
  background: rgba(25,135,84,.1);
  color: #198754;
}

.severity.medium {
  background: rgba(255,193,7,.13);
  color: #997404;
}

.severity.high {
  background: rgba(220,53,69,.1);
  color: #dc3545;
}


/* ========================================================================== */
/* RECOMMENDATION */
/* ========================================================================== */

.recommendation-card {
  padding: 25px;
  margin-top: 18px;
  border: 1px solid var(--bs-border-color);
  border-radius: 21px;
  background: var(--bs-body-bg);
}

.recommendation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recommendation-header h3 {
  margin: 4px 0 0;
  font-size: 20px;
}

.recommendation-icon {
  width: 45px;
  height: 45px;
  display: grid;
  place-items: center;
  border-radius: 13px;
  background: rgba(255,193,7,.13);
  color: #d39e00;
  font-size: 20px;
}

.recommendation-list {
  margin-top: 20px;
}

.recommendation-item {
  display: flex;
  gap: 18px;
  padding: 18px 0;
  border-top: 1px solid var(--bs-border-color);
}

.recommendation-number {
  font-size: 13px;
  font-weight: 800;
  color: var(--bs-primary);
}

.recommendation-content {
  flex: 1;
}

.recommendation-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.recommendation-top strong {
  font-size: 14px;
}

.recommendation-content p {
  margin: 6px 0;
  color: var(--bs-secondary-color);
  font-size: 12px;
}

.recommendation-content small {
  color: var(--bs-secondary-color);
}

.priority {
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
}

.priority.low {
  background: rgba(25,135,84,.1);
  color: #198754;
}

.priority.medium {
  background: rgba(255,193,7,.13);
  color: #997404;
}

.priority.high {
  background: rgba(220,53,69,.1);
  color: #dc3545;
}


/* ========================================================================== */
/* OUTLOOK */
/* ========================================================================== */

.outlook-card {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 18px;
  padding: 24px;
  border-radius: 20px;
  background:
    linear-gradient(
      135deg,
      rgba(13,110,253,.1),
      rgba(111,66,193,.06)
    );
  border: 1px solid rgba(13,110,253,.15);
}

.outlook-icon {
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  display: grid;
  place-items: center;
  border-radius: 15px;
  background: rgba(13,110,253,.1);
  color: var(--bs-primary);
  font-size: 20px;
}

.outlook-card h3 {
  margin: 4px 0;
  font-size: 16px;
}

.outlook-card p {
  margin: 0;
  color: var(--bs-secondary-color);
  font-size: 12px;
}


/* ========================================================================== */
/* ERROR */
/* ========================================================================== */

.ai-error {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 18px;
  margin-bottom: 20px;
  border: 1px solid rgba(220,53,69,.2);
  border-radius: 16px;
  background: rgba(220,53,69,.05);
}

.error-icon {
  color: #dc3545;
  font-size: 22px;
}

.ai-error p {
  margin: 3px 0 0;
  color: var(--bs-secondary-color);
  font-size: 12px;
}

.retry-button {
  margin-left: auto;
  padding: 9px 14px;
  border: 0;
  border-radius: 10px;
  background: #dc3545;
  color: white;
  font-size: 12px;
}


/* ========================================================================== */
/* LOADING */
/* ========================================================================== */

.ai-loading {
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
}

.ai-loader {
  position: relative;
  width: 80px;
  height: 80px;
  display: grid;
  place-items: center;
  margin-bottom: 20px;
  border-radius: 50%;
  background: rgba(13,110,253,.08);
  color: var(--bs-primary);
  font-size: 25px;
}

.loader-orbit {
  position: absolute;
  inset: 0;
  border: 2px solid transparent;
  border-top-color: var(--bs-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.ai-loading h3 {
  margin: 0;
  font-size: 19px;
}

.ai-loading p {
  max-width: 430px;
  margin-top: 7px;
  color: var(--bs-secondary-color);
  font-size: 13px;
  line-height: 1.6;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}


/* ========================================================================== */
/* FOOTER */
/* ========================================================================== */

.ai-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  padding: 15px 3px 5px;
  color: var(--bs-secondary-color);
  font-size: 11px;
}

.ai-footer span {
  display: flex;
  align-items: center;
  gap: 7px;
}

.ai-footer button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 13px;
  border: 1px solid var(--bs-border-color);
  border-radius: 10px;
  background: var(--bs-body-bg);
  color: var(--bs-body-color);
  font-size: 11px;
}

.ai-footer button:hover {
  border-color: var(--bs-primary);
  color: var(--bs-primary);
}


/* ========================================================================== */
/* EMPTY */
/* ========================================================================== */

.empty-insight {
  padding: 25px 0;
  color: var(--bs-secondary-color);
  font-size: 12px;
}

/* ========================================================================== */
/* MONTHLY BUDGET DARK THEME OVERRIDE                                        */
/* ========================================================================== */

.ai-page {
  color: var(--text-primary);
}


/* ========================================================================== */
/* HEADER */
/* ========================================================================== */

.ai-header h1 {
  color: var(--text-primary);
}

.ai-header p {
  color: var(--text-secondary);
}

.ai-eyebrow {
  color: var(--accent);
}

.beta-badge {
  background: var(--accent-soft);
  border-color: var(--border-color);
  color: var(--accent);
}


/* ========================================================================== */
/* MONTH SELECTOR */
/* ========================================================================== */

.month-arrow {
  background: var(--bg-card);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.month-arrow:hover:not(:disabled) {
  background: var(--bg-card-hover);
  border-color: var(--accent);
  color: var(--accent);
}

.month-current small {
  color: var(--text-muted);
}

.month-current strong {
  color: var(--text-primary);
}


/* ========================================================================== */
/* HEALTH HERO */
/* ========================================================================== */

.health-hero {
  background:
    radial-gradient(
      circle at 10% 10%,
      rgba(0, 255, 170, 0.06),
      transparent 35%
    ),
    linear-gradient(
      135deg,
      rgba(13, 110, 253, 0.04),
      transparent 55%
    ),
    var(--bg-card);

  border-color:
    var(--border-color);

  box-shadow:
    0 18px 50px rgba(0, 0, 0, 0.18);
}


/* ========================================================================== */
/* SCORE */
/* ========================================================================== */

.score-track {
  stroke:
    var(--border-color);
}

.score-value strong {
  color:
    var(--text-primary);
}

.score-value span {
  color:
    var(--text-muted);
}


/* ========================================================================== */
/* HEALTH INFO */
/* ========================================================================== */

.health-label {
  color:
    var(--accent);
}

.health-info h2 {
  color:
    var(--text-primary);
}

.health-info p {
  color:
    var(--text-secondary);
}

.health-meta {
  color:
    var(--text-muted);
}


/* ========================================================================== */
/* HERO INSIGHT */
/* ========================================================================== */

.hero-headline {
  background:
    rgba(255, 255, 255, 0.025);

  border-color:
    var(--border-color);
}

.hero-headline span {
  color:
    var(--text-muted);
}

.hero-headline strong {
  color:
    var(--text-primary);
}


/* ========================================================================== */
/* SECTION */
/* ========================================================================== */

.section-heading h3 {
  color:
    var(--text-primary);
}

.section-heading > i {
  color:
    var(--text-secondary);
}


/* ========================================================================== */
/* SCORE CARDS */
/* ========================================================================== */

.score-card {
  background:
    var(--bg-card);

  border-color:
    var(--border-color);

  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.08);
}

.score-card-top > span {
  color:
    var(--text-secondary);
}

.score-card-top > strong {
  color:
    var(--text-primary);
}

.score-bar {
  background:
    var(--bg-card-hover);
}


/* ========================================================================== */
/* METRIC CARDS */
/* ========================================================================== */

.metric-card {
  background:
    var(--bg-card);

  border-color:
    var(--border-color);

  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.08);
}

.metric-card span {
  color:
    var(--text-secondary);
}

.metric-card strong {
  color:
    var(--text-primary);
}

.metric-card small {
  color:
    var(--text-muted);
}


/* ========================================================================== */
/* CONTENT CARDS */
/* ========================================================================== */

.glass-card {
  background:
    var(--bg-card);

  border-color:
    var(--border-color);

  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.08);
}

.card-title h3 {
  color:
    var(--text-primary);
}

.card-title span {
  color:
    var(--accent);
}

.large-text {
  color:
    var(--text-secondary);
}


/* ========================================================================== */
/* INSIGHT LIST */
/* ========================================================================== */

.insight-list > div {
  border-color:
    var(--border-color);
}

.insight-list span {
  color:
    var(--text-muted);
}

.insight-list strong {
  color:
    var(--text-primary);
}


/* ========================================================================== */
/* MINI INSIGHT */
/* ========================================================================== */

.mini-insight {
  background:
    var(--bg-card-hover);

  border:
    1px solid var(--border-color);
}

.mini-insight span {
  color:
    var(--text-muted);
}

.mini-insight p {
  color:
    var(--text-secondary);
}


/* ========================================================================== */
/* LIST */
/* ========================================================================== */

.list-item {
  border-color:
    var(--border-color);
}

.list-item strong {
  color:
    var(--text-primary);
}

.list-item p {
  color:
    var(--text-secondary);
}


/* ========================================================================== */
/* RECOMMENDATION */
/* ========================================================================== */

.recommendation-card {
  background:
    var(--bg-card);

  border-color:
    var(--border-color);

  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.08);
}

.recommendation-header h3 {
  color:
    var(--text-primary);
}

.recommendation-header span {
  color:
    var(--accent);
}

.recommendation-item {
  border-color:
    var(--border-color);
}

.recommendation-top strong {
  color:
    var(--text-primary);
}

.recommendation-content p {
  color:
    var(--text-secondary);
}

.recommendation-content small {
  color:
    var(--text-muted);
}


/* ========================================================================== */
/* OUTLOOK */
/* ========================================================================== */

.outlook-card {
  background:
    radial-gradient(
      circle at 0% 50%,
      rgba(0, 255, 170, 0.06),
      transparent 45%
    ),
    var(--bg-card);

  border-color:
    var(--border-color);
}

.outlook-card h3 {
  color:
    var(--text-primary);
}

.outlook-card p {
  color:
    var(--text-secondary);
}

.outlook-card span {
  color:
    var(--accent);
}


/* ========================================================================== */
/* FOOTER */
/* ========================================================================== */

.ai-footer {
  color:
    var(--text-muted);
}

.ai-footer button {
  background:
    var(--bg-card);

  border-color:
    var(--border-color);

  color:
    var(--text-secondary);
}

.ai-footer button:hover {
  background:
    var(--bg-card-hover);

  border-color:
    var(--accent);

  color:
    var(--accent);
}


/* ========================================================================== */
/* LOADING */
/* ========================================================================== */

.ai-loader {
  background:
    var(--accent-soft);

  color:
    var(--accent);
}

.ai-loading h3 {
  color:
    var(--text-primary);
}

.ai-loading p {
  color:
    var(--text-secondary);
}


/* ========================================================================== */
/* ERROR */
/* ========================================================================== */

.ai-error {
  background:
    rgba(220, 53, 69, 0.06);

  border-color:
    rgba(220, 53, 69, 0.18);
}

.ai-error p {
  color:
    var(--text-secondary);
}


/* ========================================================================== */
/* EMPTY */
/* ========================================================================== */

.empty-insight {
  color:
    var(--text-muted);
}

/* ========================================================================== */
/* RESPONSIVE */
/* ========================================================================== */

@media (max-width: 1100px) {

  .health-hero {
    grid-template-columns:
      140px 1fr;
  }

  .hero-headline {
    grid-column: 1 / -1;
  }

  .score-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .metric-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

}


@media (max-width: 768px) {

  .ai-page {
    padding: 18px;
  }

  .ai-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .month-control {
    width: 100%;
    justify-content: space-between;
  }

  .month-current {
    flex: 1;
  }

  .health-hero {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .health-score-wrapper {
    margin: auto;
  }

  .health-meta {
    justify-content: center;
  }

  .score-grid,
  .metric-grid,
  .content-grid {
    grid-template-columns: 1fr;
  }

  .ai-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .ai-footer button {
    width: 100%;
    justify-content: center;
  }

}

</style>