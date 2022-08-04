self.onmessage = (event) => {
  const { i, values } = event.data
  // console.log('REDUCE', i, values)

  let result = 0

  for (const value of values) {
    result += value.count
  }

  self.postMessage({
    i,
    result: {
      key: values[0].value,
      value: result,
    },
  })
}