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

const categories = ref([])

const loading = ref(false)

const saving = ref(false)

const deleting = ref(false)

const search = ref('')

const filterType = ref('all')

const showModal = ref(false)

const editingCategory = ref(null)

const errorMessage = ref('')

const successMessage = ref('')


// ========================================
// FORM
// ========================================

const form = ref({
  name: '',
  type: 'expense',
  icon: 'bi-tag',
  color: '#64748b'
})


// ========================================
// ICON OPTIONS
// ========================================

const iconOptions = [
  'bi-tag',
  'bi-wallet2',
  'bi-cash-stack',
  'bi-bank',
  'bi-credit-card',
  'bi-cup-hot',
  'bi-cart',
  'bi-bag',
  'bi-house',
  'bi-car-front',
  'bi-fuel-pump',
  'bi-phone',
  'bi-lightning-charge',
  'bi-heart-pulse',
  'bi-book',
  'bi-controller',
  'bi-airplane',
  'bi-gift',
  'bi-tools',
  'bi-three-dots'
]


// ========================================
// COLOR OPTIONS
// ========================================

const colorOptions = [
  '#22c55e',
  '#16a34a',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#14b8a6',
  '#06b6d4',
  '#64748b'
]


// ========================================
// FILTERED CATEGORIES
// ========================================

const filteredCategories =
  computed(() => {

    const keyword =
      search.value
        .trim()
        .toLowerCase()


    return categories.value.filter(
      category => {

        const matchesSearch =
          !keyword ||
          category.name
            ?.toLowerCase()
            .includes(keyword)


        const matchesType =
          filterType.value === 'all' ||
          category.type === filterType.value


        return (
          matchesSearch &&
          matchesType
        )

      }
    )

  })


// ========================================
// GROUPED CATEGORIES
// ========================================

const incomeCategories =
  computed(() =>
    filteredCategories.value.filter(
      category =>
        category.type === 'income'
    )
  )


const expenseCategories =
  computed(() =>
    filteredCategories.value.filter(
      category =>
        category.type === 'expense'
    )
  )


// ========================================
// COUNTS
// ========================================

const incomeCount =
  computed(() =>
    categories.value.filter(
      category =>
        category.type === 'income'
    ).length
  )


const expenseCount =
  computed(() =>
    categories.value.filter(
      category =>
        category.type === 'expense'
    ).length
  )


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


// ========================================
// LOAD CATEGORIES
// ========================================

async function loadCategories() {

  loading.value = true

  clearMessages()

  try {

    const response =
      await api.get('/categories')


    categories.value =
      response.data?.data || []

  } catch (error) {

    console.error(
      'GET CATEGORIES ERROR:',
      error
    )


    showError(
      error.response?.data?.message ||
      'Gagal mengambil data kategori.'
    )

  } finally {

    loading.value = false

  }

}


// ========================================
// OPEN CREATE
// ========================================

function openCreate() {

  clearMessages()

  editingCategory.value = null


  form.value = {

    name: '',

    type: 'expense',

    icon: 'bi-tag',

    color: '#64748b'

  }


  showModal.value = true

}


// ========================================
// OPEN EDIT
// ========================================

