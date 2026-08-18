<script setup>

import {
  computed,
  onMounted,
  ref
} from 'vue'

import api from '../services/api'


const accounts = ref([])

const loading = ref(false)

const saving = ref(false)

const errorMessage = ref('')

const successMessage = ref('')


const showModal = ref(false)

const editingAccount = ref(null)


const form = ref({
  name: '',
  type: 'cash'
})


const typeOptions = [
  {
    value: 'cash',
    label: 'Cash',
    icon: 'bi-wallet2'
  },
  {
    value: 'bank',
    label: 'Bank',
    icon: 'bi-bank'
  },
  {
    value: 'ewallet',
    label: 'E-Wallet',
    icon: 'bi-phone'
  }
]


const totalBalance = computed(() => {

  return accounts.value.reduce(
    (total, account) =>
      total + Number(account.balance || 0),
    0
  )

})


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


function getTypeLabel(type) {

  const item =
    typeOptions.find(
      option =>
        option.value === type
    )

  return item?.label || type

}


function getTypeIcon(type) {

  const item =
    typeOptions.find(
      option =>
        option.value === type
    )

  return item?.icon || 'bi-wallet2'

}


function clearMessages() {

  errorMessage.value = ''

  successMessage.value = ''

}


async function fetchAccounts() {

  loading.value = true

  errorMessage.value = ''

  try {

    const response =
      await api.get('/accounts')

    accounts.value =
      Array.isArray(response.data)
        ? response.data
        : response.data?.data || []

  } catch (error) {

    console.error(
      'GET /accounts:',
      error
    )

    errorMessage.value =
      error.response?.data?.message ||
      'Gagal mengambil data account.'

  } finally {

    loading.value = false

  }

}


function openCreateModal() {

  clearMessages()

  editingAccount.value = null

  form.value = {
    name: '',
    type: 'cash'
  }

  showModal.value = true

}


function openEditModal(account) {

  clearMessages()

  editingAccount.value = account

  form.value = {
    name: account.name || '',
    type: account.type || 'cash'
  }

  showModal.value = true

}


function closeModal() {

  if (saving.value) {
    return
  }

  showModal.value = false

}


async function saveAccount() {

  clearMessages()

  if (!form.value.name.trim()) {

    errorMessage.value =
      'Nama account wajib diisi.'

    return

  }


  saving.value = true

  try {

    if (editingAccount.value) {

      await api.put(
        `/accounts/${editingAccount.value.id}`,
        {
          name:
            form.value.name.trim(),

          type:
            form.value.type
        }
      )

      successMessage.value =
        'Account berhasil diperbarui.'

    } else {

      await api.post(
        '/accounts',
        {
          name:
            form.value.name.trim(),

          type:
            form.value.type
        }
      )

      successMessage.value =
        'Account berhasil dibuat.'

    }


    showModal.value = false

    await fetchAccounts()

  } catch (error) {

    console.error(
      'SAVE /accounts:',
      error
    )

    errorMessage.value =
      error.response?.data?.message ||
      'Gagal menyimpan account.'

  } finally {

    saving.value = false

  }

}


async function deleteAccount(account) {

  clearMessages()

  const confirmed =
    window.confirm(
      `Hapus account "${account.name}"?`
    )

  if (!confirmed) {
    return
  }


  try {

    await api.delete(
      `/accounts/${account.id}`
    )

    successMessage.value =
      'Account berhasil dihapus.'

    await fetchAccounts()

  } catch (error) {

    console.error(
      'DELETE /accounts:',
      error
    )

    if (
      error.response?.status === 409
    ) {

      errorMessage.value =
        error.response.data.message ||
        'Account masih memiliki transaksi.'

    } else {

      errorMessage.value =
        error.response?.data?.message ||
        'Gagal menghapus account.'

    }

  }

}


onMounted(() => {

  fetchAccounts()

})

</script>


