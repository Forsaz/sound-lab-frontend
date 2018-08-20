<template>
  <v-app id="inspire">
    <v-content>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4>
            <v-card class="elevation-12">
              <v-toolbar color="amber">
                <v-toolbar-title>Login</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <v-form>
                  <v-text-field prepend-icon="person" v-model="email" label="Email" type="text"></v-text-field>
                  <v-text-field prepend-icon="lock" v-model="password" label="Password" id="password" type="password"></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="doLogin">Login</v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  data () {
    return {
      email: 'tulak45@gmail.com',
      password: 'heslo'
    }
  },

  methods: {
    ...mapActions('auth', ['getCurrentUser', 'login']),
    doLogin () {
      this.login({ email: this.email, password: this.password })
    }
  }
}
</script>
