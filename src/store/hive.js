const state = {
  id: null,
  name: null,
  sounds: []
}

const getters = {
}

const mutations = {
  setHive (state, {id, name}) {
    state.id = id
    state.name = name
  },

  setSounds (state, sounds) {
    state.sounds = sounds
  }
}

const actions = {
  load ({commit}, id) {
    this._vm.$http.get(`/hives/${id}`).then((response) => {
      let hive = response.data
      commit('setHive', hive)
    })
  },

  loadSounds ({commit, state}, id) {
    this._vm.$http.get(`/hives/${id}/sounds`).then((response) => {
      let sounds = response.data
      commit('setSounds', sounds)
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


    return this._vm.$http.post(`/hives/${hiveId}/sounds`, data).then((response) => {
      console.log('Response: ', response)
      dispatch('loadSounds', hiveId)
    })
  }
}

export default {
  namespaced: true,
  state, getters, mutations, actions 
}