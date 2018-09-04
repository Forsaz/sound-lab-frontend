<template>
  <div>
    <v-container grid-list-sm fuild>
      <v-layout column>
        <v-flex>
          <v-card>
            <v-card-title primary-title>
              <h2>
                <router-link :to="{ name: 'hive', params: { id: hive_id }}">
                  Back To Hive
                </router-link>
              </h2>

              <h3>Sound: {{file_name}}</h3>
              
            </v-card-title>

            <v-card-text>
              <v-list dense>
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
import { mapActions, mapState, mapMutations } from 'vuex'
import AudioSample from '@/components/wavesurfer/AudioSample'

export default {
  components: {AudioSample},
  props: ['id'],

  computed: {
    ...mapState('sound', ['file_url', 'file_name', 'channel', 'recorded_at', 'created_at', 
                          'duration', 'completed_analysers', 'hive_id', 'sound_labels'])
  },

  methods: {
    ...mapActions('sound', ['load', 'reset']),
    ...mapMutations('sound', ['setFileUrl'])
  },

  mounted() {
    this.reset()
    this.load(this.id)
  }
}
</script>

