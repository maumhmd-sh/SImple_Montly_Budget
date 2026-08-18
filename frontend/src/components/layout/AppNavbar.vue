<script setup>

import {
  onMounted,
  onBeforeUnmount,
  ref
} from 'vue'

import LiveClock
  from '../common/LiveClock.vue'

import api
  from '../../services/api'


// ========================================
// USER
// ========================================

const user = ref({

  name: 'Mola',

  email: ''

})


function loadUser() {

  const savedUser =
    localStorage.getItem(
      'monthly_budget_user'
    )


  if (!savedUser) {

    user.value = {

      name: 'Mola',

      email: ''

    }

    return

  }


  try {

    const parsedUser =
      JSON.parse(
        savedUser
      )


    user.value = {

      name:
        parsedUser?.name ||
        'Mola',

      email:
        parsedUser?.email ||
        ''

    }

  } catch {

    user.value = {

      name: 'Mola',

      email: ''

    }

  }

}


function handleUserUpdated() {

  loadUser()

}


// ========================================
// THEME
// ========================================

const darkMode =
  ref(false)


function applyTheme(
  theme
) {

  /*
   * Theme "system" mengikuti
   * pengaturan OS.
   */

  if (
    theme === 'system'
  ) {

    const systemDark =
      window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches


    document.documentElement
      .setAttribute(
        'data-theme',
        systemDark
          ? 'dark'
          : 'light'
      )


    darkMode.value =
      systemDark

  } else {

    document.documentElement
      .setAttribute(
        'data-theme',
        theme
      )


    darkMode.value =
      theme === 'dark'

  }


  localStorage.setItem(
    'monthly_budget_theme',
    theme
  )

}


function toggleTheme() {

  applyTheme(

    darkMode.value
      ? 'light'
      : 'dark'

  )

}


// ========================================
// SYSTEM THEME CHANGE
// ========================================

let systemThemeMedia =
  null


function handleSystemThemeChange() {

  const savedTheme =
    localStorage.getItem(
      'monthly_budget_theme'
    )


  if (
    savedTheme !== 'system'
  ) {

    return

  }


  applyTheme(
    'system'
  )

}


// ========================================
// NOTIFICATIONS
// ========================================

const notifications =
  ref([])


const unreadCount =
  ref(0)


const notificationOpen =
  ref(false)


const notificationLoading =
  ref(false)


const notificationActionLoading =
  ref(false)


let notificationInterval =
  null


// ========================================
// LOAD NOTIFICATIONS
// ========================================

async function loadNotifications() {

  const token =
    localStorage.getItem(
      'monthly_budget_token'
    )


  if (!token) {

    notifications.value = []

    unreadCount.value = 0

    return

  }


  try {

    notificationLoading.value =
      true


    const response =
      await api.get(
        '/notifications'
      )


    notifications.value =
      response.data?.notifications ||
      []


  } catch (error) {

    console.error(

      'LOAD NOTIFICATIONS ERROR:',

      error

    )

  } finally {

    notificationLoading.value =
      false

  }

}


// ========================================
// LOAD UNREAD COUNT
// ========================================

async function loadUnreadCount() {

  const token =
    localStorage.getItem(
      'monthly_budget_token'
    )


  if (!token) {

    unreadCount.value = 0

    return

  }


  try {

    const response =
      await api.get(
        '/notifications/unread-count'
      )


    unreadCount.value =
      Number(
        response.data?.count ||
        0
      )


  } catch (error) {

    console.error(

      'LOAD UNREAD COUNT ERROR:',

      error

    )

  }

}


// ========================================
// LOAD NOTIFICATION DATA
// ========================================

async function refreshNotifications() {

  await Promise.all([

    loadNotifications(),

    loadUnreadCount()

  ])

}


// ========================================
// TOGGLE NOTIFICATION
// ========================================

async function toggleNotifications() {

  notificationOpen.value =
    !notificationOpen.value


  if (
    notificationOpen.value
  ) {

    await refreshNotifications()

  }

}


// ========================================
// CLOSE NOTIFICATION
// ========================================

function closeNotifications() {

  notificationOpen.value =
    false

}


// ========================================
// MARK ONE AS READ
// ========================================

async function markAsRead(
  notification
) {

  if (
    !notification ||
    notification.is_read
  ) {

    return

  }


  try {

    await api.put(

      `/notifications/${notification.id}/read`

    )


    notification.is_read =
      true


    unreadCount.value =
      Math.max(

        0,

        unreadCount.value - 1

      )


  } catch (error) {

    console.error(

      'MARK NOTIFICATION READ ERROR:',

      error

    )

  }

}


