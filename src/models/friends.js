import { withTimeout } from '../utils/timeout.js'
import { Friend } from './friend.js'

export class Friends {
  #byId = new Map()

  constructor (api, storage) {
    this.api = api
    this.storage = storage
  }

  async getFriends(userId, friendsCount, fields) {
    const response = await withTimeout(this.api.call('friends.get', {
      user_id: userId,
      count: friendsCount,
      fields
    }))

    const converted = this.#convert(response)

    for (const friend of converted) {
      try {
        this.#byId.set(friend.id, friend)
        await this.storage.add(friend)
      } catch (e) {
        console.log(e)
      }
    }

    return converted
  }

  #convert({ items }) {
    return items.map(item => new Friend(item))
  }

  get byId() {
    return this.#byId
  }

  set byId(friends) {
    friends?.forEach((friend) => {
      this.#byId.set(friend.id, friend)
    })
  }
}
