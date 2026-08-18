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

const budgets = ref([])

const categories = ref([])

const loading = ref(false)

const saving = ref(false)

const deleting = ref(false)

const showModal = ref(false)

const editingBudget = ref(null)

const errorMessage = ref('')

const successMessage = ref('')


// ========================================
// MONTH
// ========================================

const selectedMonth = ref(
  new Date()
    .toISOString()
    .slice(0, 7)
)


// ========================================
// FORM
// ========================================

const form = ref({
  category_id: '',
  amount: ''
})


// ========================================
// COMPUTED
// ========================================

const totalBudget = computed(() => {

  return budgets.value.reduce(
    (total, budget) =>
      total +
      Number(budget.amount || budget.budget || 0),
    0
  )

})


const totalSpent = computed(() => {

  return budgets.value.reduce(
    (total, budget) =>
      total +
      Number(budget.spent || 0),
    0
  )

})


const totalRemaining = computed(() => {

  return totalBudget.value -
    totalSpent.value

})


const overallPercentage = computed(() => {

  if (totalBudget.value <= 0) {

    return 0

  }

  return Math.round(
    totalSpent.value /
    totalBudget.value *
    100
  )

})


// ========================================
// HELPERS
// ========================================

function clearMessages() {

  errorMessage.value = ''

  successMessage.value = ''

}


function showSuccess(message) {

  errorMessage.value = ''

  successMessage.value = message

  setTimeout(() => {

    successMessage.value = ''

  }, 3000)

}


function showError(message) {

  successMessage.value = ''

  errorMessage.value = message

}


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


function getPercentage(budget) {

  const amount =
    Number(
      budget.amount ||
      budget.budget ||
      0
    )

  const spent =
    Number(
      budget.spent || 0
    )

  if (amount <= 0) {

    return 0

  }

  return Math.round(
    spent /
    amount *
    100
  )

}


function getProgressWidth(budget) {

  return Math.min(
    getPercentage(budget),
    100
  )

}


function getStatus(budget) {

  const percentage =
    getPercentage(budget)


  if (percentage >= 100) {

    return {
      key: 'danger',
      label: 'Melebihi budget',
      icon: 'bi-exclamation-circle-fill'
    }

  }


  if (percentage >= 80) {

    return {
      key: 'warning',
      label: 'Mendekati batas',
      icon: 'bi-exclamation-triangle-fill'
    }

  }


  return {
    key: 'success',
    label: 'Aman',
    icon: 'bi-check-circle-fill'
  }

}


function getCategoryName(budget) {

  return (
    budget.category?.name ||
    budget.Category?.name ||
    budget.category_name ||
    'Tanpa kategori'
  )

}


function getCategoryIcon(budget) {

  return (
    budget.category?.icon ||
    budget.Category?.icon ||
    'bi-tag'
  )

}


function getCategoryColor(budget) {

  return (
    budget.category?.color ||
    budget.Category?.color ||
    '#64748b'
  )

}


function getBudgetAmount(budget) {

  return Number(
    budget.amount ||
    budget.budget ||
    0
  )

}


function getSpent(budget) {

  return Number(
    budget.spent || 0
  )

}


// ========================================
// LOAD CATEGORIES
// ========================================

async function loadCategories() {

  try {

    const response =
      await api.get(
        '/categories'
      )


    categories.value =
      (
        response.data?.data ||
        []
      ).filter(
        category =>
          category.type === 'expense'
      )

  } catch (error) {

    console.error(
      'GET CATEGORIES ERROR:',
      error
    )

    throw error

  }

}


// ========================================
// LOAD BUDGETS
// ========================================

async function loadBudgets() {

  loading.value = true

  clearMessages()

  try {

    const response =
      await api.get(
        '/budgets',
        {
          params: {
            month:
              selectedMonth.value
          }
        }
      )


    budgets.value =
      Array.isArray(
        response.data
      )
        ? response.data
        : (
            response.data?.data ||
            []
          )

  } catch (error) {

    console.error(
      'GET BUDGETS ERROR:',
      error
    )

    showError(
      error.response?.data?.message ||
      'Gagal mengambil data budget.'
    )

  } finally {

    loading.value = false

  }

}


// ========================================
// LOAD PAGE
// ========================================

