export class API {
  constructor(apiId) {
    this.apiId = apiId

    this.init()
  }

  init() {
    VK.init({
      apiId: this.apiId,
      status: true,
    })
  }

  login() {
    VK.Auth.login()
  }

  call(method, options, debug = false) {
    return new Promise((resolve, reject) => {
      debug && console.info(`REQUEST: ${method}`, options)

      try {
        VK.Api.call(method, { v: '5.131', ...options }, ({ response, error }) => {
          if (response) {
            debug && console.info(`RESPONSE: ${method}`, response)
            return resolve(response)
          }

          if (error) {
            console.error(`ERROR: ${method}`, error)
            return reject(error)
          }
        })
      } catch (error) {
        console.error(`REQUEST ERROR: ${method}`, error)
        reject(error)
      }
    })
  }
}