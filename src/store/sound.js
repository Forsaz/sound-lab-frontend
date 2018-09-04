const state = {
  id: null,
  hive_id: null,
  file_name: null,
  channel: null,
  recorded_at: null,
  created_at: null,
  duration: null, 
  completed_analysers: [],
  file_url: null,
  sound_labels: []
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

  resetSoundLabels (state) {
    state.sound_labels = []
  },

  setFileUrl (state, {url}) {
    state.file_url = url
  },

  addSoundLabel (state, sound_label) {
    sound_label.offset = parseFloat(sound_label.offset)
    sound_label.length = parseFloat(sound_label.length)
    state.sound_labels.push(sound_label)
  },

  removeSoundLabel (state, id) {
    let sound_label = state.sound_labels.find((sl) => sl.id === id )
    let index = state.sound_labels.indexOf(sound_label)
    state.sound_labels.splice(index,1)
  }
}

const actions = {
  load ({commit, state}, id) {
    this._vm.$http.get(`/sounds/${id}`).then((response) => {
      let sound = response.data
      commit('setSound', sound)
      commit('resetSoundLabels')
      for (let sound_label of sound.sound_labels) {
        commit('addSoundLabel', sound_label)
      }
    })

    this._vm.$http.get(`/sounds/${id}/file_url`).then((response) => {
      let json = response.data
      commit('setFileUrl', json)
    })
  },

  createSoundLabel ({commit, state}, data) {
    data.sound_id = state.id
    this._vm.$http.post(`/sounds/${state.id}/sound_labels`, data).then((response) => {
      let json = response.data
      commit('addSoundLabel', json)
    })
  },

  destroySoundLabel ({commit}, id) {
    this._vm.$http.delete(`/sound_labels/${id}`).then((response) => {
      commit('removeSoundLabel', id)
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