async function loadPage() {

  loading.value = true

  clearMessages()

  try {

    await Promise.all([
      loadCategories(),
      loadBudgets()
    ])

  } catch (error) {

    console.error(
      'LOAD BUDGET PAGE ERROR:',
      error
    )

    showError(
      error.response?.data?.message ||
      'Gagal memuat halaman budget.'
    )

  } finally {

    loading.value = false

  }

}


// ========================================
// MONTH CHANGE
// ========================================

function changeMonth() {

  loadBudgets()

}


// ========================================
// OPEN CREATE
// ========================================

function openCreate() {

  clearMessages()

  editingBudget.value = null

  form.value = {

    category_id:
      categories.value[0]?.id || '',

    amount: ''

  }

  showModal.value = true

}


// ========================================
// OPEN EDIT
// ========================================

function openEdit(budget) {

  clearMessages()

  editingBudget.value = budget

  form.value = {

    category_id:
      budget.category_id ||
      budget.category?.id ||
      budget.Category?.id ||
      '',

    amount:
      getBudgetAmount(budget)

  }

  showModal.value = true

}


// ========================================
// CLOSE MODAL
// ========================================

function closeModal() {

  if (saving.value) {

    return

  }

  showModal.value = false

  editingBudget.value = null

}


// ========================================
// SAVE BUDGET
// ========================================

async function saveBudget() {

  clearMessages()


  if (!form.value.category_id) {

    showError(
      'Kategori wajib dipilih.'
    )

    return

  }


  const amount =
    Number(form.value.amount)


  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    showError(
      'Jumlah budget harus lebih dari 0.'
    )

    return

  }


  saving.value = true


  try {

    const payload = {

      category_id:
        Number(
          form.value.category_id
        ),

      amount,

      month:
        selectedMonth.value

    }


    let response


    if (editingBudget.value) {

      response =
        await api.put(
          `/budgets/${editingBudget.value.id}`,
          payload
        )

    } else {

      response =
        await api.post(
          '/budgets',
          payload
        )

    }


    closeModal()

    showSuccess(
      response.data?.message ||
      (
        editingBudget.value
          ? 'Budget berhasil diperbarui.'
          : 'Budget berhasil dibuat.'
      )
    )


    await loadBudgets()

  } catch (error) {

    console.error(
      'SAVE BUDGET ERROR:',
      error
    )

    showError(
      error.response?.data?.message ||
      'Gagal menyimpan budget.'
    )

  } finally {

    saving.value = false

  }

}


// ========================================
// DELETE
// ========================================

async function deleteBudget(budget) {

  if (deleting.value) {

    return

  }


  const categoryName =
    getCategoryName(budget)


  const confirmed =
    window.confirm(
      `Hapus budget "${categoryName}" sebesar ${formatMoney(getBudgetAmount(budget))}?`
    )


  if (!confirmed) {

    return

  }


  clearMessages()

  deleting.value = true


  try {

    const response =
      await api.delete(
        `/budgets/${budget.id}`
      )


    showSuccess(
      response.data?.message ||
      'Budget berhasil dihapus.'
    )


    await loadBudgets()

  } catch (error) {

    console.error(
      'DELETE BUDGET ERROR:',
      error
    )

    showError(
      error.response?.data?.message ||
      'Gagal menghapus budget.'
    )

  } finally {

    deleting.value = false

  }

}


// ========================================
// INITIAL
// ========================================

onMounted(
  loadPage
)

</script>


