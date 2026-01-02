import crypto from 'crypto'
import yaml from 'yaml'

const CONFIG_PATH = './conf/config.yaml'
let config = null

export const getConfig = () => {
  if (config === null) {
    config = yaml.parse(fs.readFileSync(CONFIG_PATH, 'utf8'))
    config.SESSION_SECRET = crypto.randomBytes(32).toString('hex')
  }
  return config
}
