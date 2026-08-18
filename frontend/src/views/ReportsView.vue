<script setup>

import {
  computed,
  onMounted,
  ref
} from 'vue'

import api from '../services/api'


// ========================================
// STATE
// ========================================

const selectedMonth = ref(
  new Date()
    .toISOString()
    .slice(0, 7)
)

const loading = ref(false)

const errorMessage = ref('')

const data = ref({
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
  saving: 0,
  expenseRate: 0,
  savingRate: 0,
  categoryExpenses: [],
  budgetProgress: [],
  accounts: []
})


// ========================================
// HELPERS
// ========================================

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


function formatNumber(value) {

  return new Intl.NumberFormat(
    'id-ID'
  ).format(
    Number(value || 0)
  )

}


function formatMonth(month) {

  if (!month) {

    return ''

  }

  const [year, monthNumber] =
    month.split('-').map(Number)

  const date =
    new Date(
      year,
      monthNumber - 1,
      1
    )

  return new Intl.DateTimeFormat(
    'id-ID',
    {
      month: 'long',
      year: 'numeric'
    }
  ).format(date)

}


function getCategoryIcon(category) {

  return (
    category?.category?.icon ||
    category?.Category?.icon ||
    'bi-tag'
  )

}


function getCategoryColor(category) {

  return (
    category?.category?.color ||
    category?.Category?.color ||
    '#64748b'
  )

}


// ========================================
// COMPUTED
// ========================================

const monthLabel = computed(() => {

  return formatMonth(
    selectedMonth.value
  )

})


const categoryExpenses = computed(() => {

  return Array.isArray(
    data.value.categoryExpenses
  )
    ? [...data.value.categoryExpenses]
        .sort(
          (a, b) =>
            Number(b.amount || 0) -
            Number(a.amount || 0)
        )
    : []

})


const highestExpenseCategory =
  computed(() => {

    return (
      categoryExpenses.value[0] ||
      null
    )

  })


const maxCategoryExpense =
  computed(() => {

    return Math.max(
      ...categoryExpenses.value.map(
        item =>
          Number(item.amount || 0)
      ),
      1
    )

  })


const budgetProgress =
  computed(() => {

    return Array.isArray(
      data.value.budgetProgress
    )
      ? [...data.value.budgetProgress]
          .sort(
            (a, b) =>
              Number(
                b.spent || 0
              ) -
              Number(
                a.spent || 0
              )
          )
      : []

  })


const maxBudgetValue =
  computed(() => {

    return Math.max(
      ...budgetProgress.value.map(
        item =>
          Math.max(
            Number(item.budget || 0),
            Number(item.spent || 0)
          )
      ),
      1
    )

  })


const incomeExpenseTotal =
  computed(() => {

    return (
      Number(data.value.totalIncome || 0) +
      Number(data.value.totalExpense || 0)
    )

  })


const incomeVisualWidth =
  computed(() => {

    if (
      incomeExpenseTotal.value <= 0
    ) {

      return 0

    }

    return Math.round(
      Number(data.value.totalIncome || 0) /
      incomeExpenseTotal.value *
      100
    )

  })


const expenseVisualWidth =
  computed(() => {

    if (
      incomeExpenseTotal.value <= 0
    ) {

      return 0

    }

    return Math.round(
      Number(data.value.totalExpense || 0) /
      incomeExpenseTotal.value *
      100
    )

  })


function budgetPercentage(budget) {

  const value =
    Number(
      budget.percentage ??
      (
        Number(budget.budget || 0) > 0
          ? Number(budget.spent || 0) /
            Number(budget.budget || 0) *
            100
          : 0
      )
    )

  return Math.round(value)

}


function budgetStatus(budget) {

  const percentage =
    budgetPercentage(budget)

  if (percentage >= 100) {

    return {
      className: 'danger',
      label: 'Melebihi budget',
      icon: 'bi-exclamation-circle-fill'
    }

  }

  if (percentage >= 80) {

    return {
      className: 'warning',
      label: 'Mendekati batas',
      icon: 'bi-exclamation-triangle-fill'
    }

  }

  return {
    className: 'success',
    label: 'Aman',
    icon: 'bi-check-circle-fill'
  }

}