// ========================================
// MARK ALL AS READ
// ========================================

async function markAllAsRead() {

  if (
    unreadCount.value <= 0
  ) {

    return

  }


  try {

    notificationActionLoading.value =
      true


    await api.put(
      '/notifications/read-all'
    )


    notifications.value =
      notifications.value.map(
        notification => ({

          ...notification,

          is_read: true

        })
      )


    unreadCount.value = 0


  } catch (error) {

    console.error(

      'MARK ALL NOTIFICATIONS READ ERROR:',

      error

    )

  } finally {

    notificationActionLoading.value =
      false

  }

}


// ========================================
// NOTIFICATION TYPE ICON
// ========================================

function getNotificationIcon(
  type
) {

  const icons = {

    profile:
      'bi-person-check-fill',

    password:
      'bi-shield-lock-fill',

    theme:
      'bi-palette-fill',

    account:
      'bi-wallet2',

    income:
      'bi-arrow-down-left-circle-fill',

    expense:
      'bi-arrow-up-right-circle-fill',

    budget:
      'bi-pie-chart-fill',

    transaction:
      'bi-receipt-cutoff',

    system:
      'bi-info-circle-fill',

    security:
      'bi-shield-check',

    admin:
      'bi-megaphone-fill'

  }


  return (

    icons[type] ||

    'bi-bell-fill'

  )

}


// ========================================
// NOTIFICATION TIME
// ========================================

function formatNotificationTime(
  date
) {

  if (!date) {

    return ''

  }


  const timestamp =
    new Date(
      date
    ).getTime()


  if (
    Number.isNaN(
      timestamp
    )
  ) {

    return ''

  }


  const now =
    Date.now()


  const diff =
    Math.max(

      0,

      now - timestamp

    )


  const seconds =
    Math.floor(
      diff / 1000
    )


  if (
    seconds < 10
  ) {

    return 'Baru saja'

  }


  if (
    seconds < 60
  ) {

    return `${seconds} detik lalu`

  }


  const minutes =
    Math.floor(
      seconds / 60
    )


  if (
    minutes < 60
  ) {

    return `${minutes} menit lalu`

  }


  const hours =
    Math.floor(
      minutes / 60
    )


  if (
    hours < 24
  ) {

    return `${hours} jam lalu`

  }


  const days =
    Math.floor(
      hours / 24
    )


  if (
    days < 7
  ) {

    return `${days} hari lalu`

  }


  return new Date(
    date
  ).toLocaleDateString(
    'id-ID',
    {

      day: 'numeric',

      month: 'short',

      year: 'numeric'

    }
  )

}


// ========================================
// CLICK OUTSIDE
// ========================================

function handleDocumentClick(
  event
) {

  const target =
    event.target


  if (
    target.closest(
      '.notification-wrapper'
    )
  ) {

    return

  }


  closeNotifications()

}


// ========================================
// MOUNT
// ========================================

onMounted(() => {

  // --------------------------------------
  // LOAD USER
  // --------------------------------------

  loadUser()


  // --------------------------------------
  // LOAD THEME
  // --------------------------------------

  const savedTheme =
    localStorage.getItem(
      'monthly_budget_theme'
    )


  if (savedTheme) {

    applyTheme(
      savedTheme
    )

  } else {

    const systemDark =
      window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches


    applyTheme(

      systemDark
        ? 'dark'
        : 'light'

    )

  }


  // --------------------------------------
  // INITIAL NOTIFICATIONS
  // --------------------------------------

  refreshNotifications()


  // --------------------------------------
  // USER UPDATE EVENT
  // --------------------------------------

  window.addEventListener(

    'monthly-budget-user-updated',

    handleUserUpdated

  )


  // --------------------------------------
  // SYSTEM THEME
  // --------------------------------------

  systemThemeMedia =
    window.matchMedia(
      '(prefers-color-scheme: dark)'
    )


  if (
    systemThemeMedia.addEventListener
  ) {

    systemThemeMedia.addEventListener(

      'change',

      handleSystemThemeChange

    )

  } else {

    systemThemeMedia.addListener(

      handleSystemThemeChange

    )

  }


  // --------------------------------------
  // CLICK OUTSIDE
  // --------------------------------------

  document.addEventListener(

    'click',

    handleDocumentClick

  )


  // --------------------------------------
  // REFRESH NOTIFICATION
  // EVERY 30 SECONDS
  // --------------------------------------

  notificationInterval =
    window.setInterval(

      () => {

        loadUnreadCount()

      },

      30000

    )

})


// ========================================
// UNMOUNT
// ========================================

