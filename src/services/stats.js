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

    return res
  }
}