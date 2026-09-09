<script setup>

import {
  computed,
  onMounted,
  ref
} from 'vue'

import api from '../services/api'


/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

const selectedMonth = ref(
  new Date()
    .toISOString()
    .slice(0, 7)
)

const loading = ref(false)
const errorMessage = ref('')

const dashboard = ref({
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

const savings = ref([])

const savingsLoading = ref(false)


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

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


function formatPercent(value) {

  const number = Number(value || 0)

  return `${Math.round(number)}%`

}


function formatMonth(month) {

  if (!month) {
    return ''
  }

  const [
    year,
    monthNumber
  ] = month
    .split('-')
    .map(Number)

  const date = new Date(
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


function formatDate(value) {

  if (!value) {
    return '-'
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value
  }

  return new Intl.DateTimeFormat(
    'id-ID',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }
  ).format(date)

}


function getCategoryIcon(category) {

  return (
    category?.category?.icon ||
    category?.Category?.icon ||
    category?.icon ||
    'bi-tag'
  )

}


function getCategoryColor(category) {

  return (
    category?.category?.color ||
    category?.Category?.color ||
    category?.color ||
    '#64748b'
  )

}


function savingTypeLabel(type) {

  if (type === 'free') {
    return 'Tabungan Bebas'
  }

  return 'Tabungan Target'

}


function savingTypeIcon(type) {

  if (type === 'free') {
    return 'bi-stars'
  }

  return 'bi-bullseye'
}


function routineFrequencyLabel(
  frequency
) {

  const labels = {
    weekly: 'Mingguan',
    monthly: 'Bulanan',
    yearly: 'Tahunan'
  }

  return (
    labels[frequency] ||
    '-'
  )

}


function accountIcon(type) {

  if (type === 'bank') {
    return 'bi-bank'
  }

  if (type === 'cash') {
    return 'bi-cash-stack'
  }

  return 'bi-phone'
}


/*
|--------------------------------------------------------------------------
| COMPUTED - GENERAL
|--------------------------------------------------------------------------
*/

const monthLabel = computed(() => {

  return formatMonth(
    selectedMonth.value
  )

})


const totalIncome = computed(() => {

  return Number(
    dashboard.value.totalIncome || 0
  )

})


const totalExpense = computed(() => {

  return Number(
    dashboard.value.totalExpense || 0
  )

})


const cashflow = computed(() => {

  return (
    totalIncome.value -
    totalExpense.value
  )

})


const cashflowRate = computed(() => {

  if (
    totalIncome.value <= 0
  ) {
    return 0
  }

  return (
    cashflow.value /
    totalIncome.value
  ) * 100

})


const expenseRate = computed(() => {

  if (
    totalIncome.value <= 0
  ) {
    return 0
  }

  return (
    totalExpense.value /
    totalIncome.value
  ) * 100

})


/*
|--------------------------------------------------------------------------
| CATEGORY ANALYSIS
|--------------------------------------------------------------------------
*/

const categoryExpenses = computed(() => {

  const list =
    Array.isArray(
      dashboard.value.categoryExpenses
    )
      ? dashboard.value.categoryExpenses
      : []

  return [...list]
    .sort(
      (a, b) =>
        Number(b.amount || 0) -
        Number(a.amount || 0)
    )

})


const highestExpenseCategory =
  computed(() => {

    return (
      categoryExpenses.value[0] ||
      null
    )

  })


const lowestExpenseCategory =
  computed(() => {

    if (
      !categoryExpenses.value.length
    ) {
      return null
    }

    return (
      [...categoryExpenses.value]
        .sort(
          (a, b) =>
            Number(a.amount || 0) -
            Number(b.amount || 0)
        )[0]
    )

  })


const maxCategoryExpense =
  computed(() => {

    return Math.max(
      ...categoryExpenses.value.map(
        item =>
          Number(
            item.amount || 0
          )
      ),
      1
    )

  })


const categoryExpensePercentage =
  category => {

    const amount =
      Number(
        category?.amount || 0
      )

    if (
      totalExpense.value <= 0
    ) {
      return 0
    }

    return (
      amount /
      totalExpense.value
    ) * 100

  }


/*
|--------------------------------------------------------------------------
| BUDGET ANALYSIS
|--------------------------------------------------------------------------
*/

const budgetProgress =
  computed(() => {

    const list =
      Array.isArray(
        dashboard.value.budgetProgress
      )
        ? dashboard.value.budgetProgress
        : []

    return [...list]
      .sort(
        (a, b) =>
          Number(b.spent || 0) -
          Number(a.spent || 0)
      )

  })


function budgetPercentage(
  budget
) {

  const explicit =
    budget?.percentage

  if (
    explicit !== undefined &&
    explicit !== null
  ) {
    return Math.round(
      Number(explicit)
    )
  }

  const limit =
    Number(
      budget?.budget || 0
    )

  const spent =
    Number(
      budget?.spent || 0
    )

  if (limit <= 0) {
    return 0
  }

  return Math.round(
    spent /
    limit *
    100
  )

}


function budgetStatus(
  budget
) {

  const percentage =
    budgetPercentage(
      budget
    )

  if (
    percentage >= 100
  ) {

    return {
      className: 'danger',
      label: 'Melebihi budget',
      icon: 'bi-exclamation-circle-fill'
    }

  }

  if (
    percentage >= 80
  ) {

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


function budgetWidth(
  budget
) {

  return Math.min(
    budgetPercentage(
      budget
    ),
    100
  )

}


const totalBudget =
  computed(() => {

    return budgetProgress.value.reduce(
      (total, item) =>
        total +
        Number(
          item.budget || 0
        ),
      0
    )

  })


const totalBudgetSpent =
  computed(() => {

    return budgetProgress.value.reduce(
      (total, item) =>
        total +
        Number(
          item.spent || 0
        ),
      0
    )

  })


const remainingBudget =
  computed(() => {

    return (
      totalBudget.value -
      totalBudgetSpent.value
    )

  })


const exceededBudgets =
  computed(() => {

    return budgetProgress.value
      .filter(
        item =>
          budgetPercentage(item) >= 100
      )

  })


/*
|--------------------------------------------------------------------------
| SAVINGS ANALYSIS
|--------------------------------------------------------------------------
*/

const validSavings = computed(() => {

  return Array.isArray(
    savings.value
  )
    ? savings.value
    : []

})


const targetSavings =
  computed(() => {

    return validSavings.value
      .filter(
        saving =>
          saving.type !== 'free'
      )

  })


const freeSavings =
  computed(() => {

    return validSavings.value
      .filter(
        saving =>
          saving.type === 'free'
      )

  })


const activeSavings =
  computed(() => {

    return validSavings.value
      .filter(
        saving =>
          saving.status === 'active'
      )

  })


const completedSavings =
  computed(() => {

    return validSavings.value
      .filter(
        saving =>
          saving.status === 'completed'
      )

  })


const cancelledSavings =
  computed(() => {

    return validSavings.value
      .filter(
        saving =>
          saving.status === 'cancelled'
      )

  })


const totalSavingsBalance =
  computed(() => {

    return validSavings.value.reduce(
      (total, saving) =>
        total +
        Number(
          saving.current_amount || 0
        ),
      0
    )

  })


const totalTargetAmount =
  computed(() => {

    return targetSavings.value.reduce(
      (total, saving) =>
        total +
        Number(
          saving.target_amount || 0
        ),
      0
    )

  })


const totalTargetCurrent =
  computed(() => {

    return targetSavings.value.reduce(
      (total, saving) =>
        total +
        Number(
          saving.current_amount || 0
        ),
      0
    )

  })


const totalTargetRemaining =
  computed(() => {

    return Math.max(
      totalTargetAmount.value -
      totalTargetCurrent.value,
      0
    )

  })


const overallTargetProgress =
  computed(() => {

    if (
      totalTargetAmount.value <= 0
    ) {
      return 0
    }

    return Math.min(
      (
        totalTargetCurrent.value /
        totalTargetAmount.value
      ) * 100,
      100
    )

  })


/*
|--------------------------------------------------------------------------
| MONTHLY SAVINGS TRANSACTIONS
|--------------------------------------------------------------------------
*/

const monthlySavingsTransactions =
  computed(() => {

    const result = []

    for (
      const saving
      of validSavings.value
    ) {

      const transactions =
        Array.isArray(
          saving.transactions
        )
          ? saving.transactions
          : []

      for (
        const transaction
        of transactions
      ) {

        const date =
          String(
            transaction.transaction_date ||
            ''
          )

        if (
          date.startsWith(
            selectedMonth.value
          )
        ) {

          result.push({
            ...transaction,
            savingName:
              saving.name,
            savingType:
              saving.type
          })

        }

      }

    }

    return result.sort(
      (a, b) =>
        String(
          b.transaction_date
        ).localeCompare(
          String(
            a.transaction_date
          )
        )
    )

  })


const monthlyDeposits =
  computed(() => {

    return monthlySavingsTransactions.value
      .filter(
        item =>
          item.type === 'deposit'
      )
      .reduce(
        (total, item) =>
          total +
          Number(
            item.amount || 0
          ),
        0
      )

  })


const monthlyWithdrawals =
  computed(() => {

    return monthlySavingsTransactions.value
      .filter(
        item =>
          item.type === 'withdrawal'
      )
      .reduce(
        (total, item) =>
          total +
          Number(
            item.amount || 0
          ),
        0
      )

  })


const monthlySavingNet =
  computed(() => {

    return (
      monthlyDeposits.value -
      monthlyWithdrawals.value
    )

  })


const monthlyDepositCount =
  computed(() => {

    return monthlySavingsTransactions.value
      .filter(
        item =>
          item.type === 'deposit'
      )
      .length

  })


const monthlyWithdrawalCount =
  computed(() => {

    return monthlySavingsTransactions.value
      .filter(
        item =>
          item.type === 'withdrawal'
      )
      .length

  })


/*
|--------------------------------------------------------------------------
| SAVING PROGRESS
|--------------------------------------------------------------------------
*/

function savingProgress(
  saving
) {

  const target =
    Number(
      saving?.target_amount || 0
    )

  const current =
    Number(
      saving?.current_amount || 0
    )

  if (
    saving?.type === 'free'
  ) {
    return null
  }

  if (
    target <= 0
  ) {
    return 0
  }

  return Math.min(
    (
      current /
      target
    ) * 100,
    100
  )

}


function savingRemaining(
  saving
) {

  const target =
    Number(
      saving?.target_amount || 0
    )

  const current =
    Number(
      saving?.current_amount || 0
    )

  return Math.max(
    target - current,
    0
  )

}


const bestSaving =
  computed(() => {

    const targets =
      targetSavings.value

    if (
      !targets.length
    ) {
      return null
    }

    return [...targets]
      .sort(
        (a, b) =>
          Number(
            savingProgress(b) || 0
          ) -
          Number(
            savingProgress(a) || 0
          )
      )[0]

  })


const lowestSaving =
  computed(() => {

    const targets =
      targetSavings.value
        .filter(
          saving =>
            saving.status === 'active'
        )

    if (
      !targets.length
    ) {
      return null
    }

    return [...targets]
      .sort(
        (a, b) =>
          Number(
            savingProgress(a) || 0
          ) -
          Number(
            savingProgress(b) || 0
          )
      )[0]

  })


const routineSavings =
  computed(() => {

    return validSavings.value
      .filter(
        saving =>
          Number(
            saving.routine_amount || 0
          ) > 0 &&
          saving.routine_frequency
      )

  })


const monthlyRoutineEstimate =
  computed(() => {

    return routineSavings.value.reduce(
      (total, saving) => {

        const amount =
          Number(
            saving.routine_amount || 0
          )

        if (
          saving.routine_frequency ===
          'weekly'
        ) {
          return total +
            amount * 4.345
        }

        if (
          saving.routine_frequency ===
          'yearly'
        ) {
          return total +
            amount / 12
        }

        return total +
          amount

      },
      0
    )

  })


/*
|--------------------------------------------------------------------------
| FINANCIAL HEALTH
|--------------------------------------------------------------------------
*/

const financialHealth =
  computed(() => {

    if (
      totalIncome.value <= 0
    ) {

      return {
        score: 0,
        label: 'Belum cukup data',
        className: 'neutral',
        description:
          'Belum ada pemasukan pada periode ini.'
      }

    }

    let score = 100

    const expense =
      expenseRate.value

    if (
      expense > 100
    ) {
      score -= 60
    } else if (
      expense > 80
    ) {
      score -= 40
    } else if (
      expense > 60
    ) {
      score -= 20
    }

    if (
      cashflow.value < 0
    ) {
      score -= 30
    }

    if (
      monthlySavingNet.value > 0
    ) {
      score += 5
    }

    if (
      exceededBudgets.value.length
    ) {
      score -= Math.min(
        exceededBudgets.value.length * 5,
        20
      )
    }

    score =
      Math.max(
        0,
        Math.min(
          score,
          100
        )
      )

    if (
      score >= 80
    ) {

      return {
        score,
        label: 'Sangat sehat',
        className: 'excellent',
        description:
          'Cashflow kamu terlihat sehat dan pengeluaran masih terkendali.'
      }

    }

    if (
      score >= 60
    ) {

      return {
        score,
        label: 'Cukup sehat',
        className: 'good',
        description:
          'Kondisi cukup baik, tetapi masih ada ruang untuk mengontrol pengeluaran.'
      }

    }

    if (
      score >= 40
    ) {

      return {
        score,
        label: 'Perlu perhatian',
        className: 'warning',
        description:
          'Pengeluaran mulai cukup besar dibanding pemasukan.'
      }

    }

    return {
      score,
      label: 'Perlu diperbaiki',
      className: 'danger',
      description:
        'Cashflow sedang tertekan. Pertimbangkan mengurangi pengeluaran dan memperkuat tabungan.'
    }

  })


/*
|--------------------------------------------------------------------------
| VISUAL WIDTHS
|--------------------------------------------------------------------------
*/

const incomeExpenseTotal =
  computed(() => {

    return (
      totalIncome.value +
      totalExpense.value
    )

  })


const incomeVisualWidth =
  computed(() => {

    if (
      incomeExpenseTotal.value <= 0
    ) {
      return 0
    }

    return (
      totalIncome.value /
      incomeExpenseTotal.value
    ) * 100

  })


const expenseVisualWidth =
  computed(() => {

    if (
      incomeExpenseTotal.value <= 0
    ) {
      return 0
    }

    return (
      totalExpense.value /
      incomeExpenseTotal.value
    ) * 100

  })


/*
|--------------------------------------------------------------------------
| LOAD REPORT
|--------------------------------------------------------------------------
*/

async function loadReport() {

  loading.value = true

  savingsLoading.value = true

  errorMessage.value = ''

  try {

    const [
      dashboardResponse,
      savingsResponse
    ] = await Promise.all([
      api.get(
        '/dashboard',
        {
          params: {
            month:
              selectedMonth.value
          }
        }
      ),

      api.get(
        '/savings'
      )
    ])


    const dashboardPayload =
      dashboardResponse.data?.data ||
      dashboardResponse.data ||
      {}


    const savingsPayload =
      savingsResponse.data?.data ||
      savingsResponse.data ||
      []


    dashboard.value = {

      totalIncome:
        Number(
          dashboardPayload?.totalIncome ||
          0
        ),

      totalExpense:
        Number(
          dashboardPayload?.totalExpense ||
          0
        ),

      balance:
        Number(
          dashboardPayload?.balance ||
          0
        ),

      saving:
        Number(
          dashboardPayload?.saving ||
          0
        ),

      expenseRate:
        Number(
          dashboardPayload?.expenseRate ||
          0
        ),

      savingRate:
        Number(
          dashboardPayload?.savingRate ||
          0
        ),

      categoryExpenses:
        Array.isArray(
          dashboardPayload?.categoryExpenses
        )
          ? dashboardPayload.categoryExpenses
          : [],

      budgetProgress:
        Array.isArray(
          dashboardPayload?.budgetProgress
        )
          ? dashboardPayload.budgetProgress
          : [],

      accounts:
        Array.isArray(
          dashboardPayload?.accounts
        )
          ? dashboardPayload.accounts
          : []

    }


    savings.value =
      Array.isArray(
        savingsPayload
      )
        ? savingsPayload
        : []


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

    savingsLoading.value = false

  }

}


function changeMonth() {

  loadReport()

}


function previousMonth() {

  const [
    year,
    month
  ] = selectedMonth.value
    .split('-')
    .map(Number)

  const date =
    new Date(
      year,
      month - 2,
      1
    )

  selectedMonth.value =
    `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`

  loadReport()

}


function nextMonth() {

  const [
    year,
    month
  ] = selectedMonth.value
    .split('-')
    .map(Number)

  const date =
    new Date(
      year,
      month,
      1
    )

  selectedMonth.value =
    `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`

  loadReport()

}


function goCurrentMonth() {

  selectedMonth.value =
    new Date()
      .toISOString()
      .slice(0, 7)

  loadReport()

}


function printReport() {

  window.print()

}


onMounted(
  loadReport
)

</script>


<template>

  <div class="reports-page">

    <!-- ================================================= -->
    <!-- HEADER -->
    <!-- ================================================= -->

    <div class="page-header">

      <div>

        <div class="eyebrow">
          FINANCIAL REPORT
        </div>

        <h1>
          Laporan Keuangan
        </h1>

        <p>
          Analisis lengkap kondisi keuangan,
          budget, dan tabungan untuk
          {{ monthLabel }}.
        </p>

      </div>


      <div class="report-actions">

        <button
          class="month-arrow"
          title="Bulan sebelumnya"
          @click="previousMonth"
        >
          <i class="bi bi-chevron-left"></i>
        </button>

        <div class="month-control">

          <i class="bi bi-calendar3"></i>

          <input
            v-model="selectedMonth"
            type="month"
            @change="changeMonth"
          />

        </div>

        <button
          class="month-arrow"
          title="Bulan berikutnya"
          @click="nextMonth"
        >
          <i class="bi bi-chevron-right"></i>
        </button>

        <button
          class="today-button"
          @click="goCurrentMonth"
        >
          Bulan ini
        </button>

        <button
          class="print-button"
          @click="printReport"
        >
          <i class="bi bi-printer"></i>
          Cetak
        </button>

      </div>

    </div>


    <!-- ================================================= -->
    <!-- ERROR -->
    <!-- ================================================= -->

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


    <!-- ================================================= -->
    <!-- LOADING -->
    <!-- ================================================= -->

    <div
      v-if="loading"
      class="budget-card loading-card"
    >

      <div class="loading-spinner"></div>

      <strong>
        Memuat laporan...
      </strong>

      <span>
        Mengambil data keuangan
        {{ monthLabel }}.
      </span>

    </div>


    <template v-else>

      <!-- ================================================= -->
      <!-- SUMMARY -->
      <!-- ================================================= -->

      <div class="summary-grid">

        <!-- INCOME -->

        <div class="budget-card summary-card">

          <div class="summary-icon income">
            <i class="bi bi-arrow-down-left"></i>
          </div>

          <div>

            <span>
              Total Pemasukan
            </span>

            <strong>
              {{ formatMoney(totalIncome) }}
            </strong>

            <small>
              {{ monthLabel }}
            </small>

          </div>

        </div>


        <!-- EXPENSE -->

        <div class="budget-card summary-card">

          <div class="summary-icon expense">
            <i class="bi bi-arrow-up-right"></i>
          </div>

          <div>

            <span>
              Total Pengeluaran
            </span>

            <strong>
              {{ formatMoney(totalExpense) }}
            </strong>

            <small>
              {{ formatPercent(expenseRate) }}
              dari pemasukan
            </small>

          </div>

        </div>


        <!-- CASHFLOW -->

        <div class="budget-card summary-card">

          <div
            class="summary-icon"
            :class="
              cashflow >= 0
                ? 'saving'
                : 'expense'
            "
          >
            <i
              class="bi"
              :class="
                cashflow >= 0
                  ? 'bi-graph-up-arrow'
                  : 'bi-graph-down-arrow'
              "
            ></i>
          </div>

          <div>

            <span>
              Cashflow Bersih
            </span>

            <strong
              :class="{
                negative:
                  cashflow < 0
              }"
            >
              {{ formatMoney(cashflow) }}
            </strong>

            <small>
              {{ formatPercent(cashflowRate) }}
              dari pemasukan
            </small>

          </div>

        </div>


        <!-- SAVINGS -->

        <div class="budget-card summary-card">

          <div class="summary-icon saving">
            <i class="bi bi-piggy-bank"></i>
          </div>

          <div>

            <span>
              Setoran Tabungan
            </span>

            <strong>
              {{ formatMoney(monthlyDeposits) }}
            </strong>

            <small>
              {{ monthlyDepositCount }}
              transaksi deposit
            </small>

          </div>

        </div>

      </div>


      <!-- ================================================= -->
      <!-- FINANCIAL HEALTH -->
      <!-- ================================================= -->

      <div class="budget-card health-card">

        <div class="health-left">

          <div
            class="health-score"
            :class="
              financialHealth.className
            "
          >

            <strong>
              {{ financialHealth.score }}
            </strong>

            <span>
              /100
            </span>

          </div>

          <div>

            <div class="eyebrow">
              FINANCIAL HEALTH
            </div>

            <h3>
              {{ financialHealth.label }}
            </h3>

            <p>
              {{ financialHealth.description }}
            </p>

          </div>

        </div>


        <div class="health-stats">

          <div>

            <span>
              Expense Rate
            </span>

            <strong>
              {{ formatPercent(expenseRate) }}
            </strong>

          </div>

          <div>

            <span>
              Cashflow
            </span>

            <strong
              :class="{
                positive:
                  cashflow >= 0,
                negative:
                  cashflow < 0
              }"
            >
              {{ formatMoney(cashflow) }}
            </strong>

          </div>

          <div>

            <span>
              Tabungan Bulan Ini
            </span>

            <strong>
              {{ formatMoney(monthlySavingNet) }}
            </strong>

          </div>

        </div>

      </div>


      <!-- ================================================= -->
      <!-- CASHFLOW -->
      <!-- ================================================= -->

      <div class="two-column-grid">

        <div class="budget-card report-card">

          <div class="card-header-custom">

            <div>

              <h5>
                Pemasukan vs Pengeluaran
              </h5>

              <span>
                Perbandingan arus uang
                {{ monthLabel }}.
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
                  {{ formatMoney(totalIncome) }}
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
                  {{ formatMoney(totalExpense) }}
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


          <div class="cashflow-result">

            <div class="result-icon">
              <i
                class="bi"
                :class="
                  cashflow >= 0
                    ? 'bi-check-lg'
                    : 'bi-exclamation-lg'
                "
              ></i>
            </div>

            <div>

              <span>
                Hasil cashflow
              </span>

              <strong
                :class="{
                  positive:
                    cashflow >= 0,
                  negative:
                    cashflow < 0
                }"
              >
                {{ formatMoney(cashflow) }}
              </strong>

            </div>

            <small>
              {{
                cashflow >= 0
                  ? 'Uang masuk masih lebih besar dari uang keluar.'
                  : 'Pengeluaran lebih besar dari pemasukan.'
              }}
            </small>

          </div>

        </div>


        <!-- TOP CATEGORY -->

        <div class="budget-card report-card">

          <div class="card-header-custom">

            <div>

              <h5>
                Pengeluaran Terbesar
              </h5>

              <span>
                Kategori yang paling banyak
                menyerap uang.
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
                Kategori terbesar
              </span>

              <strong>
                {{
                  highestExpenseCategory.name
                }}
              </strong>

              <b>
                {{
                  formatMoney(
                    highestExpenseCategory.amount
                  )
                }}
              </b>

              <small>
                {{
                  formatPercent(
                    categoryExpensePercentage(
                      highestExpenseCategory
                    )
                  )
                }}
                dari total pengeluaran
              </small>

              <div class="mini-progress">

                <div
                  :style="{
                    width: '100%',
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


      <!-- ================================================= -->
      <!-- SAVINGS OVERVIEW -->
      <!-- ================================================= -->

      <div class="section-title savings-section-title">

        <div>

          <div class="eyebrow">
            SAVINGS
          </div>

          <h2>
            Analisis Tabungan
          </h2>

          <p>
            Ringkasan seluruh tabungan,
            target, tabungan bebas,
            dan aktivitas setoran.
          </p>

        </div>

      </div>


      <div class="savings-summary-grid">

        <!-- TOTAL -->

        <div class="budget-card savings-summary-card">

          <div class="saving-summary-icon purple">
            <i class="bi bi-piggy-bank-fill"></i>
          </div>

          <span>
            Total Saldo Tabungan
          </span>

          <strong>
            {{ formatMoney(totalSavingsBalance) }}
          </strong>

          <small>
            {{ validSavings.length }}
            tabungan aktif/tersimpan
          </small>

        </div>


        <!-- TARGET -->

        <div class="budget-card savings-summary-card">

          <div class="saving-summary-icon blue">
            <i class="bi bi-bullseye"></i>
          </div>

          <span>
            Progress Target
          </span>

          <strong>
            {{ formatPercent(overallTargetProgress) }}
          </strong>

          <small>
            {{ formatMoney(totalTargetCurrent) }}
            dari
            {{ formatMoney(totalTargetAmount) }}
          </small>

        </div>


        <!-- MONTHLY -->

        <div class="budget-card savings-summary-card">

          <div class="saving-summary-icon green">
            <i class="bi bi-arrow-down-circle-fill"></i>
          </div>

          <span>
            Deposit Bulan Ini
          </span>

          <strong>
            {{ formatMoney(monthlyDeposits) }}
          </strong>

          <small>
            {{ monthlyDepositCount }}
            transaksi
          </small>

        </div>


        <!-- WITHDRAW -->

        <div class="budget-card savings-summary-card">

          <div class="saving-summary-icon orange">
            <i class="bi bi-arrow-up-circle-fill"></i>
          </div>

          <span>
            Penarikan Bulan Ini
          </span>

          <strong>
            {{ formatMoney(monthlyWithdrawals) }}
          </strong>

          <small>
            {{ monthlyWithdrawalCount }}
            transaksi
          </small>

        </div>

      </div>


      <!-- ================================================= -->
      <!-- SAVINGS DETAIL -->
      <!-- ================================================= -->

      <div class="two-column-grid savings-grid">

        <!-- TARGET PROGRESS -->

        <div class="budget-card report-card">

          <div class="card-header-custom">

            <div>

              <h5>
                Progress Tabungan Target
              </h5>

              <span>
                Seberapa dekat setiap target
                dengan nominal tujuan.
              </span>

            </div>

            <strong>
              {{ targetSavings.length }}
            </strong>

          </div>


          <div
            v-if="targetSavings.length"
            class="saving-list"
          >

            <div
              v-for="saving in targetSavings"
              :key="saving.id"
              class="saving-row"
            >

              <div class="saving-row-head">

                <div class="saving-name">

                  <div class="saving-avatar target">
                    <i class="bi bi-bullseye"></i>
                  </div>

                  <div>

                    <strong>
                      {{ saving.name }}
                    </strong>

                    <span>
                      {{
                        saving.status === 'completed'
                          ? 'Selesai'
                          : saving.status === 'cancelled'
                            ? 'Dibatalkan'
                            : 'Aktif'
                      }}
                    </span>

                  </div>

                </div>


                <strong>
                  {{
                    formatPercent(
                      savingProgress(saving)
                    )
                  }}
                </strong>

              </div>


              <div class="saving-progress-track">

                <div
                  class="saving-progress-fill"
                  :class="{
                    completed:
                      saving.status === 'completed'
                  }"
                  :style="{
                    width:
                      Math.min(
                        Number(
                          savingProgress(saving) || 0
                        ),
                        100
                      ) +
                      '%'
                  }"
                ></div>

              </div>


              <div class="saving-row-bottom">

                <span>
                  {{
                    formatMoney(
                      saving.current_amount
                    )
                  }}
                  /
                  {{
                    formatMoney(
                      saving.target_amount
                    )
                  }}
                </span>

                <span
                  v-if="
                    saving.status !== 'completed'
                  "
                >
                  Sisa
                  {{
                    formatMoney(
                      savingRemaining(saving)
                    )
                  }}
                </span>

                <span
                  v-else
                  class="positive"
                >
                  Target tercapai
                </span>

              </div>


              <div
                v-if="
                  saving.routine_amount &&
                  saving.routine_frequency
                "
                class="routine-badge"
              >

                <i class="bi bi-arrow-repeat"></i>

                Rutin
                {{
                  formatMoney(
                    saving.routine_amount
                  )
                }}
                /
                {{
                  routineFrequencyLabel(
                    saving.routine_frequency
                  )
                }}

              </div>

            </div>

          </div>


          <div
            v-else
            class="small-empty"
          >

            <i class="bi bi-bullseye"></i>

            <span>
              Belum ada tabungan target.
            </span>

          </div>

        </div>


        <!-- FREE SAVINGS -->

        <div class="budget-card report-card">

          <div class="card-header-custom">

            <div>

              <h5>
                Tabungan Bebas
              </h5>

              <span>
                Tabungan tanpa target nominal
                yang bisa digunakan secara fleksibel.
              </span>

            </div>

            <strong>
              {{ freeSavings.length }}
            </strong>

          </div>


          <div
            v-if="freeSavings.length"
            class="free-saving-list"
          >

            <div
              v-for="saving in freeSavings"
              :key="saving.id"
              class="free-saving-card"
            >

              <div class="free-saving-icon">
                <i class="bi bi-stars"></i>
              </div>

              <div class="free-saving-content">

                <strong>
                  {{ saving.name }}
                </strong>

                <span>
                  Tabungan bebas
                </span>

                <b>
                  {{
                    formatMoney(
                      saving.current_amount
                    )
                  }}
                </b>

                <div
                  v-if="
                    saving.routine_amount &&
                    saving.routine_frequency
                  "
                  class="routine-badge"
                >

                  <i class="bi bi-arrow-repeat"></i>

                  Rutin
                  {{
                    formatMoney(
                      saving.routine_amount
                    )
                  }}
                  /
                  {{
                    routineFrequencyLabel(
                      saving.routine_frequency
                    )
                  }}

                </div>

              </div>

            </div>

          </div>


          <div
            v-else
            class="small-empty"
          >

            <i class="bi bi-stars"></i>

            <span>
              Belum ada tabungan bebas.
            </span>

          </div>

        </div>

      </div>


      <!-- ================================================= -->
      <!-- SAVINGS INSIGHT -->
      <!-- ================================================= -->

      <div class="two-column-grid">

        <div class="budget-card insight-card">

          <div class="insight-icon">
            <i class="bi bi-trophy-fill"></i>
          </div>

          <div>

            <span>
              Target Paling Maju
            </span>

            <strong
              v-if="bestSaving"
            >
              {{ bestSaving.name }}
            </strong>

            <b
              v-if="bestSaving"
            >
              {{
                formatPercent(
                  savingProgress(bestSaving)
                )
              }}
            </b>

            <p
              v-if="bestSaving"
            >
              Saldo saat ini
              {{
                formatMoney(
                  bestSaving.current_amount
                )
              }}
              dari
              {{
                formatMoney(
                  bestSaving.target_amount
                )
              }}.
            </p>

            <p
              v-else
            >
              Belum ada target tabungan.
            </p>

          </div>

        </div>


        <div class="budget-card insight-card">

          <div class="insight-icon warning">
            <i class="bi bi-flag-fill"></i>
          </div>

          <div>

            <span>
              Target yang Masih Jauh
            </span>

            <strong
              v-if="lowestSaving"
            >
              {{ lowestSaving.name }}
            </strong>

            <b
              v-if="lowestSaving"
            >
              {{
                formatPercent(
                  savingProgress(lowestSaving)
                )
              }}
            </b>

            <p
              v-if="lowestSaving"
            >
              Masih membutuhkan
              {{
                formatMoney(
                  savingRemaining(lowestSaving)
                )
              }}.
            </p>

            <p
              v-else
            >
              Semua target sudah selesai
              atau belum tersedia.
            </p>

          </div>

        </div>

      </div>


      <!-- ================================================= -->
      <!-- ROUTINE SAVINGS -->
      <!-- ================================================= -->

      <div class="budget-card report-card routine-card print-page-break">

        <div class="card-header-custom">

          <div>

            <h5>
              Setoran Rutin
            </h5>

            <span>
              Rencana nominal yang kamu tetapkan
              untuk menabung secara berkala.
            </span>

          </div>

          <i class="bi bi-arrow-repeat"></i>

        </div>


        <div
          v-if="routineSavings.length"
          class="routine-grid"
        >

          <div
            v-for="saving in routineSavings"
            :key="saving.id"
            class="routine-item"
          >

            <div class="routine-item-icon">
              <i
                class="bi"
                :class="
                  savingTypeIcon(
                    saving.type
                  )
                "
              ></i>
            </div>

            <div>

              <strong>
                {{ saving.name }}
              </strong>

              <span>
                {{
                  savingTypeLabel(
                    saving.type
                  )
                }}
              </span>

            </div>

            <div class="routine-amount">

              <strong>
                {{
                  formatMoney(
                    saving.routine_amount
                  )
                }}
              </strong>

              <span>
                /
                {{
                  routineFrequencyLabel(
                    saving.routine_frequency
                  )
                }}
              </span>

            </div>

          </div>

        </div>


        <div
          v-else
          class="small-empty"
        >

          <i class="bi bi-arrow-repeat"></i>

          <span>
            Belum ada setoran rutin.
          </span>

        </div>


        <div
          v-if="routineSavings.length"
          class="routine-estimate"
        >

          <div>

            <span>
              Estimasi setoran rutin per bulan
            </span>

            <strong>
              {{
                formatMoney(
                  monthlyRoutineEstimate
                )
              }}
            </strong>

          </div>

          <small>
            Estimasi ini dihitung dari
            frekuensi rutin masing-masing tabungan.
          </small>

        </div>

      </div>


      <!-- ================================================= -->
      <!-- MONTHLY SAVINGS TRANSACTIONS -->
      <!-- ================================================= -->

      <div class="budget-card report-card">

        <div class="card-header-custom">

          <div>

            <h5>
              Aktivitas Tabungan
            </h5>

            <span>
              Semua deposit dan withdrawal
              pada {{ monthLabel }}.
            </span>

          </div>

          <strong>
            {{
              monthlySavingsTransactions.length
            }}
          </strong>

        </div>


        <div class="saving-activity-summary">

          <div>

            <span>
              Deposit
            </span>

            <strong class="positive">
              {{ formatMoney(monthlyDeposits) }}
            </strong>

          </div>

          <div>

            <span>
              Withdrawal
            </span>

            <strong class="negative">
              {{ formatMoney(monthlyWithdrawals) }}
            </strong>

          </div>

          <div>

            <span>
              Net Tabungan
            </span>

            <strong
              :class="{
                positive:
                  monthlySavingNet >= 0,
                negative:
                  monthlySavingNet < 0
              }"
            >
              {{ formatMoney(monthlySavingNet) }}
            </strong>

          </div>

        </div>


        <div
          v-if="
            monthlySavingsTransactions.length
          "
          class="transaction-list"
        >

          <div
            v-for="transaction
              in monthlySavingsTransactions"
            :key="transaction.id"
            class="transaction-row"
          >

            <div
              class="transaction-icon"
              :class="
                transaction.type
              "
            >

              <i
                class="bi"
                :class="
                  transaction.type === 'deposit'
                    ? 'bi-arrow-down-left'
                    : 'bi-arrow-up-right'
                "
              ></i>

            </div>

            <div class="transaction-info">

              <strong>
                {{ transaction.savingName }}
              </strong>

              <span>
                {{
                  transaction.description ||
                  (
                    transaction.type === 'deposit'
                      ? 'Deposit tabungan'
                      : 'Withdrawal tabungan'
                  )
                }}
              </span>

            </div>

            <span class="transaction-date">
              {{
                formatDate(
                  transaction.transaction_date
                )
              }}
            </span>

            <strong
              :class="
                transaction.type === 'deposit'
                  ? 'positive'
                  : 'negative'
              "
            >
              {{
                transaction.type === 'deposit'
                  ? '+'
                  : '-'
              }}
              {{
                formatMoney(
                  transaction.amount
                )
              }}
            </strong>

          </div>

        </div>


        <div
          v-else
          class="small-empty"
        >

          <i class="bi bi-receipt"></i>

          <span>
            Belum ada aktivitas tabungan
            pada periode ini.
          </span>

        </div>

      </div>


      <!-- ================================================= -->
      <!-- CATEGORY + BUDGET -->
      <!-- ================================================= -->

      <div class="two-column-grid category-budget-section print-page-break">

        <!-- CATEGORY -->

        <div class="budget-card report-card">

          <div class="card-header-custom">

            <div>

              <h5>
                Pengeluaran per Kategori
              </h5>

              <span>
                Breakdown pengeluaran
                {{ monthLabel }}.
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

                <div class="category-amount">

                  <strong>
                    {{
                      formatMoney(
                        category.amount
                      )
                    }}
                  </strong>

                  <small>
                    {{
                      formatPercent(
                        categoryExpensePercentage(
                          category
                        )
                      )
                    }}
                  </small>

                </div>

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
                      ) +
                      '%',

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
              Belum ada pengeluaran
              untuk periode ini.
            </span>

          </div>

        </div>


        <!-- BUDGET -->

        <div class="budget-card report-card">

          <div class="card-header-custom">

            <div>

              <h5>
                Budget vs Actual
              </h5>

              <span>
                Perbandingan batas budget
                dengan realisasi.
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
                  {{
                    budgetPercentage(
                      budget
                    )
                  }}%
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
                      ) +
                      '%'
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
                  Sisa:
                  {{
                    formatMoney(
                      Number(
                        budget.budget || 0
                      ) -
                      Number(
                        budget.spent || 0
                      )
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
              Belum ada budget
              untuk periode ini.
            </span>

          </div>


          <div
            v-if="budgetProgress.length"
            class="budget-total"
          >

            <div>

              <span>
                Total Budget
              </span>

              <strong>
                {{ formatMoney(totalBudget) }}
              </strong>

            </div>

            <div>

              <span>
                Terpakai
              </span>

              <strong>
                {{ formatMoney(totalBudgetSpent) }}
              </strong>

            </div>

            <div>

              <span>
                Sisa
              </span>

              <strong
                :class="{
                  negative:
                    remainingBudget < 0,
                  positive:
                    remainingBudget >= 0
                }"
              >
                {{ formatMoney(remainingBudget) }}
              </strong>

            </div>

          </div>

        </div>

      </div>


      <!-- ================================================= -->
      <!-- ACCOUNTS -->
      <!-- ================================================= -->

      <div class="budget-card report-card accounts-card">

        <div class="card-header-custom">

          <div>

            <h5>
              Distribusi Saldo Account
            </h5>

            <span>
              Posisi saldo berdasarkan
              account yang tersedia.
            </span>

          </div>

          <strong>
            {{ dashboard.accounts.length }}
          </strong>

        </div>


        <div
          v-if="
            dashboard.accounts.length
          "
          class="accounts-grid"
        >

          <div
            v-for="account
              in dashboard.accounts"
            :key="account.id"
            class="account-report"
          >

            <div class="account-icon">

              <i
                class="bi"
                :class="
                  accountIcon(
                    account.type
                  )
                "
              ></i>

            </div>

            <div>

              <span>
                {{ account.name }}
              </span>

              <strong>
                {{
                  formatMoney(
                    account.balance
                  )
                }}
              </strong>

              <small>
                {{
                  account.type === 'bank'
                    ? 'Bank'
                    : account.type === 'cash'
                      ? 'Tunai'
                      : 'E-Wallet'
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
            Belum ada account.
          </span>

        </div>

      </div>


      <!-- ================================================= -->
      <!-- FINAL INSIGHT -->
      <!-- ================================================= -->

      <div class="budget-card final-insight">

        <div class="final-insight-icon">
          <i class="bi bi-lightbulb-fill"></i>
        </div>

        <div>

          <div class="eyebrow">
            FINANCIAL INSIGHT
          </div>

          <h3>
            Ringkasan {{ monthLabel }}
          </h3>

          <p>

            Kamu menerima
            <strong>
              {{ formatMoney(totalIncome) }}
            </strong>

            dan mengeluarkan
            <strong>
              {{ formatMoney(totalExpense) }}
            </strong>.

            Cashflow bersih kamu adalah

            <strong
              :class="{
                positive:
                  cashflow >= 0,
                negative:
                  cashflow < 0
              }"
            >
              {{ formatMoney(cashflow) }}
            </strong>.

            Pada sisi tabungan, terdapat
            <strong>
              {{ formatMoney(monthlyDeposits) }}
            </strong>

            deposit dan

            <strong>
              {{ formatMoney(monthlyWithdrawals) }}
            </strong>

            withdrawal sehingga net tabungan bulan
            ini sebesar

            <strong
              :class="{
                positive:
                  monthlySavingNet >= 0,
                negative:
                  monthlySavingNet < 0
              }"
            >
              {{ formatMoney(monthlySavingNet) }}
            </strong>.

          </p>

        </div>

      </div>

      <!-- ================================================= -->
      <!-- PRINT FOOTER -->
      <!-- ================================================= -->

      <div class="print-report-footer">
        <div>
          <strong>Monthly Budget</strong>
          <span>Laporan Keuangan • {{ monthLabel }}</span>
        </div>

        <div>
          <span>Dicetak {{ formatDate(new Date()) }}</span>
        </div>
      </div>

    </template>

  </div>

</template>


<style scoped>

/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

.reports-page {
  width: 100%;
  padding-bottom: 40px;
}


/*
|--------------------------------------------------------------------------
| HEADER
|--------------------------------------------------------------------------
*/

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.eyebrow {
  margin-bottom: 5px;
  color: var(--accent);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.4px;
}

.page-header h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 25px;
  font-weight: 800;
}

.page-header p {
  margin: 6px 0 0;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

.report-actions {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}

.month-control {
  height: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 11px;
  border: 1px solid var(--border-color);
  border-radius: 9px;
  background: var(--bg-card);
  color: var(--accent);
}

.month-control input {
  width: 125px;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 12px;
}

.month-arrow,
.today-button,
.print-button {
  height: 40px;
  border: 1px solid var(--border-color);
  border-radius: 9px;
  background: var(--bg-card);
  color: var(--text-secondary);
  cursor: pointer;
  transition: 160ms ease;
}

.month-arrow {
  width: 40px;
}

.month-arrow:hover,
.today-button:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--bg-card-hover);
}