<template>

  <div class="budget-page">

    <!-- ================================= -->
    <!-- HEADER -->
    <!-- ================================= -->

    <div class="page-header mb-4">

      <div>

        <h1>
          Budget
        </h1>

        <p>
          Atur batas pengeluaran berdasarkan kategori setiap bulan.
        </p>

      </div>


      <button
        class="btn-budget"
        @click="openCreate"
      >

        <i class="bi bi-plus-lg me-1"></i>

        Tambah Budget

      </button>

    </div>


    <!-- ================================= -->
    <!-- ALERT -->
    <!-- ================================= -->

    <div
      v-if="successMessage"
      class="budget-alert success"
    >

      <i class="bi bi-check-circle-fill"></i>

      <span>
        {{ successMessage }}
      </span>

      <button
        @click="
          successMessage = ''
        "
      >

        <i class="bi bi-x"></i>

      </button>

    </div>


    <div
      v-if="errorMessage"
      class="budget-alert error"
    >

      <i class="bi bi-exclamation-circle-fill"></i>

      <span>
        {{ errorMessage }}
      </span>

      <button
        @click="
          errorMessage = ''
        "
      >

        <i class="bi bi-x"></i>

      </button>

    </div>


    <!-- ================================= -->
    <!-- MONTH SELECTOR -->
    <!-- ================================= -->

    <div class="budget-card month-toolbar">

      <div class="month-title">

        <div class="month-icon">

          <i class="bi bi-calendar3"></i>

        </div>

        <div>

          <strong>
            Periode Budget
          </strong>

          <span>
            Pilih bulan untuk melihat budget.
          </span>

        </div>

      </div>


      <input
        v-model="selectedMonth"
        type="month"
        class="month-input"
        @change="changeMonth"
      />

    </div>


    <!-- ================================= -->
    <!-- SUMMARY -->
    <!-- ================================= -->

    <div class="row g-3 mb-4">

      <div class="col-xl-4 col-md-6">

        <div class="budget-card summary-card">

          <div class="summary-icon budget">

            <i class="bi bi-wallet2"></i>

          </div>


          <div>

            <span>
              Total Budget
            </span>

            <strong>
              {{ formatMoney(totalBudget) }}
            </strong>

          </div>

        </div>

      </div>


      <div class="col-xl-4 col-md-6">

        <div class="budget-card summary-card">

          <div class="summary-icon spent">

            <i class="bi bi-arrow-up-right"></i>

          </div>


          <div>

            <span>
              Sudah Terpakai
            </span>

            <strong>
              {{ formatMoney(totalSpent) }}
            </strong>

          </div>

        </div>

      </div>


      <div class="col-xl-4 col-md-6">

        <div class="budget-card summary-card">

          <div
            class="summary-icon"
            :class="
              totalRemaining < 0
                ? 'danger'
                : 'remaining'
            "
          >

            <i class="bi bi-piggy-bank"></i>

          </div>


          <div>

            <span>
              Sisa Budget
            </span>

            <strong
              :class="{
                negative:
                  totalRemaining < 0
              }"
            >

              {{ formatMoney(totalRemaining) }}

            </strong>

          </div>

        </div>

      </div>

    </div>


    <!-- ================================= -->
    <!-- OVERALL PROGRESS -->
    <!-- ================================= -->

    <div
      v-if="budgets.length"
      class="budget-card overall-card mb-4"
    >

      <div class="overall-header">

        <div>

          <strong>
            Penggunaan Budget
          </strong>

          <span>
            {{ formatMoney(totalSpent) }}
            dari
            {{ formatMoney(totalBudget) }}
          </span>

        </div>


        <strong
          :class="{
            danger:
              overallPercentage >= 100,

            warning:
              overallPercentage >= 80 &&
              overallPercentage < 100
          }"
        >

          {{ overallPercentage }}%

        </strong>

      </div>


      <div class="progress-track">

        <div
          class="progress-fill"
          :class="{
            danger:
              overallPercentage >= 100,

            warning:
              overallPercentage >= 80 &&
              overallPercentage < 100
          }"
          :style="{
            width:
              Math.min(
                overallPercentage,
                100
              ) + '%'
          }"
        ></div>

      </div>

    </div>


    <!-- ================================= -->
    <!-- LOADING -->
    <!-- ================================= -->

    <div
      v-if="loading"
      class="budget-card empty-state"
    >

      <div class="loading-spinner"></div>

      <h5>
        Memuat budget...
      </h5>

      <p>
        Tunggu sebentar.
      </p>

    </div>


    <!-- ================================= -->
    <!-- EMPTY -->
    <!-- ================================= -->

    <div
      v-else-if="!budgets.length"
      class="budget-card empty-state"
    >

      <i class="bi bi-wallet2"></i>

      <h5>
        Belum ada budget
      </h5>

      <p>
        Belum ada budget untuk periode
        {{ selectedMonth }}.
      </p>


      <button
        class="btn-budget"
        @click="openCreate"
      >

        <i class="bi bi-plus-lg me-1"></i>

        Tambah Budget

      </button>

    </div>


    <!-- ================================= -->
    <!-- BUDGET LIST -->
    <!-- ================================= -->

    <div
      v-else
      class="budget-list"
    >

      <div
        v-for="budget in budgets"
        :key="budget.id"
        class="budget-card budget-item"
      >

        <!-- TOP -->

        <div class="budget-item-header">

          <div class="budget-category">

            <div
              class="category-icon"
              :style="{
                backgroundColor:
                  `${getCategoryColor(budget)}18`,
                color:
                  getCategoryColor(budget)
              }"
            >

              <i
                class="bi"
                :class="
                  getCategoryIcon(budget)
                "
              ></i>

            </div>


            <div>

              <strong>
                {{ getCategoryName(budget) }}
              </strong>

              <span>
                Pengeluaran
              </span>

            </div>

          </div>


          <div class="budget-actions">

            <button
              class="action-button edit"
              title="Edit budget"
              @click="openEdit(budget)"
            >

              <i class="bi bi-pencil"></i>

            </button>


            <button
              class="action-button delete"
              title="Hapus budget"
              :disabled="deleting"
              @click="
                deleteBudget(budget)
              "
            >

              <i class="bi bi-trash"></i>

            </button>

          </div>

        </div>


        <!-- AMOUNT -->

        <div class="budget-amount-row">

          <div>

            <span>
              Terpakai
            </span>

            <strong>
              {{ formatMoney(getSpent(budget)) }}
            </strong>

          </div>


          <div class="text-end">

            <span>
              Budget
            </span>

            <strong>
              {{ formatMoney(getBudgetAmount(budget)) }}
            </strong>

          </div>

        </div>


        <!-- PROGRESS -->

        <div class="progress-track">

          <div
            class="progress-fill"
            :class="
              getStatus(budget).key
            "
            :style="{
              width:
                getProgressWidth(budget) +
                '%'
            }"
          ></div>

        </div>


        <!-- FOOTER -->

        <div class="budget-item-footer">

          <div
            class="status"
            :class="
              getStatus(budget).key
            "
          >

            <i
              class="bi"
              :class="
                getStatus(budget).icon
              "
            ></i>

            {{ getStatus(budget).label }}

          </div>


          <strong
            :class="
              getStatus(budget).key
            "
          >

            {{ getPercentage(budget) }}%

          </strong>

        </div>

      </div>

    </div>


    <!-- ================================= -->
    <!-- MODAL -->
    <!-- ================================= -->

    <Teleport to="body">

      <div
        v-if="showModal"
        class="modal-backdrop-custom"
        @click.self="closeModal"
      >

        <div class="budget-modal">

          <!-- HEADER -->

          <div class="modal-header-custom">

            <div>

              <h5>

                {{
                  editingBudget
                    ? 'Edit Budget'
                    : 'Tambah Budget'
                }}

              </h5>

              <p>
                Atur batas pengeluaran kategori untuk bulan ini.
              </p>

            </div>


            <button
              class="modal-close"
              :disabled="saving"
              @click="closeModal"
            >

              <i class="bi bi-x-lg"></i>

            </button>

          </div>


          <!-- FORM -->

          <form
            @submit.prevent="saveBudget"
          >

            <!-- MONTH -->

            <div class="form-group">

              <label>
                Bulan
              </label>

              <div class="readonly-month">

                <i class="bi bi-calendar3"></i>

                <span>
                  {{ selectedMonth }}
                </span>

              </div>

            </div>


            <!-- CATEGORY -->

            <div class="form-group">

              <label>
                Kategori Pengeluaran
              </label>

              <select
                v-model="form.category_id"
                class="form-input"
              >

                <option
                  value=""
                  disabled
                >
                  Pilih kategori
                </option>

                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                >

                  {{ category.name }}

                </option>

              </select>

            </div>


            <!-- AMOUNT -->

            <div class="form-group">

              <label>
                Batas Budget
              </label>

              <div class="amount-wrapper">

                <span>
                  Rp
                </span>

                <input
                  v-model="form.amount"
                  type="number"
                  min="1"
                  step="1"
                  class="form-input amount-input"
                  placeholder="0"
                />

              </div>

            </div>


            <!-- PREVIEW -->

            <div
              v-if="form.category_id"
              class="budget-preview"
            >

              <div class="preview-icon">

                <i class="bi bi-wallet2"></i>

              </div>


              <div>

                <span>
                  Budget {{ selectedMonth }}
                </span>

                <strong>
                  {{
                    formatMoney(
                      form.amount
                    )
                  }}
                </strong>

              </div>

            </div>


            <!-- ACTIONS -->

            <div class="modal-actions">

              <button
                type="button"
                class="btn-secondary-custom"
                :disabled="saving"
                @click="closeModal"
              >
                Batal
              </button>


              <button
                type="submit"
                class="btn-budget"
                :disabled="saving"
              >

                <span
                  v-if="saving"
                  class="button-spinner"
                ></span>

                <i
                  v-else
                  class="bi bi-check-lg me-1"
                ></i>

                {{
                  saving
                    ? 'Menyimpan...'
                    : editingBudget
                      ? 'Simpan Perubahan'
                      : 'Simpan Budget'
                }}

              </button>

            </div>

          </form>

        </div>

      </div>

    </Teleport>

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