onBeforeUnmount(() => {

  window.removeEventListener(

    'monthly-budget-user-updated',

    handleUserUpdated

  )


  document.removeEventListener(

    'click',

    handleDocumentClick

  )


  if (
    notificationInterval
  ) {

    window.clearInterval(

      notificationInterval

    )

    notificationInterval =
      null

  }


  if (!systemThemeMedia) {

    return

  }


  if (
    systemThemeMedia.removeEventListener
  ) {

    systemThemeMedia.removeEventListener(

      'change',

      handleSystemThemeChange

    )

  } else {

    systemThemeMedia.removeListener(

      handleSystemThemeChange

    )

  }

})

</script>


<template>

  <header class="app-navbar">


    <!-- ================================= -->
    <!-- LEFT -->
    <!-- ================================= -->

    <div class="navbar-left">

      <div>

        <div class="navbar-title">

          Monthly Budget

        </div>


        <div class="navbar-subtitle">

          Kelola keuangan dengan lebih teratur

        </div>

      </div>

    </div>


    <!-- ================================= -->
    <!-- RIGHT -->
    <!-- ================================= -->

    <div class="navbar-right">


      <!-- ================================= -->
      <!-- CLOCK -->
      <!-- ================================= -->

      <LiveClock />


      <!-- ================================= -->
      <!-- THEME -->
      <!-- ================================= -->

      <button

        type="button"

        class="navbar-icon-button"

        title="Ganti tema"

        aria-label="Ganti tema"

        @click="toggleTheme"

      >

        <i

          class="bi"

          :class="

            darkMode

              ? 'bi-sun-fill'

              : 'bi-moon-stars-fill'

          "

        ></i>

      </button>


      <!-- ================================= -->
      <!-- NOTIFICATION -->
      <!-- ================================= -->

      <div
        class="notification-wrapper"
      >

        <button

          type="button"

          class="navbar-icon-button notification-button"

          title="Notifikasi"

          aria-label="Notifikasi"

          :aria-expanded="
            notificationOpen
          "

          @click.stop="
            toggleNotifications
          "

        >

          <i class="bi bi-bell"></i>


          <!-- UNREAD BADGE -->

          <span

            v-if="
              unreadCount > 0
            "

            class="notification-badge"

          >

            {{
              unreadCount > 99
                ? '99+'
                : unreadCount
            }}

          </span>

        </button>


        <!-- ================================= -->
        <!-- NOTIFICATION DROPDOWN -->
        <!-- ================================= -->

        <Transition
          name="notification-dropdown"
        >

          <div

            v-if="
              notificationOpen
            "

            class="notification-dropdown"

            @click.stop

          >

            <!-- HEADER -->

            <div
              class="notification-header"
            >

              <div>

                <strong>
                  Notifications
                </strong>

                <span>
                  Aktivitas akun kamu
                </span>

              </div>


              <button

                v-if="
                  unreadCount > 0
                "

                type="button"

                class="notification-read-all"

                :disabled="
                  notificationActionLoading
                "

                @click="
                  markAllAsRead
                "

              >

                <i
                  class="bi bi-check2-all"
                ></i>

                Tandai dibaca

              </button>

            </div>


            <!-- BODY -->

            <div
              class="notification-list"
            >

              <!-- LOADING -->

              <div

                v-if="
                  notificationLoading
                "

                class="notification-state"

              >

                <i
                  class="bi bi-arrow-repeat spin"
                ></i>

                Memuat notifikasi...

              </div>


              <!-- EMPTY -->

              <div

                v-else-if="
                  notifications.length === 0
                "

                class="notification-state"

              >

                <div
                  class="notification-empty-icon"
                >

                  <i
                    class="bi bi-bell-slash"
                  ></i>

                </div>


                <strong>
                  Belum ada notifikasi
                </strong>


                <span>
                  Aktivitas akun kamu akan muncul di sini.
                </span>

              </div>


              <!-- NOTIFICATIONS -->

              <button

                v-else

                v-for="
                  notification in notifications
                "

                :key="
                  notification.id
                "

                type="button"

                class="notification-item"

                :class="{
                  unread:
                    !notification.is_read
                }"

                @click="
                  markAsRead(notification)
                "

              >

                <!-- ICON -->

                <div

                  class="notification-item-icon"

                  :class="
                    `notification-type-${notification.type || 'system'}`
                  "

                >

                  <i

                    class="bi"

                    :class="
                      getNotificationIcon(
                        notification.type
                      )
                    "

                  ></i>

                </div>


                <!-- CONTENT -->

                <div
                  class="notification-item-content"
                >

                  <div
                    class="notification-item-title"
                  >

                    <strong>

                      {{
                        notification.title
                      }}

                    </strong>


                    <span
                      v-if="
                        !notification.is_read
                      "

                      class="unread-indicator"
                    ></span>

                  </div>


                  <p>

                    {{
                      notification.message
                    }}

                  </p>


                  <small>

                    {{
                      formatNotificationTime(
                        notification.createdAt ||
                        notification.created_at
                      )
                    }}

                  </small>

                </div>

              </button>

            </div>

          </div>

        </Transition>

      </div>


      <!-- ================================= -->
      <!-- USER -->
      <!-- ================================= -->

      <div
        class="navbar-user"
      >

        <!-- AVATAR -->

        <div
          class="user-avatar"
        >

          {{
            user.name
              ?.charAt(0)
              ?.toUpperCase() ||
            'M'
          }}

        </div>


        <!-- USER INFO -->

        <div
          class="user-info"
        >

          <strong>

            {{
              user.name ||
              'Mola'
            }}

          </strong>


          <small
            v-if="user.email"
          >

            {{ user.email }}

          </small>

        </div>

      </div>

    </div>

  </header>