.today-button {
  padding: 0 13px;
  font-size: 11px;
  font-weight: 700;
}

.print-button {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 13px;
  border-color: var(--accent);
  background: var(--accent);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}

.print-button:hover {
  opacity: .9;
  transform: translateY(-1px);
}


/*
|--------------------------------------------------------------------------
| ALERT
|--------------------------------------------------------------------------
*/

.report-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(239, 68, 68, .10);
  color: var(--danger);
  font-size: 12px;
}

.report-alert span {
  flex: 1;
}

.report-alert button {
  border: none;
  background: transparent;
  color: inherit;
  font-weight: 700;
  cursor: pointer;
}


/*
|--------------------------------------------------------------------------
| SUMMARY
|--------------------------------------------------------------------------
*/

.summary-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.summary-card {
  min-height: 125px;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 18px;
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
  background: rgba(34, 197, 94, .10);
  color: var(--success);
}

.summary-icon.expense {
  background: rgba(239, 68, 68, .10);
  color: var(--danger);
}

.summary-icon.saving {
  background: var(--accent-soft);
  color: var(--accent);
}

.summary-card span {
  display: block;
  margin-bottom: 4px;
  color: var(--text-secondary);
  font-size: 10px;
}

.summary-card strong {
  display: block;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 800;
}

