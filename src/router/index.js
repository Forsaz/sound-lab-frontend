import Vue from 'vue'
import Router from 'vue-router'

import Dashboard from '@/components/Dashboard'
import Hives from '@/components/Hives'
import Users from '@/components/Users'
import Hive from '@/components/Hive'
import Sound from '@/components/Sound'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: Dashboard
    },

    {
      path: '/hives',
      name: 'hives',
      component: Hives
    },
    
    {
      path: '/users',
      name: 'users',
      component: Users
    },

    {
      path: '/hives/:id',
      name: 'hive',
      component: Hive,
      props: true
    },

    {
      path: '/sounds/:id',
      name: 'sound',
      component: Sound,
      props: true
    },
  ]
})