</template>


<style scoped>

.app-navbar {

  min-height: 76px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 20px;

  padding:
    0 28px;

  position: sticky;

  top: 0;

  z-index: 900;

  background:
    var(--bg-navbar);

  backdrop-filter:
    blur(14px);

  border-bottom:
    1px solid var(--border-color);

}


/* ========================================
   LEFT
======================================== */

.navbar-left {

  min-width: 0;

}


.navbar-title {

  font-size: 17px;

  font-weight: 800;

  color:
    var(--text-primary);

}


.navbar-subtitle {

  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 11px;

}


/* ========================================
   RIGHT
======================================== */

.navbar-right {

  display: flex;

  align-items: center;

  gap: 12px;

  min-width: 0;

}


/* ========================================
   ICON BUTTON
======================================== */

.navbar-icon-button {

  position: relative;

  width: 38px;

  height: 38px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  border:
    1px solid var(--border-color);

  border-radius: 10px;

  background:
    var(--bg-card);

  color:
    var(--text-secondary);

  cursor: pointer;

  transition:
    color var(--transition),
    border-color var(--transition),
    background var(--transition),
    transform var(--transition);

}


.navbar-icon-button:hover {

  color:
    var(--accent);

  border-color:
    var(--accent);

  background:
    var(--accent-soft);

}


.navbar-icon-button:active {

  transform:
    scale(.96);

}


/* ========================================
   NOTIFICATION WRAPPER
======================================== */

.notification-wrapper {

  position: relative;

}


/* ========================================
   NOTIFICATION BADGE
======================================== */

.notification-badge {

  position: absolute;

  top: -4px;

  right: -4px;

  min-width: 17px;

  height: 17px;

  display: flex;

  align-items: center;

  justify-content: center;

  padding:
    0 4px;

  border:
    2px solid var(--bg-navbar);

  border-radius: 999px;

  background:
    var(--accent);

  color: #ffffff;

  font-size: 8px;

  font-weight: 800;

  line-height: 1;

}


/* ========================================
   NOTIFICATION DROPDOWN
======================================== */

.notification-dropdown {

  position: absolute;

  top: calc(100% + 12px);

  right: 0;

  width: 370px;

  max-width:
    calc(100vw - 32px);

  overflow: hidden;

  border:
    1px solid var(--border-color);

  border-radius: 16px;

  background:
    var(--bg-card);

  box-shadow:
    0 18px 50px rgba(0, 0, 0, .15);

  z-index: 1200;

}


/* ========================================
   DROPDOWN HEADER
======================================== */

.notification-header {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 12px;

  padding:
    16px 17px;

  border-bottom:
    1px solid var(--border-color);

}


.notification-header > div {

  display: flex;

  flex-direction: column;

  min-width: 0;

}


.notification-header strong {

  color:
    var(--text-primary);

  font-size: 13px;

  font-weight: 800;

}


.notification-header span {

  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 9px;

}


.notification-read-all {

  display: flex;

  align-items: center;

  gap: 5px;

  padding:
    6px 8px;

  border: 0;

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--accent);

  font-size: 9px;

  font-weight: 700;

  white-space: nowrap;

  cursor: pointer;

}


.notification-read-all:hover {

  background:
    var(--accent-soft);

}


.notification-read-all:disabled {

  opacity: .5;

  cursor: default;

}


/* ========================================
   NOTIFICATION LIST
======================================== */

.notification-list {

  max-height: 390px;

  overflow-y: auto;

}


/* ========================================
   NOTIFICATION ITEM
======================================== */