.summary-card strong.negative {
  color: var(--danger);
}

.summary-card small {
  display: block;
  margin-top: 5px;
  color: var(--text-muted);
  font-size: 9px;
}


/*
|--------------------------------------------------------------------------
| HEALTH
|--------------------------------------------------------------------------
*/

.health-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
  margin-bottom: 12px;
  padding: 18px;
}

.health-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.health-score {
  width: 66px;
  height: 66px;
  flex-shrink: 0;
  display: flex;
  align-items: baseline;
  justify-content: center;
  border-radius: 18px;
  padding-top: 21px;
}

.health-score strong {
  font-size: 22px;
  font-weight: 900;
}

.health-score span {
  font-size: 9px;
}

.health-score.excellent {
  background: rgba(34, 197, 94, .12);
  color: var(--success);
}

.health-score.good {
  background: var(--accent-soft);
  color: var(--accent);
}

.health-score.warning {
  background: rgba(245, 158, 11, .12);
  color: #f59e0b;
}

.health-score.danger {
  background: rgba(239, 68, 68, .12);
  color: var(--danger);
}

.health-score.neutral {
  background: var(--bg-card-hover);
  color: var(--text-muted);
}

.health-left h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 800;
}

.health-left p {
  max-width: 500px;
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.5;
}

.health-stats {
  display: flex;
  gap: 28px;
}

