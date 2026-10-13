import CKEditor from '@ckeditor/ckeditor5-vue'
import { boot } from 'quasar/wrappers'

export default boot(({ app }) => {
  app.use(CKEditor)
})
