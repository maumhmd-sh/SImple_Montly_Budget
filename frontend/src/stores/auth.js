import {
  computed,
  ref
} from 'vue'

import {
  defineStore
} from 'pinia'

import {
  login as loginApi,
  register as registerApi,
  getCurrentUser
} from '../services/authService'


export const useAuthStore =
  defineStore(
    'auth',
    () => {

      // ========================================
      // STATE
      // ========================================

      const token =
        ref(
          localStorage.getItem(
            'monthly_budget_token'
          )
        )


      let storedUser = null

      try {

        storedUser =
          JSON.parse(
            localStorage.getItem(
              'monthly_budget_user'
            ) || 'null'
          )

      } catch {

        storedUser = null

        localStorage.removeItem(
          'monthly_budget_user'
        )

      }


      const user =
        ref(storedUser)


      const loading =
        ref(false)


      const isAuthenticated =
        computed(
          () => Boolean(token.value)
        )


      // ========================================
      // LOGIN
      // ========================================

      async function login(
        email,
        password
      ) {

        loading.value = true

        try {

          const response =
            await loginApi({
              email,
              password
            })


          // ====================================
          // RESPONSE BACKEND
          // ====================================
          //
          // {
          //   token: "...",
          //   user: {
          //     id: 4,
          //     name: "...",
          //     email: "..."
          //   }
          // }
          //
          // authService sudah melakukan:
          //
          // return response.data
          //
          // Jadi TIDAK menggunakan
          // response.data.token lagi.
          // ====================================


          if (!response?.token) {

            throw new Error(
              'Token login tidak ditemukan.'
            )

          }


          if (!response?.user) {

            throw new Error(
              'Data user login tidak ditemukan.'
            )

          }


          // Simpan token

          token.value =
            response.token


          // Simpan user

          user.value =
            response.user


          // Simpan ke localStorage

          localStorage.setItem(
            'monthly_budget_token',
            token.value
          )


          localStorage.setItem(
            'monthly_budget_user',
            JSON.stringify(
              user.value
            )
          )


          return response

        } finally {

          loading.value = false

        }

      }


      // ========================================
      // REGISTER
      // ========================================

      async function register(
        name,
        email,
        password
      ) {

        loading.value = true

        try {

          const response =
            await registerApi({
              name,
              email,
              password
            })


          /*
           * REGISTER TIDAK LOGIN OTOMATIS
           *
           * Backend memang mengembalikan token
           * setelah register, tetapi flow frontend
           * kita sengaja TIDAK menyimpan token.
           *
           * User harus login sendiri setelah akun
           * berhasil dibuat.
           */


          return response

        } finally {

          loading.value = false

        }

      }


      // ========================================
      // GET CURRENT USER
      // ========================================

      async function fetchUser() {

        if (!token.value) {

          return null

        }


        try {

          const response =
            await getCurrentUser()


          /*
           * authService mengembalikan
           * response.data secara langsung.
           *
           * Jika endpoint /auth/me mengembalikan:
           *
           * {
           *   user: {...}
           * }
           *
           * maka gunakan response.user.
           */

          user.value =
            response?.user || null


          if (!user.value) {

            throw new Error(
              'Data user tidak ditemukan.'
            )

          }


          localStorage.setItem(
            'monthly_budget_user',
            JSON.stringify(
              user.value
            )
          )


          return user.value

        } catch (error) {

          console.error(
            'FETCH USER ERROR:',
            error
          )


          logout()

          return null

        }

      }


      // ========================================
      // LOGOUT
      // ========================================

      function logout() {

        token.value = null

        user.value = null


        localStorage.removeItem(
          'monthly_budget_token'
        )


        localStorage.removeItem(
          'monthly_budget_user'
        )

      }


      // ========================================
      // RETURN
      // ========================================

      return {

        token,
        user,
        loading,
        isAuthenticated,

        login,
        register,
        fetchUser,
        logout

      }

    }
  )