function budgetWidth(budget) {

  return Math.min(
    budgetPercentage(budget),
    100
  )

}


// ========================================
// LOAD REPORT
// ========================================

async function loadReport() {

  loading.value = true

  errorMessage.value = ''

  try {

    const response =
      await api.get(
        '/dashboard',
        {
          params: {
            month:
              selectedMonth.value
          }
        }
      )


    const payload =
      response.data?.data ||
      response.data


    data.value = {

      totalIncome:
        Number(
          payload?.totalIncome || 0
        ),

      totalExpense:
        Number(
          payload?.totalExpense || 0
        ),

      balance:
        Number(
          payload?.balance || 0
        ),

      saving:
        Number(
          payload?.saving || 0
        ),

      expenseRate:
        Number(
          payload?.expenseRate || 0
        ),

      savingRate:
        Number(
          payload?.savingRate || 0
        ),

      categoryExpenses:
        payload?.categoryExpenses ||
        [],

      budgetProgress:
        payload?.budgetProgress ||
        [],

      accounts:
        payload?.accounts ||
        []

    }

  } catch (error) {

    console.error(
      'GET REPORT ERROR:',
      error
    )

    errorMessage.value =
      error.response?.data?.message ||
      'Gagal mengambil data laporan.'

  } finally {

    loading.value = false

  }

}


function changeMonth() {

  loadReport()

}


onMounted(
  loadReport
)

</script>


