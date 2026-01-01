import crypto from 'crypto'
import fs from 'fs'
import sendFile from 'koa-sendfile'
import path from 'path'
import yaml from 'yaml'
import {existsSync as fileExists} from 'node:fs'
import TRACK_MEMORY from './track-memory.mjs'
import twitchBot from './twitch-bot.mjs'

export const BIND_PORT = 8086
export const BIND_ADDRESS = '127.0.0.1'

export const APP_BASE_URL = `https://${BIND_ADDRESS}:${BIND_PORT}`
export const CONFIG_FILE_PATH = path.resolve('../conf/scanner_conf.yaml')
export const STARKEEPER_DATABASE_FILE = path.resolve('../media/starkeeper.db')
export const WEB_PUBLIC_ROOT = path.resolve('../_webroot/')
export const SSL_KEY_PATH = path.resolve('./secrets', 'key.pem')
export const SSL_CERT_PATH = path.resolve('./secrets', 'cert.pem')

export const DEFAULT_MIME_TYPE = 'audio/mp3'
export const CONFIG = yaml.parse(fs.readFileSync(CONFIG_FILE_PATH, 'utf8'))
export const SESSION_SECRET = crypto.randomBytes(32).toString('hex')
export const TWITCH_CALLBACK_URL = process.env.STARKEEPER_CALLBACK_URL || `${APP_BASE_URL}/auth/twitch/callback`
export const TWITCH_CLIENT_ID = process.env.TWITCH_STARKEEPER_CLIENT_ID || 'your_client_id'
export const TWITCH_SECRET = process.env.TWITCH_STARKEEPER_TWITCH_SECRET || 'your_client_secret'
export const SSL_ENABLED = process.env.STARKEEPER_SSL_ENABLED || false
export const VALID_MIME_TYPES = [
  'audio/mp3',
  'audio/mpeg',
  'audio/wav',
  'audio/aiff',
  'audio/aac',
  'audio/aacp',
  'audio/flac',
  'audio/webm',
  'audio/basic',
  'audio/ogg'
]

export const CONFIG_VARS = {
  web: {
    BIND_PORT,
    BIND_ADDRESS,
    APP_BASE_URL
  },
  fs: {
    CONFIG_FILE_PATH,
    DB_PATH: STARKEEPER_DATABASE_FILE,
    WEB_ROOT: WEB_PUBLIC_ROOT
  },
  mime: {
    DEFAULT_MIME_TYPE,
    VALID_MIME_TYPES
  },
  ssl: {
    SSL_KEY_PATH,
    SSL_CERT_PATH
  },
  twitch: {
    TWITCH_CLIENT_ID,
    TWITCH_CALLBACK_URL,
    TWITCH_SECRET: 'HIDDEN',
    SESSION_SECRET
  }
}

export const WRITE = (message, ...objs) => {
  const format_log = () => {
    const l1 = `[${new Date().toISOString().replace(/T/, ':').replace(/\..+/, '')} +0000] ${message}`
    const l2 = objs ? `    object = ${JSON.stringify(objs, null, 2)}` : ''
    return `${l1}`
  }
  const formatted = format_log(message)
  if (message.startsWith('💥 💥 💥')) {
    console.error(formatted)
  } else if (message.startsWith('🐞 🐞 🐞')) {
    console.log(message)
  } else {
    console.log(formatted)
  }
  return formatted
}

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const fileNotEmpty = (filePath) => {
  try {
    const stats = fs.statSync(filePath)
    return stats.size > 0
  } catch (err) {
    console.error(err)
    return false
  }
}

export const fileReadable = (filePath) => {
  try {
    fs.accessSync(filePath)
    return true
  } catch (err) {
    console.error(err)
    return false
  }
}

export const is_positive_integer = (value) => {
  if (is_valid_string(value)
    && Math.floor(Number(value)) === Number(value)
    && Number.isSafeInteger(Number(value))
    && Number(value) > 0) {
    return true
  } else if (typeof value === 'number'
    && Math.floor(value) === value
    && Number.isSafeInteger(Number(value))
    && Number.isFinite(value)
    && value > 0) {
    return true
  }
  return false
}

export const is_valid_string = (value) => {
  return typeof value === 'string'
    && String(value).trim() !== ''
}

export const is_valid_mime_type = (value) => {
  return typeof value === 'string' && VALID_MIME_TYPES.includes(value)
}

export const is_valid_object = (value) => {
  return typeof value === 'object'
    && Object.keys(value).length > 0
}