<template>

  <div>

    <!-- PAGE HEADER -->

    <div class="page-header mb-4">

      <div>

        <h1>
          Accounts
        </h1>

        <p>
          Kelola rekening dan sumber dana kamu.
        </p>

      </div>


      <button
        class="btn-budget"
        @click="openCreateModal"
      >

        <i class="bi bi-plus-lg me-1"></i>

        Account Baru

      </button>

    </div>


    <!-- ALERT -->

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


    <!-- TOTAL -->

    <div class="row g-3 mb-4">

      <div class="col-xl-4 col-md-6">

        <div class="budget-card summary-card">

          <div class="summary-icon balance">

            <i class="bi bi-wallet2"></i>

          </div>


          <div>

            <span>
              Total Saldo
            </span>

            <strong>
              {{ formatMoney(totalBalance) }}
            </strong>

          </div>

        </div>

      </div>


      <div class="col-xl-4 col-md-6">

        <div class="budget-card summary-card">

          <div class="summary-icon income">

            <i class="bi bi-bank"></i>

          </div>


          <div>

            <span>
              Jumlah Account
            </span>

            <strong>
              {{ accounts.length }}
            </strong>

          </div>

        </div>

      </div>

    </div>


    <!-- LOADING -->

    <div
      v-if="loading"
      class="budget-card loading-card"
    >

      <div
        class="spinner-border"
        role="status"
      ></div>

      <span>
        Memuat account...
      </span>

    </div>


    <!-- EMPTY -->

    <div
      v-else-if="accounts.length === 0"
      class="budget-card empty-card"
    >

      <div class="empty-icon">

        <i class="bi bi-wallet2"></i>

      </div>

      <h5>
        Belum ada account
      </h5>

      <p>
        Tambahkan account pertama kamu untuk mulai
        mengelola saldo.
      </p>

      <button
        class="btn-budget"
        @click="openCreateModal"
      >

        <i class="bi bi-plus-lg me-1"></i>

        Tambah Account

      </button>

    </div>


    <!-- ACCOUNT GRID -->

    <div
      v-else
      class="row g-3"
    >

      <div
        v-for="account in accounts"
        :key="account.id"
        class="col-xl-4 col-md-6"
      >

        <div class="budget-card account-card">

          <div class="account-top">

            <div
              class="account-icon"
              :class="account.type"
            >

              <i
                class="bi"
                :class="getTypeIcon(account.type)"
              ></i>

            </div>


            <div class="account-actions">

              <button
                class="account-action"
                title="Edit"
                @click="openEditModal(account)"
              >

                <i class="bi bi-pencil"></i>

              </button>


              <button
                class="account-action danger"
                title="Hapus"
                @click="deleteAccount(account)"
              >

                <i class="bi bi-trash"></i>

              </button>

            </div>

          </div>


          <div class="account-content">

            <span class="account-type">
              {{ getTypeLabel(account.type) }}
            </span>

            <h5>
              {{ account.name }}
            </h5>

            <strong>
              {{ formatMoney(account.balance) }}
            </strong>

          </div>

        </div>

      </div>

    </div>


    <!-- MODAL -->

    <div
      v-if="showModal"
      class="modal-backdrop-custom"
      @click.self="closeModal"
    >

      <div class="account-modal">

        <div class="modal-header-custom">

          <div>

            <h5>
              {{
                editingAccount
                  ? 'Edit Account'
                  : 'Account Baru'
              }}
            </h5>

            <p>
              {{
                editingAccount
                  ? 'Perbarui informasi account.'
                  : 'Tambahkan sumber dana baru.'
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


        <div class="modal-body-custom">

          <div class="mb-3">

            <label>
              Nama Account
            </label>

            <input
              v-model="form.name"
              type="text"
              class="form-control input-modern"
              placeholder="Contoh: Bank BCA"
              maxlength="100"
              @keyup.enter="saveAccount"
            >

          </div>


          <div class="mb-3">

            <label>
              Tipe Account
            </label>

            <div class="type-grid">

              <button
                v-for="option in typeOptions"
                :key="option.value"
                type="button"
                class="type-option"
                :class="{
                  active:
                    form.type === option.value
                }"
                @click="
                  form.type = option.value
                "
              >

                <i
                  class="bi"
                  :class="option.icon"
                ></i>

                <span>
                  {{ option.label }}
                </span>

              </button>

            </div>

          </div>

        </div>


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
            @click="saveAccount"
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


.summary-icon.balance {

  background: var(--accent-soft);

  color: var(--accent);

}


.summary-icon.income {

  background: rgba(34, 197, 94, 0.10);

  color: var(--success);

}


.summary-card span {

  display: block;

  color: var(--text-secondary);

  font-size: 12px;

  margin-bottom: 6px;

}


.summary-card strong {

  display: block;

  font-size: 18px;

  color: var(--text-primary);

}


.account-card {

  padding: 20px;

  transition:
    transform var(--transition),
    border-color var(--transition);

}


.account-card:hover {

  transform: translateY(-2px);

}


.account-top {

  display: flex;

  align-items: center;

  justify-content: space-between;

}


.account-icon {

  width: 46px;

  height: 46px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 13px;

  font-size: 20px;

  background: var(--accent-soft);

  color: var(--accent);

}


.account-icon.bank {

  background: rgba(59, 130, 246, 0.10);

  color: #3b82f6;

}


.account-icon.cash {

  background: rgba(34, 197, 94, 0.10);

  color: var(--success);

}


.account-icon.ewallet {

  background: rgba(168, 85, 247, 0.10);

  color: #a855f7;

}


.account-actions {

  display: flex;

  gap: 5px;

}


.account-action {

  width: 34px;

  height: 34px;

  border: 1px solid var(--border-color);

  border-radius: 9px;

  background: var(--bg-card);

  color: var(--text-secondary);

  display: flex;

  align-items: center;

  justify-content: center;

  transition: all var(--transition);

}


.account-action:hover {

  color: var(--accent);

  border-color: var(--accent);

}


.account-action.danger:hover {

  color: var(--danger);

  border-color: var(--danger);

}


.account-content {

  margin-top: 20px;

}


.account-type {

  display: block;

  color: var(--text-muted);

  font-size: 11px;

  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: .7px;

}


.account-content h5 {

  margin: 4px 0 9px;

  font-size: 15px;

  font-weight: 700;

  color: var(--text-primary);

}


.account-content strong {

  font-size: 20px;

  font-weight: 800;

  color: var(--text-primary);

}


.loading-card {

  min-height: 240px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-direction: column;

  gap: 12px;

  color: var(--text-secondary);

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

  background: var(--accent-soft);

  color: var(--accent);

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

  color: var(--text-muted);

  font-size: 13px;

}


.alert-modern {

  border-radius: 11px;

  border: 1px solid transparent;

  font-size: 13px;

}


.modal-backdrop-custom {

  position: fixed;

  inset: 0;

  z-index: 2000;

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 20px;

  background: rgba(0, 0, 0, .45);

  backdrop-filter: blur(5px);

}


.account-modal {

  width: 100%;

  max-width: 480px;

  background: var(--bg-card);

  border: 1px solid var(--border-color);

  border-radius: 16px;

  box-shadow: 0 20px 60px rgba(0, 0, 0, .20);

  overflow: hidden;

}


.modal-header-custom {

  display: flex;

  align-items: flex-start;

  justify-content: space-between;

  padding: 22px;

  border-bottom: 1px solid var(--border-color);

}


.modal-header-custom h5 {

  margin: 0;

  font-weight: 800;

  color: var(--text-primary);

}


.modal-header-custom p {

  margin: 5px 0 0;

  font-size: 12px;

  color: var(--text-muted);

}


.modal-close {

  width: 34px;

  height: 34px;

  border: 0;

  border-radius: 9px;

  background: var(--bg-card-hover);

  color: var(--text-secondary);

}


.modal-body-custom {

  padding: 22px;

}


.modal-body-custom label {

  display: block;

  margin-bottom: 7px;

  font-size: 12px;

  font-weight: 700;

  color: var(--text-secondary);

}


.input-modern {

  min-height: 44px;

  border-radius: 10px;

  background: var(--bg-input);

  border-color: var(--border-color);

  color: var(--text-primary);

}


.input-modern:focus {

  background: var(--bg-input);

  color: var(--text-primary);

  border-color: var(--accent);

  box-shadow: 0 0 0 3px var(--accent-soft);

}


.type-grid {

  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 8px;

}


.type-option {

  min-height: 80px;

  border: 1px solid var(--border-color);

  border-radius: 11px;

  background: var(--bg-card);

  color: var(--text-secondary);

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  gap: 7px;

  transition: all var(--transition);

}


.type-option i {

  font-size: 19px;

}


.type-option span {

  font-size: 11px;

  font-weight: 700;

}


.type-option:hover {

  border-color: var(--accent);

  color: var(--accent);

}


.type-option.active {

  border-color: var(--accent);

  background: var(--accent-soft);

  color: var(--accent);

}


.modal-footer-custom {

  display: flex;

  justify-content: flex-end;

  gap: 8px;

  padding: 16px 22px;

  border-top: 1px solid var(--border-color);

}


.btn-secondary-modern {

  min-height: 40px;

  padding: 0 16px;

  border: 1px solid var(--border-color);

  border-radius: 9px;

  background: var(--bg-card);

  color: var(--text-secondary);

}


.btn-secondary-modern:hover {

  background: var(--bg-card-hover);

  color: var(--text-primary);

}


@media (max-width: 575px) {

  .page-header {

    align-items: flex-start;

  }

  .page-header h1 {

    font-size: 21px;

  }

  .type-grid {

    grid-template-columns: 1fr;

  }

}

</style>