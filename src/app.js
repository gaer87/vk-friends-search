export class App {
  constructor(controller) {
    this.controller = controller

    this.#listenAuthButton()
    this.#listenGetFriendsButton()
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

  #listenShowStatsButton() {
    const btn = document.querySelector('#show-stats')
    btn.addEventListener('click', () => {
      const field = document.querySelector('#fields').value
      this.controller.showStats(field)
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

  #renderFields() {
    const cont = document.querySelector('#fields-cont')

    const options = Object.entries(SEARCHED_PROPS).map(([key, value]) => (
      `<option>${key}</option>`
    ))

    cont.innerHTML = `<select id="fields">${options}</select>`
  }

  renderFriend(field, { friend, path }) {
    const cont = document.querySelector('#content')

    if (friend) {
      let res = `<p><b>${field}</b>: ${friend[field]}</p>`
      res += path
        // .slice(1)
        .map(({ id, firstName, lastName}) => {
          return `<a href="https://vk.com/id${id}" target="_blank">${lastName} ${firstName}</a>`
        })
        .join(' > ')

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
        ${key} - ${counter}
      </li>
    `)

    cont.innerHTML = `<ul>${res.join('')}</ul>`
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