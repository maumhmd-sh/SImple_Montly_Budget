import api from './api'


// ========================================
// REGISTER
// ========================================

export async function register(data) {

  const response = await api.post(
    '/auth/register',
    data
  )

  return response.data

}


// ========================================
// LOGIN
// ========================================

export async function login(data) {

  const response = await api.post(
    '/auth/login',
    data
  )

  return response.data

}


// ========================================
// CURRENT USER
// ========================================

export async function getCurrentUser() {

  const response = await api.get(
    '/auth/me'
  )

  return response.data

}