const state = {
  id: null,
  hive_id: null,
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
  setSound (state, {id, file_name, channel, recorded_at, created_at, duration, completed_analysers, hive_id}) {
    state.id = id
    state.file_name = file_name
    state.channel = channel
    state.recorded_at = recorded_at
    state.created_at = created_at
    state.duration = duration
    state.completed_analysers = completed_analysers
    state.hive_id = hive_id
  },

  setFileUrl (state, {url}) {
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
      let json = response.data
      commit('setFileUrl', json)
    })
  },

  reset({commit}) {
    commit('setSound', {})
    commit('setFileUrl', {})
  }
}

export default {
  namespaced: true,
  state, getters, mutations, actions 
}