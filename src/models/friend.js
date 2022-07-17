export class Friend {
  constructor (data) {
    const item = data
    item.city = item.city?.title
    item.country = item.country?.title
    item.firstName = item.first_name
    item.lastName = item.last_name
    item.universityName = item.university_name
    item.mobilePhone = item.mobile_phone

    delete item.first_name
    delete item.last_name
    delete item.university_name
    delete item.mobile_phone

    Object.assign(this, item)
  }

  static createRoot() {
    return new Friend({ id: null, first_name: 'Root', last_name: 'Root' })
  }
}