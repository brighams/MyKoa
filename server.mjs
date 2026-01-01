import path from 'path'
// import yaml from 'yaml'
// import fs from 'fs'
// import {fileURLToPath} from 'url'
// import https from 'https'

import Koa from 'koa'
import parser from 'koa-bodyparser'
import Router from 'koa-router'
import serve from 'koa-static'
// import logger from 'koa-logger'
// import sendFile from 'koa-sendfile'
import cors from '@koa/cors'
// import passport from 'koa-passport'

import {openDB, random_track, runQueryWhere, to_VLC_playlist} from '../media-database/media-database.mjs'
import {initApi} from './server-api.mjs'
import {setupSession} from './server-session.mjs'
// import {installTwitchRoutes} from './twitch-auth.mjs'

import {
  createSslServer,
  WRITE,
  CONFIG_CHECK,
  BIND_PORT,
  BIND_ADDRESS,
  STARKEEPER_DATABASE_FILE,
  WEB_PUBLIC_ROOT,
  APP_BASE_URL,
  SSL_KEY_PATH,
  SSL_CERT_PATH,
  SSL_ENABLED
} from './space-utils.mjs'

CONFIG_CHECK()


const db = openDB(STARKEEPER_DATABASE_FILE)

const app = new Koa()
const server = SSL_ENABLED ? createSslServer(app) : app

const router = new Router()
initApi(router, db)
app.use(parser())
app.use(async (ctx, next) => {
  WRITE(`⭐ ⭐ ⭐ <-- Incoming: ${ctx.method} ${ctx.url}`)
  await next()
})

app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type']
}))
app.use(router.routes())
app.use(router.allowedMethods())
app.use(serve(WEB_PUBLIC_ROOT))
setupSession(app)
// installTwitchRoutes(router, passport)

server.listen(BIND_PORT, BIND_ADDRESS, () => {
  const NOW = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
  // startChatBot()
  WRITE(`🚀 🚀 🚀 ${NOW}`)
  WRITE(`🚀 🚀 🚀 Process Directory:  ${process.cwd()} 🚀 🚀 🚀`)
  WRITE(`🚀 🚀 🚀 Database:           ${path.resolve(STARKEEPER_DATABASE_FILE)} 🚀 🚀 🚀`)
  WRITE(`🚀 🚀 🚀 Now Serving Public: ${path.resolve(WEB_PUBLIC_ROOT)} 🚀 🚀 🚀`)
  WRITE(`⭐ ⭐ ⭐ -> Server listening ${APP_BASE_URL}/ ⭐ ⭐ ⭐`)
})
