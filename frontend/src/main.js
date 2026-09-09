import { createApp } from 'vue'

import { createPinia } from 'pinia'

import App from './App.vue'

import router from './router'


// Bootstrap

import 'bootstrap/dist/css/bootstrap.min.css'

import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import 'bootstrap-icons/font/bootstrap-icons.css'


// Custom CSS

import './assets/css/theme.css'

import './assets/css/main.css'

import './assets/css/responsive.css'

import './assets/css/animations.css'


// Create Vue App

const app = createApp(App)


// Pinia

app.use(createPinia())


// Vue Router

app.use(router)


// Mount

app.mount('#app')