<template>

  <div class="reports-page">

    <!-- ================================= -->
    <!-- HEADER -->
    <!-- ================================= -->

    <div class="page-header mb-4">

      <div>

        <h1>
          Laporan
        </h1>

        <p>
          Analisis kondisi keuangan berdasarkan periode yang dipilih.
        </p>

      </div>


      <div class="month-control">

        <i class="bi bi-calendar3"></i>

        <input
          v-model="selectedMonth"
          type="month"
          @change="changeMonth"
        />

      </div>

    </div>


    <!-- ================================= -->
    <!-- ERROR -->
    <!-- ================================= -->

    <div
      v-if="errorMessage"
      class="report-alert"
    >

      <i class="bi bi-exclamation-circle-fill"></i>

      <span>
        {{ errorMessage }}
      </span>

      <button
        @click="loadReport"
      >
        Coba lagi
      </button>

    </div>


    <!-- ================================= -->
    <!-- LOADING -->
    <!-- ================================= -->

    <div
      v-if="loading"
      class="budget-card loading-card"
    >

      <div class="loading-spinner"></div>

      <strong>
        Memuat laporan...
      </strong>

      <span>
        Mengambil data keuangan {{ monthLabel }}.
      </span>

    </div>


    <!-- ================================= -->
    <!-- REPORT -->
    <!-- ================================= -->

    <template v-else>

      <!-- SUMMARY -->

      <div class="row g-3 mb-4">

        <!-- INCOME -->

        <div class="col-xl-3 col-md-6">

          <div class="budget-card summary-card">

            <div class="summary-icon income">

              <i class="bi bi-arrow-down-left"></i>

            </div>

            <div>

              <span>
                Total Pemasukan
              </span>

              <strong>
                {{ formatMoney(data.totalIncome) }}
              </strong>

            </div>

          </div>

        </div>


        <!-- EXPENSE -->

        <div class="col-xl-3 col-md-6">

          <div class="budget-card summary-card">

            <div class="summary-icon expense">

              <i class="bi bi-arrow-up-right"></i>

            </div>

            <div>

              <span>
                Total Pengeluaran
              </span>

              <strong>
                {{ formatMoney(data.totalExpense) }}
              </strong>

            </div>

          </div>

        </div>


        <!-- SAVING -->

        <div class="col-xl-3 col-md-6">

          <div class="budget-card summary-card">

            <div class="summary-icon saving">

              <i class="bi bi-piggy-bank"></i>

            </div>

            <div>

              <span>
                Saving
              </span>

              <strong
                :class="{
                  negative:
                    data.saving < 0
                }"
              >
                {{ formatMoney(data.saving) }}
              </strong>

            </div>

          </div>

        </div>


        <!-- RATE -->

        <div class="col-xl-3 col-md-6">

          <div class="budget-card summary-card">

            <div class="summary-icon rate">

              <i class="bi bi-percent"></i>

            </div>

            <div>

              <span>
                Expense Rate
              </span>

              <strong>
                {{ formatNumber(data.expenseRate) }}%
              </strong>

            </div>

          </div>

        </div>

      </div>


      <!-- ================================= -->
      <!-- MAIN GRID -->
      <!-- ================================= -->

      <div class="row g-3 mb-3">

        <!-- INCOME VS EXPENSE -->

        <div class="col-lg-7">

          <div class="budget-card report-card">

            <div class="card-header-custom">

              <div>

                <h5>
                  Income vs Expense
                </h5>

                <span>
                  Perbandingan pemasukan dan pengeluaran {{ monthLabel }}.
                </span>

              </div>

              <i class="bi bi-bar-chart-fill"></i>

            </div>


            <div class="comparison">

              <div class="comparison-item">

                <div class="comparison-label">

                  <div>

                    <span class="dot income-dot"></span>

                    Pemasukan

                  </div>

                  <strong>
                    {{ formatMoney(data.totalIncome) }}
                  </strong>

                </div>


                <div class="comparison-track">

                  <div
                    class="comparison-fill income-fill"
                    :style="{
                      width:
                        incomeVisualWidth +
                        '%'
                    }"
                  ></div>

                </div>

              </div>


              <div class="comparison-item">

                <div class="comparison-label">

                  <div>

                    <span class="dot expense-dot"></span>

                    Pengeluaran

                  </div>

                  <strong>
                    {{ formatMoney(data.totalExpense) }}
                  </strong>

                </div>


                <div class="comparison-track">

                  <div
                    class="comparison-fill expense-fill"
                    :style="{
                      width:
                        expenseVisualWidth +
                        '%'
                    }"
                  ></div>

                </div>

              </div>

            </div>


            <div class="saving-highlight">

              <div class="saving-highlight-icon">

                <i class="bi bi-graph-up-arrow"></i>

              </div>

              <div>

                <span>
                  Tingkat saving
                </span>

                <strong>
                  {{ data.savingRate }}%
                </strong>

              </div>

              <small>
                {{ formatMoney(data.saving) }}
                tersisa setelah pengeluaran
              </small>

            </div>

          </div>

        </div>


        <!-- TOP CATEGORY -->

        <div class="col-lg-5">

          <div class="budget-card report-card">

            <div class="card-header-custom">

              <div>

                <h5>
                  Pengeluaran Terbesar
                </h5>

                <span>
                  Kategori dengan pengeluaran tertinggi.
                </span>

              </div>

              <i class="bi bi-pie-chart-fill"></i>

            </div>


            <div
              v-if="highestExpenseCategory"
              class="top-category"
            >

              <div
                class="top-category-icon"
                :style="{
                  backgroundColor:
                    `${getCategoryColor(highestExpenseCategory)}18`,
                  color:
                    getCategoryColor(highestExpenseCategory)
                }"
              >

                <i
                  class="bi"
                  :class="
                    getCategoryIcon(
                      highestExpenseCategory
                    )
                  "
                ></i>

              </div>


              <div class="top-category-info">

                <span>
                  {{ highestExpenseCategory.name }}
                </span>

                <strong>
                  {{
                    formatMoney(
                      highestExpenseCategory.amount
                    )
                  }}
                </strong>

                <div class="mini-progress">

                  <div
                    :style="{
                      width:
                        '100%',
                      backgroundColor:
                        getCategoryColor(
                          highestExpenseCategory
                        )
                    }"
                  ></div>

                </div>

              </div>

            </div>


            <div
              v-else
              class="small-empty"
            >

              <i class="bi bi-pie-chart"></i>

              <span>
                Belum ada pengeluaran.
              </span>

            </div>

          </div>

        </div>

      </div>


      <!-- ================================= -->
      <!-- CATEGORY + BUDGET -->
      <!-- ================================= -->

      <div class="row g-3">

        <!-- CATEGORY BREAKDOWN -->

        <div class="col-lg-6">

          <div class="budget-card report-card">

            <div class="card-header-custom">

              <div>

                <h5>
                  Pengeluaran per Kategori
                </h5>

                <span>
                  Breakdown pengeluaran {{ monthLabel }}.
                </span>

              </div>

              <strong>
                {{ categoryExpenses.length }}
              </strong>

            </div>


            <div
              v-if="categoryExpenses.length"
              class="category-list"
            >

              <div
                v-for="category in categoryExpenses"
                :key="category.name"
                class="category-row"
              >

                <div class="category-row-top">

                  <div class="category-name">

                    <span
                      class="category-dot"
                      :style="{
                        backgroundColor:
                          getCategoryColor(
                            category
                          )
                      }"
                    ></span>

                    <span>
                      {{ category.name }}
                    </span>

                  </div>


                  <strong>
                    {{
                      formatMoney(
                        category.amount
                      )
                    }}
                  </strong>

                </div>


                <div class="category-track">

                  <div
                    class="category-fill"
                    :style="{
                      width:
                        (
                          Number(
                            category.amount || 0
                          ) /
                          maxCategoryExpense *
                          100
                        ) + '%',

                      backgroundColor:
                        getCategoryColor(
                          category
                        )
                    }"
                  ></div>

                </div>

              </div>

            </div>


            <div
              v-else
              class="small-empty"
            >

              <i class="bi bi-receipt"></i>

              <span>
                Belum ada data pengeluaran untuk periode ini.
              </span>

            </div>

          </div>

        </div>


        <!-- BUDGET VS ACTUAL -->

        <div class="col-lg-6">

          <div class="budget-card report-card">

            <div class="card-header-custom">

              <div>

                <h5>
                  Budget vs Actual
                </h5>

                <span>
                  Perbandingan batas budget dengan realisasi.
                </span>

              </div>

              <i class="bi bi-wallet2"></i>

            </div>


            <div
              v-if="budgetProgress.length"
              class="budget-report-list"
            >

              <div
                v-for="budget in budgetProgress"
                :key="budget.id"
                class="budget-report-item"
              >

                <div class="budget-report-top">

                  <div>

                    <strong>
                      {{ budget.category }}
                    </strong>

                    <span>
                      {{
                        formatMoney(
                          budget.spent
                        )
                      }}
                      /
                      {{
                        formatMoney(
                          budget.budget
                        )
                      }}
                    </span>

                  </div>


                  <strong
                    :class="
                      budgetStatus(
                        budget
                      ).className
                    "
                  >
                    {{ budgetPercentage(budget) }}%
                  </strong>

                </div>


                <div class="budget-track">

                  <div
                    class="budget-fill"
                    :class="
                      budgetStatus(
                        budget
                      ).className
                    "
                    :style="{
                      width:
                        budgetWidth(
                          budget
                        ) + '%'
                    }"
                  ></div>

                </div>


                <div class="budget-report-footer">

                  <span
                    :class="
                      budgetStatus(
                        budget
                      ).className
                    "
                  >

                    <i
                      class="bi"
                      :class="
                        budgetStatus(
                          budget
                        ).icon
                      "
                    ></i>

                    {{
                      budgetStatus(
                        budget
                      ).label
                    }}

                  </span>


                  <small>
                    Budget:
                    {{
                      formatMoney(
                        budget.budget
                      )
                    }}
                  </small>

                </div>

              </div>

            </div>


            <div
              v-else
              class="small-empty"
            >

              <i class="bi bi-wallet2"></i>

              <span>
                Belum ada budget untuk periode ini.
              </span>

            </div>

          </div>

        </div>

      </div>


      <!-- ================================= -->
      <!-- ACCOUNTS -->
      <!-- ================================= -->

      <div class="budget-card accounts-card mt-3">

        <div class="card-header-custom">

          <div>

            <h5>
              Saldo Accounts
            </h5>

            <span>
              Distribusi saldo berdasarkan account.
            </span>

          </div>

          <strong>
            {{ data.accounts.length }}
          </strong>

        </div>


        <div
          v-if="data.accounts.length"
          class="accounts-grid"
        >

          <div
            v-for="account in data.accounts"
            :key="account.id"
            class="account-report"
          >

            <div class="account-icon">

              <i
                class="bi"
                :class="
                  account.type === 'bank'
                    ? 'bi-bank'
                    : account.type === 'cash'
                      ? 'bi-cash-stack'
                      : 'bi-phone'
                "
              ></i>

            </div>


            <div>

              <span>
                {{ account.name }}
              </span>

              <strong>
                {{ formatMoney(account.balance) }}
              </strong>

            </div>

          </div>

        </div>


        <div
          v-else
          class="small-empty"
        >

          <i class="bi bi-wallet2"></i>

          <span>
            Belum ada account.
          </span>

        </div>

      </div>

    </template>

  </div>