function openEdit(category) {

  clearMessages()

  editingCategory.value = category


  form.value = {

    name: category.name || '',

    type:
      category.type || 'expense',

    icon:
      category.icon || 'bi-tag',

    color:
      category.color || '#64748b'

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

  editingCategory.value = null

}


// ========================================
// SAVE CATEGORY
// ========================================

async function saveCategory() {

  clearMessages()


  const name =
    form.value.name.trim()


  if (!name) {

    showError(
      'Nama kategori wajib diisi.'
    )

    return

  }


  if (name.length > 100) {

    showError(
      'Nama kategori maksimal 100 karakter.'
    )

    return

  }


  saving.value = true


  try {

    const payload = {

      name,

      type:
        form.value.type,

      icon:
        form.value.icon || null,

      color:
        form.value.color || null

    }


    let response


    if (editingCategory.value) {

      response =
        await api.put(
          `/categories/${editingCategory.value.id}`,
          payload
        )

    } else {

      response =
        await api.post(
          '/categories',
          payload
        )

    }


    const saved =
      response.data?.data


    if (editingCategory.value) {

      const index =
        categories.value.findIndex(
          category =>
            category.id ===
            editingCategory.value.id
        )


      if (index !== -1) {

        categories.value[index] = {

          ...categories.value[index],

          ...saved

        }

      }

      showSuccess(
        response.data?.message ||
        'Kategori berhasil diperbarui.'
      )

    } else {

      categories.value.push(saved)

      showSuccess(
        response.data?.message ||
        'Kategori berhasil dibuat.'
      )

    }


    closeModal()

  } catch (error) {

    console.error(
      'SAVE CATEGORY ERROR:',
      error
    )


    showError(
      error.response?.data?.message ||
      'Gagal menyimpan kategori.'
    )

  } finally {

    saving.value = false

  }

}


// ========================================
// DELETE CATEGORY
// ========================================

async function deleteCategory(category) {

  if (deleting.value) {

    return

  }


  const confirmed =
    window.confirm(
      `Hapus kategori "${category.name}"?`
    )


  if (!confirmed) {

    return

  }


  clearMessages()

  deleting.value = true


  try {

    const response =
      await api.delete(
        `/categories/${category.id}`
      )


    categories.value =
      categories.value.filter(
        item =>
          item.id !== category.id
      )


    showSuccess(
      response.data?.message ||
      'Kategori berhasil dihapus.'
    )

  } catch (error) {

    console.error(
      'DELETE CATEGORY ERROR:',
      error
    )


    showError(
      error.response?.data?.message ||
      'Gagal menghapus kategori.'
    )

  } finally {

    deleting.value = false

  }

}


// ========================================
// FORMAT TYPE
// ========================================

function typeLabel(type) {

  return type === 'income'
    ? 'Pemasukan'
    : 'Pengeluaran'

}


// ========================================
// INITIAL LOAD
// ========================================

onMounted(
  loadCategories
)

</script>


<template>

  <div class="categories-page">

    <!-- ================================= -->
    <!-- PAGE HEADER -->
    <!-- ================================= -->

    <div class="page-header mb-4">

      <div>

        <h1>
          Kategori
        </h1>

        <p>
          Kelola kategori pemasukan dan pengeluaran.
        </p>

      </div>


      <button
        class="btn-budget"
        @click="openCreate"
      >

        <i class="bi bi-plus-lg me-1"></i>

        Tambah Kategori

      </button>

    </div>


    <!-- ================================= -->
    <!-- ALERT -->
    <!-- ================================= -->

    <div
      v-if="successMessage"
      class="category-alert success"
    >

      <i class="bi bi-check-circle-fill"></i>

      <span>
        {{ successMessage }}
      </span>

      <button
        @click="successMessage = ''"
      >
        <i class="bi bi-x"></i>
      </button>

    </div>


    <div
      v-if="errorMessage"
      class="category-alert error"
    >

      <i class="bi bi-exclamation-circle-fill"></i>

      <span>
        {{ errorMessage }}
      </span>

      <button
        @click="errorMessage = ''"
      >
        <i class="bi bi-x"></i>
      </button>

    </div>


    <!-- ================================= -->
    <!-- TOOLBAR -->
    <!-- ================================= -->

    <div class="budget-card category-toolbar">

      <div class="search-box">

        <i class="bi bi-search"></i>

        <input
          v-model="search"
          type="text"
          placeholder="Cari kategori..."
        />

      </div>


      <div class="filter-buttons">

        <button
          :class="{
            active: filterType === 'all'
          }"
          @click="filterType = 'all'"
        >
          Semua
        </button>


        <button
          :class="{
            active: filterType === 'income'
          }"
          @click="filterType = 'income'"
        >

          <i class="bi bi-arrow-down-left"></i>

          Pemasukan

        </button>


        <button
          :class="{
            active: filterType === 'expense'
          }"
          @click="filterType = 'expense'"
        >

          <i class="bi bi-arrow-up-right"></i>

          Pengeluaran

        </button>

      </div>

    </div>


    <!-- ================================= -->
    <!-- LOADING -->
    <!-- ================================= -->

    <div
      v-if="loading"
      class="budget-card empty-state"
    >

      <div class="loading-spinner">

        <span></span>

      </div>

      <h5>
        Memuat kategori...
      </h5>

      <p>
        Tunggu sebentar.
      </p>

    </div>


    <!-- ================================= -->
    <!-- CATEGORY CONTENT -->
    <!-- ================================= -->

    <template v-else>

      <!-- INCOME -->

      <section
        v-if="
          incomeCategories.length ||
          filterType === 'income' ||
          filterType === 'all'
        "
        class="category-section"
      >

        <div class="section-heading">

          <div>

            <h5>

              <span class="heading-icon income">
                <i class="bi bi-arrow-down-left"></i>
              </span>

              Pemasukan

            </h5>

            <span>
              {{ incomeCount }} kategori
            </span>

          </div>

        </div>


        <div
          v-if="incomeCategories.length"
          class="category-grid"
        >

          <div
            v-for="category in incomeCategories"
            :key="category.id"
            class="budget-card category-card"
          >

            <div
              class="category-icon"
              :style="{
                backgroundColor:
                  `${category.color || '#64748b'}18`,
                color:
                  category.color || '#64748b'
              }"
            >

              <i
                class="bi"
                :class="
                  category.icon ||
                  'bi-tag'
                "
              ></i>

            </div>


            <div class="category-main">

              <strong>
                {{ category.name }}
              </strong>

              <span class="category-type income">
                {{ typeLabel(category.type) }}
              </span>

            </div>


            <div class="category-actions">

              <button
                class="action-button edit"
                title="Edit kategori"
                @click="openEdit(category)"
              >

                <i class="bi bi-pencil"></i>

              </button>


              <button
                class="action-button delete"
                title="Hapus kategori"
                :disabled="deleting"
                @click="deleteCategory(category)"
              >

                <i class="bi bi-trash"></i>

              </button>

            </div>

          </div>

        </div>


        <div
          v-else
          class="budget-card mini-empty"
        >

          <i class="bi bi-inbox"></i>

          <span>
            Tidak ada kategori pemasukan.
          </span>

        </div>

      </section>


      <!-- EXPENSE -->

      <section
        v-if="
          expenseCategories.length ||
          filterType === 'expense' ||
          filterType === 'all'
        "
        class="category-section"
      >

        <div class="section-heading">

          <div>

            <h5>

              <span class="heading-icon expense">
                <i class="bi bi-arrow-up-right"></i>
              </span>

              Pengeluaran

            </h5>

            <span>
              {{ expenseCount }} kategori
            </span>

          </div>

        </div>


        <div
          v-if="expenseCategories.length"
          class="category-grid"
        >

          <div
            v-for="category in expenseCategories"
            :key="category.id"
            class="budget-card category-card"
          >

            <div
              class="category-icon"
              :style="{
                backgroundColor:
                  `${category.color || '#64748b'}18`,
                color:
                  category.color || '#64748b'
              }"
            >

              <i
                class="bi"
                :class="
                  category.icon ||
                  'bi-tag'
                "
              ></i>

            </div>


            <div class="category-main">

              <strong>
                {{ category.name }}
              </strong>

              <span class="category-type expense">
                {{ typeLabel(category.type) }}
              </span>

            </div>


            <div class="category-actions">

              <button
                class="action-button edit"
                title="Edit kategori"
                @click="openEdit(category)"
              >

                <i class="bi bi-pencil"></i>

              </button>


              <button
                class="action-button delete"
                title="Hapus kategori"
                :disabled="deleting"
                @click="deleteCategory(category)"
              >

                <i class="bi bi-trash"></i>

              </button>

            </div>

          </div>

        </div>


        <div
          v-else
          class="budget-card mini-empty"
        >

          <i class="bi bi-inbox"></i>

          <span>
            Tidak ada kategori pengeluaran.
          </span>

        </div>

      </section>


      <!-- NO SEARCH RESULT -->

      <div
        v-if="
          !filteredCategories.length &&
          categories.length
        "
        class="budget-card empty-state"
      >

        <i class="bi bi-search"></i>

        <h5>
          Kategori tidak ditemukan
        </h5>

        <p>
          Coba gunakan kata kunci pencarian lain.
        </p>

      </div>


      <!-- NO CATEGORY -->

      <div
        v-if="
          !categories.length
        "
        class="budget-card empty-state"
      >

        <i class="bi bi-tags"></i>

        <h5>
          Belum ada kategori
        </h5>

        <p>
          Buat kategori pertama kamu untuk mulai mengatur keuangan.
        </p>


        <button
          class="btn-budget"
          @click="openCreate"
        >

          <i class="bi bi-plus-lg me-1"></i>

          Tambah Kategori

        </button>

      </div>

    </template>


    <!-- ================================= -->
    <!-- MODAL -->
    <!-- ================================= -->

    <Teleport to="body">

      <div
        v-if="showModal"
        class="modal-backdrop-custom"
        @click.self="closeModal"
      >

        <div class="category-modal">

          <!-- MODAL HEADER -->

          <div class="modal-header-custom">

            <div>

              <h5>
                {{
                  editingCategory
                    ? 'Edit Kategori'
                    : 'Tambah Kategori'
                }}
              </h5>

              <p>
                Atur informasi kategori keuangan.
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
            @submit.prevent="saveCategory"
          >

            <!-- NAME -->

            <div class="form-group">

              <label>
                Nama Kategori
              </label>

              <input
                v-model="form.name"
                type="text"
                maxlength="100"
                placeholder="Contoh: Makanan"
                autocomplete="off"
              />

              <small>
                {{ form.name.length }}/100 karakter
              </small>

            </div>


            <!-- TYPE -->

            <div class="form-group">

              <label>
                Tipe
              </label>

              <div class="type-options">

                <button
                  type="button"
                  class="type-option income"
                  :class="{
                    active:
                      form.type === 'income'
                  }"
                  @click="
                    form.type = 'income'
                  "
                >

                  <i class="bi bi-arrow-down-left"></i>

                  <span>
                    <strong>Pemasukan</strong>
                    <small>Uang masuk</small>
                  </span>

                  <i
                    v-if="
                      form.type === 'income'
                    "
                    class="bi bi-check-circle-fill check"
                  ></i>

                </button>


                <button
                  type="button"
                  class="type-option expense"
                  :class="{
                    active:
                      form.type === 'expense'
                  }"
                  @click="
                    form.type = 'expense'
                  "
                >

                  <i class="bi bi-arrow-up-right"></i>

                  <span>
                    <strong>Pengeluaran</strong>
                    <small>Uang keluar</small>
                  </span>

                  <i
                    v-if="
                      form.type === 'expense'
                    "
                    class="bi bi-check-circle-fill check"
                  ></i>

                </button>

              </div>

            </div>


            <!-- ICON -->

            <div class="form-group">

              <label>
                Icon
              </label>

              <div class="icon-picker">

                <button
                  v-for="icon in iconOptions"
                  :key="icon"
                  type="button"
                  class="icon-option"
                  :class="{
                    active:
                      form.icon === icon
                  }"
                  @click="
                    form.icon = icon
                  "
                >

                  <i
                    class="bi"
                    :class="icon"
                  ></i>

                </button>

              </div>

            </div>


            <!-- COLOR -->

            <div class="form-group">

              <label>
                Warna
              </label>

              <div class="color-picker">

                <button
                  v-for="color in colorOptions"
                  :key="color"
                  type="button"
                  class="color-option"
                  :class="{
                    active:
                      form.color === color
                  }"
                  :style="{
                    backgroundColor: color
                  }"
                  @click="
                    form.color = color
                  "
                >

                  <i
                    v-if="
                      form.color === color
                    "
                    class="bi bi-check"
                  ></i>

                </button>


                <input
                  v-model="form.color"
                  type="color"
                  class="custom-color"
                  title="Pilih warna sendiri"
                />

              </div>

            </div>


            <!-- PREVIEW -->

            <div class="form-group">

              <label>
                Preview
              </label>

              <div class="category-preview">

                <div
                  class="preview-icon"
                  :style="{
                    backgroundColor:
                      `${form.color || '#64748b'}18`,
                    color:
                      form.color || '#64748b'
                  }"
                >

                  <i
                    class="bi"
                    :class="
                      form.icon ||
                      'bi-tag'
                    "
                  ></i>

                </div>


                <div>

                  <strong>
                    {{ form.name || 'Nama Kategori' }}
                  </strong>

                  <span
                    :class="
                      form.type
                    "
                  >
                    {{ typeLabel(form.type) }}
                  </span>

                </div>

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
                    : editingCategory
                      ? 'Simpan Perubahan'
                      : 'Simpan Kategori'
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


