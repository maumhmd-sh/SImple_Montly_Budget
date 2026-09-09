<script setup>

import {
  computed,
  onMounted,
  ref
} from 'vue'

import api from '../services/api'


// ========================================
// PROFILE
// ========================================

const profile = ref({

  id: null,

  name: '',

  email: ''

})


const userId = computed(() => {

  return profile.value.id || '-'

})


const profileLoading =
  ref(false)

const profileMessage =
  ref('')

const profileError =
  ref('')


// ========================================
// PASSWORD
// ========================================

const passwordForm = ref({

  currentPassword: '',

  newPassword: '',

  confirmPassword: ''

})


const passwordLoading =
  ref(false)

const passwordMessage =
  ref('')

const passwordError =
  ref('')


// ========================================
// THEME
// ========================================

const theme =
  ref('system')


// ========================================
// ACCENT
// ========================================

const accent =
  ref('blue')


const accentColors = [

  {
    name: 'blue',
    label: 'Blue',
    value: '#3b82f6'
  },

  {
    name: 'purple',
    label: 'Purple',
    value: '#8b5cf6'
  },

  {
    name: 'green',
    label: 'Green',
    value: '#22c55e'
  },

  {
    name: 'orange',
    label: 'Orange',
    value: '#f97316'
  },

  {
    name: 'red',
    label: 'Red',
    value: '#ef4444'
  },

  {
    name: 'pink',
    label: 'Pink',
    value: '#ec4899'
  }

]


// ========================================
// INITIALS
// ========================================

const initials = computed(() => {

  return (
    profile.value.name
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() ||
    'M'
  )

})


// ========================================
// APPLY THEME
// ========================================

function applyTheme(value) {

  const allowedThemes = [

    'light',
    'dark',
    'system'

  ]


  if (
    !allowedThemes.includes(value)
  ) {

    value = 'system'

  }


  theme.value =
    value


  localStorage.setItem(

    'monthly_budget_theme',

    value

  )


  let appliedTheme =
    value


  if (
    value === 'system'
  ) {

    const systemDark =
      window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches


    appliedTheme =
      systemDark
        ? 'dark'
        : 'light'

  }


  document.documentElement
    .setAttribute(

      'data-theme',

      appliedTheme

    )

}


// ========================================
// APPLY ACCENT
// ========================================

function applyAccent(value) {

  const selected =
    accentColors.find(

      color =>
        color.name === value

    )


  if (!selected) {

    return

  }


  accent.value =
    selected.name


  localStorage.setItem(

    'monthly_budget_accent',

    selected.name

  )


  document.documentElement
    .style
    .setProperty(

      '--accent',

      selected.value

    )


  document.documentElement
    .style
    .setProperty(

      '--accent-soft',

      `${selected.value}18`

    )

}


// ========================================
// SAVE LOCAL USER
// ========================================

function saveLocalUser() {

  localStorage.setItem(

    'monthly_budget_user',

    JSON.stringify({

      id:
        profile.value.id,

      name:
        profile.value.name,

      email:
        profile.value.email,

      theme:
        theme.value,

      accentColor:
        accent.value

    })

  )


  window.dispatchEvent(

    new Event(
      'monthly-budget-user-updated'
    )

  )

}


// ========================================
// LOAD PROFILE
// ========================================

