import { createI18n } from 'vue-i18n'
import { boot } from 'quasar/wrappers'
import messages from 'src/i18n'

export const i18n = createI18n({
  legacy: true,
  locale: 'fa-ir',
  fallbackLocale: 'en-us',
  messages
})

export default boot(({ app }) => {
  app.use(i18n)
})
