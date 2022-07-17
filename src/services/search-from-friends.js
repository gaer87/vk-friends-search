import { prepareToCompare } from '../utils/index.js'
import { Friend } from '../models/friend.js'

export class SearchFromFriends {
  constructor(friends, graph) {
    this.friends = friends
    this.graph = graph
  }

  searchInWidth(userId, prop, value) {
    const searchQueue = []
    searchQueue.push(...this.graph[userId])

    const searched = new Set([userId])

    let res

    while (searchQueue.length) {
      const friendId = searchQueue.shift()

      if (searched.has(friendId)) {
        continue
      }

      if (prepareToCompare(this.friends.byId.get(friendId)[prop]) === prepareToCompare(value)) {
        res = friendId
        break
      } else {
        const friends = this.graph[friendId]
        friends && searchQueue.push(...friends)

        searched.add(friendId)
      }
    }

    return res
  }

  enrichFriends(friendId) {
    return this.friends.byId.get(friendId) ?? Friend.createRoot()
  }
}
