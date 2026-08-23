<script setup>

import {
  ref
} from 'vue'

import {
  useRoute,
  useRouter
} from 'vue-router'

import {
  useAuthStore
} from '../../stores/auth'


// ========================================
// ROUTER
// ========================================

const route =
  useRoute()

const router =
  useRouter()


// ========================================
// AUTH STORE
// ========================================

const authStore =
  useAuthStore()


// ========================================
// SIDEBAR STATE
// ========================================

const collapsed =
  ref(false)


// ========================================
// MENUS
// ========================================

const menus = [

  {
    section: 'MAIN',

    items: [

      {
        name: 'Dashboard',
        icon: 'bi-grid-1x2-fill',
        path: '/dashboard'
      }

    ]
  },


  {
    section: 'FINANCE',

    items: [

      {
        name: 'Pemasukan',
        icon: 'bi-arrow-down-left-circle',
        path: '/income'
      },

      {
        name: 'Pengeluaran',
        icon: 'bi-arrow-up-right-circle',
        path: '/expense'
      },

      {
  name: 'Budget',
  icon: 'bi-wallet2',
  path: '/budget'
},

{
  name: 'Tabungan',
  icon: 'bi-piggy-bank',
  path: '/savings'
},

      {
        name: 'Accounts',
        icon: 'bi-wallet2',
        path: '/accounts'
      }

    ]
  },


  {
    section: 'ANALYTICS',

    items: [

      {
        name: 'Laporan',
        icon: 'bi-bar-chart-line',
        path: '/reports'
      }

    ]
  },


  {
    section: 'SYSTEM',

    items: [

      {
        name: 'Kategori',
        icon: 'bi-tags',
        path: '/categories'
      },

      {
        name: 'Pengaturan',
        icon: 'bi-gear',
        path: '/settings'
      }

    ]
  }

]


// ========================================
// ACTIVE MENU
// ========================================

function isActive(path) {

  return route.path === path

}


// ========================================
// LOGOUT
// ========================================

function logout() {

  // --------------------------------------
  // Reset authentication state
  // --------------------------------------

  authStore.logout()


  // --------------------------------------
  // Redirect ke login
  // --------------------------------------

  router.replace({
    name: 'login'
  })

}

</script>


<template>

  <aside
    class="app-sidebar"
    :class="{
      collapsed
    }"
  >

    <!-- ================================= -->
    <!-- LOGO -->
    <!-- ================================= -->

    <div class="sidebar-logo">

      <div class="logo-icon">

        <i class="bi bi-pie-chart-fill"></i>

      </div>


      <div
        v-if="!collapsed"
        class="logo-text"
      >

        <strong>
          Monthly
        </strong>

        <span>
          Budget
        </span>

      </div>

    </div>


    <!-- ================================= -->
    <!-- MENU -->
    <!-- ================================= -->

    <nav class="sidebar-nav">

      <div
        v-for="group in menus"
        :key="group.section"
        class="menu-group"
      >

        <div
          v-if="!collapsed"
          class="menu-section"
        >

          {{ group.section }}

        </div>


        <RouterLink
          v-for="item in group.items"
          :key="item.path"
          :to="item.path"
          class="sidebar-link"
          :class="{
            active:
              isActive(item.path)
          }"
        >

          <i
            class="bi"
            :class="item.icon"
          ></i>


          <span
            v-if="!collapsed"
          >

            {{ item.name }}

          </span>

        </RouterLink>

      </div>

    </nav>


    <!-- ================================= -->
    <!-- BOTTOM -->
    <!-- ================================= -->

    <div class="sidebar-bottom">

      <!-- COLLAPSE -->

      <button
        type="button"
        class="sidebar-collapse"
        @click="
          collapsed =
            !collapsed
        "
      >

        <i
          class="bi"
          :class="
            collapsed
              ? 'bi-chevron-right'
              : 'bi-chevron-left'
          "
        ></i>


        <span
          v-if="!collapsed"
        >

          Collapse

        </span>

      </button>


      <!-- LOGOUT -->

      <button
        type="button"
        class="sidebar-logout"
        @click="logout"
      >

        <i
          class="bi bi-box-arrow-right"
        ></i>


        <span
          v-if="!collapsed"
        >

          Logout

        </span>

      </button>

    </div>

  </aside>

</template>


<style scoped>

.app-sidebar {

  position: fixed;

  left: 0;

  top: 0;

  bottom: 0;

  width: 260px;

  z-index: 1000;

  display: flex;

  flex-direction: column;

  padding:
    22px 14px;

  background:
    var(--bg-sidebar);

  border-right:
    1px solid var(--border-color);

  transition:
    width 220ms ease,
    background var(--transition);

}


.app-sidebar.collapsed {

  width: 78px;

}


/* ========================================
   LOGO
======================================== */

.sidebar-logo {

  height: 48px;

  display: flex;

  align-items: center;

  gap: 11px;

  padding:
    0 8px;

  margin-bottom:
    28px;

}


.logo-icon {

  width: 38px;

  height: 38px;

  flex-shrink: 0;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 11px;

  background:
    var(--accent-soft);

  color:
    var(--accent);

  font-size: 18px;

}


.logo-text {

  display: flex;

  flex-direction: column;

  line-height: 1.05;

}


.logo-text strong {

  font-size: 15px;

  color:
    var(--text-primary);

}


.logo-text span {

  color:
    var(--accent);

  font-size: 12px;

  font-weight: 700;

}


/* ========================================
   NAVIGATION
======================================== */

.sidebar-nav {

  flex: 1;

  overflow-y: auto;

}


.menu-group {

  margin-bottom:
    22px;

}


.menu-section {

  padding:
    0 12px 8px;

  color:
    var(--text-muted);

  font-size: 10px;

  font-weight: 800;

  letter-spacing:
    1.2px;

}


.sidebar-link {

  height: 43px;

  display: flex;

  align-items: center;

  gap: 12px;

  padding:
    0 12px;

  margin:
    3px 0;

  border-radius:
    10px;

  color:
    var(--text-secondary);

  font-size: 13px;

  font-weight: 600;

  transition:
    all var(--transition);

}


.sidebar-link i {

  width: 22px;

  text-align: center;

  font-size: 17px;

}


.sidebar-link:hover {

  background:
    var(--bg-card-hover);

  color:
    var(--text-primary);

}


.sidebar-link.active {

  background:
    var(--accent-soft);

  color:
    var(--accent);

}


/* ========================================
   BOTTOM
======================================== */

.sidebar-bottom {

  padding-top:
    12px;

  border-top:
    1px solid var(--border-color);

}


.sidebar-collapse,
.sidebar-logout {

  width: 100%;

  height: 40px;

  border: none;

  background:
    transparent;

  color:
    var(--text-secondary);

  display: flex;

  align-items: center;

  gap: 12px;

  padding:
    0 12px;

  border-radius:
    9px;

  cursor: pointer;

}


.sidebar-collapse:hover {

  background:
    var(--bg-card-hover);

  color:
    var(--text-primary);

}


.sidebar-logout {

  color:
    #ef6b6b;

}


.sidebar-logout:hover {

  background:
    rgba(
      239,
      68,
      68,
      0.08
    );

}


/* ========================================
   MOBILE
======================================== */

@media (max-width: 991.98px) {

  .app-sidebar {

    display: none;

  }

}

</style>