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

const savings = ref([])

const loading = ref(false)
const saving = ref(false)
const transactionLoading = ref(false)

const errorMessage = ref('')
const successMessage = ref('')

const showModal = ref(false)
const showTransactionModal = ref(false)
const showDetailModal = ref(false)

const editingSaving = ref(null)
const selectedSaving = ref(null)

const transactionType = ref('deposit')


/*
|--------------------------------------------------------------------------
| FORM
|--------------------------------------------------------------------------
*/

const form = ref({
  name: '',
  type: 'target',

  target_amount: '',
  target_date: '',

  routine_enabled: false,
  routine_amount: '',
  routine_frequency: 'monthly',
  routine_day: 1,

  description: ''
})


const transactionForm = ref({
  amount: '',
  description: '',
  transaction_date: new Date()
    .toISOString()
    .slice(0, 10)
})


/*
|--------------------------------------------------------------------------
| OPTIONS
|--------------------------------------------------------------------------
*/

const savingTypes = [
  {
    value: 'target',
    label: 'Tabungan Target',
    description: 'Untuk tujuan tertentu dengan nominal target.',
    icon: 'bi-bullseye'
  },
  {
    value: 'free',
    label: 'Tabungan Bebas',
    description: 'Tabungan santai tanpa target nominal.',
    icon: 'bi-piggy-bank'
  }
]


const routineFrequencies = [
  {
    value: 'weekly',
    label: 'Mingguan'
  },
  {
    value: 'monthly',
    label: 'Bulanan'
  },
  {
    value: 'yearly',
    label: 'Tahunan'
  }
]


const weekDays = [
  {
    value: 1,
    label: 'Senin'
  },
  {
    value: 2,
    label: 'Selasa'
  },
  {
    value: 3,
    label: 'Rabu'
  },
  {
    value: 4,
    label: 'Kamis'
  },
  {
    value: 5,
    label: 'Jumat'
  },
  {
    value: 6,
    label: 'Sabtu'
  },
  {
    value: 7,
    label: 'Minggu'
  }
]


/*
|--------------------------------------------------------------------------
| COMPUTED
|--------------------------------------------------------------------------
*/

const totalCurrent = computed(() => {

  return savings.value.reduce(
    (total, saving) => {

      return total +
        Number(
          saving.current_amount || 0
        )

    },
    0
  )

})


const targetSavings = computed(() => {

  return savings.value.filter(
    saving =>
      saving.type !== 'free'
  )

})


const freeSavings = computed(() => {

  return savings.value.filter(
    saving =>
      saving.type === 'free'
  )

})


const totalTarget = computed(() => {

  return targetSavings.value.reduce(
    (total, saving) => {

      return total +
        Number(
          saving.target_amount || 0
        )

    },
    0
  )

})


const totalRemaining = computed(() => {

  return Math.max(
    totalTarget.value -
    targetSavings.value.reduce(
      (total, saving) => {

        return total +
          Number(
            saving.current_amount || 0
          )

      },
      0
    ),
    0
  )

})


const completedCount = computed(() => {

  return targetSavings.value.filter(
    saving =>
      saving.status === 'completed'
  ).length

})


const overallProgress = computed(() => {

  if (
    totalTarget.value <= 0
  ) {
    return 0
  }

  const current =
    targetSavings.value.reduce(
      (total, saving) => {

        return total +
          Number(
            saving.current_amount || 0
          )

      },
      0
    )

  return Math.min(
    Math.round(
      (
        current /
        totalTarget.value
      ) * 100
    ),
    100
  )

})


/*
|--------------------------------------------------------------------------
| FORMATTERS
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


function formatDate(date) {

  if (!date) {
    return '-'
  }

  const parsed =
    new Date(date)

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return '-'
  }

  return new Intl.DateTimeFormat(
    'id-ID',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }
  ).format(parsed)

}


function getToday() {

  return new Date()
    .toISOString()
    .slice(0, 10)

}


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function getProgress(saving) {

  if (
    saving?.type === 'free'
  ) {
    return 0
  }

  const target =
    Number(
      saving?.target_amount || 0
    )

  const current =
    Number(
      saving?.current_amount || 0
    )

  if (
    !Number.isFinite(target) ||
    target <= 0
  ) {
    return 0
  }

  return Math.min(
    Math.round(
      (
        current /
        target
      ) * 100
    ),
    100
  )

}


function getRemaining(saving) {

  if (
    saving?.type === 'free'
  ) {
    return 0
  }

  return Math.max(
    Number(
      saving?.target_amount || 0
    ) -
    Number(
      saving?.current_amount || 0
    ),
    0
  )

}


function getTypeLabel(type) {

  return type === 'free'
    ? 'Bebas'
    : 'Target'

}


function getTypeIcon(type) {

  return type === 'free'
    ? 'bi-piggy-bank'
    : 'bi-bullseye'

}


function getStatusLabel(status) {

  const labels = {

    active: 'Aktif',

    completed: 'Selesai',

    cancelled: 'Dibatalkan'

  }

  return (
    labels[status] ||
    status ||
    '-'
  )

}


function getRoutineLabel(saving) {

  if (
    !saving?.routine_amount ||
    !saving?.routine_frequency
  ) {
    return ''
  }

  const amount =
    formatMoney(
      saving.routine_amount
    )

  const frequency =
    saving.routine_frequency === 'weekly'
      ? 'minggu'
      : saving.routine_frequency === 'monthly'
        ? 'bulan'
        : 'tahun'

  return `${amount} / ${frequency}`

}


function getRoutineDayLabel(saving) {

  if (
    !saving?.routine_day ||
    !saving?.routine_frequency
  ) {
    return ''
  }

  const day =
    Number(
      saving.routine_day
    )

  if (
    saving.routine_frequency === 'weekly'
  ) {

    return (
      weekDays.find(
        item =>
          item.value === day
      )?.label ||
      `Hari ${day}`
    )

  }

  return `Tanggal ${day}`

}


function canDeposit(saving) {

  return (
    saving &&
    saving.status !== 'cancelled' &&
    saving.status !== 'completed'
  )

}


function canWithdraw(saving) {

  return (
    saving &&
    saving.status !== 'cancelled' &&
    Number(
      saving.current_amount || 0
    ) > 0
  )

}


function clearMessages() {

  errorMessage.value = ''
  successMessage.value = ''

}


function showError(message) {

  errorMessage.value =
    message ||
    'Terjadi kesalahan.'

  successMessage.value = ''

}


function showSuccess(message) {

  successMessage.value =
    message ||
    ''

  errorMessage.value = ''

}


/*
|--------------------------------------------------------------------------
| FETCH
|--------------------------------------------------------------------------
*/

async function fetchSavings() {

  loading.value = true

  errorMessage.value = ''

  try {

    const response =
      await api.get(
        '/savings'
      )

    const data =
      response.data?.data

    savings.value =
      Array.isArray(data)
        ? data
        : Array.isArray(response.data)
          ? response.data
          : []

  } catch (error) {

    console.error(
      'GET /savings:',
      error
    )

    showError(
      error.response?.data?.message ||
      'Gagal mengambil data tabungan.'
    )

  } finally {

    loading.value = false

  }

}


/*
|--------------------------------------------------------------------------
| RESET FORM
|--------------------------------------------------------------------------
*/

function resetForm() {

  form.value = {

    name: '',

    type: 'target',

    target_amount: '',
    target_date: '',

    routine_enabled: false,

    routine_amount: '',

    routine_frequency:
      'monthly',

    routine_day: 1,

    description: ''

  }

}


/*
|--------------------------------------------------------------------------
| CREATE
|--------------------------------------------------------------------------
*/

function openCreateModal() {

  clearMessages()

  editingSaving.value = null

  resetForm()

  showModal.value = true

}


/*
|--------------------------------------------------------------------------
| EDIT
|--------------------------------------------------------------------------
*/

