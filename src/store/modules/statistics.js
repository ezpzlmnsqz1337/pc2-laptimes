import Distinct from '@/constants/Distinct'

const state = () => ({
  driverId: null,
  position: null,
  distinct: Distinct.NO
})

// getters
const getters = {
  getFilter: (state) => () => {
    return {
      driverId: state.driverId,
      distinct: state.distinct
    }
  }
}

// actions
const actions = {
}

// mutations
const mutations = {
  setFilter (state, { driverId, distinct, position }) {
    if (driverId !== undefined) state.driverId = driverId
    if (position !== undefined) state.position = position
    if (distinct !== undefined) state.distinct = distinct
  },
  clearFilter (state) {
    state.driverId = null
    state.position = null
    state.distinct = Distinct.NO
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