</template>


<style scoped>

.page-header {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 20px;

}


.page-header h1 {

  margin: 0;

  font-size: 24px;

  font-weight: 800;

}


.page-header p {

  margin:
    5px 0 0;

  color:
    var(--text-secondary);

  font-size: 13px;

}


/* ========================================
   MONTH
======================================== */

.month-control {

  height: 40px;

  display: flex;

  align-items: center;

  gap: 8px;

  padding:
    0 11px;

  border:
    1px solid var(--border-color);

  border-radius: 9px;

  background:
    var(--bg-card);

  color:
    var(--accent);

}


.month-control input {

  width: 125px;

  border: none;

  outline: none;

  background: transparent;

  color:
    var(--text-primary);

  font-size: 12px;

}


/* ========================================
   ALERT
======================================== */

.report-alert {

  display: flex;

  align-items: center;

  gap: 10px;

  margin-bottom: 16px;

  padding:
    12px 14px;

  border-radius: 10px;

  background:
    rgba(239, 68, 68, .10);

  color:
    var(--danger);

  font-size: 12px;

}


.report-alert span {

  flex: 1;

}


.report-alert button {

  border: none;

  background: transparent;

  color:
    inherit;

  font-weight: 700;

}


/* ========================================
   SUMMARY
======================================== */

