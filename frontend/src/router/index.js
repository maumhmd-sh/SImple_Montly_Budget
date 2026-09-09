import {
  createRouter,
  createWebHistory
} from 'vue-router'

import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DashboardView from '../views/DashboardView.vue'
import AccountsView from '../views/AccountsView.vue'
import IncomeView from '../views/IncomeView.vue'
import ExpenseView from '../views/ExpenseView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import BudgetView from '../views/BudgetView.vue'
import ReportsView from '../views/ReportsView.vue'
import SettingsView from '../views/SettingsView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import SavingsView from '../views/SavingsView.vue'
import AIAnalystView from '../views/AIAnalystView.vue'

import api from '../services/api'


const routes = [

  // ========================================
  // ROOT
  // ========================================

  {
    path: '/',
    redirect: '/dashboard'
  },


  // ========================================
  // LOGIN
  // ========================================

  {
    path: '/login',
    name: 'login',
    component: LoginView,

    meta: {
      guest: true
    }
  },


  // ========================================
  // REGISTER
  // ========================================

  {
    path: '/register',
    name: 'register',
    component: RegisterView,

    meta: {
      guest: true
    }
  },


  // ========================================
  // DASHBOARD
  // ========================================

  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,

    meta: {
      requiresAuth: true
    }
  },


  // ========================================
  // ACCOUNTS
  // ========================================

  {
    path: '/accounts',
    name: 'accounts',
    component: AccountsView,

    meta: {
      requiresAuth: true
    }
  },

  // ========================================
// SAVINGS
// ========================================

{
  path: '/savings',
  name: 'savings',
  component: SavingsView,

  meta: {
    requiresAuth: true
  }
},


  // ========================================
  // INCOME
  // ========================================

  {
    path: '/income',
    name: 'income',
    component: IncomeView,

    meta: {
      requiresAuth: true
    }
  },


  // ========================================
  // EXPENSE
  // ========================================

  {
    path: '/expense',
    name: 'expense',
    component: ExpenseView,

    meta: {
      requiresAuth: true
    }
  },


  // ========================================
  // CATEGORIES
  // ========================================

  {
    path: '/categories',
    name: 'categories',
    component: CategoriesView,

    meta: {
      requiresAuth: true
    }
  },


  // ========================================
  // BUDGET
  // ========================================

  {
    path: '/budget',
    name: 'budget',
    component: BudgetView,

    meta: {
      requiresAuth: true
    }
  },


  // ========================================
  // REPORTS
  // ========================================

  {
    path: '/reports',
    name: 'reports',
    component: ReportsView,

    meta: {
      requiresAuth: true
    }
  },
  {
  path: '/ai-analyst',
  name: 'ai-analyst',
  component: AIAnalystView,
  meta: {
    requiresAuth: true
  }
},


  // ========================================
  // SETTINGS
  // ========================================

{
  path: '/settings',
  name: 'settings',
  component: SettingsView,

  meta: {
    requiresAuth: true
  }
},



{
  path: '/:pathMatch(.*)*',
  name: 'not-found',
  component: NotFoundView
}

]


const router =
  createRouter({

    history:
      createWebHistory(),

    routes,

    scrollBehavior() {

      return {
        top: 0
      }

    }

  })


// ========================================
// AUTH GUARD
// ========================================

router.beforeEach(
  async (to) => {

    const token =
      localStorage.getItem(
        'monthly_budget_token'
      )


    // ======================================
    // PROTECTED ROUTE
    // ======================================

    if (
      to.meta.requiresAuth
    ) {

      // ------------------------------------
      // NO TOKEN
      // ------------------------------------

      if (!token) {

        return {
          name: 'login'
        }

      }


      // ------------------------------------
      // VALIDATE TOKEN WITH BACKEND
      // ------------------------------------

      try {

        await api.get(
          '/auth/me'
        )


        // Token valid
        return true

      } catch (error) {

        console.warn(
          'AUTH GUARD: Session tidak valid.'
        )


        // ----------------------------------
        // CLEAN AUTH DATA
        // ----------------------------------

        localStorage.removeItem(
          'monthly_budget_token'
        )

        localStorage.removeItem(
          'monthly_budget_user'
        )


        // ----------------------------------
        // REDIRECT LOGIN
        // ----------------------------------

        return {
          name: 'login',
          query: {
            redirect: to.fullPath
          }
        }

      }

    }


    // ======================================
    // GUEST ROUTE
    // ======================================

    if (
      to.meta.guest &&
      token
    ) {

      // ------------------------------------
      // VALIDATE EXISTING TOKEN
      // ------------------------------------

      try {

        await api.get(
          '/auth/me'
        )


        // Token valid
        return {
          name: 'dashboard'
        }

      } catch {

        // Token ternyata invalid.
        // Bersihkan supaya user bisa login.

        localStorage.removeItem(
          'monthly_budget_token'
        )

        localStorage.removeItem(
          'monthly_budget_user'
        )

        return true

      }

    }


    return true

  }
)


export default router