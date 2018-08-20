<template>
  <div>
    <admin v-if="isAuthenticated"></admin>
    <login v-else></login>
  </div>
</template>

<script>
  import { mapActions, mapGetters, mapMutations } from 'vuex'

  import Admin from './Admin.vue'
  import Login from './Login.vue'

  export default {
    components: { Admin, Login },
    computed: {
      ...mapGetters('auth', ['isAuthenticated'])
    },

    methods: {
      ...mapActions('auth', ['getCurrentUser']),
      ...mapMutations('auth', ['login', 'logout'])
    },

    mounted () {
      if (localStorage.token) {
        this.login({ token: localStorage.token })
      }
    }
  }
</script>
