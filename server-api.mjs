
export const initApi = (router, db) => {
  router.get('/api/models', ctx => {
    // ctx.body = runQueryWhere(db, 'tracks')
    // console.log(ctx.body)
    ctx.body = {
      message: 'ok',
      models: {
        // return results of Sqlite3 show tables tweakafied for app usage
      }
    }
    ctx.status = 200
  })
}