.btn-budget {

  min-height: 40px;

  padding:
    0 15px;

  border: 0;

  border-radius: 9px;

  background:
    var(--accent);

  color: white;

  font-size: 12px;

  font-weight: 700;

  transition:
    all var(--transition);

}


.btn-budget:hover {

  filter:
    brightness(.94);

  transform:
    translateY(-1px);

}


.btn-budget:disabled {

  opacity: .6;

  cursor: not-allowed;

  transform: none;

}


/* ========================================
   ALERT
======================================== */

.budget-alert {

  display: flex;

  align-items: center;

  gap: 10px;

  margin-bottom: 16px;

  padding:
    12px 14px;

  border-radius: 10px;

  font-size: 13px;

}


.budget-alert span {

  flex: 1;

}


.budget-alert button {

  border: none;

  background: transparent;

  color: inherit;

}


.budget-alert.success {

  background:
    rgba(34, 197, 94, .10);

  color:
    var(--success);

}


.budget-alert.error {

  background:
    rgba(239, 68, 68, .10);

  color:
    var(--danger);

}


/* ========================================
   MONTH TOOLBAR
======================================== */

.month-toolbar {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 15px;

  padding: 15px 17px;

  margin-bottom: 16px;

}


.month-title {

  display: flex;

  align-items: center;

  gap: 11px;

}


