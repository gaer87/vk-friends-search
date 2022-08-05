const map = (event) => {
  // console.log('MAP', event.data)
  const { i, payload: { field, values } } = event.data

  const result = []

  for (const value of values) {
    result.push({ value: value[field], count: 1 })
  }

  self.postMessage({ i, result })
}

const reduce = (event) => {
  const { i, payload } = event.data
  // console.log('REDUCE', i, values)

  let result = 0

  for (const value of payload) {
    result += value.count
  }

  self.postMessage({
    i,
    result: {
      key: payload[0].value,
      value: result,
    },
  })
}

const actionsMap = {
  map,
  reduce,
}

self.onmessage = (event) => {
  actionsMap[event.data.type](event)
}