.notification-item {

  width: 100%;

  display: flex;

  align-items: flex-start;

  gap: 11px;

  padding:
    13px 16px;

  border: 0;

  border-bottom:
    1px solid var(--border-color);

  background:
    transparent;

  text-align: left;

  cursor: pointer;

  transition:
    background var(--transition);

}


.notification-item:last-child {

  border-bottom: 0;

}


.notification-item:hover {

  background:
    var(--accent-soft);

}


.notification-item.unread {

  background:
    color-mix(
      in srgb,
      var(--accent-soft) 55%,
      transparent
    );

}


/* ========================================
   NOTIFICATION ICON
======================================== */

.notification-item-icon {

  width: 34px;

  height: 34px;

  flex-shrink: 0;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 10px;

  background:
    var(--accent-soft);

  color:
    var(--accent);

  font-size: 13px;

}


/* ========================================
   NOTIFICATION CONTENT
======================================== */

.notification-item-content {

  flex: 1;

  min-width: 0;

}


.notification-item-title {

  display: flex;

  align-items: center;

  gap: 6px;

}


.notification-item-title strong {

  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;

  color:
    var(--text-primary);

  font-size: 11px;

  font-weight: 800;

}


.notification-item-content p {

  margin:
    4px 0 0;

  color:
    var(--text-secondary);

  font-size: 10px;

  line-height: 1.45;

}


.notification-item-content small {

  display: block;

  margin-top: 5px;

  color:
    var(--text-muted);

  font-size: 8px;

}


/* ========================================
   UNREAD INDICATOR
======================================== */

.unread-indicator {

  width: 6px;

  height: 6px;

  flex-shrink: 0;

  border-radius: 50%;

  background:
    var(--accent);

}


/* ========================================
   EMPTY / LOADING
======================================== */

.notification-state {

  min-height: 180px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-direction: column;

  gap: 7px;

  padding:
    25px;

  color:
    var(--text-muted);

  text-align: center;

}


.notification-state > strong {

  color:
    var(--text-primary);

  font-size: 11px;

}


.notification-state > span {

  max-width: 230px;

  font-size: 9px;

  line-height: 1.5;

}


.notification-empty-icon {

  width: 42px;

  height: 42px;

  display: flex;

  align-items: center;

  justify-content: center;

  margin-bottom: 3px;

  border-radius: 12px;

  background:
    var(--accent-soft);

  color:
    var(--accent);

  font-size: 17px;

}


.spin {

  animation:
    notification-spin 1s linear infinite;

}


@keyframes notification-spin {

  from {

    transform:
      rotate(0deg);

  }

  to {

    transform:
      rotate(360deg);

  }

}


/* ========================================
   DROPDOWN TRANSITION
======================================== */

.notification-dropdown-enter-active,
.notification-dropdown-leave-active {

  transition:
    opacity .18s ease,
    transform .18s ease;

}


.notification-dropdown-enter-from,
.notification-dropdown-leave-to {

  opacity: 0;

  transform:
    translateY(-6px)
    scale(.98);

}


/* ========================================
   USER
======================================== */

.navbar-user {

  display: flex;

  align-items: center;

  gap: 9px;

  min-width: 0;

  padding-left: 5px;

}


/* ========================================
   AVATAR
======================================== */

.user-avatar {

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

  font-size: 14px;

  font-weight: 800;

}


/* ========================================
   USER INFO
======================================== */

.user-info {

  display: flex;

  flex-direction: column;

  min-width: 0;

  max-width: 180px;

  line-height: 1.15;

}


.user-info strong {

  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;

  color:
    var(--text-primary);

  font-size: 12px;

  font-weight: 800;

}


.user-info small {

  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;

  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 9px;

}


/* ========================================
   TABLET
======================================== */

@media (max-width: 991.98px) {

  .navbar-subtitle {

    display: none;

  }

}


/* ========================================
   MOBILE
======================================== */

@media (max-width: 767.98px) {

  .app-navbar {

    padding:
      0 16px;

  }


  .navbar-right {

    gap: 8px;

  }


  .user-info {

    max-width: 130px;

  }


  .notification-dropdown {

    right: -45px;

  }

}


/* ========================================
   SMALL MOBILE
======================================== */

@media (max-width: 575.98px) {

  .navbar-right {

    gap: 7px;

  }


  .navbar-user {

    padding-left: 0;

  }


  .user-info {

    display: none;

  }


  .user-avatar {

    width: 36px;

    height: 36px;

  }


  .notification-dropdown {

    position: fixed;

    top: 70px;

    right: 12px;

    left: 12px;

    width: auto;

    max-width: none;

  }

}

</style>