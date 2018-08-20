<template>
  <div>
    <v-subheader>
      Users

      <v-btn color="green" dark small @click="newUser"> 
        <v-icon>add</v-icon> Add user
      </v-btn>
    </v-subheader>

 

    <v-data-table :headers="headers" :loading="loading" :items="users" class="elevation-1">
      <template slot="items" slot-scope="props">
        <td>{{ props.item.name }}</td>
        <td>{{ props.item.email }}</td>
        <td class="layout px-0">
          <v-btn icon class="mx-0" @click="edit(props.item.id)">
            <v-icon>edit</v-icon>
          </v-btn>
          <v-btn icon class="mx-0" @click="destroy(props.item.id)">
            <v-icon>delete</v-icon>
          </v-btn>
        </td>
      </template>
    </v-data-table>


    <v-dialog v-model="dialog" max-width="500px">
      <v-card v-if="dialog">
        <v-card-title>
          <span class="headline">{{ formTitle }}</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-form>
              <v-text-field v-model="formUser.name" label="Name"></v-text-field>
              <v-text-field v-model="formUser.email" label="Email"></v-text-field>
              <v-text-field v-model="formUser.password" label="Password"></v-text-field>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click.native="close">Cancel</v-btn>
          <v-btn color="blue darken-1" flat @click.native="save">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapState, mapMutations} from 'vuex'

export default {
  data () {
    return {
      dialog: false,
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Email', value: 'email' },
        { text: 'Actions', sortable: false }
      ],
      formUser: null,
      formAction : null
    }
  },

  computed: {
    ...mapState('users', ['users', 'loading']),
    ...mapGetters('users', ['getUser']),
    formTitle () {
      switch (this.formAction) {
        case 'update': return 'Edit User'
        case 'create': return 'New User'
      }
    },
  },

  methods: {
    ...mapActions('users', ['loadUsers','updateUser', 'createUser', 'destroyUser']),
    edit (id) {
      let user = this.getUser(id)
      this.formUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        password: ''
      }
      this.formAction = 'update'
      this.dialog = true
    },

    newUser () {
      this.formUser = {
        name: '',
        email: '',
        password: ''
      }
      this.formAction = 'create'
      this.dialog = true
    },

    save () {
      switch (this.formAction) {
        case 'update': this.updateUser(this.formUser).then(() => this.close()); break;
        case 'create': this.createUser(this.formUser).then(() => this.close()); break;
      }
    },

    destroy (id) {
      this.$confirm('Are you sure you want to delete this user').then((res) => {
        if(res) this.destroyUser(id)
      });
    },

    close () {
      this.formUser = null
      this.dialog = false
    }
  },

  mounted () {
    this.loadUsers()
  }
}
</script>
