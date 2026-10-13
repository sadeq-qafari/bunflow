import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory, type Router } from 'vue-router'
import type { Store } from 'vuex'
import type { StateInterface } from 'src/store/state'
import routes from './routes'

export default route<Store<StateInterface>>(function ({ store }): Router {
  const router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createWebHistory(process.env.VUE_ROUTER_BASE)
  })

  router.beforeEach(async (to, from) => {
    if (to.name !== 'login' && store.state.user == null) {
      const isLoggedIn = await store.dispatch('tryLogin')
      if (!isLoggedIn) return { name: 'login' }
    }

    if (from.path !== to.path) {
      sessionStorage.setItem('previousRoute', from.fullPath)
    }

    return true
  })

  return router
})
