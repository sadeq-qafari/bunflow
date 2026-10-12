import {store} from 'quasar/wrappers'
import Vuex from 'vuex'

import state from './state'
import actions from './actions'
import getters from './getters'
import mutations from './mutations'

// export {StateInterface} from './state'

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

export default store(function ({Vue}) {
  Vue.use(Vuex)

  return new Vuex.Store({
    actions,
    getters,
    mutations,
    state,

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: !!process.env.DEV
  })
})