.summary-card {

  min-height: 116px;

  display: flex;

  align-items: center;

  gap: 14px;

  padding: 19px;

}


.summary-icon {

  width: 46px;

  height: 46px;

  flex-shrink: 0;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 13px;

  font-size: 20px;

}


.summary-icon.income {

  background:
    rgba(34, 197, 94, .10);

  color:
    var(--success);

}


.summary-icon.expense {

  background:
    rgba(239, 68, 68, .10);

  color:
    var(--danger);

}


.summary-icon.saving {

  background:
    var(--accent-soft);

  color:
    var(--accent);

}


.summary-icon.rate {

  background:
    rgba(245, 158, 11, .10);

  color:
    #f59e0b;

}


.summary-card span {

  display: block;

  margin-bottom: 5px;

  color:
    var(--text-secondary);

  font-size: 11px;

}


.summary-card strong {

  display: block;

  color:
    var(--text-primary);

  font-size: 16px;

  font-weight: 800;

}


.summary-card strong.negative {

  color:
    var(--danger);

}


/* ========================================
   REPORT CARD
======================================== */

.report-card {

  min-height: 100%;

  padding: 18px;

}


.card-header-custom {

  display: flex;

  align-items: flex-start;

  justify-content: space-between;

  gap: 12px;

  margin-bottom: 20px;

}


.card-header-custom h5 {

  margin: 0;

  color:
    var(--text-primary);

  font-size: 13px;

  font-weight: 800;

}


.card-header-custom span {

  display: block;

  margin-top: 4px;

  color:
    var(--text-muted);

  font-size: 10px;

}


.card-header-custom > i {

  color:
    var(--accent);

  font-size: 18px;

}


.card-header-custom > strong {

  min-width: 28px;

  height: 28px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 8px;

  background:
    var(--accent-soft);

  color:
    var(--accent);

  font-size: 11px;

}


