<template>
  <div>
    <v-subheader>
      Hives
      <v-btn color="green" dark small @click="add"> 
        <v-icon>add</v-icon> Add hive
      </v-btn>
    </v-subheader>


    <v-container fluid grid-list-md>
      <v-layout row wrap>
        <v-flex xs12 sm4 md3 v-for="hive in hives" :key="hive.id">
          <v-card>
            <v-card-media src="./beehive.webp" height="200px">
            </v-card-media>
            <v-card-title primary-title>
              <div>
                <router-link :to="{ name: 'hive', params: { id: hive.id }}">
                  <h3 class="headline mb-0">{{hive.name}}</h3>
                </router-link>
              </div>
            </v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn icon @click="edit(hive.id)">
                <v-icon>edit</v-icon>
              </v-btn>
              <v-btn icon @click="remove(hive.id)">
                <v-icon>delete</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
    

    <v-dialog v-model="dialog" max-width="500px">
      <v-card v-if="dialog">
        <v-card-title>
          <span class="headline">{{ formTitle }}</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-form>
              <v-text-field v-model="formHive.name" label="Name"></v-text-field>
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
      formHive: null,
      formAction : null
    }
  },

  computed: {
    ...mapState('hives', ['hives', 'loading']),
    ...mapGetters('hives', ['getHive']),
    formTitle () {
      switch (this.formAction) {
        case 'update': return 'Edit Hive'
        case 'create': return 'New Hive'
      }
    },
  },

  methods: {
    ...mapActions('hives', ['load','update', 'create', 'destroy']),
    edit (id) {
      let hive = this.getHive(id)
      this.formHive = {
        id: hive.id,
        name: hive.name
      }
      this.formAction = 'update'
      this.dialog = true
    },

    add () {
      this.formHive = {
        name: ''
      }
      this.formAction = 'create'
      this.dialog = true
    },

    save () {
      switch (this.formAction) {
        case 'update': this.update(this.formHive).then(() => this.close()); break;
        case 'create': this.create(this.formHive).then(() => this.close()); break;
      }
    },

    remove (id) {
      this.$confirm('Are you sure you want to delete this hive').then((res) => {
        if(res) this.destroy(id)
      });
    },

    close () {
      this.formHive = null
      this.dialog = false
    }
  },

  mounted () {
    this.load()
  }
}
</script>
