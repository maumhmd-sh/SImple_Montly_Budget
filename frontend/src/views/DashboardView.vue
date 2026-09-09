<script setup>

import {
  computed,
  onMounted,
  ref
} from 'vue'

import api from '../services/api'


// =====================================================
// STATE
// =====================================================

const loading = ref(true)

const error = ref('')

const dashboard = ref(null)


// =====================================================
// MONTH
// =====================================================

const selectedMonth = ref(
  new Date()
    .toISOString()
    .slice(0, 7)
)


// =====================================================
// FORMAT MONEY
// =====================================================

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


// =====================================================
// FORMAT NUMBER
// =====================================================

function formatNumber(value) {

  return new Intl.NumberFormat(
    'id-ID'
  ).format(
    Number(value || 0)
  )

}


// =====================================================
// LOAD DASHBOARD
// =====================================================

async function loadDashboard() {

  loading.value = true

  error.value = ''

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


    dashboard.value =
      response.data


  } catch (err) {

    console.error(
      'LOAD DASHBOARD ERROR:',
      err
    )

    error.value =
      err.response?.data?.message ||
      'Gagal mengambil data dashboard.'


  } finally {

    loading.value = false

  }

}


// =====================================================
// REFRESH
// =====================================================

async function refreshDashboard() {

  await loadDashboard()

}


// =====================================================
// COMPUTED
// =====================================================

const balance = computed(() => {

  return dashboard.value?.balance || 0

})


const income = computed(() => {

  return dashboard.value?.totalIncome || 0

})


const expense = computed(() => {

  return dashboard.value?.totalExpense || 0

})


const saving = computed(() => {

  return dashboard.value?.saving || 0

})


const expenseRate = computed(() => {

  return dashboard.value?.expenseRate || 0

})


const savingRate = computed(() => {

  return dashboard.value?.savingRate || 0

})

const netCashflow = computed(() => {

  return dashboard.value?.netCashflow || 0

})


const totalTransfer = computed(() => {

  return dashboard.value?.totalTransfer || 0

})


const totalSavingsDeposit = computed(() => {

  return dashboard.value?.totalSavingsDeposit || 0

})


const totalSavingsWithdrawal = computed(() => {

  return dashboard.value?.totalSavingsWithdrawal || 0

})


const netSavingsMovement = computed(() => {

  return dashboard.value?.netSavingsMovement || 0

})


const transfers = computed(() => {

  return dashboard.value?.transfers || []

})


const categoryExpenses = computed(() => {

  return dashboard.value?.categoryExpenses || []

})


const budgetProgress = computed(() => {

  return dashboard.value?.budgetProgress || []

})


const accounts = computed(() => {

  return dashboard.value?.accounts || []

})


// =====================================================
// LIFECYCLE
// =====================================================

onMounted(() => {

  loadDashboard()

})

</script>


