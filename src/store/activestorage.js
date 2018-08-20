const state = {
  rails_direct_uploads_url: null
}

const getters = {}

const mutations = {
  setRailsDirectUploadsUrl (state, url) {
    state.rails_direct_uploads_url = url
  }
}

const actions = {
  loadRailsDirectUploadsUrl ({commit}) {
    const baseURL = this._vm.$http.defaults.baseURL
    this._vm.$http.get('get_direct_uploads_path').then((response) => {
      const path = response.data.direct_uploads_path
      let url = baseURL + path
      commit('setRailsDirectUploadsUrl', url)
    }).catch((error) => {
      console.log('Error', error)
    })
  }
}

export default { 
  namespaced: true,
  state, getters, mutations, actions 
}