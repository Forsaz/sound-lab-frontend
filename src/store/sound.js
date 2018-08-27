const state = {
  id: null,
  file_name: null,
  channel: null,
  recorded_at: null,
  created_at: null,
  duration: null, 
  completed_analysers: [],
  file_url: null
}

const getters = {
}

const mutations = {
  setSound (state, {id, file_name, channel, recorded_at, created_at, duration, completed_analysers}) {
    state.id = id
    state.file_name = file_name
    state.channel = channel
    state.recorded_at = recorded_at
    state.created_at = created_at
    state.duration = duration
    state.completed_analysers = completed_analysers
  },

  setFileUrl(state, url) {
    state.file_url = url
  }
}

const actions = {
  load ({commit}, id) {
    this._vm.$http.get(`/sounds/${id}`).then((response) => {
      let sound = response.data
      commit('setSound', sound)
    })

    this._vm.$http.get(`/sounds/${id}/file_url`).then((response) => {
      let url = response.url
      commit('setFileUrl', url)
    })
  }
}

export default {
  namespaced: true,
  state, getters, mutations, actions 
}