<template>

  <div>

    <!-- ================================================= -->
    <!-- PAGE HEADER -->
    <!-- ================================================= -->

    <div class="page-header mb-4">

      <div>

        <h1>
          Dashboard
        </h1>

        <p>
          Ringkasan kondisi keuangan bulan ini.
        </p>

      </div>


      <div class="dashboard-actions">

        <input
          v-model="selectedMonth"
          type="month"
          class="month-input"
          @change="loadDashboard"
        />


        <button
          class="btn-budget"
          :disabled="loading"
          @click="refreshDashboard"
        >

          <i
            class="bi"
            :class="
              loading
                ? 'bi-arrow-repeat spin'
                : 'bi-arrow-clockwise'
            "
          ></i>

          <span>
            {{ loading ? 'Memuat...' : 'Refresh' }}
          </span>

        </button>

      </div>

    </div>


    <!-- ================================================= -->
    <!-- ERROR -->
    <!-- ================================================= -->

    <div
      v-if="error"
      class="alert alert-danger dashboard-alert"
    >

      <i class="bi bi-exclamation-triangle me-2"></i>

      {{ error }}

      <button
        class="btn btn-sm btn-outline-danger ms-3"
        @click="loadDashboard"
      >
        Coba Lagi
      </button>

    </div>


    <!-- ================================================= -->
    <!-- LOADING -->
    <!-- ================================================= -->

    <div
      v-if="loading && !dashboard"
      class="dashboard-loading"
    >

      <div class="loading-icon">

        <i class="bi bi-arrow-repeat spin"></i>

      </div>

      <span>
        Memuat data keuangan...
      </span>

    </div>


    <!-- ================================================= -->
    <!-- DASHBOARD -->
    <!-- ================================================= -->

    <template v-else-if="dashboard">


      <!-- ================================================= -->
      <!-- SUMMARY -->
      <!-- ================================================= -->

      <div class="row g-3 mb-4">


        <!-- BALANCE -->

        <div class="col-xl-4 col-md-6">

          <div class="budget-card summary-card">

            <div class="summary-icon balance">

              <i class="bi bi-wallet2"></i>

            </div>

            <div class="summary-content">

              <span>
                Saldo Saat Ini
              </span>

              <strong>
                {{ formatMoney(balance) }}
              </strong>

            </div>

          </div>

        </div>


        <!-- INCOME -->

        <div class="col-xl-4 col-md-6">

          <div class="budget-card summary-card">

            <div class="summary-icon income">

              <i class="bi bi-arrow-down-left"></i>

            </div>

            <div class="summary-content">

              <span>
                Total Pemasukan
              </span>

              <strong>
                {{ formatMoney(income) }}
              </strong>

            </div>

          </div>

        </div>


        <!-- EXPENSE -->

        <div class="col-xl-4 col-md-6">

          <div class="budget-card summary-card">

            <div class="summary-icon expense">

              <i class="bi bi-arrow-up-right"></i>

            </div>

            <div class="summary-content">

              <span>
                Total Pengeluaran
              </span>

              <strong>
                {{ formatMoney(expense) }}
              </strong>

            </div>

          </div>

        </div>


      </div>


      <!-- ================================================= -->
      <!-- SECONDARY SUMMARY -->
      <!-- ================================================= -->

      <div class="row g-3 mb-4">


<!-- NET CASHFLOW -->

<div class="col-xl-4 col-md-6">

  <div class="budget-card metric-card">

    <div class="metric-header">

      <span>
        Cashflow Bersih
      </span>

      <i class="bi bi-graph-up-arrow"></i>

    </div>

    <strong>
      {{ formatMoney(netCashflow) }}
    </strong>

    <small>
      {{ savingRate }}% sisa dari pemasukan setelah pengeluaran
    </small>

  </div>

</div>


        <!-- EXPENSE RATE -->

        <div class="col-xl-4 col-md-6">

          <div class="budget-card metric-card">

            <div class="metric-header">

              <span>
                Expense Rate
              </span>

              <i class="bi bi-percent"></i>

            </div>

            <strong>
              {{ expenseRate }}%
            </strong>

            <small>
              Proporsi pengeluaran
            </small>

          </div>

        </div>


        <!-- ACCOUNT COUNT -->

        <div class="col-xl-4 col-md-6">

          <div class="budget-card metric-card">

            <div class="metric-header">

              <span>
                Accounts
              </span>

              <i class="bi bi-credit-card"></i>

            </div>

            <strong>
              {{ accounts.length }}
            </strong>

            <small>
              Account aktif
            </small>

          </div>

        </div>


      </div>


<!-- ================================================= -->
<!-- SAVINGS & TRANSFER -->
<!-- ================================================= -->

<div class="row g-3 mb-4">


  <!-- TRANSFER -->

  <div class="col-xl-4 col-md-6">

    <div class="budget-card metric-card transfer-card">

      <div class="metric-header">

        <span>
          Transfer ke Tabungan
        </span>

        <i class="bi bi-arrow-left-right"></i>

      </div>

      <strong>
        {{ formatMoney(totalTransfer) }}
      </strong>

      <small>
        Tidak dihitung sebagai pengeluaran
      </small>

    </div>

  </div>


  <!-- SAVINGS DEPOSIT -->

  <div class="col-xl-4 col-md-6">

    <div class="budget-card metric-card savings-deposit-card">

      <div class="metric-header">

        <span>
          Masuk Tabungan
        </span>

        <i class="bi bi-piggy-bank"></i>

      </div>

      <strong>
        {{ formatMoney(totalSavingsDeposit) }}
      </strong>

      <small>
        Total dana yang masuk ke tabungan
      </small>

    </div>

  </div>


  <!-- SAVINGS WITHDRAWAL -->

  <div class="col-xl-4 col-md-6">

    <div class="budget-card metric-card savings-withdraw-card">

      <div class="metric-header">

        <span>
          Diambil dari Tabungan
        </span>

        <i class="bi bi-arrow-down-circle"></i>

      </div>

      <strong>
        {{ formatMoney(totalSavingsWithdrawal) }}
      </strong>

      <small>
        Dana yang kembali ke account
      </small>

    </div>

  </div>


