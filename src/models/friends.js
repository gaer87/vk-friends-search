import { withTimeout } from '../utils/timeout.js'
import { Friend } from './friend.js'

export class Friends {
  constructor (api) {
    this.api = api
    this.byId = new Map();
  }

  async getFriends(userId, friendsCount, fields) {
    const response = await withTimeout(this.api.call('friends.get', {
      user_id: userId,
      count: friendsCount,
      fields
    }))
    const converted = this.#convert(response)

    converted.forEach((friend) => {
      this.byId.set(friend.id, friend)
    })

    return converted
  }

  #convert({ items }) {
    return items.map(item => new Friend(item))
  }
}

export class FriendsProxy {
  constructor () {}
}