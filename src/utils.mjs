import fs from 'fs'
import {existsSync as fileExists} from 'node:fs'
import * as https from "node:https";

export const SLEEP = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const WRITE_LOG = (message, ...objs) => {
  const format_log = () => {
    return `[${new Date().toISOString().replace(/T/, ':').replace(/\..+/, '')} +0000] ${message}`
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

export const is_empty_string = (value) => {
  return typeof value === 'string'
         && String(value).trim() === ''
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

export const createSslServer = (app) => {
  return https.createServer({
                              key: fs.readFileSync(process.env.MK_SSL_KEY_PATH),
                              cert: fs.readFileSync(SSL_CERT_PATH)
                            }, app.callback())
}