</div>

      <!-- ================================================= -->
      <!-- CONTENT -->
      <!-- ================================================= -->



      <div class="row g-3">


        <!-- ================================================= -->
        <!-- CATEGORY EXPENSE -->
        <!-- ================================================= -->

        <div class="col-lg-7">

          <div class="budget-card content-card">

            <div class="card-heading">

              <div>

                <h5>
                  Pengeluaran
                </h5>

                <p>
                  Breakdown berdasarkan kategori.
                </p>

              </div>

              <i class="bi bi-pie-chart"></i>

            </div>


            <div
              v-if="categoryExpenses.length"
              class="category-list"
            >

              <div
                v-for="item in categoryExpenses"
                :key="item.name"
                class="category-item"
              >

                <div class="category-info">

                  <div class="category-icon">

                    <i class="bi bi-tag"></i>

                  </div>

                  <div>

                    <strong>
                      {{ item.name }}
                    </strong>

                    <span>
                      {{ formatMoney(item.amount) }}
                    </span>

                  </div>

                </div>


                <strong class="category-amount">

                  {{ formatMoney(item.amount) }}

                </strong>

              </div>

            </div>


            <div
              v-else
              class="empty-state"
            >

              <i class="bi bi-receipt"></i>

              <span>
                Belum ada pengeluaran bulan ini.
              </span>

            </div>

          </div>

        </div>

        


        <!-- ================================================= -->
        <!-- ACCOUNTS -->
        <!-- ================================================= -->

        <div class="col-lg-5">

          <div class="budget-card content-card">

            <div class="card-heading">

              <div>

                <h5>
                  Accounts
                </h5>

                <p>
                  Saldo setiap account.
                </p>

              </div>

              <i class="bi bi-wallet2"></i>

            </div>


            <div
              v-if="accounts.length"
              class="account-list"
            >

              <div
                v-for="account in accounts"
                :key="account.id"
                class="account-item"
              >

                <div class="account-icon">

                  <i
                    class="bi"
                    :class="{
                      'bi-cash-stack':
                        account.type === 'cash',

                      'bi-bank':
                        account.type === 'bank',

                      'bi-phone':
                        account.type === 'ewallet'
                    }"
                  ></i>

                </div>


                <div class="account-info">

                  <strong>
                    {{ account.name }}
                  </strong>

                  <span>
                    {{
                      account.type === 'ewallet'
                        ? 'E-Wallet'
                        : account.type === 'bank'
                          ? 'Bank'
                          : 'Cash'
                    }}
                  </span>

                </div>


                <strong class="account-balance">

                  {{ formatMoney(account.balance) }}

                </strong>

              </div>

            </div>


            <div
              v-else
              class="empty-state"
            >

              <i class="bi bi-wallet"></i>

              <span>
                Belum ada account.
              </span>

            </div>

          </div>

        </div>

        <!-- ================================================= -->
<!-- TRANSFER HISTORY -->
<!-- ================================================= -->

<div class="col-12">

  <div class="budget-card content-card">

    <div class="card-heading">

      <div>

        <h5>
          Aktivitas Transfer Tabungan
        </h5>

        <p>
          Perpindahan dana antara account dan tabungan.
        </p>

      </div>

      <i class="bi bi-arrow-left-right"></i>

    </div>


    <div
      v-if="transfers.length"
      class="transfer-list"
    >

      <div
        v-for="item in transfers"
        :key="item.id"
        class="transfer-item"
      >

        <div class="transfer-icon">

          <i class="bi bi-arrow-left-right"></i>

        </div>


        <div class="transfer-info">

          <strong>

            {{
              item.description ||
              'Transfer tabungan'
            }}

          </strong>

          <span>

            {{
              item.account?.name ||
              'Account'
            }}

            ·

            {{ item.transaction_date }}

          </span>

        </div>


        <strong class="transfer-amount">

          {{ formatMoney(item.amount) }}

        </strong>

      </div>

    </div>


    <div
      v-else
      class="empty-state"
    >

      <i class="bi bi-arrow-left-right"></i>

      <span>
        Belum ada aktivitas transfer tabungan bulan ini.
      </span>

    </div>

  </div>