export const is_valid_file = (value) => {
  if (typeof value === 'string') {
    const notEmpty = fileNotEmpty(value)
    const itExists = fileExists(value)
    const isReadable = fileReadable(value)
    return itExists && isReadable && notEmpty
  }
  return false
}

export const is_valid_path = (value) => {
  return typeof value === 'string'
    && fileExists(value)
    && fileReadable(value)
}

export const send_safe_file = async (ctx, {track, mime_type = DEFAULT_MIME_TYPE, status = 200}) => {
  // TODO: database error: dir_path = file path
  WRITE(`🚀 --> ...Sending: ${track.dir_path}`)
  TRACK_MEMORY.addTrack({
    track,
    mime_type,
    time: new Date()
  })
  ctx.type = mime_type
  ctx.status = status
  return await sendFile(ctx, track.dir_path)
}

export const CONFIG_CHECK = (options = {
  TWITCH_ENABLED: false,
  SSL_ENABLED: false
}) => {
  let error = false
  if (options.TWITCH_ENABLED) {
    if (!is_valid_string(TWITCH_CLIENT_ID)) {
      WRITE(`💥 💥 💥 ERROR MISSING TWITCH_CLIENT_ID 💥 💥 💥`)
      error = true
    }

    if (!is_valid_string(TWITCH_SECRET)) {
      WRITE(`💥 💥 💥 ERROR MISSING TWITCH_SECRET 💥 💥 💥`)
      error = true
    }

    if (!is_valid_string(TWITCH_CALLBACK_URL)) {
      WRITE(`💥 💥 💥 ERROR MISSING TWITCH_CLIENT_ID 💥 💥 💥`)
      error = true
    }
  }

  if (options.SSL_ENABLED) {
    if (!is_valid_file(SSL_KEY_PATH)) {
      WRITE(`💥 💥 💥 ERROR MISSING SSL_KEY 💥 💥 💥`)
      error = true
    }

    if (!is_valid_file(SSL_CERT_PATH)) {
      WRITE(`💥 💥 💥 ERROR MISSING SSL_CERT 💥 💥 💥`)
      error = true
    }
  }

  if (!is_valid_path(CONFIG_FILE_PATH)) {
    WRITE(`💥 💥 💥 ERROR MISSING DEFAULT_MIME_TYPE 💥 💥 💥`)
    error = true
  }

  if (!is_valid_object(CONFIG)) {
    WRITE(`💥 💥 💥 ERROR MISSING CONFIG 💥 💥 💥`)
    error = true
  }

  if (!is_valid_string(DEFAULT_MIME_TYPE)) {
    WRITE(`💥 💥 💥 ERROR MISSING DEFAULT_MIME_TYPE 💥 💥 💥`)
    error = true
  }

  if (!is_valid_file(STARKEEPER_DATABASE_FILE)) {
    WRITE(`💥 💥 💥 ERROR MISSING STARKEEPER_DATABASE_FILE 💥 💥 💥`)
    error = true
  }

  if (!is_valid_path(WEB_PUBLIC_ROOT)) {
    WRITE(`💥 💥 💥 ERROR MISSING WEB_PUBLIC_ROOT 💥 💥 💥`)
    error = true
  }

  if (error) {
    WRITE(`💥 💥 💥 ERROR SERVER FAILED TO START: CONFIGURATION ERROR 💥 💥 💥`)
    WRITE(`💥 💥 💥 CONFIG: \n    ${JSON.stringify(CONFIG_VARS, null, 2)}`)
    process.exit(1)
  }

  // WRITE(`🐞 🐞 🐞 Twitch OAuth Configuration:`)
  // WRITE(`🐞 🐞 🐞 CLIENT_ID: ${TWITCH_CLIENT_ID ? 'OK' : '💥 💥 💥 ERROR 💥 💥 💥'}`)
  // WRITE(`🐞 🐞 🐞 SESSION_SECRET: ${TWITCH_SECRET ? 'OK' : '💥 💥 💥 ERROR 💥 💥 💥'}`)
  // WRITE(`🐞 🐞 🐞 CALLBACK_URL: ${TWITCH_CALLBACK_URL}`)
}

export const createSslServer = (app) => {
  const sslOptions = {
    key: fs.readFileSync(SSL_KEY_PATH),
    cert: fs.readFileSync(SSL_CERT_PATH)
  }
  return https.createServer(sslOptions, app.callback())
}