/* ========================================
   ALERT
======================================== */

.category-alert {

  display: flex;

  align-items: center;

  gap: 10px;

  margin-bottom: 16px;

  padding:
    12px 14px;

  border-radius: 10px;

  font-size: 13px;

}


.category-alert span {

  flex: 1;

}


.category-alert button {

  border: none;

  background: transparent;

  color: inherit;

  font-size: 16px;

}


.category-alert.success {

  background:
    rgba(34, 197, 94, 0.10);

  color:
    var(--success);

}


.category-alert.error {

  background:
    rgba(239, 68, 68, 0.10);

  color:
    var(--danger);

}


/* ========================================
   TOOLBAR
======================================== */

.category-toolbar {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 15px;

  padding: 14px;

  margin-bottom: 25px;

}


.search-box {

  min-width: 240px;

  max-width: 420px;

  flex: 1;

  height: 42px;

  display: flex;

  align-items: center;

  gap: 10px;

  padding:
    0 13px;

  border:
    1px solid var(--border-color);

  border-radius: 10px;

  background:
    var(--bg-card);

}


.search-box i {

  color:
    var(--text-muted);

}


.search-box input {

  width: 100%;

  border: none;

  outline: none;

  background: transparent;

  color:
    var(--text-primary);

  font-size: 13px;

}


