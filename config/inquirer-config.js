
module.exports = [
  {
    name: "vuex",
    type: 'confirm',
    message: "init vuex"
  },
  {
    name: "Element",
    type: 'confirm',
    message: "init element-ui"
  },
  {
    name: "proxy",
    type: 'confirm',
    message: "init proxy"
  },
  {
    name: "name",
    type: 'input',
    message: "proxy: '/name': url, name=",
    when: (config) => {
      return config.proxy
    }
  },
  {
    name: "url",
    type: 'input',
    message: "proxy: '/name': url, url=",
    when: (config) => {
      return config.proxy
    }
  }
];