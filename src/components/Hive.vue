<template>
  <div>
    <v-container grid-list-sm fuild>
      <v-layout column>
        <v-flex>
          <v-card>
            <v-card-title primary-title>
              <h3>Hive: {{name}}</h3>
            </v-card-title>
          </v-card>
        </v-flex>

        <v-flex>
          <v-card>
            <v-card-title primary-title>
              <h3>Sounds</h3>

              <SoundUpload :hive-id="id"></SoundUpload>

              <v-btn @click="loadSounds(id)" small><v-icon>refresh</v-icon></v-btn>
            </v-card-title>

            <v-card-text>
              <v-data-table :headers="soundsHeaders" :items="sounds" class="elevation-0" :rows-per-page-items="[15,50,100]">
                <template slot="items" slot-scope="props">
                  <td>{{ props.item.file_name }}</td>
                  <td>{{ props.item.recorded_at | formatDate }}</td>
                  <td>{{ props.item.duration }}</td>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>

import { mapActions, mapState } from 'vuex'
import SoundUpload from '@/components/SoundUpload'

export default {
  props: ['id'],
  components: {SoundUpload},

  computed: {
    ...mapState('hive', ['name', 'sounds'])
  },

  data () {
    return {
      soundsHeaders: [
        { text: 'Filename', value: 'file_name' },
        { text: 'Recorded At', value: 'recorded_at' },
        { text: 'Duration (Seconds)', value: 'duration' }
      ],
    }
  },

  methods: {
    ...mapActions('hive', ['load', 'loadSounds']),
  },

  mounted() {
    this.load(this.id)
    this.loadSounds(this.id)
  }
}
</script>

