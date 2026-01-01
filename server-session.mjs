import session from 'koa-session'
import passport from 'koa-passport'
import {configurePassport} from './twitch-auth.mjs'
import {SESSION_SECRET} from './space-utils.mjs'

export const setupSession = (app) => {
  app.keys = [SESSION_SECRET]
  const sessionConfig = {
    key: 'koa:sess',
    maxAge: 86400000,
    autoCommit: true,
    overwrite: true,
    httpOnly: true,
    signed: true,
    rolling: false,
    renew: false
  }
  app.use(session(sessionConfig, app))
  configurePassport(passport)
  app.use(passport.initialize())
  app.use(passport.session())
  return app
}
