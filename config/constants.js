const ELEMENT_UI = {
  ElementUI: `import ElementUI from 'element-ui';`,
  ElementUILess: `import 'element-ui/lib/theme-chalk/index.css';`,
  useElement: `Vue.use(ElementUI);`
}

const VUEX = {
  Vuex: `import Vuex from 'vuex';`,
  importStore: `import Store from './store';`,
  useVuex: `Vue.use(Vuex);`,
  store: `const store = new Vuex.Store(Store)`
}

const DOWN_URL = 'lizhichengk/vue2template';

const TEST_URL = '';

module.exports = { ELEMENT_UI, DOWN_URL, TEST_URL, VUEX };