.health-stats > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.health-stats span {
  color: var(--text-muted);
  font-size: 9px;
}

.health-stats strong {
  color: var(--text-primary);
  font-size: 12px;
}


/*
|--------------------------------------------------------------------------
| GENERAL GRID
|--------------------------------------------------------------------------
*/

.two-column-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}


/*
|--------------------------------------------------------------------------
| REPORT CARD
|--------------------------------------------------------------------------
*/

.report-card {
  min-width: 0;
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
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 800;
}

.card-header-custom span {
  display: block;
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 9px;
  line-height: 1.5;
}

.card-header-custom > i {
  color: var(--accent);
  font-size: 18px;
}

.card-header-custom > strong {
  min-width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 11px;
}


/*
|--------------------------------------------------------------------------
| COMPARISON
|--------------------------------------------------------------------------
*/

.comparison {
  display: flex;
  flex-direction: column;
  gap: 18px;
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
  color: var(--text-secondary);
}

.comparison-label strong {
  color: var(--text-primary);
  font-size: 12px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.income-dot {
  background: var(--success);
}

.expense-dot {
  background: var(--danger);
}

.comparison-track {
  width: 100%;
  height: 12px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--bg-card-hover);
}

.comparison-fill {
  height: 100%;
  border-radius: inherit;
}