async function loadProfile() {

  try {

    const response =
      await api.get(
        '/auth/me'
      )


    const user =
      response.data?.user


    if (!user) {

      return

    }


    profile.value = {

      id:
        user.id || null,

      name:
        user.name || '',

      email:
        user.email || ''

    }


    // ------------------------------------
    // LOAD THEME FROM DATABASE
    // ------------------------------------

    const databaseTheme =
      user.theme || 'system'


    theme.value =
      databaseTheme


    applyTheme(
      databaseTheme
    )


    // ------------------------------------
    // LOAD ACCENT FROM DATABASE
    // ------------------------------------

    const databaseAccent =
      user.accentColor ||
      'blue'


    accent.value =
      databaseAccent


    applyAccent(
      databaseAccent
    )


    // ------------------------------------
    // UPDATE LOCAL CACHE
    // ------------------------------------

    saveLocalUser()


  } catch (error) {

    console.error(
      'GET PROFILE ERROR:',
      error
    )


    // ------------------------------------
    // FALLBACK TO LOCAL CACHE
    // ------------------------------------

    const savedUser =
      localStorage.getItem(
        'monthly_budget_user'
      )


    if (!savedUser) {

      return

    }


    try {

      const user =
        JSON.parse(
          savedUser
        )


      profile.value = {

        id:
          user.id || null,

        name:
          user.name || '',

        email:
          user.email || ''

      }


      applyTheme(
        user.theme || 'system'
      )


      applyAccent(
        user.accentColor || 'blue'
      )


    } catch {

      // Ignore invalid cache

    }

  }

}


// ========================================
// SAVE PROFILE + PREFERENCE
// ========================================

async function saveProfile() {

  profileMessage.value = ''

  profileError.value = ''


  const name =
    profile.value.name
      .trim()


  const email =
    profile.value.email
      .trim()
      .toLowerCase()


  // --------------------------------------
  // VALIDATION
  // --------------------------------------

  if (!name) {

    profileError.value =
      'Nama wajib diisi.'

    return

  }


  if (!email) {

    profileError.value =
      'Email wajib diisi.'

    return

  }


  if (
    !email.includes('@') ||
    !email.includes('.')
  ) {

    profileError.value =
      'Format email tidak valid.'

    return

  }


  profileLoading.value =
    true


  try {

    const response =
      await api.put(

        '/auth/profile',

        {

          name,

          email,

          theme:
            theme.value,

          accentColor:
            accent.value

        }

      )


    const user =
      response.data?.user


    if (user) {

      profile.value = {

        id:
          user.id ||
          profile.value.id,

        name:
          user.name ||
          name,

        email:
          user.email ||
          email

      }


      // --------------------------------
      // SYNC PREFERENCE FROM SERVER
      // --------------------------------

      if (user.theme) {

        theme.value =
          user.theme

      }


      if (user.accentColor) {

        accent.value =
          user.accentColor

      }

    } else {

      profile.value.name =
        name

      profile.value.email =
        email

    }


    // ------------------------------------
    // APPLY AGAIN
    // ------------------------------------

    applyTheme(
      theme.value
    )


    applyAccent(
      accent.value
    )


    // ------------------------------------
    // LOCAL CACHE
    // ------------------------------------

    saveLocalUser()


    profileMessage.value =
      response.data?.message ||
      'Profile berhasil diperbarui.'


  } catch (error) {

    console.error(
      'UPDATE PROFILE ERROR:',
      error
    )


    profileError.value =
      error.response?.data?.message ||
      'Gagal memperbarui profile.'


  } finally {

    profileLoading.value =
      false

  }

}


// ========================================
// SAVE THEME
// ========================================

async function changeTheme(value) {

  if (
    theme.value === value
  ) {

    return

  }


  const previousTheme =
    theme.value


  applyTheme(value)


  try {

    await api.put(

      '/auth/profile',

      {

        name:
          profile.value.name,

        email:
          profile.value.email,

        theme:
          value,

        accentColor:
          accent.value

      }

    )


    saveLocalUser()


  } catch (error) {

    console.error(
      'SAVE THEME ERROR:',
      error
    )


    // Rollback kalau gagal

    applyTheme(
      previousTheme
    )

  }

}


// ========================================
// SAVE ACCENT
// ========================================

async function changeAccent(color) {

  const previousAccent =
    accent.value


  applyAccent(
    color.name
  )


  try {

    await api.put(

      '/auth/profile',

      {

        name:
          profile.value.name,

        email:
          profile.value.email,

        theme:
          theme.value,

        accentColor:
          color.name

      }

    )


    saveLocalUser()


  } catch (error) {

    console.error(
      'SAVE ACCENT ERROR:',
      error
    )


    // Rollback

    applyAccent(
      previousAccent
    )

  }

}


// ========================================
// CHANGE PASSWORD
// ========================================

