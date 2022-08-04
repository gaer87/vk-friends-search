export const timeout = (delay = 5000) => {
  return new Promise(resolve => {
    setTimeout(resolve, delay || Math.random() * 1000)
  })
}

export const withTimeout = async (promise) => {
  // to not block requests in VK
  await timeout()
  return await promise
}
