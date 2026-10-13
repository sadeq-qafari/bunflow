import { configureCompat } from '@vue/compat'
import { boot } from 'quasar/wrappers'

export default boot(() => {
  // Use Vue 3 semantics by default, while enabling migration warnings and
  // retaining only the legacy component contracts that have not been migrated.
  configureCompat({ MODE: 3 })
})
