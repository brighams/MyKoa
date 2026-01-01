import {valid_cdn_file, serve_cdn_file} from './media-cdn.mjs'
import {random_track, runQueryWhere, to_VLC_playlist} from '../media-database/media-database.mjs'
import {WRITE} from './space-utils.mjs'
import TRACK_MEMORY from './track-memory.mjs'

export const initApi = (router, db) => {
  router.get('/api/models', ctx => {
    // ctx.body = runQueryWhere(db, 'tracks')
    // console.log(ctx.body)
    ctx.body = {
      message: 'ok'
      models: {
        // return results of Sqlite3 show tables tweakafied for app usage
      }
    }
    ctx.status = 200
  })
}
