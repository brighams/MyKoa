
export const initApi = (router) => {
  router.get('/api/models', ctx => {
    ctx.body = {
      message: 'ok',
    }
    ctx.status = 200
  })
}
