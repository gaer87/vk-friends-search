export const timeout = () => {
  return new Promise(resolve => {
    setTimeout(resolve, Math.random() * 1000)
  })
}

export const withTimeout = async (promise) => {
  // to not block requests in VK
  await timeout()
  return await promise
}
