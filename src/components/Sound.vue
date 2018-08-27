<template>
  <div>
    <v-container grid-list-sm fuild>
      <v-layout column>
        <v-flex>
          <v-card>
            <v-card-title primary-title>
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
              
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import AudioSample from '@/components/wavesurfer/AudioSample'

export default {
  components: {AudioSample},
  props: ['id'],

  computed: {
    ...mapState('sound', ['file_name', 'channel', 'recorded_at', 'created_at', 'duration', 'completed_analysers'])
  },

  methods: {
    ...mapActions('sound', ['load']),
  },

  mounted() {
    this.load(this.id)
  }
}
</script>

