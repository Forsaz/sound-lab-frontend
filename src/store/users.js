const state = {
  loading: false,
  users: []
}

const getters = {
  getUser: (state) => (id) => state.users.find((u) => u.id == id)

}

const mutations = {
  setUsers: (state, users) => state.users = users,
  loading: (state) => state.loading = true,
  loaded: (state) => state.loading = false
}

const actions = {
  loadUsers ({commit}) {
    commit('loading')
    this._vm.$http.get('/users').then((response) => {
      let users = response.data
      commit('setUsers', users)
      commit('loaded')
    })
  },

  createUser ({commit, dispatch}, {name, email, password}) {
    commit('loading')
    this._vm.$http.post('/users', { user: { name, email, password }}).then((response) => {
      dispatch('loadUsers')
    })
  },

  updateUser ({commit, dispatch}, {name, email, password, id}) {
    commit('loading')
    this._vm.$http.patch(`/users/${id}`, { user: { name, email, password }}).then((response) => {
      dispatch('loadUsers')
    })
  },

  destroyUser ({commit, dispatch}, id) {
    commit('loading')
    this._vm.$http.delete(`/users/${id}`).then(() => {
      dispatch('loadUsers')
    })
  }
}

export default { 
  namespaced: true,
  state, getters, mutations, actions 
}