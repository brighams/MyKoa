import path from 'path'

import Koa from 'koa'
import parser from 'koa-bodyparser'
import Router from 'koa-router'
import serve from 'koa-static'
import cors from '@koa/cors'

import {initApi} from './server-api.mjs'
import {setupSession} from './server-session.mjs'
import {
  createSslServer,
  WRITE_LOG,
} from './utils.mjs'
import {checkEnv} from "./check-env.mjs";


export const startServer = (setupRoutes) => {
  checkEnv()

  const app = new Koa()
  const server = process.env.MK_SSL_ENABLED === '1' ? createSslServer(app) : app

  const router = new Router()
  if (setupRoutes) {
    setupRoutes(router)
  }
  app.use(parser())
  app.use(async (ctx, next) => {
    WRITE_LOG(`⭐ ⭐ ⭐ <-- Incoming: ${ctx.method} ${ctx.url}`)
    await next()
  })

  app.use(cors({
                 origin: '*',
                 allowMethods: ['GET', 'POST', 'OPTIONS'],
                 allowHeaders: ['Content-Type']
               }))
  app.use(router.routes())
  app.use(router.allowedMethods())
  app.use(serve(process.env.MK_WEB_PUBLIC_ROOT))
  setupSession(app)

  server.listen(process.env.MK_BIND_PORT, process.env.MK_BIND_ADDRESS, () => {
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

    WRITE_LOG(`🚀 🚀 🚀 ${NOW}`)
    WRITE_LOG(`🚀 🚀 🚀 Process Directory:  ${process.cwd()} 🚀 🚀 🚀`)
    WRITE_LOG(`🚀 🚀 🚀 Now Serving Public: ${path.resolve(process.env.MK_WEB_PUBLIC_ROOT)} 🚀 🚀 🚀`)
    if (process.env.MK_SSL_ENABLED === '1') {
      WRITE_LOG(`⭐ ⭐ ⭐ -> Server listening SSL https://${process.env.MK_BIND_ADDRESS}:${process.env.MK_BIND_PORT}/ ⭐ ⭐ ⭐`)
    } else {
      WRITE_LOG(`⭐ ⭐ ⭐ -> Server listening http://${process.env.MK_BIND_ADDRESS}:${process.env.MK_BIND_PORT}/ ⭐ ⭐ ⭐`)
    }
  })
  return router
}
