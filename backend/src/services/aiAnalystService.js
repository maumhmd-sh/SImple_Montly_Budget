import api from './api'

export async function getFinancialAnalysis(month) {
  const response = await api.get(
    '/ai/financial-analysis',
    {
      params: {
        month
      }
    }
  )

  return response.data
}