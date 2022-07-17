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

    const parents = {}

    const myFriends = this.graph[userId]
    myFriends.forEach((myFriendId) => {
      parents[myFriendId] = userId
    })

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

        friends?.forEach((itemId) => {
          // TODO: сделать пути для всех друзей, а не только первого
          if (!parents[itemId] && itemId !== userId) {
            parents[itemId] = friendId
          }
        })

        searched.add(friendId)
      }
    }

    const pathIds = []
    let pathRes = res

    while (pathRes) {
      pathIds.unshift(pathRes)
      pathRes = parents[pathRes]
    }

    return {
      friendId: res,
      pathIds,
    }
  }

  enrichFriends({ friendId, pathIds }) {
    const friend = this.friends.byId.get(friendId) ?? Friend.createRoot()
    const path = pathIds.map(pathId => this.friends.byId.get(pathId) ?? Friend.createRoot())

    return { friend, path }
  }
}