async function changePassword() {

  passwordMessage.value = ''

  passwordError.value = ''


  const currentPassword =
    passwordForm.value
      .currentPassword


  const newPassword =
    passwordForm.value
      .newPassword


  const confirmPassword =
    passwordForm.value
      .confirmPassword


  if (
    !currentPassword ||
    !newPassword ||
    !confirmPassword
  ) {

    passwordError.value =
      'Semua field password wajib diisi.'

    return

  }


  if (
    newPassword.length < 6
  ) {

    passwordError.value =
      'Password baru minimal 6 karakter.'

    return

  }


  if (
    newPassword !==
    confirmPassword
  ) {

    passwordError.value =
      'Konfirmasi password tidak cocok.'

    return

  }


  if (
    currentPassword ===
    newPassword
  ) {

    passwordError.value =
      'Password baru harus berbeda dari password lama.'

    return

  }


  passwordLoading.value =
    true


  try {

    const response =
      await api.put(

        '/auth/password',

        {

          currentPassword,

          newPassword,

          confirmPassword

        }

      )


    passwordMessage.value =
      response.data?.message ||
      'Password berhasil diperbarui.'


    passwordForm.value = {

      currentPassword: '',

      newPassword: '',

      confirmPassword: ''

    }


  } catch (error) {

    console.error(
      'CHANGE PASSWORD ERROR:',
      error
    )


    passwordError.value =
      error.response?.data?.message ||
      'Gagal memperbarui password.'


  } finally {

    passwordLoading.value =
      false

  }

}


// ========================================
// INITIALIZE
// ========================================

onMounted(() => {

  loadProfile()

})

</script>


