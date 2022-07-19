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

      // Почему-то иногда friendId - undefined
      if (prepareToCompare(this.friends.byId.get(friendId)?.[prop]) === prepareToCompare(value)) {
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
    if (!friendId) {
      return
    }
    return this.friends.byId.get(friendId)
  }

  searchByField(field, value) {
    return Array.from(this.friends.byId.values()).filter(friend => {
      return prepareToCompare(friend[field]) === prepareToCompare(value)
    })
  }
}
