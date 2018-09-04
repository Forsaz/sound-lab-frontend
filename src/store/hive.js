const state = {
  id: null,
  name: null,
  soundsLoading: false,
  sounds: []
}

const getters = {
}

const mutations = {
  soundsLoading: (state) => state.soundsLoading = true,
  soundsLoaded: (state) => state.soundsLoading = false,

  setHive (state, {id, name}) {
    state.id = id
    state.name = name
  },

  setSounds (state, sounds) {
    state.sounds = sounds
  }
}

const actions = {
  reset({commit}) {
    commit('setHive', {})
    commit('setSounds', [])
  },

  load ({commit}, id) {
    this._vm.$http.get(`/hives/${id}`).then((response) => {
      let hive = response.data
      commit('setHive', hive)
    })
  },

  loadSounds ({commit, state}, id) {
    commit('soundsLoading')
    this._vm.$http.get(`/hives/${id}/sounds`).then((response) => {
      let sounds = response.data
      commit('setSounds', sounds)
      commit('soundsLoaded')
    })
  },

  createSound ({dispatch, state}, signed_id) {
    let hiveId = state.id
    const data = { 
      sound: { 
        hive_id: hiveId,
        file: signed_id 
      }
    }


    return this._vm.$http.post(`/hives/${hiveId}/sounds`, data)
  }
}

export default {
  namespaced: true,
  state, getters, mutations, actions 
}