</div>


        <!-- ================================================= -->
        <!-- BUDGET PROGRESS -->
        <!-- ================================================= -->

        <div class="col-12">

          <div class="budget-card content-card">

            <div class="card-heading">

              <div>

                <h5>
                  Budget Progress
                </h5>

                <p>
                  Perbandingan budget dengan pengeluaran.
                </p>

              </div>

              <i class="bi bi-bar-chart-line"></i>

            </div>


            <div
              v-if="budgetProgress.length"
              class="budget-list"
            >

              <div
                v-for="item in budgetProgress"
                :key="item.id"
                class="budget-item"
              >

                <div class="budget-item-header">

                  <div>

                    <strong>
                      {{ item.category }}
                    </strong>

                    <span>
                      {{ formatMoney(item.spent) }}
                      /
                      {{ formatMoney(item.budget) }}
                    </span>

                  </div>


                  <strong
                    :class="{
                      'danger-text':
                        item.percentage >= 100,

                      'warning-text':
                        item.percentage >= 80 &&
                        item.percentage < 100
                    }"
                  >
                    {{ item.percentage }}%
                  </strong>

                </div>


                <div class="progress budget-progress">

                  <div
                    class="progress-bar"
                    :class="{
                      'bg-danger':
                        item.percentage >= 100,

                      'bg-warning':
                        item.percentage >= 80 &&
                        item.percentage < 100
                    }"
                    :style="{
                      width:
                        Math.min(
                          item.percentage,
                          100
                        ) + '%'
                    }"
                  ></div>

                </div>

              </div>

            </div>


            <div
              v-else
              class="empty-state"
            >

              <i class="bi bi-wallet2"></i>

              <span>
                Belum ada budget bulan ini.
              </span>

            </div>

          </div>

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


.dashboard-actions {

  display: flex;

  align-items: center;

  gap: 8px;

}


.month-input {

  height: 38px;

  padding:
    0 11px;

  border:
    1px solid var(--border-color);

  border-radius:
    9px;

  background:
    var(--bg-card);

  color:
    var(--text-primary);

  font-size: 12px;

  outline: none;

}


.month-input:focus {

  border-color:
    var(--accent);

}


.summary-card {

  min-height: 120px;

  display: flex;

  align-items: center;

  gap: 15px;

  padding: 20px;

}


.summary-icon {

  width: 48px;

  height: 48px;

  flex-shrink: 0;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 14px;

  font-size: 21px;

}


.summary-icon.balance {

  background:
    var(--accent-soft);

  color:
    var(--accent);

}


.summary-icon.income {

  background:
    rgba(34, 197, 94, 0.10);

  color:
    var(--success);

}


.summary-icon.expense {

  background:
    rgba(239, 68, 68, 0.10);

  color:
    var(--danger);

}


.summary-card span {

  display: block;

  color:
    var(--text-secondary);

  font-size: 12px;

  margin-bottom: 6px;

}


.summary-card strong {

  display: block;

  font-size: 18px;

  color:
    var(--text-primary);

}


.metric-card {

  min-height: 115px;

  padding: 18px 20px;

}


.metric-header {

  display: flex;

  align-items: center;

  justify-content: space-between;

  margin-bottom: 8px;

}


.metric-header span {

  color:
    var(--text-secondary);

  font-size: 12px;

}


.metric-header i {

  color:
    var(--accent);

  font-size: 17px;

}


.metric-card > strong {

  display: block;

  font-size: 19px;

  color:
    var(--text-primary);

}


.metric-card small {

  display: block;

  margin-top: 4px;

  color:
    var(--text-muted);

  font-size: 11px;

}


.content-card {

  padding: 20px;

}


.card-heading {

  display: flex;

  align-items: flex-start;

  justify-content: space-between;

  margin-bottom: 20px;

}


.card-heading h5 {

  margin: 0;

  font-size: 15px;

  font-weight: 800;

}


