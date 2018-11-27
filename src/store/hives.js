const state = {
  loading: false,
  hives: []
}

const getters = {
  getHive: (state) => (id) => state.hives.find((h) => h.id == id)
}

const mutations = {
  setHives: (state, hives) => state.hives = hives,
  loading: (state) => state.loading = true,
  loaded: (state) => state.loading = false
}

const actions = {
  load ({commit}) {
    commit('loading')
    this._vm.$http.get('/hives').then((response) => {
      let hives = response.data.hives
      commit('setHives', hives)
      commit('loaded')
    })
  },

  create ({commit, dispatch}, {name, email, password}) {
    commit('loading')
    this._vm.$http.post('/hives', { hive: { name }}).then((response) => {
      dispatch('load')
    })
  },

  update ({commit, dispatch}, {name, email, password, id}) {
    commit('loading')
    this._vm.$http.patch(`/hives/${id}`, { hive: { name }}).then((response) => {
      dispatch('load')
    })
  },

  destroy ({commit, dispatch}, id) {
    commit('loading')
    this._vm.$http.delete(`/hives/${id}`).then(() => {
      dispatch('load')
    })
  }
}

export default { 
  namespaced: true,
  state, getters, mutations, actions 
}