export class Stats {
  constructor (friends) {
    this.friends = friends
  }

  calcBy(field) {
    const counter = {}

    for (const item of this.friends.byId.values()) {
      if (item[field]) {
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
  static countNodes = 10

  constructor (friends) {
    this.friends = friends

    const { countNodes } = MapReduceStats

    this.workers = new Array(countNodes).fill(undefined).map((index) => {
      return new Worker('services/stats/map.js')
    })

    this.workersReduce = new Array(countNodes).fill(undefined).map((index) => {
      return new Worker('services/stats/reduce.js')
    })
  }

  async calcBy(field) {
    // slice()
    const { size } = this.friends.byId
    const { countNodes } = MapReduceStats
    const batch = Math.ceil(size / countNodes)

    // create workers
/*
    const workers = new Array(countNodes).fill(undefined).map((index) => {
      return new Worker('services/stats/map.js')
    })
*/

    // map()
    const tempData = await new Promise(((resolve, reject) => {
      let temp = []
      const values = Array.from(this.friends.byId.values())
      const check = new Array(countNodes).fill(false)

      setTimeout(reject, 60 * 1000)

      const onmessage = (event) => {
        const { i, result } = event.data
        // console.log({ i, result })

        check[i] = true

        temp = temp.concat(result)

        if (check.every(Boolean)) {
          resolve(temp)
        }
      }

      for (let i = 0; i < countNodes; i++) {
        const from = i * batch
        const to = (i + 1) * batch
        const slice = values.slice(from, to)
        // console.log(size, i, from, to, slice)

        const worker = this.workers[i]
        worker.onmessage = onmessage
        worker.postMessage({ i, field, values: slice })
      }
    }))

    // console.log({ tempData })

    //shuffle()
    tempData.sort((a, b) => {
      if (a.value > b.value) {
        return 1
      }
      if (a.value < b.value) {
        return -1
      }
      return 0
    })

    // reduce()
    // create workers
/*
    const workersReduce = new Array(countNodes).fill(undefined).map((index) => {
      return new Worker('services/stats/reduce.js')
    })
*/

    const result = await new Promise(async (resolve, reject) => {

      // setTimeout(reject, 60 * 1000)

      let res = {}

      let partialBatch = []
      let uniqBatch = [tempData[0]]

      for (let i = 0; i < tempData.length; i++) {
        if (tempData[i].value === tempData[i + 1]?.value) {
          uniqBatch.push(tempData[i + 1])
        } else {
          partialBatch.push(uniqBatch)
          uniqBatch = [tempData[i + 1]]
        }

        if (partialBatch.length === countNodes || i === tempData.length - 1) {
          await Promise.all(partialBatch.map((batch, i) => {
            return new Promise((resolve, reject) => {
              const onmessage = (event) => {
                const { i, result } = event.data
                // console.log({ i, result })
                res[result.key] = result.value
                resolve()
              }

              const worker = this.workersReduce[i]
              worker.onmessage = onmessage
              worker.postMessage({ i, values: batch })
            })
          }))

          partialBatch = []
        }
      }

      resolve(res)
    })

    const res = Object.entries(result)
      .sort((a, b) => b[1] - a[1])

    // console.log((res))
    console.log(Object.fromEntries(res))
  }
}