<template>

  <div class="settings-page">


    <!-- ================================= -->
    <!-- HEADER -->
    <!-- ================================= -->

    <div class="page-header mb-4">

      <div>

        <h1>
          Pengaturan
        </h1>

        <p>
          Kelola profile, keamanan, dan tampilan aplikasi.
        </p>

      </div>

    </div>


    <div class="row g-3">


      <!-- ================================= -->
      <!-- PROFILE -->
      <!-- ================================= -->

      <div class="col-lg-7">

        <div
          class="budget-card settings-card"
        >

          <div class="section-header">

            <div class="section-icon">

              <i class="bi bi-person"></i>

            </div>


            <div>

              <h5>
                Profile
              </h5>

              <span>
                Informasi akun personal kamu.
              </span>

            </div>

          </div>


          <!-- PROFILE PREVIEW -->

          <div class="profile-preview">

            <div class="profile-avatar">

              {{ initials }}

            </div>


            <div class="profile-preview-info">

              <strong>
                {{ profile.name || 'Mola' }}
              </strong>

              <span>
                {{
                  profile.email ||
                  'Email belum tersedia'
                }}
              </span>

            </div>

          </div>


          <!-- FORM -->

          <div class="form-grid">


            <div class="form-field">

              <label>
                Nama
              </label>

              <input
                v-model="profile.name"
                type="text"
                placeholder="Nama lengkap"
                autocomplete="name"
              />

            </div>


            <div class="form-field">

              <label>
                Email
              </label>

              <input
                v-model="profile.email"
                type="email"
                placeholder="email@example.com"
                autocomplete="email"
              />

            </div>


          </div>


          <!-- SUCCESS -->

          <div
            v-if="profileMessage"
            class="success-message"
          >

            <i
              class="bi bi-check-circle-fill"
            ></i>

            {{ profileMessage }}

          </div>


          <!-- ERROR -->

          <div
            v-if="profileError"
            class="error-message"
          >

            <i
              class="bi bi-exclamation-circle-fill"
            ></i>

            {{ profileError }}

          </div>


          <div class="card-actions">

            <button
              class="primary-button"
              :disabled="profileLoading"
              @click="saveProfile"
            >

              <span
                v-if="profileLoading"
                class="button-spinner"
              ></span>

              <i
                v-else
                class="bi bi-check2"
              ></i>

              {{
                profileLoading
                  ? 'Menyimpan...'
                  : 'Simpan Profile'
              }}

            </button>

          </div>

        </div>

      </div>


      <!-- ================================= -->
      <!-- ACCOUNT -->
      <!-- ================================= -->

      <div class="col-lg-5">

        <div
          class="budget-card account-info-card"
        >

          <div class="section-header">

            <div class="section-icon">

              <i
                class="bi bi-shield-check"
              ></i>

            </div>


            <div>

              <h5>
                Personal Account
              </h5>

              <span>
                Status akun kamu.
              </span>

            </div>

          </div>


          <div class="account-status">


            <div class="status-row">

              <span>
                Status
              </span>

              <strong
                class="status-active"
              >

                <i
                  class="bi bi-circle-fill"
                ></i>

                Aktif

              </strong>

            </div>


            <div class="status-row">

              <span>
                Account
              </span>

              <strong>
                Personal
              </strong>

            </div>


            <div class="status-row">

              <span>
                User ID
              </span>

              <strong>
                {{ userId }}
              </strong>

            </div>


            <div class="status-row">

              <span>
                Email
              </span>

              <strong
                class="status-email"
              >

                {{ profile.email || '-' }}

              </strong>

            </div>


          </div>

        </div>

      </div>


      <!-- ================================= -->
      <!-- APPEARANCE -->
      <!-- ================================= -->

      <div class="col-lg-6">

        <div
          class="budget-card settings-card"
        >

          <div class="section-header">

            <div class="section-icon">

              <i
                class="bi bi-palette"
              ></i>

            </div>


            <div>

              <h5>
                Appearance
              </h5>

              <span>
                Tampilan akan tersimpan ke akun kamu.
              </span>

            </div>

          </div>


          <!-- THEME -->

          <div class="setting-block">

            <label class="setting-label">
              Theme
            </label>


            <div class="theme-options">


              <button
                type="button"
                class="theme-option"
                :class="{
                  active:
                    theme === 'light'
                }"
                @click="
                  changeTheme('light')
                "
              >

                <i
                  class="bi bi-sun"
                ></i>

                <span>
                  Light
                </span>

              </button>


              <button
                type="button"
                class="theme-option"
                :class="{
                  active:
                    theme === 'dark'
                }"
                @click="
                  changeTheme('dark')
                "
              >

                <i
                  class="bi bi-moon-stars"
                ></i>

                <span>
                  Dark
                </span>

              </button>


              <button
                type="button"
                class="theme-option"
                :class="{
                  active:
                    theme === 'system'
                }"
                @click="
                  changeTheme('system')
                "
              >

                <i
                  class="bi bi-display"
                ></i>

                <span>
                  System
                </span>

              </button>


            </div>

          </div>


          <!-- ACCENT -->

          <div class="setting-block">

            <label class="setting-label">
              Accent Color
            </label>


            <div class="accent-options">

              <button
                v-for="color in accentColors"
                :key="color.name"
                type="button"
                class="accent-option"
                :class="{
                  active:
                    accent === color.name
                }"
                :title="color.label"
                @click="
                  changeAccent(color)
                "
              >

                <span
                  class="accent-dot"
                  :style="{
                    backgroundColor:
                      color.value
                  }"
                ></span>


                <i
                  v-if="
                    accent === color.name
                  "
                  class="bi bi-check-lg"
                ></i>

              </button>

            </div>

          </div>

        </div>

      </div>


      <!-- ================================= -->
      <!-- SECURITY -->
      <!-- ================================= -->

      <div class="col-lg-6">

        <div
          class="budget-card settings-card"
        >

          <div class="section-header">

            <div class="section-icon">

              <i
                class="bi bi-lock"
              ></i>

            </div>


            <div>

              <h5>
                Keamanan
              </h5>

              <span>
                Ubah password akun kamu.
              </span>

            </div>

          </div>


          <div class="form-field">

            <label>
              Password Saat Ini
            </label>

            <input
              v-model="
                passwordForm.currentPassword
              "
              type="password"
              placeholder="Password saat ini"
              autocomplete="current-password"
            />

          </div>


          <div class="form-field">

            <label>
              Password Baru
            </label>

            <input
              v-model="
                passwordForm.newPassword
              "
              type="password"
              placeholder="Minimal 6 karakter"
              autocomplete="new-password"
            />

          </div>


          <div class="form-field">

            <label>
              Konfirmasi Password
            </label>

            <input
              v-model="
                passwordForm.confirmPassword
              "
              type="password"
              placeholder="Ulangi password baru"
              autocomplete="new-password"
            />

          </div>


          <div
            v-if="passwordMessage"
            class="success-message"
          >

            <i
              class="bi bi-check-circle-fill"
            ></i>

            {{ passwordMessage }}

          </div>


          <div
            v-if="passwordError"
            class="error-message"
          >

            <i
              class="bi bi-exclamation-circle-fill"
            ></i>

            {{ passwordError }}

          </div>


          <div class="card-actions">

            <button
              class="primary-button"
              :disabled="passwordLoading"
              @click="changePassword"
            >

              <span
                v-if="passwordLoading"
                class="button-spinner"
              ></span>

              <i
                v-else
                class="bi bi-key"
              ></i>

              {{
                passwordLoading
                  ? 'Mengubah...'
                  : 'Ubah Password'
              }}

            </button>

          </div>

        </div>

      </div>


    </div>

  </div>

