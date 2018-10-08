import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import store from './store'

import VueAxios from 'vue-axios'
import VueConfirm from 'vuetify-confirm'
import api from './api'

import moment from 'moment'
Vue.filter('formatDate', function(value, format) {
    const default_format = 'DD.MM.YYYY HH:mm'
    if (value) {
      return moment(String(value)).format(format || default_format)
    }
})

import filesize from 'filesize'
Vue.filter('filesize', function(value) { return filesize(value) })

Vue.use(VueAxios, api)
Vue.use(VueConfirm)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
