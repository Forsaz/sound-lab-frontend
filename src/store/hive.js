const state = {
  id: null,
  name: null,
  soundsLoading: false,
  recorded_ats: [],
  maximum_recorded_at: null,
  minimum_recorded_at: null,
  total_sounds: 0,
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

  setSounds (state, {sounds, meta}) {
    state.sounds = sounds
    state.total_sounds = meta.total_count
    state.recorded_ats = meta.recorded_ats
    state.maximum_recorded_at = meta.maximum_recorded_at
    state.minimum_recorded_at = meta.minimum_recorded_at
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

  loadSounds ({commit, state}, {id, pagination, filter}) {
    commit('soundsLoading')
    this._vm.$http.get(`/hives/${id}/sounds`, {
      params: {
        page: pagination.page,
        per: pagination.rowsPerPage,
        filter
      }
    }).then((response) => {
      let sounds = response.data.sounds
      let meta = response.data.meta
      commit('setSounds', {sounds, meta})
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