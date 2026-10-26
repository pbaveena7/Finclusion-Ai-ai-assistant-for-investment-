import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

export const getHealth = () => api.get('/health')

export const sendChatMessage = (message, sessionId, language = 'en') =>
  api.post('/chat', { message, session_id: sessionId, language })

export const getChatHistory = (sessionId) =>
  api.get('/chat/history', { params: { session_id: sessionId } })

export const calcSIP = (data) => api.post('/calculators/sip', data)
export const calcSWP = (data) => api.post('/calculators/swp', data)
export const calcPPF = (data) => api.post('/calculators/ppf', data)
export const calcNPS = (data) => api.post('/calculators/nps', data)

export const getNews = (q, pageSize = 10) =>
  api.get('/news', { params: { q, page_size: pageSize } })

export const checkFraud = (text) => api.post('/fraud/check', { text })

export const getProfile = () => api.get('/profile')
export const updateProfile = (data) => api.put('/profile', data)
export const getProfileSummary = () => api.get('/profile/summary')

export const getGoals = () => api.get('/goals')
export const createGoal = (data) => api.post('/goals', data)
export const updateGoal = (id, data) => api.put(`/goals/${id}`, data)
export const deleteGoal = (id) => api.delete(`/goals/${id}`)

export const getForecast = (symbol) => api.post('/forecaster/forecast', { symbol })
export const getStockQuote = (symbol) => api.get(`/forecaster/quote/${symbol}`)

export const registerUser = (data) => api.post('/auth/register', data)
export const loginUser = (data) => api.post('/auth/login', data)

export const recommendStocks = (data) => api.post('/recommender/recommend', data)

export default api
