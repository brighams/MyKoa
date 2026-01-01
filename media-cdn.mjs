import {runQueryWhere} from '../media-database/media-database.mjs'
import {
  is_positive_integer,
  is_valid_mime_type,
  is_valid_file,
  is_valid_string,
  send_safe_file,
  WRITE
} from './space-utils.mjs'
import mime from 'mime-types'

export const lookup_track = (db, {file_id, appid, file_name}) => {
  const track = runQueryWhere(db, 'tracks',
    ` where steam_files.id = :file_id
        and steam_apps.id = :appid
        and steam_files.file_name = :file_name`, {
      file_id,
      appid,
      file_name
    })
  return track
}

export const valid_cdn_file = (db, {file_id, appid, file_name}) => {
  const dbg_info = (obj) => `\n💥 💥     ${JSON.stringify(obj, null, 2)}`

  if (!is_positive_integer(file_id)
    || !is_positive_integer(appid)
    || !is_valid_string(file_name)) {
    const message = WRITE(`💥 💥 💥...ERROR: ILLEGAL PARAMETERS ${dbg_info({file_id, appid, file_name})}`)
    return {
      status: 422,
      valid: false,
      message
    }
  }

  const track = lookup_track(db, {file_id, appid, file_name})
  if (Array.isArray(track) || track === undefined || track.dir_path === undefined) {
    const message = WRITE(`💥 💥 💥...ERROR: UNDEFINED ${dbg_info({file_id, appid, file_name, track})}}`)
    return {
      status: 404,
      valid: false,
      message,
      track
    }
  }

  if (!is_valid_file(track.dir_path)) {
    const message = WRITE(`💥 💥 💥...ERROR: INVALID FULL PATH (track.dir_path) ${dbg_info({
      file_id,
      appid,
      file_name,
      track
    })}}`)
    return {
      status: 422,
      valid: false,
      message,
      track
    }
  }

  const mime_type = mime.lookup(track.dir_path)
  if (!is_valid_mime_type(mime_type)) {
    const message = WRITE(`💥 💥 💥...ERROR: INVALID MIME TYPE ${dbg_info({file_id, appid, file_name, track})}}`)
    return {
      status: 422,
      valid: false,
      message,
      track
    }
  }

  return {
    status: 200,
    valid: true,
    message: '🚀',
    track,
    mime_type
  }
}

export const serve_cdn_file = async (ctx, db, {file_id, appid, file_name}) => {
  // TODO: dir_path is full path when it should only be parent directory
  const {mime_type, track, valid, message, status} = valid_cdn_file(db, {file_id, appid, file_name})
  if (valid) {
    await send_safe_file(ctx, {mime_type, track})
  } else {
    ctx.body = {track, file_id, appid, file_name, message}
    ctx.status = status
  }
}
