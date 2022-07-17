const GRAPH_STORAGE_KEY = 'graph'

export class FriendsGraph {
  constructor (friends) {
    this.graph = {}
    this.friends = friends

    this.fields = Object.values(SEARCHED_PROPS).join(',')
  }

  async buildFriendsGraph(userId, friendsCount, deep = 1) {
    let currentLevel = 0
    let queueByLevel = {}
    queueByLevel[currentLevel] = [userId]

    do {
      const id = queueByLevel[currentLevel].shift()

      // Не делаем запрос на уже найденных друзей
      if (this.graph[id]) {
        continue
      }

      try {
        const friends = await this.friends.getFriends(id, friendsCount, this.fields);

        const ids = friends.map(({ id }) => id)

        this.graph[id] = ids

        // Друзей друга запиываем на следующий уровень и т.д.
        queueByLevel[currentLevel + 1] = (queueByLevel[currentLevel + 1] ?? []).concat(ids)

        // Если текущий уровень проверен - переходим к следующему
        if (!queueByLevel[currentLevel].length) {
          currentLevel += 1
        }
      } catch (e) {

      }
    } while (currentLevel <= deep)

    return this.graph
  }

  async buildFriendsGraphByCont(userId, friendsCount, count = 50) {
    let queue = [userId]

    while (queue.length && count) {
      const id = queue.shift()

      count--

      try {
        const friends = await this.friends.getFriends(id, friendsCount, this.fields);

        const ids = friends.map(({ id }) => id)

        this.graph[id] = ids

        queue = queue.concat(ids)
      } catch (e) {

      }
    }

    return this.graph
  }
}

export class FriendsGraphProxy {
  constructor (...args) {
    this.friendsGraph = new FriendsGraph(...args)
  }

  async buildFriendsGraph(...args) {}

  static create(type, ...args) {
    if (type === FriendsGraphProxy.type.localStorage) {
      return new FriendsGraphProxyLocalStorage(...args);
    }

    if (type === FriendsGraphProxy.type.memory) {
      return new FriendsGraphProxyMemory(...args);
    }

    throw new Error('Unknown storage')
  }

  static type = {
    localStorage: 'localStorage',
    memory: 'memory',
  }

  static destroy() {}
}

export class FriendsGraphProxyLocalStorage extends FriendsGraphProxy {
  async buildFriendsGraph(...args) {
    if (localStorage.getItem(GRAPH_STORAGE_KEY)) {
      return JSON.parse(localStorage.getItem(GRAPH_STORAGE_KEY))
    }

    const graph = await this.friendsGraph.buildFriendsGraphByCont(...args)

    try {
      localStorage.setItem(GRAPH_STORAGE_KEY, JSON.stringify(graph))
    } catch (e) {
      console.log(e)
    }

    return graph
  }

  static destroy() {
    localStorage.removeItem(GRAPH_STORAGE_KEY)
  }
}

export class FriendsGraphProxyMemory extends FriendsGraphProxy {
  static #cache

  async buildFriendsGraph(...args) {
    if (FriendsGraphProxyMemory.#cache) {
      return FriendsGraphProxyMemory.#cache
    }

    const graph = await this.friendsGraph.buildFriendsGraphByCont(...args)

    FriendsGraphProxyMemory.#cache = graph

    return graph
  }
}

export const SEARCHED_PROPS = {
  bdate: 'bdate',
  lastName: 'last_name',
  firstName: 'first_name',
  city: 'city',
  contacts: 'contacts',
  country: 'country',
  domain: 'domain',
  education: 'education',
  timezone: 'timezone',
  // relation: 'relation',
  status: 'status',
}