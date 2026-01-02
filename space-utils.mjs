import fs from 'fs'
import sendFile from 'koa-sendfile'
import {existsSync as fileExists} from 'node:fs'
import process from 'node:process'


export const WRITE_LOG = (message, ...objs) => {
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

export const SLEEP = (ms) => new Promise(resolve => setTimeout(resolve, ms))

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
  WRITE_LOG(`🚀 --> ...Sending: ${track.dir_path}`)
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
      WRITE_LOG(`💥 💥 💥 ERROR MISSING TWITCH_CLIENT_ID 💥 💥 💥`)
      error = true
    }

    if (!is_valid_string(TWITCH_SECRET)) {
      WRITE_LOG(`💥 💥 💥 ERROR MISSING TWITCH_SECRET 💥 💥 💥`)
      error = true
    }

    if (!is_valid_string(TWITCH_CALLBACK_URL)) {
      WRITE_LOG(`💥 💥 💥 ERROR MISSING TWITCH_CLIENT_ID 💥 💥 💥`)
      error = true
    }
  }

  if (options.SSL_ENABLED) {
    if (!is_valid_file(SSL_KEY_PATH)) {
      WRITE_LOG(`💥 💥 💥 ERROR MISSING SSL_KEY 💥 💥 💥`)
      error = true
    }

    if (!is_valid_file(SSL_CERT_PATH)) {
      WRITE_LOG(`💥 💥 💥 ERROR MISSING SSL_CERT 💥 💥 💥`)
      error = true
    }
  }

  if (!is_valid_path(CONFIG_FILE_PATH)) {
    WRITE_LOG(`💥 💥 💥 ERROR MISSING DEFAULT_MIME_TYPE 💥 💥 💥`)
    error = true
  }

  if (!is_valid_object(CONFIG)) {
    WRITE_LOG(`💥 💥 💥 ERROR MISSING CONFIG 💥 💥 💥`)
    error = true
  }

  if (!is_valid_string(DEFAULT_MIME_TYPE)) {
    WRITE_LOG(`💥 💥 💥 ERROR MISSING DEFAULT_MIME_TYPE 💥 💥 💥`)
    error = true
  }

  if (!is_valid_file(STARKEEPER_DATABASE_FILE)) {
    WRITE_LOG(`💥 💥 💥 ERROR MISSING STARKEEPER_DATABASE_FILE 💥 💥 💥`)
    error = true
  }

  if (!is_valid_path(WEB_PUBLIC_ROOT)) {
    WRITE_LOG(`💥 💥 💥 ERROR MISSING WEB_PUBLIC_ROOT 💥 💥 💥`)
    error = true
  }

  if (error) {
    WRITE_LOG(`💥 💥 💥 ERROR SERVER FAILED TO START: CONFIGURATION ERROR 💥 💥 💥`)
    WRITE_LOG(`💥 💥 💥 CONFIG: \n    ${JSON.stringify(CONFIG_VARS, null, 2)}`)
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
