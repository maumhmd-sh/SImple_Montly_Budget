<script setup>

import { ref } from 'vue'

import { useRouter } from 'vue-router'

import { useAuthStore } from '../stores/auth'


const router = useRouter()

const auth = useAuthStore()


// ========================================
// FORM
// ========================================

const email = ref('')

const password = ref('')


// ========================================
// STATE
// ========================================

const error = ref('')


// ========================================
// LOGIN
// ========================================

async function handleLogin() {

  error.value = ''


  // ----------------------------------------
  // VALIDATION
  // ----------------------------------------

  if (
    !email.value.trim() ||
    !password.value
  ) {

    error.value =
      'Email dan password wajib diisi.'

    return

  }


  // ----------------------------------------
  // REQUEST
  // ----------------------------------------

  try {

    console.log(
      'LOGIN REQUEST:',
      {
        email: email.value
      }
    )


    const response =
      await auth.login(
        email.value.trim(),
        password.value
      )


    console.log(
      'LOGIN RESPONSE:',
      response
    )


    // ----------------------------------------
    // LOGIN BERHASIL
    // ----------------------------------------

    router.push('/dashboard')


  } catch (err) {

    console.error(
      'LOGIN ERROR:',
      err
    )


    error.value =
      err.response?.data?.message ||
      'Email atau password salah.'

  }

}

</script>


<template>

  <div class="auth-page">

    <div class="auth-card">

      <div class="auth-logo">

        <i class="bi bi-pie-chart-fill"></i>

      </div>


      <h1>
        Monthly Budget
      </h1>


      <p>
        Kelola keuangan kamu dengan lebih teratur.
      </p>


      <!-- ================================= -->
      <!-- ERROR -->
      <!-- ================================= -->

      <div
        v-if="error"
        class="alert alert-danger"
      >

        <i class="bi bi-exclamation-circle me-2"></i>

        {{ error }}

      </div>


      <!-- ================================= -->
      <!-- FORM -->
      <!-- ================================= -->

      <form
        @submit.prevent="handleLogin"
      >

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
            placeholder="••••••••"
            autocomplete="current-password"
          >

        </div>


        <!-- LOGIN BUTTON -->

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

            Memproses...

          </span>


          <span v-else>

            <i class="bi bi-box-arrow-in-right me-2"></i>

            Masuk

          </span>

        </button>

      </form>


      <!-- REGISTER -->

      <div class="auth-register">

        Belum punya akun?

        <RouterLink to="/register">

          Daftar

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

</style>