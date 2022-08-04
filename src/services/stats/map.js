self.onmessage = (event) => {
  // console.log('MAP', event.data)
  const { i, field, values } = event.data

  const result = []

  for (const value of values) {
    result.push({ value: value[field], count: 1 })
  }

  self.postMessage({ i, result })
}