/* ========================================
   COMPARISON
======================================== */

.comparison {

  display: flex;

  flex-direction: column;

  gap: 19px;

}


.comparison-item {

  display: flex;

  flex-direction: column;

  gap: 8px;

}


.comparison-label {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 10px;

  font-size: 11px;

}


.comparison-label > div {

  display: flex;

  align-items: center;

  gap: 7px;

  color:
    var(--text-secondary);

}


.comparison-label strong {

  color:
    var(--text-primary);

  font-size: 12px;

}


.dot {

  width: 8px;

  height: 8px;

  border-radius: 50%;

}


.income-dot {

  background:
    var(--success);

}


.expense-dot {

  background:
    var(--danger);

}


.comparison-track {

  width: 100%;

  height: 13px;

  overflow: hidden;

  border-radius: 999px;

  background:
    var(--bg-card-hover);

}


.comparison-fill {

  height: 100%;

  min-width: 0;

  border-radius: inherit;

  transition:
    width 500ms ease;

}


.income-fill {

  background:
    var(--success);

}


.expense-fill {

  background:
    var(--danger);

}


.saving-highlight {

  display: flex;

  align-items: center;

  gap: 10px;

  margin-top: 24px;

  padding: 12px;

  border:
    1px solid var(--border-color);

  border-radius: 11px;

  background:
    var(--bg-card-hover);

}


.saving-highlight-icon {

  width: 35px;

  height: 35px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 9px;

  background:
    var(--accent-soft);

  color:
    var(--accent);

}


.saving-highlight div:nth-child(2) {

  display: flex;

  flex-direction: column;

  gap: 2px;

}


.saving-highlight span {

  color:
    var(--text-muted);

  font-size: 9px;

}


.saving-highlight strong {

  color:
    var(--text-primary);

  font-size: 13px;

}


.saving-highlight small {

  margin-left: auto;

  color:
    var(--text-muted);

  font-size: 9px;

  text-align: right;

}


/* ========================================
   TOP CATEGORY
======================================== */

.top-category {

  display: flex;

  align-items: center;

  gap: 13px;

  min-height: 130px;

}


.top-category-icon {

  width: 60px;

  height: 60px;

  flex-shrink: 0;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 16px;

  font-size: 25px;

}


.top-category-info {

  flex: 1;

  min-width: 0;

}


.top-category-info > span {

  display: block;

  margin-bottom: 4px;

  color:
    var(--text-muted);

  font-size: 10px;

}


.top-category-info > strong {

  display: block;

  color:
    var(--text-primary);

  font-size: 18px;

}


.mini-progress {

  width: 100%;

  height: 6px;

  overflow: hidden;

  margin-top: 9px;

  border-radius: 999px;

  background:
    var(--bg-card-hover);

}


.mini-progress div {

  height: 100%;

  border-radius: inherit;

}


/* ========================================
   CATEGORY
======================================== */

.category-list {

  display: flex;

  flex-direction: column;

  gap: 15px;

}


.category-row {

  display: flex;

  flex-direction: column;

  gap: 7px;

}


.category-row-top {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 10px;

}


.category-name {

  display: flex;

  align-items: center;

  gap: 7px;

  color:
    var(--text-secondary);

  font-size: 11px;

}


.category-name strong {

  color:
    var(--text-primary);

}


.category-dot {

  width: 8px;

  height: 8px;

  flex-shrink: 0;

  border-radius: 50%;

}


.category-row-top > strong {

  color:
    var(--text-primary);

  font-size: 11px;

}


.category-track {

  width: 100%;

  height: 7px;

  overflow: hidden;

  border-radius: 999px;

  background:
    var(--bg-card-hover);

}


.category-fill {

  height: 100%;

  min-width: 2px;

  border-radius: inherit;

  transition:
    width 400ms ease;

}


/* ========================================
   BUDGET
======================================== */

.budget-report-list {

  display: flex;

  flex-direction: column;

  gap: 18px;

}


.budget-report-item {

  display: flex;

  flex-direction: column;

  gap: 7px;

}


.budget-report-top {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 10px;

}