.income-fill {
  background: var(--success);
}

.expense-fill {
  background: var(--danger);
}


/*
|--------------------------------------------------------------------------
| CASHFLOW
|--------------------------------------------------------------------------
*/

.cashflow-result {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 23px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 11px;
  background: var(--bg-card-hover);
}

.result-icon {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 9px;
  background: var(--accent-soft);
  color: var(--accent);
}

.cashflow-result > div:nth-child(2) {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cashflow-result span {
  color: var(--text-muted);
  font-size: 9px;
}

.cashflow-result strong {
  font-size: 13px;
}

.cashflow-result small {
  margin-left: auto;
  max-width: 190px;
  color: var(--text-muted);
  font-size: 9px;
  text-align: right;
}


/*
|--------------------------------------------------------------------------
| TOP CATEGORY
|--------------------------------------------------------------------------
*/

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
  color: var(--text-muted);
  font-size: 9px;
}

.top-category-info > strong {
  display: block;
  margin-top: 4px;
  color: var(--text-primary);
  font-size: 17px;
}

.top-category-info > b {
  display: block;
  margin-top: 3px;
  color: var(--text-primary);
  font-size: 13px;
}

.top-category-info > small {
  display: block;
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 9px;
}

.mini-progress {
  width: 100%;
  height: 6px;
  overflow: hidden;
  margin-top: 9px;
  border-radius: 999px;
  background: var(--bg-card-hover);
}

