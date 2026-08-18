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

const incomes = ref([])

const categories = ref([])

const accounts = ref([])

const loading = ref(false)

const saving = ref(false)

const deleting = ref(null)

const errorMessage = ref('')

const successMessage = ref('')

const showModal = ref(false)

const editingIncome = ref(null)


// ========================================
// FILTER
// ========================================

const selectedMonth = ref(
  new Date()
    .toISOString()
    .slice(0, 7)
)

const searchQuery = ref('')


// ========================================
// FORM
// ========================================

const form = ref({
  category_id: '',
  account_id: '',
  amount: '',
  description: '',
  transaction_date:
    new Date()
      .toISOString()
      .slice(0, 10)
})


// ========================================
// COMPUTED
// ========================================

const filteredIncomes = computed(() => {

  const query =
    searchQuery.value
      .trim()
      .toLowerCase()

  if (!query) {
    return incomes.value
  }

  return incomes.value.filter(
    income => {

      const category =
        income.category?.name || ''

      const account =
        income.account?.name || ''

      const description =
        income.description || ''

      return [
        category,
        account,
        description,
        income.amount,
        income.transaction_date
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)

    }
  )

})


const totalIncome = computed(() => {

  return filteredIncomes.value.reduce(
    (total, income) =>
      total +
      Number(income.amount || 0),
    0
  )

})


// ========================================
// FORMAT
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


function formatDate(date) {

  if (!date) {
    return '-'
  }

  return new Intl.DateTimeFormat(
    'id-ID',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }
  ).format(
    new Date(`${date}T00:00:00`)
  )

}


// ========================================
// HELPERS
// ========================================

function clearMessages() {

  errorMessage.value = ''

  successMessage.value = ''

}


function extractArray(response) {

  if (Array.isArray(response.data)) {
    return response.data
  }

  if (
    Array.isArray(
      response.data?.data
    )
  ) {
    return response.data.data
  }

  return []

}


// ========================================
// LOAD DATA
// ========================================

async function fetchIncomes() {

  loading.value = true

  errorMessage.value = ''

  try {

    const response =
      await api.get(
        '/incomes',
        {
          params: {
            month:
              selectedMonth.value
          }
        }
      )

    incomes.value =
      extractArray(response)

  } catch (error) {

    console.error(
      'GET /incomes:',
      error
    )

    errorMessage.value =
      error.response?.data?.message ||
      'Gagal mengambil data pemasukan.'

  } finally {

    loading.value = false

  }

}


async function fetchCategories() {

  try {

    const response =
      await api.get('/categories')

    const data =
      extractArray(response)

    categories.value =
      data.filter(
        category =>
          category.type === 'income'
      )

  } catch (error) {

    console.error(
      'GET /categories:',
      error
    )

    errorMessage.value =
      error.response?.data?.message ||
      'Gagal mengambil kategori pemasukan.'

  }

}


async function fetchAccounts() {

  try {

    const response =
      await api.get('/accounts')

    accounts.value =
      extractArray(response)

  } catch (error) {

    console.error(
      'GET /accounts:',
      error
    )

    errorMessage.value =
      error.response?.data?.message ||
      'Gagal mengambil account.'

  }

}


async function loadPage() {

  await Promise.all([
    fetchIncomes(),
    fetchCategories(),
    fetchAccounts()
  ])

}


function changeMonth() {

  fetchIncomes()

}


// ========================================
// MODAL
// ========================================

function openCreateModal() {

  clearMessages()

  editingIncome.value = null

  form.value = {

    category_id:
      categories.value[0]?.id || '',

    account_id:
      accounts.value[0]?.id || '',

    amount: '',

    description: '',

    transaction_date:
      selectedMonth.value +
      '-01'

  }

  showModal.value = true

}


function openEditModal(income) {

  clearMessages()

  editingIncome.value = income

  form.value = {

    category_id:
      income.category_id || '',

    account_id:
      income.account_id || '',

    amount:
      income.amount || '',

    description:
      income.description || '',

    transaction_date:
      income.transaction_date ||
      selectedMonth.value + '-01'

  }

  showModal.value = true

}


function closeModal() {

  if (saving.value) {
    return
  }

  showModal.value = false

}


// ========================================
// SAVE
// ========================================

