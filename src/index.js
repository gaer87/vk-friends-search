import { API } from './utils/api.js'
import { APP_ID } from './consts.js'
import { AppController } from './app-controller.js'

window.addEventListener('load', () => {
  const api = new API(APP_ID)
  const controller = new AppController(api)
})
