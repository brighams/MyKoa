import session from 'koa-session'
import passport from 'koa-passport'
import crypto from "crypto";

const SESSION_SECRET = crypto.randomBytes(32).toString('hex')

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
  app.use(passport.initialize())
  app.use(passport.session())
  return app
}