</template>


<style scoped>

.settings-page {

  width: 100%;

}


/* ========================================
   HEADER
======================================== */

.page-header h1 {

  margin: 0;

  color:
    var(--text-primary);

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
   CARDS
======================================== */

.settings-card,
.account-info-card {

  padding: 20px;

}


/* ========================================
   SECTION HEADER
======================================== */

.section-header {

  display: flex;

  align-items: center;

  gap: 11px;

  margin-bottom: 20px;

}


.section-icon {

  width: 40px;

  height: 40px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  border-radius: 11px;

  background:
    var(--accent-soft);

  color:
    var(--accent);

  font-size: 18px;

}


.section-header h5 {

  margin: 0;

  color:
    var(--text-primary);

  font-size: 13px;

  font-weight: 800;

}


.section-header span {

  display: block;

  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 10px;

}


/* ========================================
   PROFILE
======================================== */

.profile-preview {

  display: flex;

  align-items: center;

  gap: 12px;

  margin-bottom: 20px;

  padding: 13px;

  border:
    1px solid var(--border-color);

  border-radius: 11px;

  background:
    var(--bg-card-hover);

}


.profile-avatar {

  width: 48px;

  height: 48px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  border-radius: 14px;

  background:
    var(--accent-soft);

  color:
    var(--accent);

  font-size: 18px;

  font-weight: 800;

}


.profile-preview-info {

  display: flex;

  flex-direction: column;

  min-width: 0;

}


.profile-preview strong {

  color:
    var(--text-primary);

  font-size: 13px;

}


.profile-preview span {

  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;

  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 10px;

}


/* ========================================
   FORM
======================================== */

.form-grid {

  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 12px;

}


.form-field {

  margin-bottom: 13px;

}


.form-field label,
.setting-label {

  display: block;

  margin-bottom: 6px;

  color:
    var(--text-secondary);

  font-size: 10px;

  font-weight: 700;

}


.form-field input {

  width: 100%;

  height: 40px;

  padding:
    0 11px;

  outline: none;

  border:
    1px solid var(--border-color);

  border-radius: 9px;

  background:
    var(--bg-card);

  color:
    var(--text-primary);

  font-size: 11px;

  transition:
    border-color var(--transition),
    box-shadow var(--transition);

}


.form-field input::placeholder {

  color:
    var(--text-muted);

}


.form-field input:focus {

  border-color:
    var(--accent);

  box-shadow:
    0 0 0 3px
    var(--accent-soft);

}


/* ========================================
   ACTION
======================================== */

.card-actions {

  display: flex;

  justify-content: flex-end;

  margin-top: 4px;

}


.primary-button {

  height: 38px;

  display: inline-flex;

  align-items: center;

  justify-content: center;

  gap: 7px;

  padding:
    0 14px;

  border: none;

  border-radius: 9px;

  background:
    var(--accent);

  color: white;

  font-size: 10px;

  font-weight: 700;

  transition:
    opacity var(--transition),
    transform var(--transition);

}


.primary-button:hover:not(:disabled) {

  opacity: .9;

  transform:
    translateY(-1px);

}


.primary-button:disabled {

  opacity: .6;

  cursor: not-allowed;

}


.button-spinner {

  width: 12px;

  height: 12px;

  border:
    2px solid rgba(255,255,255,.35);

  border-top-color:
    white;

  border-radius: 50%;

  animation:
    settings-spin .7s linear infinite;

}


@keyframes settings-spin {

  to {

    transform:
      rotate(360deg);

  }

}


/* ========================================
   MESSAGE
======================================== */

.success-message,
.error-message {

  display: flex;

  align-items: center;

  gap: 7px;

  margin:
    3px 0 12px;

  padding:
    9px 10px;

  border-radius: 8px;

  font-size: 10px;

}


.success-message {

  background:
    rgba(34,197,94,.10);

  color:
    var(--success);

}


.error-message {

  background:
    rgba(239,68,68,.10);

  color:
    var(--danger);

}


/* ========================================
   ACCOUNT
======================================== */

.account-status {

  display: flex;

  flex-direction: column;

}


.status-row {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 10px;

  min-height: 43px;

  border-bottom:
    1px solid var(--border-color);

}


.status-row:last-child {

  border-bottom: none;

}


.status-row span {

  color:
    var(--text-muted);

  font-size: 10px;

}


.status-row strong {

  max-width: 65%;

  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;

  color:
    var(--text-primary);

  font-size: 10px;

}


.status-active {

  display: flex;

  align-items: center;

  gap: 5px;

  color:
    var(--success) !important;

}


.status-active i {

  font-size: 6px;

}


.status-email {

  text-align: right;

}


/* ========================================
   APPEARANCE
======================================== */

.setting-block {

  margin-bottom: 20px;

}


.setting-block:last-child {

  margin-bottom: 0;

}


.theme-options {

  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 8px;

}


.theme-option {

  min-height: 70px;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  gap: 6px;

  border:
    1px solid var(--border-color);

  border-radius: 10px;

  background:
    var(--bg-card);

  color:
    var(--text-secondary);

  transition:
    all var(--transition);

}


.theme-option i {

  font-size: 17px;

}


.theme-option span {

  font-size: 10px;

  font-weight: 700;

}


.theme-option:hover {

  border-color:
    var(--accent);

  color:
    var(--accent);

}


.theme-option.active {

  border-color:
    var(--accent);

  background:
    var(--accent-soft);

  color:
    var(--accent);

}


/* ========================================
   ACCENT
======================================== */

.accent-options {

  display: flex;

  flex-wrap: wrap;

  gap: 10px;

}


.accent-option {

  position: relative;

  width: 38px;

  height: 38px;

  display: flex;

  align-items: center;

  justify-content: center;

  border:
    2px solid transparent;

  border-radius: 10px;

  background:
    var(--bg-card-hover);

  cursor: pointer;

  transition:
    transform var(--transition),
    border-color var(--transition);

}


.accent-option:hover {

  transform:
    translateY(-1px);

}


.accent-dot {

  width: 22px;

  height: 22px;

  border-radius: 50%;

}


.accent-option i {

  position: absolute;

  color: white;

  font-size: 11px;

  text-shadow:
    0 1px 2px rgba(0,0,0,.3);

}


.accent-option.active {

  border-color:
    var(--text-primary);

}


/* ========================================
   RESPONSIVE
======================================== */

@media (max-width: 767.98px) {

  .form-grid {

    grid-template-columns: 1fr;

  }

}


@media (max-width: 575.98px) {

  .page-header h1 {

    font-size: 21px;

  }


  .settings-card,
  .account-info-card {

    padding: 16px;

  }


  .theme-options {

    grid-template-columns: 1fr;

  }


  .status-row strong {

    max-width: 55%;

  }

}



</style>