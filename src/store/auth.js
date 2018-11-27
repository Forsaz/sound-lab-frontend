const state = {
  token: null,
  currentUser: {
    name: null,
    email: null
  }
}

const getters = {
  isAuthenticated: (state) => !!state.token,
  token: (state) => state.token,
  currentUserName: (state) => state.currentUser.name,
  currentUserEmail: (state) => state.currentUser.email
}

const mutations = {
  login (state, {token}) {
    state.token = token
    this._vm.$http.defaults.headers.common['Authorization'] = 'Bearer ' + token
  },

  logout (state) {
    state.token = null
    localStorage.removeItem('token')
    this._vm.$http.defaults.headers.common['Authorization'] = null
  },

  setCurrentuser (state, {name, email}) {
    state.currentUser.name = name
    state.currentUser.email = email
  }
}

const actions = {
  getCurrentUser ({commit}) {
    this._vm.$http.get('auth/profile').then((response) => {
      commit('setCurrentuser', {name: response.data.name, email: response.data.email})
    }).catch((error) => {
      commit('logout')
      console.log('Error', error)
    })
  },

  login ({commit, dispatch}, {email, password}) {
    this._vm.$http.post('auth/login', { auth: { email, password}}).then((response) => {
      let token = response.data.jwt
      localStorage.token = token
      commit('login', { token: token })
      dispatch('getCurrentUser')
    })
  }
}

export default { 
  namespaced: true,
  state, getters, mutations, actions 
}