.month-icon {

  width: 39px;

  height: 39px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 11px;

  background:
    var(--accent-soft);

  color:
    var(--accent);

}


.month-title > div:last-child {

  display: flex;

  flex-direction: column;

  gap: 2px;

}


.month-title strong {

  font-size: 12px;

}


.month-title span {

  color:
    var(--text-muted);

  font-size: 10px;

}


.month-input {

  height: 40px;

  padding:
    0 10px;

  border:
    1px solid var(--border-color);

  border-radius: 9px;

  outline: none;

  background:
    var(--bg-card);

  color:
    var(--text-primary);

  font-size: 12px;

}


.month-input:focus {

  border-color:
    var(--accent);

}


/* ========================================
   SUMMARY
======================================== */

.summary-card {

  min-height: 116px;

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


.summary-icon.budget {

  background:
    var(--accent-soft);

  color:
    var(--accent);

}


.summary-icon.spent {

  background:
    rgba(239, 68, 68, .10);

  color:
    var(--danger);

}


.summary-icon.remaining {

  background:
    rgba(34, 197, 94, .10);

  color:
    var(--success);

}


.summary-icon.danger {

  background:
    rgba(239, 68, 68, .10);

  color:
    var(--danger);

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

  font-size: 17px;

  font-weight: 800;

}


.summary-card strong.negative {

  color:
    var(--danger);

}


/* ========================================
   OVERALL
======================================== */

.overall-card {

  padding: 18px;

}


.overall-header {

  display: flex;

  align-items: center;

  justify-content: space-between;

  margin-bottom: 11px;

}


.overall-header > div {

  display: flex;

  flex-direction: column;

  gap: 3px;

}


.overall-header strong {

  font-size: 12px;

}


.overall-header span {

  color:
    var(--text-muted);

  font-size: 10px;

}


.overall-header > strong {

  font-size: 14px;

  color:
    var(--success);

}


.overall-header > strong.warning {

  color:
    #f59e0b;

}


.overall-header > strong.danger {

  color:
    var(--danger);

}


/* ========================================
   PROGRESS
======================================== */

.progress-track {

  width: 100%;

  height: 8px;

  overflow: hidden;

  border-radius: 999px;

  background:
    var(--bg-card-hover);

}


.progress-fill {

  height: 100%;

  min-width: 0;

  border-radius: inherit;

  background:
    var(--success);

  transition:
    width 400ms ease;

}


.progress-fill.warning {

  background:
    #f59e0b;

}


.progress-fill.danger {

  background:
    var(--danger);

}


/* ========================================
   BUDGET LIST
======================================== */

.budget-list {

  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 12px;

}


.budget-item {

  padding: 17px;

}


.budget-item-header {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 12px;

  margin-bottom: 18px;

}


.budget-category {

  display: flex;

  align-items: center;

  gap: 10px;

  min-width: 0;

}


.category-icon {

  width: 43px;

  height: 43px;

  flex-shrink: 0;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 12px;

  font-size: 18px;

}


.budget-category > div:last-child {

  min-width: 0;

  display: flex;

  flex-direction: column;

  gap: 3px;

}


.budget-category strong {

  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;

  color:
    var(--text-primary);

  font-size: 13px;

}


.budget-category span {

  color:
    var(--text-muted);

  font-size: 10px;

}


.budget-actions {

  display: flex;

  gap: 5px;

}


.action-button {

  width: 32px;

  height: 32px;

  display: flex;

  align-items: center;

  justify-content: center;

  border: none;

  border-radius: 8px;

  background:
    transparent;

  color:
    var(--text-muted);

}


.action-button.edit:hover {

  background:
    var(--accent-soft);

  color:
    var(--accent);

}


.action-button.delete:hover {

  background:
    rgba(239, 68, 68, .10);

  color:
    var(--danger);

}


.action-button:disabled {

  opacity: .5;

}


/* ========================================
   AMOUNTS
======================================== */

.budget-amount-row {

  display: flex;

  align-items: flex-end;

  justify-content: space-between;

  margin-bottom: 10px;

}


.budget-amount-row > div {

  display: flex;

  flex-direction: column;

  gap: 3px;

}


.budget-amount-row span {

  color:
    var(--text-muted);

  font-size: 10px;

}


.budget-amount-row strong {

  color:
    var(--text-primary);

  font-size: 13px;

  font-weight: 800;

}


/* ========================================
   FOOTER
======================================== */

.budget-item-footer {

  display: flex;

  align-items: center;

  justify-content: space-between;

  margin-top: 9px;

}


.status {

  display: flex;

  align-items: center;

  gap: 5px;

  font-size: 10px;

  font-weight: 700;

}


.status.success {

  color:
    var(--success);

}


.status.warning {

  color:
    #f59e0b;

}


.status.danger {

  color:
    var(--danger);

}


.budget-item-footer > strong {

  font-size: 11px;

}


.budget-item-footer > strong.success {

  color:
    var(--success);

}


.budget-item-footer > strong.warning {

  color:
    #f59e0b;

}


.budget-item-footer > strong.danger {

  color:
    var(--danger);

}


/* ========================================
   EMPTY
======================================== */

.empty-state {

  min-height: 280px;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  text-align: center;

  padding: 30px;

}


.empty-state > i {

  margin-bottom: 13px;

  color:
    var(--accent);

  font-size: 38px;

}


.empty-state h5 {

  margin: 0;

  font-weight: 800;

}


.empty-state p {

  max-width: 420px;

  margin:
    7px 0 18px;

  color:
    var(--text-muted);

  font-size: 13px;

}


.loading-spinner {

  width: 32px;

  height: 32px;

  margin-bottom: 15px;

  border:
    3px solid var(--border-color);

  border-top-color:
    var(--accent);

  border-radius: 50%;

  animation:
    budget-spin 700ms linear infinite;

}


@keyframes budget-spin {

  to {

    transform:
      rotate(360deg);

  }

}


/* ========================================
   MODAL
======================================== */

.modal-backdrop-custom {

  position: fixed;

  inset: 0;

  z-index: 3000;

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 20px;

  background:
    rgba(0, 0, 0, .45);

  backdrop-filter:
    blur(5px);

}


.budget-modal {

  width: min(
    500px,
    100%
  );

  max-height:
    calc(100vh - 40px);

  overflow-y: auto;

  padding: 22px;

  border:
    1px solid var(--border-color);

  border-radius: 16px;

  background:
    var(--bg-card);

  box-shadow:
    0 25px 70px rgba(0, 0, 0, .20);

}


.modal-header-custom {

  display: flex;

  align-items: flex-start;

  justify-content: space-between;

  gap: 15px;

  margin-bottom: 22px;

}


.modal-header-custom h5 {

  margin: 0;

  font-size: 17px;

  font-weight: 800;

}


.modal-header-custom p {

  margin:
    5px 0 0;

  color:
    var(--text-muted);

  font-size: 11px;

}


.modal-close {

  width: 32px;

  height: 32px;

  border: none;

  border-radius: 8px;

  background:
    var(--bg-card-hover);

  color:
    var(--text-secondary);

}


.form-group {

  margin-bottom: 18px;

}


.form-group > label {

  display: block;

  margin-bottom: 7px;

  color:
    var(--text-primary);

  font-size: 12px;

  font-weight: 700;

}


.form-input {

  width: 100%;

  height: 42px;

  padding:
    0 12px;

  border:
    1px solid var(--border-color);

  border-radius: 9px;

  outline: none;

  background:
    var(--bg-card);

  color:
    var(--text-primary);

  font-size: 12px;

}


.form-input:focus {

  border-color:
    var(--accent);

  box-shadow:
    0 0 0 3px var(--accent-soft);

}


.readonly-month {

  height: 42px;

  display: flex;

  align-items: center;

  gap: 9px;

  padding:
    0 12px;

  border:
    1px solid var(--border-color);

  border-radius: 9px;

  background:
    var(--bg-card-hover);

  color:
    var(--text-secondary);

  font-size: 12px;

}


.readonly-month i {

  color:
    var(--accent);

}


.amount-wrapper {

  position: relative;

}


.amount-wrapper > span {

  position: absolute;

  left: 13px;

  top: 50%;

  z-index: 2;

  transform:
    translateY(-50%);

  color:
    var(--text-muted);

  font-size: 11px;

  font-weight: 700;

}


.amount-input {

  padding-left: 38px;

}


/* ========================================
   PREVIEW
======================================== */

.budget-preview {

  display: flex;

  align-items: center;

  gap: 11px;

  padding: 13px;

  margin-bottom: 18px;

  border:
    1px solid var(--border-color);

  border-radius: 10px;

  background:
    var(--bg-card-hover);

}


.preview-icon {

  width: 39px;

  height: 39px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 10px;

  background:
    var(--accent-soft);

  color:
    var(--accent);

}


.budget-preview > div:last-child {

  display: flex;

  flex-direction: column;

  gap: 3px;

}


.budget-preview span {

  color:
    var(--text-muted);

  font-size: 10px;

}


.budget-preview strong {

  color:
    var(--text-primary);

  font-size: 13px;

}


/* ========================================
   ACTIONS
======================================== */

.modal-actions {

  display: flex;

  justify-content: flex-end;

  gap: 8px;

}


.btn-secondary-custom {

  height: 40px;

  padding:
    0 16px;

  border:
    1px solid var(--border-color);

  border-radius: 9px;

  background:
    var(--bg-card);

  color:
    var(--text-secondary);

  font-size: 12px;

  font-weight: 700;

}


.btn-secondary-custom:hover {

  background:
    var(--bg-card-hover);

  color:
    var(--text-primary);

}


.button-spinner {

  display: inline-block;

  width: 13px;

  height: 13px;

  margin-right: 5px;

  vertical-align: -2px;

  border:
    2px solid rgba(255,255,255,.45);

  border-top-color:
    white;

  border-radius: 50%;

  animation:
    budget-spin 600ms linear infinite;

}


/* ========================================
   RESPONSIVE
======================================== */

@media (max-width: 767.98px) {

  .month-toolbar {

    align-items: stretch;

    flex-direction: column;

  }


  .month-input {

    width: 100%;

  }


  .budget-list {

    grid-template-columns: 1fr;

  }

}


@media (max-width: 575.98px) {

  .page-header {

    align-items: flex-start;

  }


  .page-header h1 {

    font-size: 21px;

  }


  .page-header .btn-budget {

    padding:
      8px 10px;

    font-size: 11px;

  }


  .budget-modal {

    padding: 17px;

    border-radius: 13px;

  }

}

</style>