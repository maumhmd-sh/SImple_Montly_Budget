<script setup>

import {
  computed,
  onMounted
} from 'vue'

import {
  useRoute
} from 'vue-router'

import AppSidebar
  from './components/layout/AppSidebar.vue'

import AppNavbar
  from './components/layout/AppNavbar.vue'

import AppFooter
  from './components/layout/AppFooter.vue'

import api
  from './services/api'


// ========================================
// ROUTE
// ========================================

const route =
  useRoute()


const isAuthPage =
  computed(() => {

    return [
      'login',
      'register'
    ].includes(
      route.name
    )

  })


// ========================================
// ACCENT COLORS
// ========================================

const accentColors = {

  blue: '#3b82f6',

  purple: '#8b5cf6',

  green: '#22c55e',

  orange: '#f97316',

  red: '#ef4444',

  pink: '#ec4899'

}


// ========================================
// DARKEN COLOR
// ========================================

function darkenColor(
  hex,
  amount = 18
) {

  const value =
    hex.replace(
      '#',
      ''
    )


  const num =
    parseInt(
      value,
      16
    )


  let r =
    (num >> 16) -
    amount


  let g =
    ((num >> 8) & 0xff) -
    amount


  let b =
    (num & 0xff) -
    amount


  r =
    Math.max(
      0,
      r
    )


  g =
    Math.max(
      0,
      g
    )


  b =
    Math.max(
      0,
      b
    )


  return `#${(
    (r << 16) |
    (g << 8) |
    b
  )
    .toString(16)
    .padStart(
      6,
      '0'
    )}`

}


// ========================================
// APPLY THEME
// ========================================

function applyTheme(
  theme
) {

  const allowedThemes = [

    'light',

    'dark',

    'system'

  ]


  if (
    !allowedThemes.includes(
      theme
    )
  ) {

    theme =
      'system'

  }


  // --------------------------------------
  // SAVE CACHE
  // --------------------------------------

  localStorage.setItem(

    'monthly_budget_theme',

    theme

  )


  // --------------------------------------
  // RESOLVE SYSTEM THEME
  // --------------------------------------

  let appliedTheme =
    theme


  if (
    theme === 'system'
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


  // --------------------------------------
  // APPLY THEME
  // --------------------------------------

  document.documentElement
    .setAttribute(

      'data-theme',

      appliedTheme

    )

}


// ========================================
// APPLY ACCENT
// ========================================

function applyAccent(
  accent
) {

  const color =
    accentColors[
      accent
    ]


  // --------------------------------------
  // INVALID COLOR
  // --------------------------------------

  if (!color) {

    return

  }


  // --------------------------------------
  // SAVE CACHE
  // --------------------------------------

  localStorage.setItem(

    'monthly_budget_accent',

    accent

  )


  // --------------------------------------
  // GENERATE HOVER COLOR
  // --------------------------------------

  const hoverColor =
    darkenColor(
      color,
      18
    )


  // --------------------------------------
  // MAIN ACCENT
  // --------------------------------------

  document.documentElement
    .style
    .setProperty(

      '--accent',

      color

    )


  // --------------------------------------
  // HOVER ACCENT
  // --------------------------------------

  document.documentElement
    .style
    .setProperty(

      '--accent-hover',

      hoverColor

    )


  // --------------------------------------
  // SOFT ACCENT
  // --------------------------------------

  document.documentElement
    .style
    .setProperty(

      '--accent-soft',

      `${color}18`

    )


  // --------------------------------------
  // LIGHT ACCENT
  // --------------------------------------

  document.documentElement
    .style
    .setProperty(

      '--accent-light',

      color

    )

}


// ========================================
// APPLY LOCAL CACHE FIRST
// ========================================

function applyCachedPreferences() {

  const savedTheme =
    localStorage.getItem(

      'monthly_budget_theme'

    )


  const savedAccent =
    localStorage.getItem(

      'monthly_budget_accent'

    )


  // --------------------------------------
  // THEME CACHE
  // --------------------------------------

  if (savedTheme) {

    applyTheme(
      savedTheme
    )

  }


  // --------------------------------------
  // ACCENT CACHE
  // --------------------------------------

  if (savedAccent) {

    applyAccent(
      savedAccent
    )

  }

}


// ========================================
// LOAD ACCOUNT PREFERENCES
// ========================================

async function loadAccountPreferences() {

  const token =
    localStorage.getItem(

      'monthly_budget_token'

    )


  // --------------------------------------
  // NOT LOGGED IN
  // --------------------------------------

  if (!token) {

    return

  }


  try {

    // ------------------------------------
    // GET CURRENT USER
    // ------------------------------------

    const response =
      await api.get(

        '/auth/me'

      )


    const user =
      response.data?.user


    if (!user) {

      return

    }


    // ------------------------------------
    // DATABASE PREFERENCE
    // ------------------------------------

    const accountTheme =
      user.theme ||
      'system'


    const accountAccent =
      user.accentColor ||
      'blue'


    // ------------------------------------
    // SAVE USER CACHE
    // ------------------------------------

    localStorage.setItem(

      'monthly_budget_user',

      JSON.stringify({

        id:
          user.id,

        name:
          user.name,

        email:
          user.email,

        theme:
          accountTheme,

        accentColor:
          accountAccent

      })

    )


    // ------------------------------------
    // APPLY THEME FROM DATABASE
    // ------------------------------------

    applyTheme(
      accountTheme
    )


    // ------------------------------------
    // APPLY ACCENT FROM DATABASE
    // ------------------------------------

    applyAccent(
      accountAccent
    )


  } catch (error) {

    console.error(

      'LOAD ACCOUNT PREFERENCES ERROR:',

      error

    )

    // ------------------------------------
    // Kalau API gagal, cache tetap aktif.
    // ------------------------------------

  }

}


// ========================================
// INITIALIZE APP
// ========================================

onMounted(() => {

  // --------------------------------------
  // STEP 1
  // Apply cache secepat mungkin
  // --------------------------------------

  applyCachedPreferences()


  // --------------------------------------
  // STEP 2
  // Sinkronisasi dengan database
  // --------------------------------------

  loadAccountPreferences()

})

</script>


<template>

  <!-- ============================================= -->
  <!-- AUTH PAGES -->
  <!-- ============================================= -->

  <template
    v-if="isAuthPage"
  >

    <RouterView />

  </template>


  <!-- ============================================= -->
  <!-- APPLICATION -->
  <!-- ============================================= -->

  <template
    v-else
  >

    <div
      class="app-shell"
    >

      <!-- ===================================== -->
      <!-- SIDEBAR -->
      <!-- ===================================== -->

      <AppSidebar />


      <!-- ===================================== -->
      <!-- MAIN -->
      <!-- ===================================== -->

      <div
        class="app-main"
      >

        <!-- =================================== -->
        <!-- NAVBAR -->
        <!-- =================================== -->

        <AppNavbar />


        <!-- =================================== -->
        <!-- CONTENT -->
        <!-- =================================== -->

        <main
          class="app-content"
        >

          <RouterView />

        </main>


        <!-- =================================== -->
        <!-- FOOTER -->
        <!-- =================================== -->

        <AppFooter />

      </div>

    </div>

  </template>

</template>