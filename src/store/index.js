import Vue from 'vue'
import Vuex from 'vuex'

import auth from './auth'
import activestorage from './activestorage'
import users from './users'
import hives from './hives'
import hive from './hive'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
    auth, activestorage, users, hives, hive
  },

  strict: debug
})