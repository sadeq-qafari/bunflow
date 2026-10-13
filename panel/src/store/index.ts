import { store } from 'quasar/wrappers'
import { createStore } from 'vuex'

import state from './state'
import actions from './actions'
import getters from './getters'
import mutations from './mutations'

export default store(() => {
  const instance = createStore({
    actions,
    getters,
    mutations,
    state,
    strict: !!process.env.DEV
  })

  // Quasar's current CLI assumes a Pinia store provider and calls store.use()
  // to expose the router. Keep Vuex 4 and adapt that one provider hook.
  ;(instance as any).use = (plugin: (context: { store: typeof instance }) => void) => {
    plugin({ store: instance })
    return instance
  }

  return instance
})
