import axios from 'axios'

// If VITE_API_URL is set (e.g. in Render deployment), use it. Otherwise, use /api for local Vite proxy.
const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API Error:', err.response?.status, err.message)
    return Promise.reject(err)
  }
)

export const getPanchayats = () => apiClient.get('/panchayats')
export const getForecast = (panchayatId, days = 7, crop = null) =>
  apiClient.get(`/forecast/${panchayatId}`, { params: { days, ...(crop && { crop }) } })
export const getMapData = (variable, date) =>
  apiClient.get('/map', { params: { variable, date } })
export const getMetrics = () => apiClient.get('/metrics')
export const getMonsoon = (panchayatId) => apiClient.get(`/monsoon/${panchayatId}`)
export const getCompare = (panchayatId) => apiClient.get(`/compare/${panchayatId}`)

export const predictDisease = (formData) => apiClient.post('/disease-predict', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const predictPest = (formData) => apiClient.post('/pest-predict', formData, { headers: { 'Content-Type': 'multipart/form-data' } })

export default apiClient
