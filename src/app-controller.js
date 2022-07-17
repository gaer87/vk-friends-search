import { MY_ID } from './consts.js'
import { App } from './app.js'
import { FriendsGraphProxy } from './services/friends-graph.js'
import { SearchFromFriends } from './services/search-from-friends.js'
import { Friends } from './models/friends.js'

export class AppController {
  constructor (api) {
    this.view = new App(this)
    this.friends = new Friends(api)
  }

  async searchFriend(field, value, friendsCount, requestsCount) {
    const friendsGraphService = FriendsGraphProxy.create(FriendsGraphProxy.type.memory, this.friends)
    const graph = await friendsGraphService.buildFriendsGraph(MY_ID, friendsCount, parseInt(requestsCount))

    if (!Object.keys(graph).length) {
      this.view.renderError()
      return
    }

    const searchFromFriends = new SearchFromFriends(this.friends, graph)
    const searchResult = searchFromFriends.searchInWidth(MY_ID, field, value)
    const result = searchFromFriends.enrichFriends(searchResult)

    this.view.renderFriend(field, result)
  }

  showList() {
    this.view.renderList(Array.from(this.friends.byId.values()))
  }

  showStats(field) {
    // TODO: сделать сервис статы
    const counter = {}

    for (const item of this.friends.byId.values()) {
      if (item[field]) {
        counter[item[field]] = counter[item[field]] ? counter[item[field]] + 1 : 1
      }
    }

    const res = Object.entries(counter)
      .sort((a, b) => b[1] - a[1])

    this.view.renderStats(res)
  }
}