.search-box input::placeholder {

  color:
    var(--text-muted);

}


.filter-buttons {

  display: flex;

  gap: 6px;

  padding: 4px;

  border-radius: 10px;

  background:
    var(--bg-card-hover);

}


.filter-buttons button {

  height: 34px;

  padding:
    0 11px;

  border: none;

  border-radius: 8px;

  background: transparent;

  color:
    var(--text-secondary);

  font-size: 12px;

  font-weight: 600;

}


.filter-buttons button:hover {

  color:
    var(--text-primary);

}


.filter-buttons button.active {

  background:
    var(--bg-card);

  color:
    var(--accent);

  box-shadow:
    0 1px 4px rgba(0, 0, 0, 0.08);

}


/* ========================================
   SECTION
======================================== */

.category-section {

  margin-bottom: 28px;

}


.section-heading {

  display: flex;

  align-items: center;

  justify-content: space-between;

  margin-bottom: 11px;

}


.section-heading > div {

  display: flex;

  align-items: center;

  gap: 10px;

}


.section-heading h5 {

  display: flex;

  align-items: center;

  gap: 8px;

  margin: 0;

  font-size: 14px;

  font-weight: 800;

}


.section-heading > div > span {

  color:
    var(--text-muted);

  font-size: 11px;

}


.heading-icon {

  width: 27px;

  height: 27px;

  display: inline-flex;

  align-items: center;

  justify-content: center;

  border-radius: 8px;

}


