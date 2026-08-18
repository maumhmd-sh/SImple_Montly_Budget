<script setup>

import { ref } from 'vue'

import { useRouter } from 'vue-router'

import { useAuthStore } from '../stores/auth'


const router = useRouter()

const auth = useAuthStore()


// ================================
// FORM
// ================================

const name = ref('')

const email = ref('')

const password = ref('')

const passwordConfirmation = ref('')


// ================================
// STATE
// ================================

const error = ref('')

const success = ref('')


// ================================
// REGISTER
// ================================

async function handleRegister() {

  error.value = ''

  success.value = ''


  // -------------------------------
  // VALIDATION
  // -------------------------------

  if (
    !name.value.trim() ||
    !email.value.trim() ||
    !password.value
  ) {

    error.value =
      'Nama, email, dan password wajib diisi.'

    return

  }


  if (password.value.length < 6) {

    error.value =
      'Password minimal 6 karakter.'

    return

  }


  if (
    password.value !==
    passwordConfirmation.value
  ) {

    error.value =
      'Konfirmasi password tidak sama.'

    return

  }


  // -------------------------------
  // REQUEST
  // -------------------------------

  try {

    console.log(
      'REGISTER REQUEST:',
      {
        name: name.value,
        email: email.value
      }
    )


    const response =
      await auth.register(
        name.value.trim(),
        email.value.trim(),
        password.value
      )


    console.log(
      'REGISTER RESPONSE:',
      response
    )


    success.value =
  'Akun berhasil dibuat! Silakan login menggunakan akun kamu.'

// Kosongkan form setelah berhasil

name.value = ''

email.value = ''

password.value = ''

passwordConfirmation.value = ''


  } catch (err) {

    console.error(
      'REGISTER ERROR:',
      err
    )


    error.value =
      err.response?.data?.message ||
      err.message ||
      'Registrasi gagal.'

  }

}

</script>


<template>

  <div class="auth-page">

    <div class="auth-card">

      <div class="auth-logo">

        <i class="bi bi-person-plus-fill"></i>

      </div>


      <h1>
        Buat Akun
      </h1>


      <p>
        Mulai kelola budget bulanan kamu.
      </p>


      <!-- ================================= -->
      <!-- ERROR -->
      <!-- ================================= -->

      <div
        v-if="error"
        class="alert alert-danger"
      >

        {{ error }}

      </div>


      <!-- ================================= -->
      <!-- SUCCESS -->
      <!-- ================================= -->

<div
  v-if="success"
  class="register-success"
>

  <div class="success-icon">

    <i class="bi bi-check-lg"></i>

  </div>

  <div>

    <strong>
      Akun berhasil dibuat!
    </strong>

    <p>
      Silakan login menggunakan akun kamu.
    </p>

  </div>

</div>


      <!-- ================================= -->
      <!-- FORM -->
      <!-- ================================= -->

      <form
        @submit.prevent="handleRegister"
      >

        <!-- NAMA -->

        <div class="mb-3">

          <label>
            Nama
          </label>


          <input
            v-model="name"
            type="text"
            class="form-control"
            placeholder="Nama kamu"
            autocomplete="name"
          >

        </div>


        <!-- EMAIL -->

        <div class="mb-3">

          <label>
            Email
          </label>


          <input
            v-model="email"
            type="email"
            class="form-control"
            placeholder="nama@email.com"
            autocomplete="email"
          >

        </div>


        <!-- PASSWORD -->

        <div class="mb-3">

          <label>
            Password
          </label>


          <input
            v-model="password"
            type="password"
            class="form-control"
            placeholder="Minimal 6 karakter"
            autocomplete="new-password"
          >

        </div>


        <!-- KONFIRMASI PASSWORD -->

        <div class="mb-3">

          <label>
            Konfirmasi Password
          </label>


          <input
            v-model="passwordConfirmation"
            type="password"
            class="form-control"
            placeholder="Ulangi password"
            autocomplete="new-password"
          >

        </div>


        <!-- BUTTON -->

        <button
          type="submit"
          class="btn-budget w-100"
          :disabled="auth.loading"
        >

          <span
            v-if="auth.loading"
            class="spinner-border spinner-border-sm me-2"
          ></span>


          <span v-if="auth.loading">

            Membuat akun...

          </span>


          <span v-else>

            Daftar

          </span>

        </button>

      </form>


      <!-- LOGIN -->

      <div class="auth-register">

        Sudah punya akun?

        <RouterLink to="/login">

          Masuk

        </RouterLink>

      </div>


    </div>

  </div>

</template>


<style scoped>

.auth-page {

  min-height: 100vh;

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 20px;

  background:
    radial-gradient(
      circle at top right,
      var(--accent-soft),
      transparent 35%
    ),
    var(--bg-body);

}


.auth-card {

  width: 100%;

  max-width: 410px;

  padding: 35px;

  background:
    var(--bg-card);

  border:
    1px solid var(--border-color);

  border-radius:
    22px;

  box-shadow:
    var(--shadow-md);

}


.auth-logo {

  width: 52px;

  height: 52px;

  display: flex;

  align-items: center;

  justify-content: center;

  margin-bottom: 18px;

  border-radius: 15px;

  background:
    var(--accent-soft);

  color:
    var(--accent);

  font-size: 23px;

}


.auth-card h1 {

  font-size: 24px;

  font-weight: 800;

  margin: 0;

}


.auth-card > p {

  color:
    var(--text-secondary);

  font-size: 13px;

  margin:
    7px 0 25px;

}


.auth-card label {

  display: block;

  margin-bottom: 6px;

  font-size: 12px;

  font-weight: 700;

  color:
    var(--text-secondary);

}


.auth-register {

  margin-top: 20px;

  text-align: center;

  font-size: 12px;

  color:
    var(--text-secondary);

}


.auth-register a {

  color:
    var(--accent);

  font-weight: 700;

}

.register-success {

  display: flex;

  align-items: center;

  gap: 12px;

  margin-bottom: 20px;

  padding: 13px 14px;

  border-radius: 14px;

  background: rgba(34, 197, 94, 0.12);

  border: 1px solid rgba(34, 197, 94, 0.25);

  color: #22c55e;

}


.success-icon {

  width: 34px;

  height: 34px;

  flex-shrink: 0;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 50%;

  background: rgba(34, 197, 94, 0.15);

  font-size: 18px;

}


.register-success strong {

  display: block;

  font-size: 13px;

}


.register-success p {

  margin: 2px 0 0;

  font-size: 11px;

  opacity: 0.8;

}

</style>