import {boot} from 'quasar/wrappers'
import {Chart, registerables} from 'chart.js'

Chart.register(...registerables);
Chart.defaults.font.family = "iransans"

export {Chart}

export default boot(({ app }) => {
  app.config.globalProperties.$chart = Chart
})

