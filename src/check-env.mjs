import process from 'node:process'

import {is_valid_file, is_valid_path, WRITE_LOG} from "./utils.mjs";

export const checkEnv = () => {
  let error = false

  if (process.env.MK_SSL_ENABLED === '1') {
    if (!is_valid_file(process.env.MK_SSL_KEY_PATH)) {
      WRITE_LOG(`💥 💥 💥 ERROR MISSING SSL_KEY 💥 💥 💥`)
      error = true
    }

    if (!is_valid_file(process.env.MK_SSL_CERT_PATH)) {
      WRITE_LOG(`💥 💥 💥 ERROR MISSING SSL_CERT 💥 💥 💥`)
      error = true
    }
  }

  if (!is_valid_path(process.env.MK_WEB_PUBLIC_ROOT)) {
    WRITE_LOG(`💥 💥 💥 ERROR MISSING WEB_PUBLIC_ROOT 💥 💥 💥`)
    error = true
  }

  if (error) {
    WRITE_LOG(`💥 💥 💥 ERROR SERVER FAILED TO START: CONFIGURATION ERROR 💥 💥 💥`)
    process.exit(1)
  }
}
