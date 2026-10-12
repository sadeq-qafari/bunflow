import {boot} from 'quasar/wrappers'
import {Chart, registerables} from 'chart.js'

Chart.register(...registerables);
Chart.defaults.font.family = "iransans"

declare module 'vue/types/vue' {
  interface Vue {
    $chart: Chart;
  }
}

export {Chart}

export default boot(({Vue, app, store, router}) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  Vue.prototype.$chart = Chart
})

