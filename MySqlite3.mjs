import yaml from 'yaml'
import fs from 'fs'
import xmlescape from 'xml-escape'
import Database from 'better-sqlite3'


export const DB_TITLE = 'starkeeper'
export const DB_NAME = `${DB_TITLE}.db`

export const DB_DIR = '../media'
export const DB_DIR_PATH = `${DB_DIR}/${DB_TITLE}.db`
export const DB_SQL_DIR = `../media-database`
export const DB_MEDIA_SQL_LIB_FILE = `media-sql.yaml`

// cwd is elsewhere
// TODO: fix refs to this file
export const DB_SQL_YAML_FILE = `${DB_SQL_DIR}/${DB_MEDIA_SQL_LIB_FILE}`
const src = fs.readFileSync(DB_SQL_YAML_FILE, 'utf8').toString()
export const sql = yaml.parse(src)

const openSteamDB = () => {
  const db = openDB(DB_DIR_PATH)
  db.prepare(sql.create.steam_owned_apps).run()
  db.prepare(sql.create.steam_apps).run()
  db.prepare(sql.create.steam_files).run()
  return db
}

export const resetDB = () => {
  if (fs.existsSync(DB_DIR_PATH)) {
    const files = fs.readdirSync(DB_DIR)
    const dbCount = files.filter(file => file.endsWith('db')).length
    const toName = `${DB_DIR}/_${dbCount.toString().padStart(4, '0')}_${DB_NAME}`
    fs.renameSync(DB_DIR_PATH, toName)
  }

  return openSteamDB()
}

export const createIndexes = (db) => {
  // const idx = 0
  // for (const table of sql.index) {
  //   console.log(`Indexing: ${table}`)
  //   for (const column of table) {
  //     console.log(`On Column: ${column}`)
  //     const stmt = `create index sk_idx_${column}_${idx} on ${column}`
  //     console.log(`SQL: ${stmt}`)
  //     db.prepare(stmt).run()
  //   }
  // }
}

export const openDB = (db_path = '../media/starkeeper.db') => {
  const db = new Database(db_path)
  //db.pragma('cache_size', { simple: true })); // =>
  // db.pragma('journal_mode' = MEMORY')
  // db.pragma('journal_mode = WAL')
  // db.pragma('locking_mode = EXCLUSIVE')
  // db.pragma('synchronous = OFF')
  return db
}

export const runQuery = (db, key, procArgs = {}) => {
  return runQueryWhere(db, key, '', procArgs)
}

export const runQueryWhere = (db, key, where = '', procArgs = {}) => {
  try {
    const raw = sql.query[key]
    const src = raw.replace(/}:where:{/, where)
    console.warn(src)
    const stmt = db.prepare(src)
    const res = stmt.all(procArgs)
    if (res.length === 1) {
      return res[0]
    }
    return res
  } catch (error) {
    console.error(error.message)
    console.error(error)
    console.error(`ERROR ${key} ${where} ${JSON.stringify(procArgs)}`)
    throw error
  }

}

export const close_db = (db) => {
  db.close()
}


// STEAM DB

const RND = (max) => {
  return Math.floor(Math.random() * Math.floor(max))
}

const RNDF = (max) => {
  return Math.random() * max
}

export const loadOwnedApps = (db, steam_owned_apps) => {
  const stmt = db.prepare(sql.insert.steam_owned_apps)
  for (const app of steam_owned_apps) {
    app.has_community_visible_stats = app.has_community_visible_stats ? '1' : '0'
    app.has_leaderboards = app.has_leaderboards ? '1' : '0'
    app.appid = app.appid.toString()
    stmt.run(app)
  }
}

export const loadSteamApps = (db, steam_apps) => {
  const stmt = db.prepare(sql.insert.steam_apps)
  for (const app of steam_apps) {
    stmt.run(app)
  }
}

export const random_track = (db) => {
  const titles = runQueryWhere(db, 'games_with_mp3')
  const title_index = RND(titles.length)
  const current_album = titles[title_index].title
  const all_tracks = runQuery(db, 'mp3_alblum_tracks', {album_title: current_album})
  const track_index = RND(all_tracks.length)
  return all_tracks[track_index]
}

export const to_VLC_playlist = async (music) => {
  const output = ['<?xml version="1.0" encoding="UTF-8"?>',
    '<playlist version="1" xmlns="http://xspf.org/ns/0/">',
    '<title>STARKEEPER GAME RADIO</title>',
    '<trackList>']
  const tracks = music.map(track => `
    <track>
      <location>${xmlescape(track.full_path)}</location>
      <title>${xmlescape(track.file_name)}</title>
      <image>${xmlescape(track.capsule_image)}</image>
      <album>${xmlescape(track.title)}</album>
      <annotation>${xmlescape(track.steam_store_page)}</annotation>
    </track>
`).join('\n')
  output.push(tracks)  // Add the tracks
  output.push(`</trackList></playlist>\n`)
  return output.join('\n')
}

//
// export const random_track =  (db) => {
//   const game_tracks = random_game_tracks(db)
//   const track_index = RND(all_tracks.length)
//   return all_tracks[track_index]
// }
//
// export const random_game_tracks =  (db) => {
//   const titles = runQueryWhere(db, 'games_with_mp3')
//   const title_index = RND(titles.length)
//   const current_album = titles[title_index].title
//   return runQuery(db, 'mp3_alblum_tracks', { album_title: current_album })
// }
//
// export const sample_game_tracks = (db, tracks, howMany = 2) => {
//   const start = RND(titles.length)
//   const results = []
//   for (let x = 0; x < howMany; x++) {
//     results[results.length] =  tracks[Math.floor((x + start) % tracks.length)]
//   }
//   return results
// }
