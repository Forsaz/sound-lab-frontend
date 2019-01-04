<template>
  <div>
    <v-container grid-list-sm fuild>
      <v-layout column>
        <v-flex>
          <v-card>
            <v-card-title primary-title>
              <h3>Hive: {{name}}</h3>
              <div>
                <v-menu offset-y>
                  <v-btn
                    slot="activator"
                    color="primary"
                    dark
                  >
                    Download Features
                  </v-btn>
                  <v-list>
                    <v-list-tile
                      v-for="extractor in features_extractors"
                      :key="extractor"
                      @click="downloadFeatures(extractor)"
                    >
                      <v-list-tile-title>Version {{ extractor }}</v-list-tile-title>
                    </v-list-tile>
                  </v-list>
                </v-menu>

                <span v-if="features_downloading">
                  <v-progress-circular indeterminate/>
                  Downloading features: {{features_downloading_size | filesize}}
                </span>
              </div>
            </v-card-title>
          </v-card>
        </v-flex>

        <v-flex>
          <v-card>
            <v-card-title primary-title>
              <h3>Sounds</h3>

              <SoundUpload :hive-id="id"></SoundUpload>

              <v-btn @click="loadFilteredSounds" small><v-icon>refresh</v-icon></v-btn>

              <v-menu
                ref="recorded_at_picker"
                :close-on-content-click="false"
                :nudge-right="40"
                :return-value.sync="filter.recorded_at"
                lazy
                transition="scale-transition"
                offset-y
                full-width
                min-width="290px"
              >
                <v-text-field
                  slot="activator"
                  v-model="filter.recorded_at"
                  label="Recorded At"
                  prepend-icon="event"
                  readonly
                ></v-text-field>
                <v-date-picker v-model="filter.recorded_at" no-title
                              :min="minimum_recorded_at "
                              :max="maximum_recorded_at "
                              :allowed-dates="allowedFilterDates"
                              @input="$refs.recorded_at_picker.save(filter.recorded_at)">
                </v-date-picker>
              </v-menu>


            </v-card-title>

            <v-card-text>
              <v-data-table class="elevation-0" 
              :headers="soundsHeaders" 
              :items="sounds" 
              :total-items="total_sounds"
              :rows-per-page-items="[15,50,100]" 
              :loading="soundsLoading"
              :pagination.sync="pagination">
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
                  <td align="center">
                    <v-chip color="primary" text-color="white" v-if="props.item.sound_labels.length > 0">
                      {{props.item.sound_labels.length}}
                    </v-chip>
                  </td>
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
import _ from 'underscore'

export default {
  props: ['id'],
  components: {SoundUpload},

  computed: {
    ...mapState('hive', ['name', 'sounds', 'features_extractors', 'total_sounds', 'soundsLoading',
                        'recorded_ats', 'maximum_recorded_at', 'minimum_recorded_at'
                        ])
  },

  data () {
    return {
      features_downloading: false,
      features_downloading_size: 0,
      pagination: {},
      filter: {},
      soundsHeaders: [
        { text: 'Filename', value: 'file_name' },
        { text: 'Channel', value: 'channel' },
        { text: 'Recorded At', value: 'recorded_at' },
        { text: 'Duration (Seconds)', value: 'duration' },
        { text: 'Labels Count', sortable: false }
      ],
    }
  },

  watch: {
    pagination() {
      this.loadFilteredSounds()
    },

    filter() {
      this.loadFilteredSounds()
    }
  },

  methods: {
    ...mapActions('hive', ['reset','load', 'loadSounds']),
    loadFilteredSounds() {
      this.loadSounds({id: this.id, pagination: this.pagination, filter: this.filter})
    },

    allowedFilterDates(val) {
      return this.recorded_ats.indexOf(val) > -1
    },

    downloadFeatures(extractor) {
      this.features_downloading = true
      this.features_downloading_size = 0
      this.$http.get(`/hives/${this.id}/download_features`, {
        onDownloadProgress: _.throttle((e) => this.downloadFeaturesProgress(e), 500),
        params: { features_extractor: extractor }
      }).then(({data}) => {
        this.features_downloading = false
        let blob = new Blob([data])
        let blobURL = window.URL.createObjectURL(blob)

        let a = document.createElement('a')
        a.href = blobURL
        a.download = `features-${extractor}.csv`
        document.body.appendChild(a)
        a.click()

        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(blobURL);  
        }, 0); 
      })
    },

    downloadFeaturesProgress(progressEvent) {
      this.features_downloading_size = progressEvent.loaded
    }
  },

  mounted() {
    this.load(this.id)
    this.loadFilteredSounds()
  },

  beforeDestroy() {
    // this.reset()
  }
}
</script>

