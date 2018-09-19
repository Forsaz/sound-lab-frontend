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
              <v-data-table :headers="soundsHeaders" :items="sounds" class="elevation-0" :rows-per-page-items="[15,50,100]" :loading="soundsLoading">
                <template slot="items" slot-scope="props">
                  <td>
                    <router-link :to="{ name: 'sound', params: { id: props.item.id }}">
                      {{ props.item.file_name }}
                    </router-link> &nbsp;
                    <v-chip color="red" text-color="white" v-if="props.item.corrupted">corrupted</v-chip>
                  </td>
                  <td>{{ props.item.channel }}</td>
                  <td>{{ props.item.recorded_at | formatDate }}</td>
                  <td>{{ props.item.duration }}</td>
                  <td>{{ props.item.sound_labels.length }}</td>
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
    ...mapState('hive', ['name', 'sounds', 'soundsLoading'])
  },

  data () {
    return {
      soundsHeaders: [
        { text: 'Filename', value: 'file_name' },
        { text: 'Channel', value: 'channel' },
        { text: 'Recorded At', value: 'recorded_at' },
        { text: 'Duration (Seconds)', value: 'duration' },
        { text: 'Labels Count', sortable: false }
      ],
    }
  },

  methods: {
    ...mapActions('hive', ['reset','load', 'loadSounds']),
  },

  mounted() {
    this.load(this.id)
    this.loadSounds(this.id)
  },

  beforeDestroy() {
    this.reset()
  }
}
</script>

