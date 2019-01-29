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
  next_sound_id: null,
  previous_sound_id: null,
  corrupted: null,
  coeffs: {},
  sound_labels: [],
  sound_slices: [],

  chartSelectedFeature: null
}

const getters = {
}

const mutations = {
  setSound (state, {id, file_name, channel, recorded_at, created_at, duration, completed_analysers,
                    hive_id, next_sound_id, previous_sound_id, corrupted, coeffs, sound_slices}) {
    state.id = id
    state.file_name = file_name
    state.channel = channel
    state.recorded_at = recorded_at
    state.created_at = created_at
    state.duration = duration
    state.completed_analysers = completed_analysers
    state.hive_id = hive_id
    state.next_sound_id = next_sound_id
    state.previous_sound_id = previous_sound_id
    state.corrupted = corrupted
    state.coeffs = coeffs
    state.sound_slices = sound_slices
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

  updateSoundLabel (state, sound_label) {
    sound_label.offset = parseFloat(sound_label.offset)
    sound_label.length = parseFloat(sound_label.length)
    let existingSoundLabel = state.sound_labels.filter((sl) => sl.id === sound_label.id)[0]
    let index = state.sound_labels.indexOf(existingSoundLabel)
    state.sound_labels.splice(index, 1, sound_label)
  },

  removeSoundLabel (state, id) {
    let sound_label = state.sound_labels.find((sl) => sl.id === id )
    let index = state.sound_labels.indexOf(sound_label)
    state.sound_labels.splice(index,1)
  },

  selectChartFeature (state, feature) {
    state.chartSelectedFeature = feature
  }
}

const actions = {
  load ({commit, state}, id) {
    this._vm.$http.get(`/sounds/${id}`).then((response) => {
      let sound = response.data.sound
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

  updateSound({commit, state}, sound) {
    return this._vm.$http.put(`/sounds/${state.id}`, sound).then((response) => {
      let {sound} = response.data
      commit('setSound', sound)
    })
  },

  createSoundLabel ({commit, state}, data) {
    data.sound_id = state.id
    return this._vm.$http.post(`/sounds/${state.id}/sound_labels`, data).then((response) => {
      let json = response.data
      commit('addSoundLabel', json)
      return json.id
    })
  },

  updateSoundLabel ({commit}, data) {
    this._vm.$http.put(`/sound_labels/${data.id}`, { sound_label: data }).then((response) => {
      let soundLabel = response.data
      commit('updateSoundLabel', soundLabel)
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