import { MY_ID } from './consts.js'
import { App } from './app.js'
import { timeout } from './utils/timeout.js'
import { FriendsGraphProxy, FriendsGraphProxyLocalStorage } from './services/friends-graph.js'
import { SearchFromFriends } from './services/search-from-friends.js'
import { MapReduceStats, Stats } from './services/stats/stats.js'
import { Friends } from './models/friends.js'
import { Storage } from './storage.js'

export class AppController {
  constructor (api) {
    this.view = new App(this)
    this.api = api

    this.storage = new Storage('friends')
    this.friends = new Friends(this.api, this.storage)

    this.mapReduceStats = new MapReduceStats(10, this.friends)

    this.build()
  }

  async build() {
    await this.storage.build()
    const data = await this.storage.getAll()
    this.friends.byId = data
  }

  cleanCache() {
    Storage.destroy()
    FriendsGraphProxyLocalStorage.destroy()
  }

  async searchFriend(field, value, friendsCount, requestsCount) {
    const friendsGraphService = FriendsGraphProxy.create(FriendsGraphProxy.type.localStorage, this.friends)
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

  async showStats(field) {
    const simpleStats = new Stats(this.friends)
    console.time('simpleStats')
    const simpleRes = simpleStats.calcBy(field)
    console.timeEnd('simpleStats')

    console.time('stats')
    const res = await this.mapReduceStats.calcBy(field)
    console.timeEnd('stats')

    this.view.renderStats(res)
  }

  async searchByField(field, value, friendsCount, requestsCount) {
    const friendsGraphService = FriendsGraphProxy.create(FriendsGraphProxy.type.localStorage, this.friends)
    const graph = await friendsGraphService.buildFriendsGraph(MY_ID, friendsCount, parseInt(requestsCount))

    if (!Object.keys(graph).length) {
      this.view.renderError()
      return
    }

    const searchFromFriends = new SearchFromFriends(this.friends, graph)
    const res = searchFromFriends.searchByField(field, value)

    this.view.renderListByField(res)
  }
}