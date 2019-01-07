<template>
  <div>
    <v-container grid-list-sm fuild>
      <v-layout row>
        <!-- <v-flex xs3>
          <v-card>
                <v-card-text>
                </v-card-text>
          </v-card>
        </v-flex> -->

        <v-flex xs12>
          
          <v-layout column>
            <v-flex>
              <v-card>
                <v-card-actions color="red">
                  <v-btn flat v-if="previous_sound_id" @click="$router.push({name: 'sound', params: {id: previous_sound_id}})">
                    <v-icon>keyboard_arrow_left</v-icon>
                  </v-btn>
                  <v-btn flat @click="$router.push({name: 'hive', params: {id: hive_id}})"><v-icon>keyboard_arrow_up</v-icon></v-btn>
                  <v-spacer></v-spacer>
                  <h2>{{file_name}}</h2>
                  <v-spacer></v-spacer>
                  <v-btn flat v-if="next_sound_id" @click="$router.push({name: 'sound', params: {id: next_sound_id}})">
                    <v-icon>keyboard_arrow_right</v-icon>
                  </v-btn>
                </v-card-actions>

                <v-card-text>
                  <v-layout row wrap>
                    <v-flex>
                      <v-list dense class="narrow-list">

                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>Channel</v-list-tile-title>
                            <v-list-tile-sub-title>{{channel}}</v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>

                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>Recorded At</v-list-tile-title>
                            <v-list-tile-sub-title>{{recorded_at | formatDate }}</v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>

                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>Duration At</v-list-tile-title>
                            <v-list-tile-sub-title>{{duration}} seconds</v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>
                      </v-list>
                    </v-flex>

                    <v-flex>

                      <v-list dense class="narrow-list">

                        <v-list-tile @click="">
                          <v-list-tile-action>
                            <v-checkbox color="red" :value="corrupted" @change="updateSound({corrupted: !corrupted})"></v-checkbox>
                          </v-list-tile-action>
                          <v-list-tile-content @click="updateSound({corrupted: !corrupted})">
                            <v-list-tile-title>Corrupted</v-list-tile-title>
                          </v-list-tile-content>
                        </v-list-tile>
                      </v-list>

                      <v-btn @click="download"><v-icon>cloud_download</v-icon> &nbsp;&nbsp; Download</v-btn>
                    </v-flex>
                  </v-layout>
                </v-card-text>

                <v-divider ></v-divider>

                <v-card-title primary-title>
                  <h4>Labels</h4>
                </v-card-title>

                <v-card-text>
                  <audio-sample :sound_url="file_url" v-if="file_url"></audio-sample>
                </v-card-text>
              </v-card>
            </v-flex>
          </v-layout>

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