function openEditModal(
  savingData
) {

  clearMessages()

  editingSaving.value =
    savingData

  form.value = {

    name:
      savingData?.name ||
      '',

    type:
      savingData?.type ||
      'target',

    target_amount:
      savingData?.target_amount ||
      '',

    target_date:
      savingData?.target_date ||
      '',

    routine_enabled:
      Boolean(
        savingData?.routine_amount &&
        savingData?.routine_frequency
      ),

    routine_amount:
      savingData?.routine_amount ||
      '',

    routine_frequency:
      savingData?.routine_frequency ||
      'monthly',

    routine_day:
      Number(
        savingData?.routine_day ||
        1
      ),

    description:
      savingData?.description ||
      ''

  }

  showModal.value = true

}


/*
|--------------------------------------------------------------------------
| CLOSE CREATE / EDIT
|--------------------------------------------------------------------------
*/

function closeModal() {

  if (
    saving.value
  ) {
    return
  }

  showModal.value = false

}


/*
|--------------------------------------------------------------------------
| SAVE
|--------------------------------------------------------------------------
*/

async function saveSaving() {

  clearMessages()

  const name =
    String(
      form.value.name || ''
    ).trim()


  if (!name) {

    showError(
      'Nama tabungan wajib diisi.'
    )

    return

  }


  /*
  |--------------------------------------------------------------------------
  | TARGET VALIDATION
  |--------------------------------------------------------------------------
  */

  let targetAmount = 0

  if (
    form.value.type === 'target'
  ) {

    targetAmount =
      Number(
        form.value.target_amount
      )

    if (
      !Number.isFinite(
        targetAmount
      ) ||
      targetAmount <= 0
    ) {

      showError(
        'Target tabungan harus lebih dari 0.'
      )

      return

    }

  }


  /*
  |--------------------------------------------------------------------------
  | ROUTINE VALIDATION
  |--------------------------------------------------------------------------
  */

  let routineAmount = null
  let routineFrequency = null
  let routineDay = null


  if (
    form.value.routine_enabled
  ) {

    routineAmount =
      Number(
        form.value.routine_amount
      )

    if (
      !Number.isFinite(
        routineAmount
      ) ||
      routineAmount <= 0
    ) {

      showError(
        'Nominal setoran rutin harus lebih dari 0.'
      )

      return

    }


    routineFrequency =
      form.value.routine_frequency


    routineDay =
      Number(
        form.value.routine_day
      )


    if (
      !Number.isInteger(
        routineDay
      ) ||
      routineDay < 1
    ) {

      showError(
        'Hari rutin tidak valid.'
      )

      return

    }


    if (
      routineFrequency ===
      'weekly' &&
      routineDay > 7
    ) {

      showError(
        'Hari mingguan harus antara Senin sampai Minggu.'
      )

      return

    }


    if (
      (
        routineFrequency === 'monthly' ||
        routineFrequency === 'yearly'
      ) &&
      routineDay > 31
    ) {

      showError(
        'Tanggal rutin harus antara 1 sampai 31.'
      )

      return

    }

  }


  saving.value = true


  try {

    const payload = {

      name,

      type:
        form.value.type,

      target_amount:
        targetAmount,

      target_date:
        form.value.type === 'target'
          ? (
              form.value.target_date ||
              null
            )
          : null,

      routine_amount:
        routineAmount,

      routine_frequency:
        routineFrequency,

      routine_day:
        routineDay,

      description:
        String(
          form.value.description ||
          ''
        ).trim() ||
        null

    }


    if (
      editingSaving.value
    ) {

      await api.put(

        `/savings/${editingSaving.value.id}`,

        payload

      )

      showSuccess(
        'Tabungan berhasil diperbarui.'
      )

    } else {

      await api.post(

        '/savings',

        payload

      )

      showSuccess(
        'Tabungan berhasil dibuat.'
      )

    }


    showModal.value = false

    await fetchSavings()

  } catch (error) {

    console.error(
      'SAVE /savings:',
      error
    )

    showError(
      error.response?.data?.message ||
      'Gagal menyimpan tabungan.'
    )

  } finally {

    saving.value = false

  }

}


/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

async function deleteSaving(
  savingData
) {

  if (
    !savingData?.id
  ) {
    return
  }


  const confirmed =
    window.confirm(
      `Hapus tabungan "${savingData.name}"?`
    )


  if (!confirmed) {
    return
  }


  clearMessages()


  try {

    await api.delete(
      `/savings/${savingData.id}`
    )


    showSuccess(
      'Tabungan berhasil dihapus.'
    )


    if (
      selectedSaving.value?.id ===
      savingData.id
    ) {

      selectedSaving.value =
        null

      showDetailModal.value =
        false

    }


    await fetchSavings()

  } catch (error) {

    console.error(
      'DELETE /savings:',
      error
    )

    showError(
      error.response?.data?.message ||
      'Gagal menghapus tabungan.'
    )

  }

}


/*
|--------------------------------------------------------------------------
| DETAIL
|--------------------------------------------------------------------------
*/

async function openDetail(
  savingData
) {

  if (
    !savingData?.id
  ) {
    return
  }


  clearMessages()

  selectedSaving.value =
    savingData

  showDetailModal.value =
    true


  try {

    const response =
      await api.get(
        `/savings/${savingData.id}`
      )


    selectedSaving.value =
      response.data?.data ||
      response.data

  } catch (error) {

    console.error(
      'GET /savings/:id:',
      error
    )

    showError(
      error.response?.data?.message ||
      'Gagal mengambil detail tabungan.'
    )

  }

}


/*
|--------------------------------------------------------------------------
| REFRESH DETAIL
|--------------------------------------------------------------------------
*/

async function refreshSelectedSaving() {

  if (
    !selectedSaving.value?.id
  ) {
    return
  }


  try {

    const response =
      await api.get(
        `/savings/${selectedSaving.value.id}`
      )


    selectedSaving.value =
      response.data?.data ||
      response.data

  } catch (error) {

    console.error(
      'REFRESH SAVING DETAIL:',
      error
    )

  }

}


/*
|--------------------------------------------------------------------------
| TRANSACTION MODAL
|--------------------------------------------------------------------------
*/

function openTransactionModal(
  savingData,
  type
) {

  if (
    !savingData?.id
  ) {
    return
  }


  if (
    type === 'deposit' &&
    !canDeposit(savingData)
  ) {
    return
  }


  if (
    type === 'withdrawal' &&
    !canWithdraw(savingData)
  ) {
    return
  }


  clearMessages()


  selectedSaving.value =
    savingData


  transactionType.value =
    type


  transactionForm.value = {

    amount: '',

    description: '',

    transaction_date:
      getToday()

  }


  showTransactionModal.value =
    true

}


function closeTransactionModal() {

  if (
    transactionLoading.value
  ) {
    return
  }

  showTransactionModal.value =
    false

}


/*
|--------------------------------------------------------------------------
| DEPOSIT / WITHDRAW
|--------------------------------------------------------------------------
*/

async function submitTransaction() {

  clearMessages()


  const amount =
    Number(
      transactionForm.value.amount
    )


  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    showError(
      'Nominal transaksi harus lebih dari 0.'
    )

    return

  }


  if (
    !transactionForm.value
      .transaction_date
  ) {

    showError(
      'Tanggal transaksi wajib diisi.'
    )

    return

  }


  const current =
    Number(
      selectedSaving.value
        ?.current_amount ||
      0
    )


  if (
    transactionType.value ===
    'withdrawal'
  ) {

    if (
      amount > current
    ) {

      showError(
        'Nominal withdrawal melebihi saldo tabungan.'
      )

      return

    }

  }


  if (
    transactionType.value ===
      'deposit' &&
    !canDeposit(
      selectedSaving.value
    )
  ) {

    showError(
      'Tabungan ini tidak dapat menerima deposit.'
    )

    return

  }


  if (
    transactionType.value ===
      'withdrawal' &&
    !canWithdraw(
      selectedSaving.value
    )
  ) {

    showError(
      'Tabungan ini tidak dapat melakukan withdrawal.'
    )

    return

  }


  transactionLoading.value =
    true


  try {

    const endpoint =
      transactionType.value ===
      'deposit'

        ? `/savings/${selectedSaving.value.id}/deposit`

        : `/savings/${selectedSaving.value.id}/withdraw`


    await api.post(

      endpoint,

      {

        amount,

        description:
          String(
            transactionForm.value
              .description ||
            ''
          ).trim() ||
          null,

        transaction_date:
          transactionForm.value
            .transaction_date

      }

    )


    showTransactionModal.value =
      false


    showSuccess(

      transactionType.value ===
      'deposit'

        ? 'Deposit berhasil.'

        : 'Withdrawal berhasil.'

    )


    await fetchSavings()

    await refreshSelectedSaving()

  } catch (error) {

    console.error(
      'SAVINGS TRANSACTION:',
      error
    )

    showError(
      error.response?.data?.message ||
      'Gagal memproses transaksi tabungan.'
    )

  } finally {

    transactionLoading.value =
      false

  }

}