.mini-progress div {
  height: 100%;
  border-radius: inherit;
}


/*
|--------------------------------------------------------------------------
| SECTION TITLE
|--------------------------------------------------------------------------
*/

.section-title {
  margin: 28px 0 12px;
}

.section-title h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 19px;
  font-weight: 800;
}

.section-title p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}


/*
|--------------------------------------------------------------------------
| SAVINGS SUMMARY
|--------------------------------------------------------------------------
*/

.savings-summary-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.savings-summary-card {
  min-height: 145px;
  padding: 17px;
}

.saving-summary-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  border-radius: 11px;
  font-size: 16px;
}

.saving-summary-icon.purple {
  background: rgba(139, 92, 246, .12);
  color: #8b5cf6;
}

.saving-summary-icon.blue {
  background: rgba(59, 130, 246, .12);
  color: #3b82f6;
}

.saving-summary-icon.green {
  background: rgba(34, 197, 94, .12);
  color: var(--success);
}

.saving-summary-icon.orange {
  background: rgba(245, 158, 11, .12);
  color: #f59e0b;
}

.savings-summary-card > span {
  display: block;
  color: var(--text-muted);
  font-size: 9px;
}

.savings-summary-card > strong {
  display: block;
  margin-top: 5px;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 800;
}

.savings-summary-card > small {
  display: block;
  margin-top: 5px;
  color: var(--text-muted);
  font-size: 9px;
}


/*
|--------------------------------------------------------------------------
| SAVINGS LIST
|--------------------------------------------------------------------------
*/

.saving-list {
  display: flex;
  flex-direction: column;
  gap: 17px;
}

.saving-row {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.saving-row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.saving-name {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.saving-avatar {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 9px;
}

.saving-avatar.target {
  background: rgba(59, 130, 246, .12);
  color: #3b82f6;
}

.saving-name > div:last-child {
  min-width: 0;
}

.saving-name strong {
  display: block;
  overflow: hidden;
  color: var(--text-primary);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.saving-name span {
  display: block;
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 8px;
}

.saving-row-head > strong {
  color: var(--text-primary);
  font-size: 11px;
}

.saving-progress-track {
  width: 100%;
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--bg-card-hover);
}

.saving-progress-fill {
  height: 100%;
  min-width: 0;
  border-radius: inherit;
  background: var(--accent);
  transition: width 300ms ease;
}

.saving-progress-fill.completed {
  background: var(--success);
}

.saving-row-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: var(--text-muted);
  font-size: 9px;
}


/*
|--------------------------------------------------------------------------
| ROUTINE BADGE
|--------------------------------------------------------------------------
*/

.routine-badge {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 5px;
  padding: 4px 7px;
  border-radius: 6px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 8px;
  font-weight: 700;
}


/*
|--------------------------------------------------------------------------
| FREE SAVINGS
|--------------------------------------------------------------------------
*/

.free-saving-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.free-saving-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-card-hover);
}

.free-saving-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 10px;
  background: rgba(139, 92, 246, .12);
  color: #8b5cf6;
}

.free-saving-content {
  min-width: 0;
  flex: 1;
}

.free-saving-content > strong {
  display: block;
  color: var(--text-primary);
  font-size: 11px;
}

.free-saving-content > span {
  display: block;
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 8px;
}

.free-saving-content > b {
  display: block;
  margin-top: 4px;
  color: var(--text-primary);
  font-size: 12px;
}


/*
|--------------------------------------------------------------------------
| INSIGHT
|--------------------------------------------------------------------------
*/

.insight-card {
  display: flex;
  align-items: flex-start;
  gap: 13px;
  padding: 17px;
}

.insight-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 11px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 17px;
}

.insight-icon.warning {
  background: rgba(245, 158, 11, .12);
  color: #f59e0b;
}

.insight-card > div:last-child {
  min-width: 0;
}

.insight-card span {
  display: block;
  color: var(--text-muted);
  font-size: 9px;
}

.insight-card strong {
  display: block;
  margin-top: 3px;
  color: var(--text-primary);
  font-size: 14px;
}

.insight-card b {
  display: block;
  margin-top: 2px;
  color: var(--accent);
  font-size: 12px;
}

.insight-card p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 9px;
  line-height: 1.5;
}


/*
|--------------------------------------------------------------------------
| ROUTINE
|--------------------------------------------------------------------------
*/

.routine-card {
  margin-bottom: 12px;
}

.routine-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 9px;
}

.routine-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-card-hover);
}

.routine-item-icon {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 9px;
  background: var(--accent-soft);
  color: var(--accent);
}

.routine-item > div:nth-child(2) {
  min-width: 0;
  flex: 1;
}

.routine-item > div:nth-child(2) strong {
  display: block;
  overflow: hidden;
  color: var(--text-primary);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.routine-item > div:nth-child(2) span {
  display: block;
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 8px;
}

.routine-amount {
  text-align: right;
}

.routine-amount strong {
  display: block;
  color: var(--text-primary);
  font-size: 11px;
}

.routine-amount span {
  display: block;
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 8px;
}

.routine-estimate {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-top: 12px;
  padding: 11px;
  border: 1px solid var(--border-color);
  border-radius: 9px;
  background: var(--bg-card-hover);
}

.routine-estimate div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.routine-estimate span {
  color: var(--text-muted);
  font-size: 9px;
}

.routine-estimate strong {
  color: var(--accent);
  font-size: 13px;
}

.routine-estimate small {
  color: var(--text-muted);
  font-size: 8px;
  text-align: right;
}


/*
|--------------------------------------------------------------------------
| SAVING ACTIVITY
|--------------------------------------------------------------------------
*/

.saving-activity-summary {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 9px;
  margin-bottom: 15px;
}

.saving-activity-summary > div {
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 9px;
  background: var(--bg-card-hover);
}

.saving-activity-summary span {
  display: block;
  color: var(--text-muted);
  font-size: 8px;
}

.saving-activity-summary strong {
  display: block;
  margin-top: 4px;
  font-size: 11px;
}

.transaction-list {
  display: flex;
  flex-direction: column;
}

.transaction-row {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-color);
}

.transaction-row:last-child {
  border-bottom: none;
}

.transaction-icon {
  width: 33px;
  height: 33px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 9px;
}

.transaction-icon.deposit {
  background: rgba(34, 197, 94, .10);
  color: var(--success);
}

.transaction-icon.withdrawal {
  background: rgba(239, 68, 68, .10);
  color: var(--danger);
}

.transaction-info {
  min-width: 0;
  flex: 1;
}

.transaction-info strong {
  display: block;
  overflow: hidden;
  color: var(--text-primary);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transaction-info span {
  display: block;
  overflow: hidden;
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transaction-date {
  flex-shrink: 0;
  color: var(--text-muted);
  font-size: 8px;
}

.transaction-row > strong {
  min-width: 110px;
  text-align: right;
  font-size: 10px;
}


/*
|--------------------------------------------------------------------------
| CATEGORY
|--------------------------------------------------------------------------
*/

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
  min-width: 0;
  color: var(--text-secondary);
  font-size: 10px;
}

.category-name span:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
}

.category-amount {
  display: flex;
  align-items: center;
  gap: 7px;
}

.category-amount strong {
  color: var(--text-primary);
  font-size: 10px;
}

.category-amount small {
  color: var(--text-muted);
  font-size: 8px;
}

.category-track {
  width: 100%;
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--bg-card-hover);
}

.category-fill {
  height: 100%;
  min-width: 2px;
  border-radius: inherit;
}


/*
|--------------------------------------------------------------------------
| BUDGET
|--------------------------------------------------------------------------
*/

.budget-report-list {
  display: flex;
  flex-direction: column;
  gap: 17px;
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
  color: var(--text-primary);
  font-size: 10px;
}

.budget-report-top span {
  color: var(--text-muted);
  font-size: 8px;
}

.budget-report-top > strong {
  font-size: 10px;
}

.budget-track {
  width: 100%;
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--bg-card-hover);
}

.budget-fill {
  height: 100%;
  border-radius: inherit;
}

.budget-fill.success {
  background: var(--success);
}

.budget-fill.warning {
  background: #f59e0b;
}

