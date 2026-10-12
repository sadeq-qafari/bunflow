const
  express = require('express'),
  serveStatic = require('serve-static'),
  history = require('connect-history-api-fallback'),
  port = 4200

const app = express()

app.use(history())
app.use(serveStatic('./'))
app.listen(port)