/*
|--------------------------------------------------------------------------
| DETAIL CLOSE
|--------------------------------------------------------------------------
*/

function closeDetailModal() {

  showDetailModal.value =
    false

}


/*
|--------------------------------------------------------------------------
| MOUNT
|--------------------------------------------------------------------------
*/

onMounted(() => {

  fetchSavings()

})

</script>


<template>

  <div class="page-container">

    <!-- ================================================= -->
    <!-- HEADER -->
    <!-- ================================================= -->

    <div class="page-header">

      <div>

        <span class="eyebrow">
          FINANCE
        </span>

        <h1>
          Tabungan
        </h1>

        <p>
          Simpan uang untuk target tertentu atau sekadar menabung santai.
        </p>

      </div>


      <button
        class="btn-primary"
        type="button"
        @click="openCreateModal"
      >

        <i class="bi bi-plus-lg"></i>

        Tambah Tabungan

      </button>

    </div>


    <!-- ================================================= -->
    <!-- MESSAGES -->
    <!-- ================================================= -->

    <div
      v-if="errorMessage"
      class="alert alert-danger"
    >

      <i class="bi bi-exclamation-circle"></i>

      <span>
        {{ errorMessage }}
      </span>

      <button
        type="button"
        @click="errorMessage = ''"
      >
        ×
      </button>

    </div>


    <div
      v-if="successMessage"
      class="alert alert-success"
    >

      <i class="bi bi-check-circle"></i>

      <span>
        {{ successMessage }}
      </span>

      <button
        type="button"
        @click="successMessage = ''"
      >
        ×
      </button>

    </div>


    <!-- ================================================= -->
    <!-- SUMMARY -->
    <!-- ================================================= -->

    <div class="summary-grid">

      <div class="summary-card">

        <div class="summary-icon">

          <i class="bi bi-piggy-bank"></i>

        </div>

        <div>

          <span>
            Total Terkumpul
          </span>

          <strong>
            {{ formatMoney(totalCurrent) }}
          </strong>

        </div>

      </div>


      <div class="summary-card">

        <div class="summary-icon target">

          <i class="bi bi-bullseye"></i>

        </div>

        <div>

          <span>
            Total Target
          </span>

          <strong>
            {{ formatMoney(totalTarget) }}
          </strong>

        </div>

      </div>


      <div class="summary-card">

        <div class="summary-icon remaining">

          <i class="bi bi-hourglass-split"></i>

        </div>

        <div>

          <span>
            Sisa Target
          </span>

          <strong>
            {{ formatMoney(totalRemaining) }}
          </strong>

        </div>

      </div>


      <div class="summary-card">

        <div class="summary-icon completed">

          <i class="bi bi-check2-circle"></i>

        </div>

        <div>

          <span>
            Target Selesai
          </span>

          <strong>
            {{ completedCount }}
          </strong>

        </div>

      </div>

    </div>


    <!-- ================================================= -->
    <!-- OVERALL TARGET PROGRESS -->
    <!-- ================================================= -->

    <div
      v-if="targetSavings.length"
      class="overall-card"
    >

      <div class="overall-header">

        <div>

          <span>
            Progress target
          </span>

          <strong>
            {{ overallProgress }}%
          </strong>

        </div>

        <span>

          {{ formatMoney(
            targetSavings.reduce(
              (total, item) =>
                total +
                Number(
                  item.current_amount || 0
                ),
              0
            )
          ) }}

          /

          {{ formatMoney(totalTarget) }}

        </span>

      </div>


      <div class="progress-track large">

        <div
          class="progress-bar"
          :style="{
            width: `${overallProgress}%`
          }"
        ></div>

      </div>

    </div>


    <!-- ================================================= -->
    <!-- LOADING -->
    <!-- ================================================= -->

    <div
      v-if="loading"
      class="loading-state"
    >

      <div class="spinner"></div>

      <span>
        Memuat data tabungan...
      </span>

    </div>


    <!-- ================================================= -->
    <!-- EMPTY -->
    <!-- ================================================= -->

    <div
      v-else-if="!savings.length"
      class="empty-state"
    >

      <div class="empty-icon">

        <i class="bi bi-piggy-bank"></i>

      </div>

      <h3>
        Belum ada tabungan
      </h3>

      <p>
        Buat tabungan target atau tabungan bebas
        untuk mulai menyimpan uangmu.
      </p>

      <button
        class="btn-primary"
        type="button"
        @click="openCreateModal"
      >

        <i class="bi bi-plus-lg"></i>

        Buat Tabungan

      </button>

    </div>


    <!-- ================================================= -->
    <!-- SAVINGS -->
    <!-- ================================================= -->

    <div
      v-else
      class="savings-grid"
    >

      <div
        v-for="item in savings"
        :key="item.id"
        class="saving-card"
      >

        <!-- HEADER -->

        <div class="saving-card-header">

          <div class="saving-title">

            <div
              class="saving-icon"
              :class="{
                free: item.type === 'free'
              }"
            >

              <i
                :class="
                  item.type === 'free'
                    ? 'bi bi-piggy-bank-fill'
                    : 'bi bi-bullseye'
                "
              ></i>

            </div>


            <div>

              <h3>
                {{ item.name }}
              </h3>

              <span>

                {{ getTypeLabel(item.type) }}

                <template
                  v-if="
                    item.type !== 'free' &&
                    item.target_date
                  "
                >

                  ·
                  {{ formatDate(item.target_date) }}

                </template>

              </span>

            </div>

          </div>


          <span
            class="status-badge"
            :class="item.status"
          >

            {{ getStatusLabel(item.status) }}

          </span>

        </div>


        <!-- AMOUNT -->

        <div class="saving-amount">

          <strong>
            {{ formatMoney(item.current_amount) }}
          </strong>


          <span
            v-if="item.type !== 'free'"
          >

            dari
            {{ formatMoney(item.target_amount) }}

          </span>


          <span
            v-else
          >
            Tabungan bebas
          </span>

        </div>


        <!-- TARGET PROGRESS -->

        <template
          v-if="item.type !== 'free'"
        >

          <div class="progress-wrapper">

            <div class="progress-info">

              <span>
                Progress
              </span>

              <strong>
                {{ getProgress(item) }}%
              </strong>

            </div>


            <div class="progress-track">

              <div
                class="progress-bar"
                :style="{
                  width: `${getProgress(item)}%`
                }"
              ></div>

            </div>

          </div>


          <div class="remaining-text">

            <span>
              Sisa target
            </span>

            <strong>
              {{ formatMoney(
                getRemaining(item)
              ) }}
            </strong>

          </div>

        </template>


        <!-- FREE SAVINGS INFO -->

        <div
          v-else
          class="free-saving-info"
        >

          <i class="bi bi-stars"></i>

          <span>
            Tidak ada target. Nabung sesuka hati.
          </span>

        </div>


        <!-- ROUTINE -->

        <div
          v-if="
            item.routine_amount &&
            item.routine_frequency
          "
          class="routine-box"
        >

          <div class="routine-icon">

            <i class="bi bi-arrow-repeat"></i>

          </div>

          <div>

            <span>
              Rencana rutin
            </span>

            <strong>
              {{ getRoutineLabel(item) }}
            </strong>

            <small>
              {{ getRoutineDayLabel(item) }}
            </small>

          </div>

        </div>


        <!-- DESCRIPTION -->

        <p
          v-if="item.description"
          class="saving-description"
        >

          {{ item.description }}

        </p>


        <!-- ACTIONS -->

        <div class="saving-actions">

          <button
            class="action-btn detail"
            type="button"
            title="Detail"
            @click="openDetail(item)"
          >

            <i class="bi bi-eye"></i>

          </button>


          <button
            class="action-btn deposit"
            type="button"
            title="Deposit"
            :disabled="
              !canDeposit(item)
            "
            @click="
              openTransactionModal(
                item,
                'deposit'
              )
            "
          >

            <i class="bi bi-plus-circle"></i>

          </button>


          <button
            class="action-btn withdraw"
            type="button"
            title="Withdrawal"
            :disabled="
              !canWithdraw(item)
            "
            @click="
              openTransactionModal(
                item,
                'withdrawal'
              )
            "
          >

            <i class="bi bi-dash-circle"></i>

          </button>


          <button
            class="action-btn edit"
            type="button"
            title="Edit"
            @click="
              openEditModal(item)
            "
          >

            <i class="bi bi-pencil"></i>

          </button>


          <button
            class="action-btn delete"
            type="button"
            title="Hapus"
            @click="
              deleteSaving(item)
            "
          >

            <i class="bi bi-trash"></i>

          </button>

        </div>

      </div>

    </div>


    <!-- ================================================= -->
    <!-- CREATE / EDIT MODAL -->
    <!-- ================================================= -->

    <div
      v-if="showModal"
      class="modal-backdrop"
      @click.self="closeModal"
    >

      <div class="modal-card">

        <div class="modal-header">

          <div>

            <span class="modal-eyebrow">
              SAVINGS
            </span>

            <h2>

              {{
                editingSaving
                  ? 'Edit Tabungan'
                  : 'Tambah Tabungan'
              }}

            </h2>

          </div>


          <button
            class="modal-close"
            type="button"
            :disabled="saving"
            @click="closeModal"
          >
            ×
          </button>

        </div>


        <form
          @submit.prevent="saveSaving"
        >

          <!-- NAME -->

          <div class="form-group">

            <label>
              Nama Tabungan
            </label>

            <input
              v-model.trim="form.name"
              type="text"
              maxlength="100"
              placeholder="Contoh: Tabungan Laptop"
              autocomplete="off"
              required
            />

          </div>


          <!-- TYPE -->

          <div class="form-group">

            <label>
              Jenis Tabungan
            </label>


            <div class="type-grid">

              <button
                v-for="type in savingTypes"
                :key="type.value"
                type="button"
                class="type-option"
                :class="{
                  selected:
                    form.type ===
                    type.value
                }"
                @click="
                  form.type =
                    type.value
                "
              >

                <div class="type-option-icon">

                  <i
                    :class="
                      `bi ${type.icon}`
                    "
                  ></i>

                </div>


                <div>

                  <strong>
                    {{ type.label }}
                  </strong>

                  <span>
                    {{ type.description }}
                  </span>

                </div>

              </button>

            </div>

          </div>


          <!-- TARGET -->

          <div
            v-if="
              form.type === 'target'
            "
            class="form-group"
          >

            <label>
              Target Nominal
            </label>

            <input
              v-model.number="
                form.target_amount
              "
              type="number"
              min="1"
              step="1"
              inputmode="numeric"
              placeholder="10000000"
              required
            />

            <small class="input-help">
              Bisa memasukkan nominal apa pun.
              Contoh: 50000000.
            </small>

          </div>


          <!-- TARGET DATE -->

          <div
            v-if="
              form.type === 'target'
            "
            class="form-group"
          >

            <label>

              Target Tanggal

              <small>
                (opsional)
              </small>

            </label>

            <input
              v-model="
                form.target_date
              "
              type="date"
            />

          </div>


          <!-- ROUTINE TOGGLE -->

          <div class="routine-toggle">

            <div>

              <strong>
                Setoran rutin
              </strong>

              <span>
                Atur nominal yang ingin kamu tabung secara berkala.
              </span>

            </div>


            <label class="switch">

              <input
                v-model="
                  form.routine_enabled
                "
                type="checkbox"
              />

              <span class="switch-slider"></span>

            </label>

          </div>


          <!-- ROUTINE -->

          <div
            v-if="
              form.routine_enabled
            "
            class="routine-form"
          >

            <div class="form-group">

              <label>
                Nominal Rutin
              </label>

              <input
                v-model.number="
                  form.routine_amount
                "
                type="number"
                min="1"
                step="1"
                inputmode="numeric"
                placeholder="1000000"
                required
              />

            </div>


            <div class="form-group">

              <label>
                Frekuensi
              </label>

              <select
                v-model="
                  form.routine_frequency
                "
              >

                <option
                  v-for="
                    frequency in
                    routineFrequencies
                  "
                  :key="
                    frequency.value
                  "
                  :value="
                    frequency.value
                  "
                >

                  {{ frequency.label }}

                </option>

              </select>

            </div>


            <div class="form-group">

              <label>

                {{
                  form.routine_frequency ===
                  'weekly'
                    ? 'Hari'
                    : 'Tanggal'
                }}

              </label>


              <select
                v-model.number="
                  form.routine_day
                "
              >

                <template
                  v-if="
                    form.routine_frequency ===
                    'weekly'
                  "
                >

                  <option
                    v-for="
                      day in weekDays
                    "
                    :key="day.value"
                    :value="day.value"
                  >

                    {{ day.label }}

                  </option>

                </template>


                <template
                  v-else
                >

                  <option
                    v-for="
                      day in 31
                    "
                    :key="day"
                    :value="day"
                  >

                    Tanggal {{ day }}

                  </option>

                </template>

              </select>

            </div>

          </div>


          <!-- DESCRIPTION -->

          <div class="form-group">

            <label>

              Deskripsi

              <small>
                (opsional)
              </small>

            </label>

            <textarea
              v-model="
                form.description
              "
              rows="3"
              maxlength="1000"
              placeholder="Contoh: Tabungan santai setiap bulan"
            ></textarea>

          </div>


          <!-- ACTIONS -->

          <div class="modal-actions">

            <button
              type="button"
              class="btn-secondary"
              :disabled="saving"
              @click="closeModal"
            >

              Batal

            </button>


            <button
              type="submit"
              class="btn-primary"
              :disabled="saving"
            >

              <span
                v-if="saving"
                class="button-spinner"
              ></span>

              <i
                v-else
                class="bi bi-check-lg"
              ></i>

              {{
                saving
                  ? 'Menyimpan...'
                  : 'Simpan'
              }}

            </button>

          </div>

        </form>

      </div>

    </div>


    <!-- ================================================= -->
    <!-- TRANSACTION MODAL -->
    <!-- ================================================= -->

    <div
      v-if="showTransactionModal"
      class="modal-backdrop"
      @click.self="
        closeTransactionModal
      "
    >

      <div class="modal-card">

        <div class="modal-header">

          <div>

            <span
              class="modal-eyebrow"
              :class="transactionType"
            >

              {{
                transactionType ===
                'deposit'
                  ? 'DEPOSIT'
                  : 'WITHDRAWAL'
              }}

            </span>


            <h2>

              {{
                transactionType ===
                'deposit'
                  ? 'Tambah Tabungan'
                  : 'Ambil Dana'
              }}

            </h2>

          </div>


          <button
            class="modal-close"
            type="button"
            :disabled="
              transactionLoading
            "
            @click="
              closeTransactionModal
            "
          >
            ×
          </button>

        </div>


        <!-- INFO -->

        <div class="transaction-info">

          <span>
            Tabungan
          </span>

          <strong>
            {{ selectedSaving?.name }}
          </strong>

          <small>

            Saldo:
            {{
              formatMoney(
                selectedSaving?.current_amount
              )
            }}

          </small>

        </div>


        <form
          @submit.prevent="
            submitTransaction
          "
        >

          <!-- AMOUNT -->

          <div class="form-group">

            <label>
              Nominal
            </label>

            <input
              v-model.number="
                transactionForm.amount
              "
              type="number"
              min="1"
              step="1"
              inputmode="numeric"
              placeholder="50000000"
              required
            />

            <small class="input-help">
              Masukkan nominal rupiah tanpa titik.
              Contoh: 50000000.
            </small>

          </div>


          <!-- DATE -->

          <div class="form-group">

            <label>
              Tanggal
            </label>

            <input
              v-model="
                transactionForm.transaction_date
              "
              type="date"
              required
            />

          </div>


          <!-- DESCRIPTION -->

          <div class="form-group">

            <label>

              Deskripsi

              <small>
                (opsional)
              </small>

            </label>

            <textarea
              v-model="
                transactionForm.description
              "
              rows="3"
              maxlength="1000"
              placeholder="Keterangan transaksi"
            ></textarea>

          </div>


          <!-- ACTIONS -->

          <div class="modal-actions">

            <button
              type="button"
              class="btn-secondary"
              :disabled="
                transactionLoading
              "
              @click="
                closeTransactionModal
              "
            >

              Batal

            </button>


            <button
              type="submit"
              class="btn-primary"
              :disabled="
                transactionLoading
              "
            >

              <span
                v-if="
                  transactionLoading
                "
                class="button-spinner"
              ></span>

              <i
                v-else
                :class="
                  transactionType ===
                  'deposit'
                    ? 'bi bi-plus-lg'
                    : 'bi bi-dash-lg'
                "
              ></i>

              {{
                transactionLoading
                  ? 'Memproses...'
                  : transactionType ===
                      'deposit'
                    ? 'Deposit'
                    : 'Withdrawal'
              }}

            </button>

          </div>

        </form>

      </div>

    </div>


    <!-- ================================================= -->
    <!-- DETAIL MODAL -->
    <!-- ================================================= -->

    <div
      v-if="
        showDetailModal &&
        selectedSaving
      "
      class="modal-backdrop"
      @click.self="
        closeDetailModal
      "
    >

      <div class="modal-card detail-modal">

        <div class="modal-header">

          <div>

            <span class="modal-eyebrow">
              DETAIL TABUNGAN
            </span>

            <h2>
              {{ selectedSaving.name }}
            </h2>

          </div>


          <button
            class="modal-close"
            type="button"
            @click="
              closeDetailModal
            "
          >
            ×
          </button>

        </div>


        <!-- TYPE -->

        <div class="detail-type">

          <i
            :class="
              `bi ${getTypeIcon(
                selectedSaving.type
              )}`
            "
          ></i>

          <div>

            <strong>
              {{
                getTypeLabel(
                  selectedSaving.type
                )
              }}
            </strong>

            <span>
              {{
                selectedSaving.type ===
                'free'
                  ? 'Tabungan bebas tanpa target'
                  : 'Tabungan dengan target'
              }}
            </span>

          </div>

        </div>


        <!-- DETAIL SUMMARY -->

        <div class="detail-summary">

          <div>

            <span>
              Terkumpul
            </span>

            <strong>
              {{
                formatMoney(
                  selectedSaving.current_amount
                )
              }}
            </strong>

          </div>


          <div>

            <span>
              {{
                selectedSaving.type ===
                'free'
                  ? 'Tipe'
                  : 'Target'
              }}
            </span>

            <strong>

              {{
                selectedSaving.type ===
                'free'
                  ? 'Bebas'
                  : formatMoney(
                      selectedSaving.target_amount
                    )
              }}

            </strong>

          </div>


          <div
            v-if="
              selectedSaving.type !==
              'free'
            "
          >

            <span>
              Progress
            </span>

            <strong>
              {{
                getProgress(
                  selectedSaving
                )
              }}%
            </strong>

          </div>

        </div>


        <!-- TARGET REMAINING -->

        <div
          v-if="
            selectedSaving.type !==
            'free'
          "
          class="detail-remaining"
        >

          <div>

            <span>
              Sisa Target
            </span>

            <strong>
              {{
                formatMoney(
                  getRemaining(
                    selectedSaving
                  )
                )
              }}
            </strong>

          </div>


          <div>

            <span>
              Target Tanggal
            </span>

            <strong>
              {{
                formatDate(
                  selectedSaving.target_date
                )
              }}
            </strong>

          </div>

        </div>


        <!-- FREE INFO -->

        <div
          v-else
          class="free-detail"
        >

          <i class="bi bi-stars"></i>

          <div>

            <strong>
              Tabungan bebas
            </strong>

            <span>
              Tidak terikat target nominal.
              Kamu bebas menabung kapan saja.
            </span>

          </div>

        </div>


        <!-- PROGRESS -->

        <div
          v-if="
            selectedSaving.type !==
            'free'
          "
          class="detail-progress"
        >

          <div class="progress-track">

            <div
              class="progress-bar"
              :style="{
                width:
                  `${getProgress(
                    selectedSaving
                  )}%`
              }"
            ></div>

          </div>

        </div>


        <!-- ROUTINE -->

        <div
          v-if="
            selectedSaving.routine_amount &&
            selectedSaving.routine_frequency
          "
          class="detail-routine"
        >

          <div class="routine-icon">

            <i class="bi bi-arrow-repeat"></i>

          </div>

          <div>

            <span>
              Rencana setoran rutin
            </span>

            <strong>
              {{
                getRoutineLabel(
                  selectedSaving
                )
              }}
            </strong>

            <small>
              {{
                getRoutineDayLabel(
                  selectedSaving
                )
              }}
            </small>

          </div>

        </div>


        <!-- DESCRIPTION -->

        <div
          v-if="
            selectedSaving.description
          "
          class="detail-description"
        >

          <span>
            Deskripsi
          </span>

          <p>
            {{ selectedSaving.description }}
          </p>

        </div>


        <!-- TRANSACTIONS -->

        <div class="transactions-section">

          <div class="section-title">

            <h3>
              Riwayat Transaksi
            </h3>

            <span>

              {{
                selectedSaving
                  .transactions
                  ?.length || 0
              }}

              transaksi

            </span>

          </div>


          <div
            v-if="
              !selectedSaving
                .transactions
                ?.length
            "
            class="transaction-empty"
          >

            <i class="bi bi-receipt"></i>

            <span>
              Belum ada transaksi.
            </span>

          </div>


          <div
            v-else
            class="transaction-list"
          >

            <div
              v-for="
                transaction in
                selectedSaving.transactions
              "
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
                  :class="
                    transaction.type ===
                    'deposit'
                      ? 'bi bi-arrow-down-left'
                      : 'bi bi-arrow-up-right'
                  "
                ></i>

              </div>


              <div class="transaction-info-main">

                <strong>

                  {{
                    transaction.type ===
                    'deposit'
                      ? 'Deposit'
                      : 'Withdrawal'
                  }}

                </strong>


                <span>

                  {{
                    transaction.description ||
                    'Tanpa deskripsi'
                  }}

                </span>


                <small>

                  {{
                    formatDate(
                      transaction.transaction_date
                    )
                  }}

                </small>

              </div>


              <strong
                class="transaction-amount"
                :class="
                  transaction.type
                "
              >

                {{
                  transaction.type ===
                  'deposit'
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

        </div>


        <!-- DETAIL ACTIONS -->

        <div class="modal-actions">

          <button
            type="button"
            class="btn-secondary"
            @click="
              closeDetailModal
            "
          >

            Tutup

          </button>


          <button
            v-if="
              canWithdraw(
                selectedSaving
              )
            "
            type="button"
            class="btn-warning"
            @click="
              closeDetailModal();
              openTransactionModal(
                selectedSaving,
                'withdrawal'
              )
            "
          >

            <i class="bi bi-dash-lg"></i>

            Withdrawal

          </button>


          <button
            v-if="
              canDeposit(
                selectedSaving
              )
            "
            type="button"
            class="btn-primary"
            @click="
              closeDetailModal();
              openTransactionModal(
                selectedSaving,
                'deposit'
              )
            "
          >

            <i class="bi bi-plus-lg"></i>

            Deposit

          </button>

        </div>

      </div>

    </div>

  </div>

</template>


<style scoped>

/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

.page-container {

  padding: 5px;

  max-width: 1500px;

  margin: 0 auto;

}


.page-header {

  display: flex;

  justify-content:
    space-between;

  align-items:
    flex-end;

  gap: 20px;

  margin-bottom: 25px;

}


.eyebrow,
.modal-eyebrow {

  display: block;

  font-size: 10px;

  font-weight: 800;

  letter-spacing: 1.4px;

  color:
    var(--accent);

  margin-bottom: 5px;

}


.page-header h1 {

  margin: 0;

  color:
    var(--text-primary);

  font-size: 28px;

  font-weight: 800;

}


.page-header p {

  margin:
    6px 0 0;

  color:
    var(--text-muted);

  font-size: 13px;

}


/*
|--------------------------------------------------------------------------
| BUTTONS
|--------------------------------------------------------------------------
*/

.btn-primary,
.btn-secondary,
.btn-warning {

  min-height: 42px;

  padding:
    0 17px;

  border-radius: 10px;

  border:
    1px solid transparent;

  display: inline-flex;

  align-items: center;

  justify-content: center;

  gap: 8px;

  font-size: 13px;

  font-weight: 700;

  cursor: pointer;

  transition:
    all .2s ease;

}


.btn-primary {

  background:
    var(--accent);

  color:
    #fff;

}


.btn-primary:hover {

  transform:
    translateY(-1px);

  filter:
    brightness(1.06);

}


.btn-secondary {

  background:
    var(--bg-card);

  border-color:
    var(--border-color);

  color:
    var(--text-secondary);

}


.btn-secondary:hover {

  background:
    var(--bg-card-hover);

  color:
    var(--text-primary);

}


.btn-warning {

  background:
    rgba(245, 158, 11, .12);

  border-color:
    rgba(245, 158, 11, .18);

  color:
    #f59e0b;

}


.btn-warning:hover {

  background:
    rgba(245, 158, 11, .18);

}


.btn-primary:disabled,
.btn-secondary:disabled,
.btn-warning:disabled {

  opacity:
    .55;

  cursor:
    not-allowed;

  transform:
    none;

}


/*
|--------------------------------------------------------------------------
| ALERT
|--------------------------------------------------------------------------
*/

.alert {

  display: flex;

  align-items:
    center;

  gap: 10px;

  padding:
    12px 15px;

  border-radius: 10px;

  margin-bottom: 16px;

  font-size: 13px;

}


.alert span {

  flex: 1;

}


.alert button {

  border: 0;

  background:
    transparent;

  font-size: 20px;

  cursor:
    pointer;

  color:
    inherit;

}


.alert-danger {

  color:
    #ef6b6b;

  background:
    rgba(239, 68, 68, .08);

  border:
    1px solid
    rgba(239, 68, 68, .12);

}


.alert-success {

  color:
    #22c55e;

  background:
    rgba(34, 197, 94, .08);

  border:
    1px solid
    rgba(34, 197, 94, .12);

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

  gap: 14px;

  margin-bottom: 18px;

}


.summary-card {

  min-height: 94px;

  padding: 17px;

  display: flex;

  align-items: center;

  gap: 13px;

  border-radius: 14px;

  background:
    var(--bg-card);

  border:
    1px solid
    var(--border-color);

}


.summary-icon {

  width: 44px;

  height: 44px;

  flex-shrink: 0;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 12px;

  background:
    var(--accent-soft);

  color:
    var(--accent);

  font-size: 20px;

}


.summary-icon.target {

  color:
    #8b5cf6;

  background:
    rgba(139, 92, 246, .10);

}


.summary-icon.remaining {

  color:
    #f59e0b;

  background:
    rgba(245, 158, 11, .10);

}


.summary-icon.completed {

  color:
    #22c55e;

  background:
    rgba(34, 197, 94, .10);

}


.summary-card span {

  display: block;

  color:
    var(--text-muted);

  font-size: 11px;

  margin-bottom: 4px;

}


.summary-card strong {

  color:
    var(--text-primary);

  font-size: 17px;

}


/*
|--------------------------------------------------------------------------
| OVERALL
|--------------------------------------------------------------------------
*/

.overall-card {

  padding:
    16px 18px;

  margin-bottom: 20px;

  border-radius: 14px;

  background:
    var(--bg-card);

  border:
    1px solid
    var(--border-color);

}


.overall-header {

  display: flex;

  align-items: center;

  justify-content:
    space-between;

  gap: 15px;

  margin-bottom: 10px;

}


.overall-header > div {

  display: flex;

  align-items: center;

  gap: 10px;

}


.overall-header span {

  color:
    var(--text-muted);

  font-size: 11px;

}


.overall-header strong {

  color:
    var(--accent);

  font-size: 14px;

}


.progress-track {

  width: 100%;

  height: 7px;

  overflow: hidden;

  border-radius: 20px;

  background:
    var(--bg-card-hover);

}


.progress-track.large {

  height: 9px;

}


.progress-bar {

  height: 100%;

  border-radius:
    inherit;

  background:
    var(--accent);

  transition:
    width .4s ease;

}


/*
|--------------------------------------------------------------------------
| SAVINGS
|--------------------------------------------------------------------------
*/

.savings-grid {

  display: grid;

  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap: 16px;

}


.saving-card {

  padding: 18px;

  border-radius: 15px;

  background:
    var(--bg-card);

  border:
    1px solid
    var(--border-color);

  transition:
    transform .2s ease,
    border-color .2s ease;

}


.saving-card:hover {

  transform:
    translateY(-2px);

  border-color:
    var(--accent);

}


.saving-card-header {

  display: flex;

  align-items:
    flex-start;

  justify-content:
    space-between;

  gap: 12px;

}


.saving-title {

  min-width: 0;

  display: flex;

  align-items: center;

  gap: 11px;

}


.saving-icon {

  width: 42px;

  height: 42px;

  flex-shrink: 0;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 11px;

  color:
    var(--accent);

  background:
    var(--accent-soft);

  font-size: 18px;

}


.saving-icon.free {

  color:
    #22c55e;

  background:
    rgba(34, 197, 94, .10);

}


.saving-title h3 {

  margin: 0;

  color:
    var(--text-primary);

  font-size: 15px;

  white-space:
    nowrap;

  overflow:
    hidden;

  text-overflow:
    ellipsis;

}


.saving-title span {

  display: block;

  margin-top: 4px;

  color:
    var(--text-muted);

  font-size: 11px;

}


.status-badge {

  padding:
    5px 9px;

  border-radius: 20px;

  font-size: 10px;

  font-weight: 800;

  white-space:
    nowrap;

}


.status-badge.active {

  color:
    #22c55e;

  background:
    rgba(34, 197, 94, .10);

}


.status-badge.completed {

  color:
    var(--accent);

  background:
    var(--accent-soft);

}


.status-badge.cancelled {

  color:
    #ef6b6b;

  background:
    rgba(239, 68, 68, .10);

}


.saving-amount {

  margin-top: 22px;

}


.saving-amount strong {

  display: block;

  color:
    var(--text-primary);

  font-size: 23px;

}


.saving-amount span {

  display: block;

  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 11px;

}


.progress-wrapper {

  margin-top: 18px;

}


.progress-info {

  display: flex;

  justify-content:
    space-between;

  margin-bottom: 7px;

  font-size: 11px;

}


.progress-info span {

  color:
    var(--text-muted);

}


.progress-info strong {

  color:
    var(--accent);

}


.remaining-text {

  display: flex;

  justify-content:
    space-between;

  align-items: center;

  gap: 10px;

  margin-top: 10px;

  padding:
    8px 10px;

  border-radius: 8px;

  background:
    var(--bg-card-hover);

}


.remaining-text span {

  color:
    var(--text-muted);

  font-size: 10px;

}


.remaining-text strong {

  color:
    var(--text-secondary);

  font-size: 11px;

}


/*
|--------------------------------------------------------------------------
| FREE SAVINGS
|--------------------------------------------------------------------------
*/

.free-saving-info {

  display: flex;

  align-items: center;

  gap: 8px;

  margin-top: 18px;

  padding:
    10px 12px;

  border-radius: 9px;

  background:
    rgba(34, 197, 94, .07);

  color:
    #22c55e;

  font-size: 11px;

}


/*
|--------------------------------------------------------------------------
| ROUTINE
|--------------------------------------------------------------------------
*/

.routine-box,
.detail-routine {

  display: flex;

  align-items: center;

  gap: 10px;

  margin-top: 13px;

  padding:
    10px 11px;

  border-radius: 10px;

  background:
    rgba(139, 92, 246, .07);

  border:
    1px solid
    rgba(139, 92, 246, .10);

}


.routine-icon {

  width: 34px;

  height: 34px;

  flex-shrink: 0;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 9px;

  color:
    #8b5cf6;

  background:
    rgba(139, 92, 246, .10);

}


.routine-box > div:last-child,
.detail-routine > div:last-child {

  min-width: 0;

}


.routine-box span,
.routine-box strong,
.routine-box small,
.detail-routine span,
.detail-routine strong,
.detail-routine small {

  display: block;

}


.routine-box span,
.detail-routine span {

  color:
    var(--text-muted);

  font-size: 9px;

}


.routine-box strong,
.detail-routine strong {

  margin-top: 2px;

  color:
    var(--text-primary);

  font-size: 11px;

}


.routine-box small,
.detail-routine small {

  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 9px;

}


/*
|--------------------------------------------------------------------------
| DESCRIPTION
|--------------------------------------------------------------------------
*/

.saving-description {

  min-height: 35px;

  margin:
    14px 0 0;

  color:
    var(--text-secondary);

  font-size: 12px;

  line-height: 1.5;

}


/*
|--------------------------------------------------------------------------
| ACTIONS
|--------------------------------------------------------------------------
*/

.saving-actions {

  display: flex;

  gap: 7px;

  margin-top: 17px;

  padding-top: 14px;

  border-top:
    1px solid
    var(--border-color);

}


.action-btn {

  width: 35px;

  height: 35px;

  border: 0;

  border-radius: 9px;

  display: flex;

  align-items: center;

  justify-content: center;

  cursor: pointer;

  background:
    var(--bg-card-hover);

  color:
    var(--text-secondary);

  transition:
    all .2s ease;

}


.action-btn:hover {

  color:
    var(--text-primary);

  transform:
    translateY(-1px);

}


.action-btn:disabled {

  opacity:
    .3;

  cursor:
    not-allowed;

  transform:
    none;

}


.action-btn.detail:hover {

  color:
    var(--accent);

}


.action-btn.deposit:hover {

  color:
    #22c55e;

}


.action-btn.withdraw:hover {

  color:
    #f59e0b;

}


.action-btn.edit:hover {

  color:
    #8b5cf6;

}


.action-btn.delete:hover {

  color:
    #ef6b6b;

}


/*
|--------------------------------------------------------------------------
| LOADING / EMPTY
|--------------------------------------------------------------------------
*/

.loading-state,
.empty-state {

  min-height: 280px;

  display: flex;

  flex-direction:
    column;

  align-items:
    center;

  justify-content:
    center;

  text-align:
    center;

  border:
    1px solid
    var(--border-color);

  border-radius: 15px;

  background:
    var(--bg-card);

}


.loading-state {

  gap: 12px;

  color:
    var(--text-muted);

  font-size: 13px;

}


.empty-state {

  padding:
    40px 20px;

}


.empty-icon {

  width: 65px;

  height: 65px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 18px;

  background:
    var(--accent-soft);

  color:
    var(--accent);

  font-size: 28px;

  margin-bottom: 15px;

}


.empty-state h3 {

  margin: 0;

  color:
    var(--text-primary);

}


.empty-state p {

  max-width: 430px;

  color:
    var(--text-muted);

  font-size: 13px;

  line-height: 1.6;

  margin:
    8px 0 18px;

}


.spinner,
.button-spinner {

  border:
    2px solid
    rgba(255,255,255,.3);

  border-top-color:
    currentColor;

  border-radius:
    50%;

  animation:
    spin .7s linear infinite;

}


.spinner {

  width: 25px;

  height: 25px;

  color:
    var(--accent);

}


.button-spinner {

  width: 14px;

  height: 14px;

}


@keyframes spin {

  to {

    transform:
      rotate(360deg);

  }

}


/*
|--------------------------------------------------------------------------
| MODAL
|--------------------------------------------------------------------------
*/

.modal-backdrop {

  position: fixed;

  inset: 0;

  z-index: 3000;

  padding: 20px;

  display: flex;

  align-items:
    center;

  justify-content:
    center;

  background:
    rgba(0,0,0,.62);

  backdrop-filter:
    blur(5px);

}


.modal-card {

  width:
    min(100%, 520px);

  max-height:
    calc(100vh - 40px);

  overflow-y:
    auto;

  padding: 22px;

  border-radius: 17px;

  background:
    var(--bg-card);

  border:
    1px solid
    var(--border-color);

  box-shadow:
    0 25px 80px
    rgba(0,0,0,.3);

}


.detail-modal {

  width:
    min(100%, 650px);

}


.modal-header {

  display: flex;

  align-items:
    flex-start;

  justify-content:
    space-between;

  gap: 15px;

  margin-bottom: 22px;

}


.modal-header h2 {

  margin: 0;

  color:
    var(--text-primary);

  font-size: 20px;

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

  font-size: 22px;

  cursor: pointer;

}


.modal-close:hover {

  color:
    var(--text-primary);

}


.modal-close:disabled {

  opacity:
    .4;

  cursor:
    not-allowed;

}


.modal-eyebrow.deposit {

  color:
    #22c55e;

}


.modal-eyebrow.withdrawal {

  color:
    #f59e0b;

}


/*
|--------------------------------------------------------------------------
| FORM
|--------------------------------------------------------------------------
*/

.form-group {

  margin-bottom: 16px;

}


.form-group label {

  display: block;

  margin-bottom: 7px;

  color:
    var(--text-primary);

  font-size: 12px;

  font-weight: 700;

}


.form-group label small {

  color:
    var(--text-muted);

  font-weight: 500;

}


.form-group input,
.form-group textarea,
.form-group select {

  width: 100%;

  box-sizing: border-box;

  border:
    1px solid
    var(--border-color);

  border-radius: 10px;

  outline: none;

  background:
    var(--bg-card-hover);

  color:
    var(--text-primary);

  padding:
    11px 12px;

  font: inherit;

  font-size: 13px;

  transition:
    border-color .2s ease,
    box-shadow .2s ease;

}


.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {

  border-color:
    var(--accent);

  box-shadow:
    0 0 0 3px
    var(--accent-soft);

}


.form-group textarea {

  resize:
    vertical;

}


.form-group input[type="number"] {

  appearance:
    textfield;

}


.form-group input[type="number"]::-webkit-inner-spin-button,
.form-group input[type="number"]::-webkit-outer-spin-button {

  opacity:
    .65;

}


.form-group select {

  cursor:
    pointer;

}


.input-help {

  display: block;

  margin-top: 5px;

  color:
    var(--text-muted);

  font-size: 10px;

}


/*
|--------------------------------------------------------------------------
| TYPE SELECTOR
|--------------------------------------------------------------------------
*/

.type-grid {

  display: grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap: 10px;

}


.type-option {

  display: flex;

  align-items:
    flex-start;

  gap: 10px;

  padding: 12px;

  text-align:
    left;

  border:
    1px solid
    var(--border-color);

  border-radius: 11px;

  background:
    var(--bg-card-hover);

  color:
    var(--text-primary);

  cursor:
    pointer;

  transition:
    all .2s ease;

}


.type-option:hover {

  border-color:
    var(--accent);

}


.type-option.selected {

  border-color:
    var(--accent);

  background:
    var(--accent-soft);

}


.type-option-icon {

  width: 34px;

  height: 34px;

  flex-shrink: 0;

  display: flex;

  align-items:
    center;

  justify-content:
    center;

  border-radius: 9px;

  color:
    var(--accent);

  background:
    var(--bg-card);

}


.type-option strong,
.type-option span {

  display: block;

}


.type-option strong {

  font-size: 11px;

}


.type-option span {

  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 9px;

  line-height: 1.4;

}


/*
|--------------------------------------------------------------------------
| ROUTINE FORM
|--------------------------------------------------------------------------
*/

.routine-toggle {

  display: flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap: 15px;

  padding:
    13px;

  margin-bottom: 16px;

  border:
    1px solid
    var(--border-color);

  border-radius: 11px;

  background:
    var(--bg-card-hover);

}


.routine-toggle strong,
.routine-toggle span {

  display: block;

}


.routine-toggle strong {

  color:
    var(--text-primary);

  font-size: 12px;

}


.routine-toggle span {

  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 10px;

}


.routine-form {

  display: grid;

  grid-template-columns:
    1.2fr 1fr 1fr;

  gap: 10px;

  padding:
    13px;

  margin-bottom: 16px;

  border-radius: 11px;

  background:
    rgba(139, 92, 246, .06);

  border:
    1px solid
    rgba(139, 92, 246, .10);

}


.routine-form .form-group {

  margin-bottom: 0;

}


/*
|--------------------------------------------------------------------------
| SWITCH
|--------------------------------------------------------------------------
*/

.switch {

  position: relative;

  width: 42px;

  height: 23px;

  flex-shrink: 0;

}


.switch input {

  position: absolute;

  opacity: 0;

  width: 0;

  height: 0;

}


.switch-slider {

  position: absolute;

  inset: 0;

  cursor: pointer;

  border-radius: 30px;

  background:
    var(--bg-card);

  border:
    1px solid
    var(--border-color);

  transition:
    .2s ease;

}


.switch-slider::before {

  content: '';

  position: absolute;

  width: 17px;

  height: 17px;

  left: 2px;

  top: 2px;

  border-radius: 50%;

  background:
    var(--text-muted);

  transition:
    .2s ease;

}


.switch input:checked
+ .switch-slider {

  background:
    var(--accent);

  border-color:
    var(--accent);

}


.switch input:checked
+ .switch-slider::before {

  transform:
    translateX(18px);

  background:
    #fff;

}


/*
|--------------------------------------------------------------------------
| MODAL ACTIONS
|--------------------------------------------------------------------------
*/

.modal-actions {

  display: flex;

  justify-content:
    flex-end;

  flex-wrap:
    wrap;

  gap: 9px;

  margin-top: 22px;

}


/*
|--------------------------------------------------------------------------
| TRANSACTION
|--------------------------------------------------------------------------
*/

.transaction-info {

  padding: 13px;

  margin-bottom: 18px;

  border-radius: 11px;

  background:
    var(--accent-soft);

}


.transaction-info span,
.transaction-info small {

  display: block;

  color:
    var(--text-muted);

  font-size: 11px;

}


.transaction-info strong {

  display: block;

  margin:
    3px 0;

  color:
    var(--text-primary);

  font-size: 14px;

}


/*
|--------------------------------------------------------------------------
| DETAIL
|--------------------------------------------------------------------------
*/

.detail-type {

  display: flex;

  align-items: center;

  gap: 10px;

  padding: 12px;

  margin-bottom: 12px;

  border-radius: 11px;

  background:
    var(--bg-card-hover);

}


.detail-type > i {

  width: 36px;

  height: 36px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 9px;

  background:
    var(--accent-soft);

  color:
    var(--accent);

}


.detail-type strong,
.detail-type span {

  display: block;

}


.detail-type strong {

  color:
    var(--text-primary);

  font-size: 12px;

}


.detail-type span {

  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 10px;

}


.detail-summary {

  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 10px;

}


.detail-summary > div,
.detail-remaining > div {

  padding: 13px;

  border-radius: 11px;

  background:
    var(--bg-card-hover);

}


.detail-summary span,
.detail-remaining span {

  display: block;

  color:
    var(--text-muted);

  font-size: 10px;

  margin-bottom: 5px;

}


.detail-summary strong,
.detail-remaining strong {

  color:
    var(--text-primary);

  font-size: 14px;

}


.detail-remaining {

  display: grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap: 10px;

  margin-top: 10px;

}


.detail-progress {

  margin-top: 13px;

}


.free-detail {

  display: flex;

  align-items: center;

  gap: 10px;

  margin-top: 10px;

  padding: 12px;

  border-radius: 11px;

  background:
    rgba(34, 197, 94, .07);

}


.free-detail > i {

  color:
    #22c55e;

  font-size: 20px;

}


.free-detail strong,
.free-detail span {

  display: block;

}


.free-detail strong {

  color:
    var(--text-primary);

  font-size: 12px;

}


.free-detail span {

  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 10px;

}


.detail-description {

  margin-top: 18px;

  padding: 13px;

  border-radius: 11px;

  background:
    var(--bg-card-hover);

}


.detail-description span {

  color:
    var(--text-muted);

  font-size: 10px;

}


.detail-description p {

  margin:
    5px 0 0;

  color:
    var(--text-secondary);

  font-size: 12px;

  line-height: 1.5;

}


/*
|--------------------------------------------------------------------------
| TRANSACTIONS
|--------------------------------------------------------------------------
*/

.transactions-section {

  margin-top: 22px;

}


.section-title {

  display: flex;

  align-items: center;

  justify-content:
    space-between;

  margin-bottom: 10px;

}


.section-title h3 {

  margin: 0;

  color:
    var(--text-primary);

  font-size: 14px;

}


.section-title span {

  color:
    var(--text-muted);

  font-size: 11px;

}


.transaction-list {

  max-height: 280px;

  overflow-y:
    auto;

}


.transaction-row {

  display: flex;

  align-items: center;

  gap: 10px;

  padding:
    11px 0;

  border-bottom:
    1px solid
    var(--border-color);

}


.transaction-icon {

  width: 34px;

  height: 34px;

  flex-shrink: 0;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 9px;

}


.transaction-icon.deposit {

  color:
    #22c55e;

  background:
    rgba(34,197,94,.10);

}


.transaction-icon.withdrawal {

  color:
    #f59e0b;

  background:
    rgba(245,158,11,.10);

}


.transaction-info-main {

  min-width: 0;

  flex: 1;

}


.transaction-info-main strong,
.transaction-info-main span,
.transaction-info-main small {

  display: block;

}


.transaction-info-main strong {

  color:
    var(--text-primary);

  font-size: 12px;

}


.transaction-info-main span {

  margin-top: 2px;

  overflow:
    hidden;

  text-overflow:
    ellipsis;

  white-space:
    nowrap;

  color:
    var(--text-muted);

  font-size: 10px;

}


.transaction-info-main small {

  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 9px;

}


.transaction-amount {

  white-space:
    nowrap;

  font-size: 11px;

}


.transaction-amount.deposit {

  color:
    #22c55e;

}


.transaction-amount.withdrawal {

  color:
    #f59e0b;

}


.transaction-empty {

  padding:
    35px 15px;

  display: flex;

  flex-direction:
    column;

  align-items:
    center;

  gap: 8px;

  color:
    var(--text-muted);

  font-size: 12px;

}


.transaction-empty i {

  font-size: 25px;

}


/*
|--------------------------------------------------------------------------
| RESPONSIVE
|--------------------------------------------------------------------------
*/

@media (max-width: 1200px) {

  .savings-grid {

    grid-template-columns:
      repeat(2, minmax(0, 1fr));

  }


  .summary-grid {

    grid-template-columns:
      repeat(2, minmax(0, 1fr));

  }

}


@media (max-width: 767px) {

  .page-container {

    padding: 18px;

  }


  .page-header {

    align-items:
      stretch;

    flex-direction:
      column;

  }


  .page-header h1 {

    font-size:
      23px;

  }


  .summary-grid,
  .savings-grid {

    grid-template-columns:
      1fr;

  }


  .detail-summary,
  .detail-remaining {

    grid-template-columns:
      1fr;

  }


  .type-grid {

    grid-template-columns:
      1fr;

  }


  .routine-form {

    grid-template-columns:
      1fr;

  }


  .modal-card {

    padding:
      18px;

  }


  .overall-header {

    align-items:
      flex-start;

    flex-direction:
      column;

  }


  .modal-actions {

    justify-content:
      stretch;

  }


  .modal-actions
  .btn-primary,
  .modal-actions
  .btn-secondary,
  .modal-actions
  .btn-warning {

    flex:
      1;

  }

}

</style>