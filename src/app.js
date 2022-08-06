export class App {
  constructor(controller) {
    this.controller = controller

    this.#listenAuthButton()
    this.#listenGetFriendsButton()
    this.#listenRemoveCacheButton()
    this.#listenShowListButton()
    this.#listenShowStatsButton()
    this.#renderFields()
  }

  #listenAuthButton() {
    const btn = document.querySelector('#auth')
    btn.addEventListener('click', () => this.api.login())
  }

  #listenShowListButton() {
    const btn = document.querySelector('#show-list')
    btn.addEventListener('click', () => this.controller.showList())
  }

  #listenRemoveCacheButton() {
    const btn = document.querySelector('#clean-cache')
    btn.addEventListener('click', () => this.controller.cleanCache())
  }

  #listenShowStatsButton() {
    const btn = document.querySelector('#show-stats')
    btn.addEventListener('click', async () => {
      const field = document.querySelector('#fields').value
      this.#toggleBar(true)
      await this.controller.showStats(field)
      this.#toggleBar(false)
    })
  }

  #listenGetFriendsButton() {
    const btn = document.querySelector('#get-friends')
    btn.addEventListener('click', () => {
      const field = document.querySelector('#fields').value
      const value = document.querySelector('#value').value

      const friendsCount = document.querySelector('#friends-count')
      const friendsCountValue = friendsCount.value
      friendsCount.setAttribute('disabled', true)

      const requestsCount = document.querySelector('#requests-count')
      const requestsCountValue = requestsCount.value
      requestsCount.setAttribute('disabled', true)

      this.searchFriend()

      requestAnimationFrame(() => this.controller.searchFriend(field, value, friendsCountValue, requestsCountValue))
    })
  }

  #toggleBar(show) {
    const bar = document.querySelector('.bar')

    show
      ? bar.classList.add('show')
      : bar.classList.remove('show')
  }

  #renderFields() {
    const cont = document.querySelector('#fields-cont')

    const options = Object.entries(SEARCHED_PROPS).map(([key, value]) => (
      `<option>${key}</option>`
    ))

    cont.innerHTML = `<select id="fields">${options}</select>`
  }

  renderFriend(field, friend) {
    const cont = document.querySelector('#content')

    if (friend) {
      let res = (`
        <p><b>${field}</b>: ${friend[field]}</p>
        <p><a href="https://vk.com/id${friend.id}" target="_blank">${friend.lastName} ${friend.firstName}</a></p>
      `)

      cont.innerHTML = res
    } else {
      this.resetFriend()
    }
  }
  
  searchFriend() {
    const cont = document.querySelector('#content')
    cont.innerHTML = `<i>&hellip;</i>`
  }

  renderError() {
    const cont = document.querySelector('#content')
    cont.innerHTML = `<i>Ошибка</i>`
  }

  resetFriend() {
    const cont = document.querySelector('#content')
    cont.innerHTML = `<i>Нема</i>`
  }

  renderList(list) {
    const cont = document.querySelector('#list')

    let res = list.map((item) => `
      <li>  
        ${item.id}
        ${item.lastName}
        ${item.firstName}
        ${item.domain ?? ''}
        ${item.bdate ?? ''}
        ${item.country ?? ''}
        ${item.city ?? ''}
        ${item.universityName ?? ''}
        ${item.status ?? ''}
      </li>
    `)

    cont.innerHTML = `<ul>${res.join('')}</ul>`
  }

  renderStats(counterEntries) {
    const cont = document.querySelector('#stats')

    let res = counterEntries.map(([key, counter]) => `
      <li>  
        <a href="#" data-value="${key}">${key}</a> - ${counter}
      </li>
    `)

    cont.innerHTML = `<ul>${res.join('')}</ul>`

    cont.addEventListener('click', (ev) => {
      const field = document.querySelector('#fields').value
      const value = ev.target.dataset.value

      const friendsCount = document.querySelector('#friends-count')
      const friendsCountValue = friendsCount.value

      const requestsCount = document.querySelector('#requests-count')
      const requestsCountValue = requestsCount.value

      requestAnimationFrame(() => this.controller.searchByField(field, value, friendsCountValue, requestsCountValue))
    })
  }

  renderListByField(list) {
    const cont = document.querySelector('#show-list-by-stats')

    let res = list.map((item) => `
      <tr>
        <td><a href="https://vk.com/id${item.id}" target="_blank">${item.lastName} ${item.firstName} (${item.domain ?? ''})</a></td>
        <td>${item.bdate ?? ''}</td>
        <td>${item.country ?? ''}</td>
        <td>${item.city ?? ''}</td>
      </tr>
    `)

    cont.innerHTML = `<table>${res.join('')}</table>`
  }
}

export const SEARCHED_PROPS = {
  bdate: 'bdate',
  lastName: 'last_name',
  firstName: 'first_name',
  city: 'city',
  mobilePhone: 'mobile_phone',
  country: 'country',
  domain: 'domain',
  timezone: 'timezone',
  status: 'status',
  universityName: 'university_name',
}