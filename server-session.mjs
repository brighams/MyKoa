import session from 'koa-session'
import passport from 'koa-passport'
import {configurePassport} from './twitch-auth.mjs'
import {getConfig} from './server-config.mjs'

export const setupSession = (app) => {
  app.keys = [getConfig().SESSION_SECRET]
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
