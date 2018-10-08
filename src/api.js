import axios from 'axios'
import Qs from 'qs'

const API_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000/'

export default axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  paramsSerializer: function (params) {
    return Qs.stringify(params, {arrayFormat: 'brackets'})
  }
})