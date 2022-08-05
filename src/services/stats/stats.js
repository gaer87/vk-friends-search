export class Stats {
  constructor (friends) {
    this.friends = friends
  }

  calcBy(field) {
    const counter = {}

    for (const item of this.friends.byId.values()) {
      if (item.hasOwnProperty(field)) {
        counter[item[field]] = counter[item[field]] ? counter[item[field]] + 1 : 1
      }
    }

    const res = Object.entries(counter)
      .sort((a, b) => b[1] - a[1])

    // console.log((res))
    console.log(Object.fromEntries(res))
    return res
  }
}

export class MapReduceStats {
  constructor (countNodes, friends) {
    this.friends = friends
    this.countNodes = countNodes

    this.nodes = new Array(countNodes).fill(undefined).map(() => {
      return new Worker('services/stats/node.js')
    })
  }

  async calcBy(field) {
    // slice()
    const { size } = this.friends.byId
    const { countNodes } = this
    const countInBatch = Math.ceil(size / countNodes)

    const batchesFriends = []
    const values = Array.from(this.friends.byId.values())

    for (let i = 0; i < countNodes; i++) {
      const slice = values.slice(i * countInBatch, (i + 1) * countInBatch)
      batchesFriends.push({ field, values: slice })
    }

    // map()
    const temp = await Promise.all(batchesFriends.map((item, i) => {
      return new Promise((resolve) => {
        const worker = this.nodes[i]
        worker.onmessage = (event) => {
          const { i, result } = event.data
          resolve(result)
        }
        worker.postMessage({ i, type: 'map', payload: item })
      })
    }))

    // shuffle()
    let tempData = temp.reduce((acc, cur) => acc.concat(cur), [])

    tempData.sort((a, b) => {
      if (a.value > b.value) {
        return 1
      }
      if (a.value < b.value) {
        return -1
      }
      return 0
    })

    const result = await new Promise(async (resolve) => {
      const result = {}

      let partialBatch = []
      let sameItemsBatch = [tempData[0]]

      for (let i = 0; i < tempData.length; i++) {
        // Group same items in an array
        if (tempData[i].value === tempData[i + 1]?.value) {
          sameItemsBatch.push(tempData[i + 1])
        } else {
          partialBatch.push(sameItemsBatch)
          sameItemsBatch = [tempData[i + 1]]
        }

        // reduce()
        if (partialBatch.length === countNodes || i === tempData.length - 1) {
          const tempResults = await Promise.all(partialBatch.map((batch, i) => {
            return new Promise((resolve) => {
              const worker = this.nodes[i]
              worker.onmessage = (event) => {
                const { i, result } = event.data
                // console.log({ i, result })
                resolve(result)
              }
              worker.postMessage({ i, type: 'reduce', payload: batch })
            })
          }))

          const tempResult = tempResults.reduce((acc, cur) => {
            return Object.assign(acc, { [cur.key]: cur.value })
          }, {})

          Object.assign(result, tempResult)

          partialBatch = []
        }
      }

      resolve(result)
    })

    const res = Object.entries(result)
      .sort((a, b) => b[1] - a[1])

    // console.log((res))
    console.log(Object.fromEntries(res))
  }
}