async function saveIncome() {

  clearMessages()


  if (!form.value.category_id) {

    errorMessage.value =
      'Kategori pemasukan wajib dipilih.'

    return

  }


  if (!form.value.account_id) {

    errorMessage.value =
      'Account wajib dipilih.'

    return

  }


  const amount =
    Number(form.value.amount)


  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    errorMessage.value =
      'Jumlah pemasukan harus lebih dari 0.'

    return

  }


  if (!form.value.transaction_date) {

    errorMessage.value =
      'Tanggal pemasukan wajib diisi.'

    return

  }


  saving.value = true


  const payload = {

    category_id:
      Number(form.value.category_id),

    account_id:
      Number(form.value.account_id),

    amount,

    description:
      form.value.description?.trim() ||
      null,

    transaction_date:
      form.value.transaction_date

  }


  try {

    if (editingIncome.value) {

      const response =
        await api.put(
          `/incomes/${editingIncome.value.id}`,
          payload
        )

      successMessage.value =
        response.data?.message ||
        'Pemasukan berhasil diperbarui.'

    } else {

      await api.post(
        '/incomes',
        payload
      )

      successMessage.value =
        'Pemasukan berhasil ditambahkan.'

    }


    showModal.value = false

    await fetchIncomes()

  } catch (error) {

    console.error(
      'SAVE /incomes:',
      error
    )

    errorMessage.value =
      error.response?.data?.message ||
      'Gagal menyimpan pemasukan.'

  } finally {

    saving.value = false

  }

}


// ========================================
// DELETE
// ========================================

async function deleteIncome(income) {

  clearMessages()


  const confirmed =
    window.confirm(
      `Hapus pemasukan "${formatMoney(income.amount)}" dari ${income.category?.name || 'kategori ini'}?`
    )


  if (!confirmed) {
    return
  }


  deleting.value = income.id


  try {

    const response =
      await api.delete(
        `/incomes/${income.id}`
      )

    successMessage.value =
      response.data?.message ||
      'Pemasukan berhasil dihapus.'

    await fetchIncomes()

  } catch (error) {

    console.error(
      'DELETE /incomes:',
      error
    )

    errorMessage.value =
      error.response?.data?.message ||
      'Gagal menghapus pemasukan.'

  } finally {

    deleting.value = null

  }

}


// ========================================
// MOUNT
// ========================================

onMounted(() => {

  loadPage()

})

</script>