.budget-report-top > div {

  display: flex;

  flex-direction: column;

  gap: 2px;

}


.budget-report-top strong {

  color:
    var(--text-primary);

  font-size: 11px;

}


.budget-report-top span {

  color:
    var(--text-muted);

  font-size: 9px;

}


.budget-report-top > strong {

  font-size: 11px;

}


.budget-track {

  width: 100%;

  height: 7px;

  overflow: hidden;

  border-radius: 999px;

  background:
    var(--bg-card-hover);

}


.budget-fill {

  height: 100%;

  min-width: 0;

  border-radius: inherit;

  transition:
    width 400ms ease;

}


.budget-fill.success {

  background:
    var(--success);

}


.budget-fill.warning {

  background:
    #f59e0b;

}


.budget-fill.danger {

  background:
    var(--danger);

}


.budget-report-top > strong.success {

  color:
    var(--success);

}


.budget-report-top > strong.warning {

  color:
    #f59e0b;

}


.budget-report-top > strong.danger {

  color:
    var(--danger);

}


.budget-report-footer {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 10px;

}


.budget-report-footer span {

  display: flex;

  align-items: center;

  gap: 4px;

  font-size: 9px;

  font-weight: 700;

}


.budget-report-footer span.success {

  color:
    var(--success);

}


.budget-report-footer span.warning {

  color:
    #f59e0b;

}


.budget-report-footer span.danger {

  color:
    var(--danger);

}


.budget-report-footer small {

  color:
    var(--text-muted);

  font-size: 9px;

}


/* ========================================
   ACCOUNTS
======================================== */

.accounts-card {

  padding: 18px;

}


.accounts-grid {

  display: grid;

  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap: 10px;

}


.account-report {

  display: flex;

  align-items: center;

  gap: 10px;

  padding: 12px;

  border:
    1px solid var(--border-color);

  border-radius: 10px;

  background:
    var(--bg-card-hover);

}


.account-icon {

  width: 35px;

  height: 35px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  border-radius: 9px;

  background:
    var(--accent-soft);

  color:
    var(--accent);

}


.account-report > div:last-child {

  min-width: 0;

  display: flex;

  flex-direction: column;

  gap: 2px;

}


.account-report span {

  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;

  color:
    var(--text-muted);

  font-size: 9px;

}


.account-report strong {

  color:
    var(--text-primary);

  font-size: 11px;

}


/* ========================================
   EMPTY / LOADING
======================================== */

.small-empty {

  min-height: 130px;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  gap: 7px;

  color:
    var(--text-muted);

  font-size: 10px;

  text-align: center;

}


.small-empty i {

  color:
    var(--accent);

  font-size: 25px;

}


.loading-card {

  min-height: 300px;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  text-align: center;

}


.loading-card strong {

  color:
    var(--text-primary);

  font-size: 13px;

}


.loading-card > span {

  margin-top: 5px;

  color:
    var(--text-muted);

  font-size: 10px;

}


.loading-spinner {

  width: 32px;

  height: 32px;

  margin-bottom: 14px;

  border:
    3px solid var(--border-color);

  border-top-color:
    var(--accent);

  border-radius: 50%;

  animation:
    report-spin 700ms linear infinite;

}


@keyframes report-spin {

  to {

    transform:
      rotate(360deg);

  }

}


/* ========================================
   RESPONSIVE
======================================== */

@media (max-width: 991.98px) {

  .accounts-grid {

    grid-template-columns:
      repeat(2, minmax(0, 1fr));

  }

}


@media (max-width: 767.98px) {

  .page-header {

    align-items: flex-start;

    flex-direction: column;

  }


  .month-control {

    width: 100%;

  }


  .month-control input {

    flex: 1;

    width: auto;

  }


  .saving-highlight {

    align-items: flex-start;

    flex-wrap: wrap;

  }


  .saving-highlight small {

    width: 100%;

    margin-left: 45px;

    text-align: left;

  }

}


@media (max-width: 575.98px) {

  .page-header h1 {

    font-size: 21px;

  }


  .accounts-grid {

    grid-template-columns:
      1fr;

  }

}

</style>