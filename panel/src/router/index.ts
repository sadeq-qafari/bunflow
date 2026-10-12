import {route} from 'quasar/wrappers'
import VueRouter from 'vue-router'
import {Store} from 'vuex'
import {StateInterface} from 'src/store/state'
import routes from './routes'
import {LocalStorage} from "quasar";

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */

export default route<Store<StateInterface>>(function ({Vue, store}) {
  Vue.use(VueRouter)

  const router = new VueRouter({
    scrollBehavior: () => ({x: 0, y: 0}),
    routes,

    // Leave these as is and change from quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  })

    router.beforeEach(async (to, from, next) => {
      if (to.name !== 'login') {
        if (store.state.user == null) {
          const isLoggedIn = await store.dispatch('tryLogin')
          return isLoggedIn ? next() : next({name: 'login'})
        }
      }
      if (from.path != to.path)
        sessionStorage.setItem('previousRoute', from.fullPath)

      return next()
    });

  return router
})