.budget-fill.danger {
  background: var(--danger);
}

.budget-report-top > strong.success {
  color: var(--success);
}

.budget-report-top > strong.warning {
  color: #f59e0b;
}

.budget-report-top > strong.danger {
  color: var(--danger);
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
  font-size: 8px;
  font-weight: 700;
}

.budget-report-footer span.success {
  color: var(--success);
}

.budget-report-footer span.warning {
  color: #f59e0b;
}

.budget-report-footer span.danger {
  color: var(--danger);
}

.budget-report-footer small {
  color: var(--text-muted);
  font-size: 8px;
}

.budget-total {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--border-color);
}

.budget-total > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.budget-total span {
  color: var(--text-muted);
  font-size: 8px;
}

.budget-total strong {
  color: var(--text-primary);
  font-size: 10px;
}


/*
|--------------------------------------------------------------------------
| ACCOUNTS
|--------------------------------------------------------------------------
*/

.accounts-card {
  margin-bottom: 12px;
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
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-card-hover);
}

.account-icon {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 9px;
  background: var(--accent-soft);
  color: var(--accent);
}

.account-report > div:last-child {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.account-report span {
  overflow: hidden;
  color: var(--text-muted);
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-report strong {
  color: var(--text-primary);
  font-size: 11px;
}

.account-report small {
  color: var(--text-muted);
  font-size: 8px;
}


/*
|--------------------------------------------------------------------------
| FINAL INSIGHT
|--------------------------------------------------------------------------
*/

.final-insight {
  display: flex;
  align-items: flex-start;
  gap: 13px;
  margin-top: 12px;
  padding: 18px;
}

.final-insight-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 11px;
  background: var(--accent-soft);
  color: var(--accent);
}

.final-insight h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 14px;
}

.final-insight p {
  max-width: 850px;
  margin: 5px 0 0;
  color: var(--text-secondary);
  font-size: 10px;
  line-height: 1.7;
}

.final-insight strong {
  color: var(--text-primary);
}


/*
|--------------------------------------------------------------------------
| COLORS
|--------------------------------------------------------------------------
*/

.positive {
  color: var(--success) !important;
}

.negative {
  color: var(--danger) !important;
}


/*
|--------------------------------------------------------------------------
| EMPTY
|--------------------------------------------------------------------------
*/

.small-empty {
  min-height: 130px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: var(--text-muted);
  font-size: 10px;
  text-align: center;
}

.small-empty i {
  color: var(--accent);
  font-size: 25px;
}


/*
|--------------------------------------------------------------------------
| LOADING
|--------------------------------------------------------------------------
*/