<template>

  <div>

    <!-- ================================= -->
    <!-- PAGE HEADER -->
    <!-- ================================= -->

    <div class="page-header mb-4">

      <div>

        <h1>
          Pemasukan
        </h1>

        <p>
          Kelola semua pemasukan dan uang yang masuk.
        </p>

      </div>


      <button
        class="btn-budget"
        @click="openCreateModal"
      >

        <i class="bi bi-plus-lg me-1"></i>

        Pemasukan Baru

      </button>

    </div>


    <!-- ================================= -->
    <!-- ALERT -->
    <!-- ================================= -->

    <div
      v-if="errorMessage"
      class="alert alert-danger alert-modern mb-3"
    >

      <i class="bi bi-exclamation-circle me-2"></i>

      {{ errorMessage }}

    </div>


    <div
      v-if="successMessage"
      class="alert alert-success alert-modern mb-3"
    >

      <i class="bi bi-check-circle me-2"></i>

      {{ successMessage }}

    </div>


    <!-- ================================= -->
    <!-- SUMMARY -->
    <!-- ================================= -->

    <div class="row g-3 mb-4">

      <div class="col-xl-4 col-md-6">

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

          </div>

        </div>

      </div>


      <div class="col-xl-4 col-md-6">

        <div class="budget-card summary-card">

          <div class="summary-icon balance">

            <i class="bi bi-receipt"></i>

          </div>


          <div>

            <span>
              Jumlah Transaksi
            </span>

            <strong>
              {{ filteredIncomes.length }}
            </strong>

          </div>

        </div>

      </div>

    </div>


    <!-- ================================= -->
    <!-- FILTER -->
    <!-- ================================= -->

    <div class="budget-card filter-card mb-3">

      <div class="filter-item">

        <label>
          Bulan
        </label>

        <input
          v-model="selectedMonth"
          type="month"
          class="form-control input-modern"
          @change="changeMonth"
        >

      </div>


      <div class="filter-item search-item">

        <label>
          Cari
        </label>

        <div class="search-wrapper">

          <i class="bi bi-search"></i>

          <input
            v-model="searchQuery"
            type="text"
            class="form-control input-modern search-input"
            placeholder="Cari kategori, account, deskripsi..."
          >

        </div>

      </div>

    </div>


    <!-- ================================= -->
    <!-- LOADING -->
    <!-- ================================= -->

    <div
      v-if="loading"
      class="budget-card loading-card"
    >

      <div
        class="spinner-border"
        role="status"
      ></div>

      <span>
        Memuat pemasukan...
      </span>

    </div>


    <!-- ================================= -->
    <!-- EMPTY -->
    <!-- ================================= -->

    <div
      v-else-if="filteredIncomes.length === 0"
      class="budget-card empty-card"
    >

      <div class="empty-icon">

        <i class="bi bi-arrow-down-left-circle"></i>

      </div>


      <h5>
        Belum ada pemasukan
      </h5>


      <p>
        Belum ada transaksi pemasukan pada periode ini.
      </p>


      <button
        class="btn-budget"
        @click="openCreateModal"
      >

        <i class="bi bi-plus-lg me-1"></i>

        Tambah Pemasukan

      </button>

    </div>


    <!-- ================================= -->
    <!-- TABLE -->
    <!-- ================================= -->

    <div
      v-else
      class="budget-card table-card"
    >

      <div class="table-responsive">

        <table class="income-table">

          <thead>

            <tr>

              <th>
                Tanggal
              </th>

              <th>
                Kategori
              </th>

              <th>
                Account
              </th>

              <th>
                Deskripsi
              </th>

              <th class="text-end">
                Nominal
              </th>

              <th class="action-column">
              </th>

            </tr>

          </thead>


          <tbody>

            <tr
              v-for="income in filteredIncomes"
              :key="income.id"
            >

              <td>

                <span class="date-text">
                  {{ formatDate(income.transaction_date) }}
                </span>

              </td>


              <td>

                <div class="category-cell">

                  <div class="category-icon">

                    <i class="bi bi-tag"></i>

                  </div>

                  <span>
                    {{ income.category?.name || '—' }}
                  </span>

                </div>

              </td>


              <td>

                <span class="account-badge">

                  <i class="bi bi-wallet2"></i>

                  {{ income.account?.name || '—' }}

                </span>

              </td>


              <td>

                <span class="description-text">

                  {{ income.description || 'Tanpa deskripsi' }}

                </span>

              </td>


              <td class="text-end">

                <strong class="income-amount">

                  +{{ formatMoney(income.amount) }}

                </strong>

              </td>


              <td>

                <div class="table-actions">

                  <button
                    class="table-action"
                    title="Edit"
                    @click="openEditModal(income)"
                  >

                    <i class="bi bi-pencil"></i>

                  </button>


                  <button
                    class="table-action danger"
                    title="Hapus"
                    :disabled="
                      deleting === income.id
                    "
                    @click="deleteIncome(income)"
                  >

                    <span
                      v-if="
                        deleting === income.id
                      "
                      class="spinner-border spinner-border-sm"
                    ></span>

                    <i
                      v-else
                      class="bi bi-trash"
                    ></i>

                  </button>

                </div>

              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </div>


    <!-- ================================= -->
    <!-- MODAL -->
    <!-- ================================= -->

    <div
      v-if="showModal"
      class="modal-backdrop-custom"
      @click.self="closeModal"
    >

      <div class="income-modal">

        <!-- HEADER -->

        <div class="modal-header-custom">

          <div>

            <h5>

              {{
                editingIncome
                  ? 'Edit Pemasukan'
                  : 'Pemasukan Baru'
              }}

            </h5>

            <p>

              {{
                editingIncome
                  ? 'Perbarui transaksi pemasukan.'
                  : 'Catat pemasukan baru ke account kamu.'
              }}

            </p>

          </div>


          <button
            class="modal-close"
            @click="closeModal"
          >

            <i class="bi bi-x-lg"></i>

          </button>

        </div>


        <!-- BODY -->

        <div class="modal-body-custom">

          <div class="row g-3">

            <!-- CATEGORY -->

            <div class="col-md-6">

              <label>
                Kategori
              </label>

              <select
                v-model="form.category_id"
                class="form-select input-modern"
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


            <!-- ACCOUNT -->

            <div class="col-md-6">

              <label>
                Account
              </label>

              <select
                v-model="form.account_id"
                class="form-select input-modern"
              >

                <option
                  value=""
                  disabled
                >
                  Pilih account
                </option>

                <option
                  v-for="account in accounts"
                  :key="account.id"
                  :value="account.id"
                >

                  {{ account.name }}

                </option>

              </select>

            </div>


            <!-- AMOUNT -->

            <div class="col-md-6">

              <label>
                Nominal
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
                  class="form-control input-modern amount-input"
                  placeholder="0"
                >

              </div>

            </div>


            <!-- DATE -->

            <div class="col-md-6">

              <label>
                Tanggal
              </label>

              <input
                v-model="form.transaction_date"
                type="date"
                class="form-control input-modern"
              >

            </div>


            <!-- DESCRIPTION -->

            <div class="col-12">

              <label>
                Deskripsi
              </label>

              <textarea
                v-model="form.description"
                class="form-control input-modern"
                rows="3"
                maxlength="255"
                placeholder="Contoh: Gaji bulan Agustus"
              ></textarea>

              <small class="character-count">

                {{ form.description?.length || 0 }}/255

              </small>

            </div>

          </div>

        </div>


        <!-- FOOTER -->

        <div class="modal-footer-custom">

          <button
            class="btn-secondary-modern"
            :disabled="saving"
            @click="closeModal"
          >

            Batal

          </button>


          <button
            class="btn-budget"
            :disabled="saving"
            @click="saveIncome"
          >

            <span
              v-if="saving"
              class="spinner-border spinner-border-sm me-1"
            ></span>

            <i
              v-else
              class="bi bi-check-lg me-1"
            ></i>

            {{
              saving
                ? 'Menyimpan...'
                : 'Simpan'
            }}

          </button>

        </div>

      </div>

    </div>

  </div>

