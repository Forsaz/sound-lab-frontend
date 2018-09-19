<template>
  <v-app>
    <v-navigation-drawer
      fixed
      :mini-variant="miniVariant"
      :clipped="true"
      v-model="drawer"
      app
    >
      <v-list>
        <v-list-tile 
          value="true"
          v-for="(item, i) in menu_items"
          :to="item.route"
          :key="i"
        >
          <v-list-tile-action>
            <v-icon v-html="item.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title"></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    
    <v-toolbar fixed app :clipped-left="true" color="amber">
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-btn icon @click.stop="miniVariant = !miniVariant">
        <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'"></v-icon>
      </v-btn>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn flat @click="logout">
          {{currentUserName}} &nbsp; <v-icon>exit_to_app</v-icon>
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <v-content>
      <v-container fluid>
        <v-slide-y-transition mode="out-in">
          <v-layout column>
            <router-view  :key="$route.fullPath"/>
          </v-layout>
        </v-slide-y-transition>
      </v-container>
    </v-content>

    <v-footer app class="pa-3">
      <v-spacer></v-spacer>
      <span>Forsáž &copy; 2018</span>
    </v-footer>
  </v-app>
</template>

<script>
  import { mapGetters, mapActions, mapMutations } from 'vuex'
  export default {
    data () {
      return {
        drawer: true,
        menu_items: [
          { icon: 'bubble_chart', title: 'Hives', route: '/hives' },
          { icon: 'people', title: 'Users', route: '/users' }
        ],
        miniVariant: false,
        right: true,
        rightDrawer: false,
        title: 'Forsáž - Sound Lab'
      }
    },

    methods: {
      ...mapActions('auth', ['getCurrentUser']),
      ...mapActions('activestorage', ['loadRailsDirectUploadsUrl']),
      ...mapMutations('auth', ['logout'])
    },

    computed: {
      ...mapGetters('auth', ['currentUserName', 'currentUserEmail'])
    },

    mounted () {
      this.getCurrentUser()
      this.loadRailsDirectUploadsUrl()
    }
  }
</script>