.loading-card {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.loading-card strong {
  color: var(--text-primary);
  font-size: 13px;
}

.loading-card > span {
  margin-top: 5px;
  color: var(--text-muted);
  font-size: 10px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  margin-bottom: 14px;
  border: 3px solid var(--border-color);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation:
    report-spin
    700ms
    linear
    infinite;
}

@keyframes report-spin {

  to {
    transform:
      rotate(360deg);
  }

}


/*
|--------------------------------------------------------------------------
| RESPONSIVE
|--------------------------------------------------------------------------
*/

@media (
  max-width: 1200px
) {

  .summary-grid,
  .savings-summary-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

}


@media (
  max-width: 991.98px
) {

  .health-card {
    align-items: flex-start;
    flex-direction: column;
  }

  .health-stats {
    width: 100%;
    justify-content: space-between;
  }

  .accounts-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

}


@media (
  max-width: 767.98px
) {

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .report-actions {
    width: 100%;
  }

  .month-control {
    flex: 1;
  }

  .month-control input {
    width: auto;
    flex: 1;
  }

  .two-column-grid {
    grid-template-columns: 1fr;
  }

  .routine-grid {
    grid-template-columns: 1fr;
  }

  .saving-activity-summary {
    grid-template-columns: 1fr;
  }

  .transaction-date {
    display: none;
  }

  .transaction-row > strong {
    min-width: 90px;
  }

}


@media (
  max-width: 575.98px
) {

  .summary-grid,
  .savings-summary-grid {
    grid-template-columns: 1fr;
  }

  .health-stats {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .health-stats > div {
    width: 100%;
    padding-bottom: 8px;
    border-bottom:
      1px solid
      var(--border-color);
  }

  .accounts-grid {
    grid-template-columns: 1fr;
  }

  .saving-row-bottom {
    align-items: flex-start;
    flex-direction: column;
    gap: 3px;
  }

  .routine-estimate {
    align-items: flex-start;
    flex-direction: column;
  }

  .routine-estimate small {
    text-align: left;
  }

  .print-button {
    display: none;
  }

}


/*
|--------------------------------------------------------------------------
| PRINT — FULL WIDTH A4
|--------------------------------------------------------------------------
*/

.print-report-footer {
  display: none;
}


/*
|--------------------------------------------------------------------------
| A4
|--------------------------------------------------------------------------
|
| Tidak memakai margin browser.
| Margin internal kita atur sendiri pada .reports-page.
|
*/

@page {
  size: A4 portrait;
  margin: 0;
}


@media print {

  /*
  |--------------------------------------------------------------------------
  | GLOBAL PRINT RESET
  |--------------------------------------------------------------------------
  */

  html,
  body,
  #app {
    width: 100% !important;
    min-width: 0 !important;
    max-width: none !important;

    margin: 0 !important;
    padding: 0 !important;

    background: #ffffff !important;

    overflow: visible !important;

    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }


  /*
  |--------------------------------------------------------------------------
  | MATIKAN APP LAYOUT
  |--------------------------------------------------------------------------
  |
  | Ini bagian penting.
  |
  | Sidebar = 260px
  | App content = padding 28px
  |
  | Saat print semuanya dilepas supaya laporan
  | benar-benar menggunakan lebar kertas.
  |
  */

  :global(.app-shell) {
    display: block !important;

    width: 100% !important;
    min-width: 0 !important;

    margin: 0 !important;
    padding: 0 !important;

    background: #ffffff !important;
  }


  :global(.app-sidebar) {
    display: none !important;
  }


  :global(.app-navbar) {
    display: none !important;
  }


  :global(.app-footer) {
    display: none !important;
  }


  :global(.app-main) {
    display: block !important;

    width: 100% !important;
    min-width: 0 !important;
    max-width: none !important;

    margin: 0 !important;
    padding: 0 !important;

    background: #ffffff !important;
  }


  :global(.app-content) {
    display: block !important;

    width: 100% !important;
    min-width: 0 !important;
    max-width: none !important;

    margin: 0 !important;

    /*
     * Margin internal laporan.
     *
     * Karena @page = 0,
     * ini menjadi margin laporan.
     */
    padding: 7mm 7mm 9mm !important;

    background: #ffffff !important;

    min-height: 0 !important;
  }


  /*
  |--------------------------------------------------------------------------
  | REPORT PAGE
  |--------------------------------------------------------------------------
  */

  .reports-page {

    display: block !important;

    width: 100% !important;
    max-width: none !important;
    min-width: 0 !important;

    margin: 0 !important;

    padding: 0 !important;

    background: #ffffff !important;

    color: #172033 !important;

    box-sizing: border-box !important;
  }


  /*
  |--------------------------------------------------------------------------
  | HIDE UI
  |--------------------------------------------------------------------------
  */

  .report-actions,
  .report-alert,
  .month-arrow,
  .today-button,
  .print-button {
    display: none !important;
  }


  /*
  |--------------------------------------------------------------------------
  | HEADER
  |--------------------------------------------------------------------------
  */

  .page-header {

    width: 100% !important;

    display: flex !important;

    align-items: flex-end !important;
    justify-content: space-between !important;

    gap: 15px !important;

    margin: 0 0 5mm !important;

    padding: 0 0 3mm !important;

    border-bottom: 1px solid #d9dee8 !important;

    break-after: avoid !important;
    page-break-after: avoid !important;
  }


  .page-header h1 {

    margin: 0 !important;

    color: #111827 !important;

    font-size: 22px !important;

    line-height: 1.15 !important;
  }


  .page-header p {

    margin: 3px 0 0 !important;

    max-width: none !important;

    color: #667085 !important;

    font-size: 8px !important;

    line-height: 1.4 !important;
  }


  .eyebrow {

    margin-bottom: 2px !important;

    color: #7c3aed !important;

    font-size: 6.5px !important;

    font-weight: 800 !important;

    letter-spacing: 1.3px !important;
  }


  /*
  |--------------------------------------------------------------------------
  | CARDS
  |--------------------------------------------------------------------------
  */

  .budget-card {

    background: #ffffff !important;

    border: 1px solid #dfe4ec !important;

    box-shadow: none !important;

    color: #172033 !important;

    border-radius: 6px !important;

    box-sizing: border-box !important;
  }


  /*
  |--------------------------------------------------------------------------
  | SUMMARY
  |--------------------------------------------------------------------------
  */

  .summary-grid,
  .savings-summary-grid {

    width: 100% !important;

    gap: 6px !important;

    margin-bottom: 6px !important;
  }


  .summary-card {

    min-height: 67px !important;

    padding: 8px !important;
  }


  .summary-icon {

    width: 29px !important;
    height: 29px !important;

    border-radius: 7px !important;

    font-size: 13px !important;
  }


  .summary-card span,
  .savings-summary-card > span {

    color: #667085 !important;

    font-size: 6.5px !important;
  }


  .summary-card strong,
  .savings-summary-card > strong {

    color: #111827 !important;

    font-size: 9.5px !important;
  }


  .summary-card small,
  .savings-summary-card > small {

    color: #98a2b3 !important;

    font-size: 5.8px !important;
  }


  /*
  |--------------------------------------------------------------------------
  | FINANCIAL HEALTH
  |--------------------------------------------------------------------------
  */

  .health-card {

    width: 100% !important;

    margin-bottom: 6px !important;

    padding: 9px !important;

    gap: 12px !important;

    break-inside: avoid !important;

    page-break-inside: avoid !important;
  }


  .health-score {

    width: 43px !important;
    height: 43px !important;

    padding-top: 12px !important;

    border-radius: 10px !important;
  }


  .health-score strong {

    font-size: 15px !important;
  }


  .health-score span {

    font-size: 6px !important;
  }


  .health-left {

    gap: 8px !important;
  }


  .health-left h3 {

    font-size: 10px !important;
  }


  .health-left p {

    max-width: none !important;

    font-size: 6px !important;

    line-height: 1.35 !important;
  }


  .health-stats {

    gap: 15px !important;
  }


  .health-stats span {

    font-size: 5.8px !important;

    color: #98a2b3 !important;
  }


  .health-stats strong {

    font-size: 7.5px !important;

    color: #111827 !important;
  }


  /*
  |--------------------------------------------------------------------------
  | TWO COLUMN
  |--------------------------------------------------------------------------
  */

  .two-column-grid {

    width: 100% !important;

    gap: 6px !important;

    margin-bottom: 6px !important;
  }


  /*
  |--------------------------------------------------------------------------
  | REPORT CARD
  |--------------------------------------------------------------------------
  */

  .report-card {

    width: 100% !important;

    padding: 9px !important;

    break-inside: avoid !important;

    page-break-inside: avoid !important;
  }


  .card-header-custom {

    margin-bottom: 7px !important;

    gap: 6px !important;
  }


  .card-header-custom h5 {

    color: #111827 !important;

    font-size: 8px !important;
  }


  .card-header-custom span {

    margin-top: 1px !important;

    color: #667085 !important;

    font-size: 5.8px !important;

    line-height: 1.3 !important;
  }


  .card-header-custom > i {

    font-size: 10px !important;
  }


  /*
  |--------------------------------------------------------------------------
  | COMPARISON
  |--------------------------------------------------------------------------
  */

  .comparison {

    gap: 7px !important;
  }


  .comparison-item {

    gap: 3px !important;
  }


  .comparison-label {

    font-size: 6px !important;
  }


  .comparison-label strong {

    font-size: 7px !important;
  }


  .comparison-track {

    height: 5px !important;
  }


  .cashflow-result {

    margin-top: 7px !important;

    padding: 6px !important;

    gap: 5px !important;
  }


  .result-icon {

    width: 22px !important;
    height: 22px !important;

    border-radius: 6px !important;
  }


  .cashflow-result span {

    font-size: 5.5px !important;
  }


  .cashflow-result strong {

    font-size: 7.5px !important;
  }


  .cashflow-result small {

    max-width: none !important;

    font-size: 5.5px !important;
  }


  /*
  |--------------------------------------------------------------------------
  | SECTION TITLE
  |--------------------------------------------------------------------------
  */

  .section-title {

    width: 100% !important;

    margin: 0 0 5px !important;

    break-after: avoid !important;

    page-break-after: avoid !important;
  }


  .section-title h2 {

    color: #111827 !important;

    font-size: 12px !important;
  }


  .section-title p {

    margin-top: 1px !important;

    color: #667085 !important;

    font-size: 6px !important;
  }


  /*
  |--------------------------------------------------------------------------
  | CATEGORY
  |--------------------------------------------------------------------------
  */

  .top-category {

    min-height: 72px !important;

    gap: 7px !important;
  }


  .top-category-icon {

    width: 35px !important;
    height: 35px !important;

    border-radius: 8px !important;

    font-size: 15px !important;
  }


  .top-category-info > strong {

    font-size: 10px !important;
  }


  .top-category-info > b {

    font-size: 8px !important;
  }


  .top-category-info > span,
  .top-category-info > small {

    font-size: 5.5px !important;
  }


  .category-list {

    gap: 6px !important;
  }


  .category-row {

    gap: 3px !important;
  }


  .category-name,
  .category-amount strong {

    font-size: 6.5px !important;
  }


  .category-amount small,
  .category-name span:last-child {

    font-size: 5.5px !important;
  }


  .category-track,
  .budget-track {

    height: 4px !important;
  }


  /*
  |--------------------------------------------------------------------------
  | BUDGET
  |--------------------------------------------------------------------------
  */

  .budget-report-list {

    gap: 6px !important;
  }


  .budget-report-item {

    gap: 3px !important;

    break-inside: avoid !important;

    page-break-inside: avoid !important;
  }


  .budget-report-top strong {

    font-size: 6.5px !important;
  }


  .budget-report-top span,
  .budget-report-footer span,
  .budget-report-footer small {

    font-size: 5.5px !important;
  }


  .budget-total {

    gap: 4px !important;

    margin-top: 6px !important;

    padding-top: 6px !important;
  }


  .budget-total span {

    font-size: 5.5px !important;
  }


  .budget-total strong {

    font-size: 6.5px !important;
  }


  /*
  |--------------------------------------------------------------------------
  | SAVINGS
  |--------------------------------------------------------------------------
  */

  .savings-summary-card {

    min-height: 78px !important;

    padding: 8px !important;

    break-inside: avoid !important;

    page-break-inside: avoid !important;
  }


  .saving-summary-icon {

    width: 24px !important;
    height: 24px !important;

    margin-bottom: 5px !important;

    border-radius: 6px !important;

    font-size: 10px !important;
  }


  .saving-list {

    gap: 6px !important;
  }


  .saving-row {

    gap: 3px !important;

    padding-bottom: 1px !important;

    break-inside: avoid !important;

    page-break-inside: avoid !important;
  }


  .saving-avatar {

    width: 23px !important;
    height: 23px !important;

    border-radius: 6px !important;
  }


  .saving-name {

    gap: 4px !important;
  }


  .saving-name strong,
  .saving-row-head > strong {

    font-size: 6.5px !important;
  }


  .saving-name span,
  .saving-row-bottom {

    font-size: 5.5px !important;
  }


  .saving-progress-track {

    height: 4px !important;
  }


  .routine-badge {

    margin-top: 1px !important;

    padding: 2px 4px !important;

    font-size: 5px !important;
  }


  .free-saving-list {

    gap: 5px !important;
  }


  .free-saving-card {

    gap: 5px !important;

    padding: 6px !important;

    border-radius: 6px !important;

    break-inside: avoid !important;

    page-break-inside: avoid !important;
  }


  /*
  |--------------------------------------------------------------------------
  | SAVINGS ACTIVITY
  |--------------------------------------------------------------------------
  */

  .saving-activity-summary {

    width: 100% !important;

    gap: 6px !important;
  }


  .transaction-row {

    break-inside: avoid !important;

    page-break-inside: avoid !important;
  }


  /*
  |--------------------------------------------------------------------------
  | ACCOUNTS
  |--------------------------------------------------------------------------
  */

  .accounts-grid {

    width: 100% !important;

    gap: 6px !important;
  }


  .account-report {

    break-inside: avoid !important;

    page-break-inside: avoid !important;
  }


  /*
  |--------------------------------------------------------------------------
  | FINAL INSIGHT
  |--------------------------------------------------------------------------
  */

  .final-insight {

    width: 100% !important;

    margin-top: 6px !important;

    padding: 9px !important;

    break-inside: avoid !important;

    page-break-inside: avoid !important;
  }


  .final-insight h3 {

    font-size: 10px !important;
  }


  .final-insight p {

    font-size: 6.5px !important;

    line-height: 1.45 !important;
  }


  /*
  |--------------------------------------------------------------------------
  | PRINT FOOTER
  |--------------------------------------------------------------------------
  */

  .print-report-footer {

    display: flex !important;

    width: 100% !important;

    align-items: center !important;

    justify-content: space-between !important;

    gap: 10px !important;

    margin-top: 5mm !important;

    padding-top: 2.5mm !important;

    border-top: 1px solid #d9dee8 !important;

    color: #98a2b3 !important;

    font-size: 6px !important;

    break-inside: avoid !important;
  }


  .print-report-footer strong {

    color: #667085 !important;

    font-size: 6.5px !important;
  }


  .print-report-footer span {

    display: block !important;
  }


  /*
  |--------------------------------------------------------------------------
  | PREVENT WEIRD BREAKS
  |--------------------------------------------------------------------------
  */

  .budget-card,
  .summary-card,
  .health-card,
  .report-card,
  .savings-summary-card,
  .saving-row,
  .free-saving-card,
  .account-report,
  .transaction-row,
  .final-insight {

    break-inside: avoid !important;

    page-break-inside: avoid !important;
  }


  /*
  |--------------------------------------------------------------------------
  | ANIMATION OFF
  |--------------------------------------------------------------------------
  */

  .reports-page *,
  .reports-page *::before,
  .reports-page *::after {

    animation: none !important;

    transition: none !important;
  }


  /*
  |--------------------------------------------------------------------------
  | NO HORIZONTAL OVERFLOW
  |--------------------------------------------------------------------------
  */

  * {

    max-width: 100%;

    box-sizing: border-box !important;
  }

}

</style>