.card-heading p {

  margin:
    4px 0 0;

  color:
    var(--text-muted);

  font-size: 11px;

}


.card-heading > i {

  color:
    var(--accent);

  font-size: 20px;

}


.category-list,
.account-list,
.budget-list {

  display: flex;

  flex-direction: column;

  gap: 10px;

}


.category-item,
.account-item {

  display: flex;

  align-items: center;

  gap: 11px;

  padding: 11px;

  border:
    1px solid var(--border-color);

  border-radius: 10px;

  transition:
    all var(--transition);

}


.category-item:hover,
.account-item:hover {

  background:
    var(--bg-card-hover);

}


.category-info {

  flex: 1;

  display: flex;

  align-items: center;

  gap: 10px;

}


.category-icon,
.account-icon {

  width: 38px;

  height: 38px;

  flex-shrink: 0;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 10px;

  background:
    var(--accent-soft);

  color:
    var(--accent);

}


.category-info strong,
.account-info strong {

  display: block;

  font-size: 12px;

  color:
    var(--text-primary);

}


.category-info span,
.account-info span {

  display: block;

  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 10px;

}


.category-amount,
.account-balance {

  font-size: 12px;

  color:
    var(--text-primary);

}


.account-info {

  flex: 1;

}


.budget-item {

  padding:
    13px 0;

  border-bottom:
    1px solid var(--border-color);

}


.budget-item:first-child {

  padding-top: 0;

}


.budget-item:last-child {

  border-bottom: none;

  padding-bottom: 0;

}


.budget-item-header {

  display: flex;

  align-items: center;

  justify-content: space-between;

  margin-bottom: 8px;

}


.budget-item-header > div strong {

  display: block;

  font-size: 12px;

}


.budget-item-header > div span {

  display: block;

  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 10px;

}


.budget-item-header > strong {

  font-size: 12px;

}


.budget-progress {

  height: 7px;

  overflow: hidden;

  background:
    var(--bg-card-hover);

  border-radius: 99px;

}


.budget-progress .progress-bar {

  border-radius: 99px;

}


.danger-text {

  color:
    var(--danger) !important;

}


.warning-text {

  color:
    #d97706 !important;

}

.transfer-list {

  display: flex;

  flex-direction: column;

  gap: 10px;

}


.transfer-item {

  display: flex;

  align-items: center;

  gap: 12px;

  padding: 12px;

  border:
    1px solid var(--border-color);

  border-radius: 11px;

  transition:
    all var(--transition);

}


.transfer-item:hover {

  background:
    var(--bg-card-hover);

}


.transfer-icon {

  width: 40px;

  height: 40px;

  flex-shrink: 0;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 11px;

  background:
    rgba(59, 130, 246, 0.10);

  color:
    #3b82f6;

}


.transfer-info {

  flex: 1;

}


.transfer-info strong {

  display: block;

  font-size: 12px;

  color:
    var(--text-primary);

}


.transfer-info span {

  display: block;

  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 10px;

}


.transfer-amount {

  font-size: 13px;

  color:
    var(--text-primary);

}


.transfer-card .metric-header i {

  color:
    #3b82f6;

}


.savings-deposit-card .metric-header i {

  color:
    var(--success);

}


.savings-withdraw-card .metric-header i {

  color:
    #f59e0b;

}

.empty-state {

  min-height: 150px;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  gap: 8px;

  color:
    var(--text-muted);

  font-size: 12px;

}


.empty-state i {

  font-size: 28px;

  color:
    var(--accent);

}


.dashboard-loading {

  min-height: 400px;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  gap: 10px;

  color:
    var(--text-muted);

  font-size: 12px;

}


.loading-icon {

  font-size: 30px;

  color:
    var(--accent);

}


.dashboard-alert {

  font-size: 12px;

}


.spin {

  animation:
    spin 900ms linear infinite;

}


@keyframes spin {

  from {

    transform:
      rotate(0deg);

  }

  to {

    transform:
      rotate(360deg);

  }

}
/* =============================
ADD
============================= */






@media (max-width: 575px) {

  .page-header {

    align-items: flex-start;

    gap: 12px;

    flex-direction: column;

  }


  .dashboard-actions {

    width: 100%;

  }


  .month-input {

    flex: 1;

  }


  .page-header h1 {

    font-size: 21px;

  }

}

</style>