.heading-icon.income {

  background:
    rgba(34, 197, 94, 0.10);

  color:
    var(--success);

}


.heading-icon.expense {

  background:
    rgba(239, 68, 68, 0.10);

  color:
    var(--danger);

}


/* ========================================
   GRID
======================================== */

.category-grid {

  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 10px;

}


.category-card {

  min-height: 74px;

  display: flex;

  align-items: center;

  gap: 12px;

  padding:
    12px 14px;

  transition:
    transform var(--transition),
    border-color var(--transition);

}


.category-card:hover {

  transform:
    translateY(-1px);

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


.category-main {

  min-width: 0;

  flex: 1;

  display: flex;

  flex-direction: column;

  gap: 3px;

}


.category-main strong {

  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;

  color:
    var(--text-primary);

  font-size: 13px;

}


.category-type {

  font-size: 10px;

  font-weight: 700;

}


.category-type.income {

  color:
    var(--success);

}


.category-type.expense {

  color:
    var(--danger);

}


.category-actions {

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
    rgba(239, 68, 68, 0.10);

  color:
    var(--danger);

}


.action-button:disabled {

  opacity: 0.5;

  cursor: not-allowed;

}


/* ========================================
   EMPTY
======================================== */

.empty-state {

  min-height: 260px;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  text-align: center;

  padding: 30px;

}


.empty-state > i {

  margin-bottom: 12px;

  color:
    var(--accent);

  font-size: 36px;

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


.mini-empty {

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 8px;

  padding: 18px;

  color:
    var(--text-muted);

  font-size: 12px;

}


.mini-empty i {

  font-size: 16px;

}


/* ========================================
   LOADING
======================================== */

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
    category-spin 700ms linear infinite;

}


@keyframes category-spin {

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
    rgba(0, 0, 0, 0.45);

  backdrop-filter:
    blur(4px);

}


.category-modal {

  width: min(
    520px,
    100%
  );

  max-height:
    calc(100vh - 40px);

  overflow-y: auto;

  border:
    1px solid var(--border-color);

  border-radius: 16px;

  background:
    var(--bg-card);

  box-shadow:
    0 25px 70px rgba(0, 0, 0, 0.20);

  padding: 22px;

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
    4px 0 0;

  color:
    var(--text-muted);

  font-size: 11px;

}


.modal-close {

  width: 32px;

  height: 32px;

  display: flex;

  align-items: center;

  justify-content: center;

  border: none;

  border-radius: 8px;

  background:
    var(--bg-card-hover);

  color:
    var(--text-secondary);

}


.modal-close:hover {

  color:
    var(--text-primary);

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


.form-group > input[type="text"] {

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

  font-size: 13px;

}


.form-group > input[type="text"]:focus {

  border-color:
    var(--accent);

  box-shadow:
    0 0 0 3px var(--accent-soft);

}


.form-group > small {

  display: block;

  margin-top: 5px;

  color:
    var(--text-muted);

  font-size: 10px;

}


/* ========================================
   TYPE
======================================== */

.type-options {

  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 8px;

}


.type-option {

  min-height: 64px;

  position: relative;

  display: flex;

  align-items: center;

  gap: 10px;

  padding: 10px;

  border:
    1px solid var(--border-color);

  border-radius: 10px;

  background:
    var(--bg-card);

  color:
    var(--text-secondary);

  text-align: left;

}


.type-option > i:first-child {

  width: 34px;

  height: 34px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  border-radius: 9px;

}


.type-option.income > i:first-child {

  background:
    rgba(34, 197, 94, 0.10);

  color:
    var(--success);

}


.type-option.expense > i:first-child {

  background:
    rgba(239, 68, 68, 0.10);

  color:
    var(--danger);

}


.type-option span {

  display: flex;

  flex-direction: column;

  gap: 2px;

}


.type-option strong {

  font-size: 11px;

  color:
    var(--text-primary);

}


.type-option small {

  font-size: 9px;

  color:
    var(--text-muted);

}


.type-option .check {

  position: absolute;

  right: 8px;

  top: 8px;

  width: auto;

  height: auto;

  background: transparent;

  color:
    var(--accent);

}


.type-option.active {

  border-color:
    var(--accent);

  background:
    var(--accent-soft);

}


/* ========================================
   ICON PICKER
======================================== */

.icon-picker {

  display: grid;

  grid-template-columns:
    repeat(10, 1fr);

  gap: 6px;

}


.icon-option {

  aspect-ratio: 1;

  display: flex;

  align-items: center;

  justify-content: center;

  border:
    1px solid var(--border-color);

  border-radius: 8px;

  background:
    var(--bg-card);

  color:
    var(--text-secondary);

  font-size: 15px;

}


.icon-option:hover {

  color:
    var(--accent);

  border-color:
    var(--accent);

}


.icon-option.active {

  border-color:
    var(--accent);

  background:
    var(--accent-soft);

  color:
    var(--accent);

}


/* ========================================
   COLOR
======================================== */

.color-picker {

  display: flex;

  align-items: center;

  flex-wrap: wrap;

  gap: 8px;

}


.color-option {

  width: 28px;

  height: 28px;

  display: flex;

  align-items: center;

  justify-content: center;

  border:
    2px solid transparent;

  border-radius: 50%;

  color: white;

}


.color-option.active {

  border-color:
    var(--text-primary);

  box-shadow:
    0 0 0 2px var(--bg-card);

}


.custom-color {

  width: 30px;

  height: 30px;

  padding: 0;

  overflow: hidden;

  border:
    1px solid var(--border-color);

  border-radius: 50%;

  background: transparent;

  cursor: pointer;

}


/* ========================================
   PREVIEW
======================================== */

.category-preview {

  display: flex;

  align-items: center;

  gap: 11px;

  padding: 12px;

  border:
    1px solid var(--border-color);

  border-radius: 10px;

  background:
    var(--bg-card-hover);

}


.preview-icon {

  width: 40px;

  height: 40px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 11px;

  font-size: 17px;

}


.category-preview > div:last-child {

  display: flex;

  flex-direction: column;

  gap: 3px;

}


.category-preview strong {

  font-size: 12px;

}


.category-preview span {

  font-size: 10px;

  font-weight: 700;

}


.category-preview span.income {

  color:
    var(--success);

}


.category-preview span.expense {

  color:
    var(--danger);

}


/* ========================================
   MODAL ACTIONS
======================================== */

.modal-actions {

  display: flex;

  justify-content: flex-end;

  gap: 8px;

  padding-top: 5px;

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


.btn-budget:disabled {

  opacity: 0.6;

  cursor: not-allowed;

}


.button-spinner {

  display: inline-block;

  width: 13px;

  height: 13px;

  margin-right: 6px;

  vertical-align: -2px;

  border:
    2px solid rgba(255, 255, 255, 0.45);

  border-top-color:
    white;

  border-radius: 50%;

  animation:
    category-spin 600ms linear infinite;

}


/* ========================================
   RESPONSIVE
======================================== */

@media (max-width: 767.98px) {

  .category-toolbar {

    flex-direction: column;

    align-items: stretch;

  }


  .search-box {

    max-width: none;

  }


  .filter-buttons {

    overflow-x: auto;

  }


  .filter-buttons button {

    white-space: nowrap;

  }


  .category-grid {

    grid-template-columns: 1fr;

  }


  .type-options {

    grid-template-columns: 1fr;

  }


  .icon-picker {

    grid-template-columns:
      repeat(5, 1fr);

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


  .category-modal {

    padding: 17px;

    border-radius: 13px;

  }

}

</style>