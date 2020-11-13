import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home-page',
      component: require('@/pages/Launcher').default
    },
    {
      path: '/setting',
      name: 'setting-page',
      component: require('@/pages/Setting').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
