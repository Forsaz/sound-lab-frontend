<template>
  <div>
    <v-container grid-list-sm fuild>
      <v-layout column>
        <v-toolbar>
          <v-toolbar-items>
            <v-btn flat v-if="previous_sound_id" 
                    @click="$router.push({name: 'sound', params: {id: previous_sound_id}})">
              <v-icon>keyboard_arrow_left</v-icon>
            </v-btn>
            <v-btn flat @click="$router.push({name: 'hive', params: {id: hive_id}})"><v-icon>keyboard_arrow_up</v-icon></v-btn>
          </v-toolbar-items>
          <v-spacer></v-spacer>
          <v-toolbar-title>{{file_name}}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn flat v-if="next_sound_id"
                    @click="$router.push({name: 'sound', params: {id: next_sound_id}})">
              <v-icon>keyboard_arrow_right</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-flex>
          <v-card>
            <v-card-text>
              <v-layout row wrap>
                <v-flex>
                  <v-list dense class="narrow-list">
                    <v-list-tile>
                      <v-list-tile-content>Channel</v-list-tile-content>
                      <v-list-tile-content class="align-end">{{channel}}</v-list-tile-content>
                    </v-list-tile>
                    <v-list-tile>
                      <v-list-tile-content>Recorded At</v-list-tile-content>
                      <v-list-tile-content class="align-end">{{recorded_at | formatDate }}</v-list-tile-content>
                    </v-list-tile>
                    <v-list-tile>
                      <v-list-tile-content>Duration</v-list-tile-content>
                      <v-list-tile-content class="align-end">{{duration}} seconds</v-list-tile-content>
                    </v-list-tile>
                  </v-list>
                </v-flex>

                <v-flex>
                  Corrupted: <v-switch color="red" :value="corrupted" @change="updateSound({corrupted: !corrupted})"></v-switch>

                  <v-btn @click="download"><v-icon>cloud_download</v-icon> &nbsp;&nbsp; Download</v-btn>
                </v-flex>
              </v-layout>
            </v-card-text>
          </v-card>
        </v-flex>

        <v-flex>
          <v-card>
            <v-card-title primary-title>
              <h4>Labels</h4>
            </v-card-title>

            <v-card-text>
              <audio-sample :sound_url="file_url" v-if="file_url"></audio-sample>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
const PRELOAD_DELAY = 2000
import { mapActions, mapState, mapMutations } from 'vuex'
import AudioSample from '@/components/wavesurfer/AudioSample'
import {delay} from 'underscore'

export default {
  components: {AudioSample},
  props: ['id'],

  computed: {
    ...mapState('sound', ['file_url', 'file_name', 'channel', 'recorded_at', 'created_at', 
                          'duration', 'completed_analysers', 'hive_id', 'sound_labels',
                          'previous_sound_id', 'next_sound_id', 'corrupted'])
  },

  methods: {
    ...mapActions('sound', ['load', 'reset', 'updateSound']),
    ...mapMutations('sound', ['setFileUrl']),

    preloadNextSound (id) {
      this.$http.get(`/sounds/${id}/file_url`).then((response) => {
        let url = response.data.url
        this.$http.get(url)
      })
    },

    download() {
      window.location.href = this.file_url
    }
  },

  mounted() {
    this.reset()
    this.load(this.id)
    delay(() => {
      this.preloadNextSound(this.next_sound_id)
    }, PRELOAD_DELAY)
  }
}
</script>

<style scoped>
.narrow-list {
  width: 300px;
}
</style>