</template>


<style scoped>

.page-header {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 15px;

}


.page-header h1 {

  margin: 0;

  font-size: 24px;

  font-weight: 800;

}


.page-header p {

  margin: 5px 0 0;

  color: var(--text-secondary);

  font-size: 13px;

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


.summary-icon.income {

  background:
    rgba(34, 197, 94, 0.10);

  color:
    var(--success);

}


.summary-icon.balance {

  background:
    var(--accent-soft);

  color:
    var(--accent);

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


.filter-card {

  padding: 16px;

  display: flex;

  align-items: flex-end;

  gap: 14px;

}


.filter-item {

  width: 180px;

}


.filter-item.search-item {

  width: 100%;

  max-width: 420px;

}


.filter-item label {

  display: block;

  margin-bottom: 7px;

  font-size: 11px;

  font-weight: 700;

  color:
    var(--text-secondary);

}


.input-modern {

  min-height: 42px;

  border-radius: 10px;

  border-color:
    var(--border-color);

  background:
    var(--bg-input);

  color:
    var(--text-primary);

}


.input-modern:focus {

  background:
    var(--bg-input);

  color:
    var(--text-primary);

  border-color:
    var(--accent);

  box-shadow:
    0 0 0 3px var(--accent-soft);

}


.search-wrapper {

  position: relative;

}


.search-wrapper > i {

  position: absolute;

  left: 13px;

  top: 50%;

  transform: translateY(-50%);

  color:
    var(--text-muted);

  z-index: 2;

}


.search-input {

  padding-left: 38px;

}


.loading-card {

  min-height: 250px;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  gap: 12px;

  color:
    var(--text-secondary);

}


.empty-card {

  min-height: 280px;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  text-align: center;

  padding: 30px;

}


.empty-icon {

  width: 58px;

  height: 58px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 16px;

  background:
    rgba(34, 197, 94, 0.10);

  color:
    var(--success);

  font-size: 25px;

  margin-bottom: 14px;

}


.empty-card h5 {

  margin: 0;

  font-weight: 800;

}


.empty-card p {

  max-width: 380px;

  margin: 7px 0 18px;

  color:
    var(--text-muted);

  font-size: 13px;

}


.alert-modern {

  border-radius: 11px;

  font-size: 13px;

  border: 1px solid transparent;

}


.table-card {

  overflow: hidden;

}


.income-table {

  width: 100%;

  border-collapse: collapse;

}


.income-table th {

  padding:
    15px 18px;

  background:
    var(--bg-card-hover);

  border-bottom:
    1px solid var(--border-color);

  color:
    var(--text-muted);

  font-size: 10px;

  font-weight: 800;

  text-transform: uppercase;

  letter-spacing: .7px;

  white-space: nowrap;

}


.income-table td {

  padding:
    15px 18px;

  border-bottom:
    1px solid var(--border-color);

  color:
    var(--text-secondary);

  font-size: 13px;

  white-space: nowrap;

}


.income-table tbody tr:last-child td {

  border-bottom: 0;

}


.income-table tbody tr {

  transition:
    background var(--transition);

}


.income-table tbody tr:hover {

  background:
    var(--bg-card-hover);

}


.date-text {

  color:
    var(--text-primary);

  font-weight: 600;

}


.category-cell {

  display: flex;

  align-items: center;

  gap: 9px;

}


.category-icon {

  width: 32px;

  height: 32px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 9px;

  background:
    var(--accent-soft);

  color:
    var(--accent);

  flex-shrink: 0;

}


.category-cell span {

  color:
    var(--text-primary);

  font-weight: 600;

}


.account-badge {

  display: inline-flex;

  align-items: center;

  gap: 6px;

  padding:
    5px 9px;

  border-radius: 8px;

  background:
    var(--bg-card-hover);

  color:
    var(--text-secondary);

  font-size: 11px;

  font-weight: 600;

}


.description-text {

  color:
    var(--text-muted);

}


.income-amount {

  color:
    var(--success);

  font-weight: 800;

}


.action-column {

  width: 80px;

}


.table-actions {

  display: flex;

  justify-content: flex-end;

  gap: 5px;

}


.table-action {

  width: 32px;

  height: 32px;

  border:
    1px solid var(--border-color);

  border-radius: 8px;

  display: flex;

  align-items: center;

  justify-content: center;

  background:
    var(--bg-card);

  color:
    var(--text-secondary);

  transition:
    all var(--transition);

}


.table-action:hover {

  color:
    var(--accent);

  border-color:
    var(--accent);

}


.table-action.danger:hover {

  color:
    var(--danger);

  border-color:
    var(--danger);

}


.table-action:disabled {

  opacity: .55;

  cursor: not-allowed;

}


.modal-backdrop-custom {

  position: fixed;

  inset: 0;

  z-index: 2000;

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 20px;

  background:
    rgba(0, 0, 0, .45);

  backdrop-filter:
    blur(5px);

}


.income-modal {

  width: 100%;

  max-width: 600px;

  max-height: 90vh;

  overflow-y: auto;

  background:
    var(--bg-card);

  border:
    1px solid var(--border-color);

  border-radius: 16px;

  box-shadow:
    0 20px 60px rgba(0, 0, 0, .20);

}


.modal-header-custom {

  display: flex;

  align-items: flex-start;

  justify-content: space-between;

  padding: 22px;

  border-bottom:
    1px solid var(--border-color);

}


.modal-header-custom h5 {

  margin: 0;

  font-weight: 800;

  color:
    var(--text-primary);

}


.modal-header-custom p {

  margin: 5px 0 0;

  font-size: 12px;

  color:
    var(--text-muted);

}


.modal-close {

  width: 34px;

  height: 34px;

  border: 0;

  border-radius: 9px;

  background:
    var(--bg-card-hover);

  color:
    var(--text-secondary);

}


.modal-body-custom {

  padding: 22px;

}


.modal-body-custom label {

  display: block;

  margin-bottom: 7px;

  font-size: 12px;

  font-weight: 700;

  color:
    var(--text-secondary);

}


.amount-wrapper {

  position: relative;

}


.amount-wrapper > span {

  position: absolute;

  left: 13px;

  top: 50%;

  transform: translateY(-50%);

  z-index: 2;

  font-size: 12px;

  font-weight: 700;

  color:
    var(--text-muted);

}


.amount-input {

  padding-left: 38px;

}


.character-count {

  display: block;

  margin-top: 5px;

  text-align: right;

  color:
    var(--text-muted);

  font-size: 10px;

}


.modal-footer-custom {

  display: flex;

  justify-content: flex-end;

  gap: 8px;

  padding: 16px 22px;

  border-top:
    1px solid var(--border-color);

}


.btn-secondary-modern {

  min-height: 40px;

  padding:
    0 16px;

  border:
    1px solid var(--border-color);

  border-radius: 9px;

  background:
    var(--bg-card);

  color:
    var(--text-secondary);

}


.btn-secondary-modern:hover {

  background:
    var(--bg-card-hover);

  color:
    var(--text-primary);

}


@media (max-width: 767px) {

  .filter-card {

    flex-direction: column;

    align-items: stretch;

  }

  .filter-item,
  .filter-item.search-item {

    width: 100%;

    max-width: none;

  }

}


@media (max-width: 575px) {

  .page-header {

    align-items: flex-start;

  }

  .page-header h1 {

    font-size: 21px;

  }

  .page-header .btn-budget {

    font-size: 11px;

    padding:
      8px 11px;

  }

  .income-table th,
  .income-table td {

    padding:
      12px;

  }

}

</style>