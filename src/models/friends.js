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

    const filtered = this.#filter(response.items)
    const converted = this.#convert(filtered)

    for (const friend of converted) {
      try {
        this.#byId.set(friend.id, friend)
        await this.storage.add(friend)
      } catch (e) {
        console.warn(e)
      }
    }

    return converted
  }

  #filter(items) {
    return items.filter(item => !(item.is_closed && !item.can_access_closed))
  }

  #convert(items) {
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
