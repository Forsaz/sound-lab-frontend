<template>
  <div :class="{ annotation: true, active: isActive}">
    <div class="handle" :style="{ left: startPos + 'px', width: width + 'px', top: topPosition + 'px' }" @click.stop="$emit('activate')" @mouseup.stop="" @mousedown.stop="">
      <div class="label" v-if="isActive">
        <v-card>
          <v-card-text>
            <v-list>
              <v-list-tile>
                {{startProgress * soundDuration}} - {{stopProgress * soundDuration}}
              </v-list-tile>

              <v-list-tile>
                <v-list-tile-content>
                  <v-combobox
                    :value="label_name"
                    :items="recommended_labels"
                    :search-input.sync="searchText"
                    item-text="name"
                    item-value="id"
                    @input="updateLabel"
                    chips
                    deletable-chips
                    label="Label"
                  >
                  </v-combobox>
                </v-list-tile-content>

                <v-list-tile-action>
                  <v-icon @click.stop="$emit('deactivate')">close</v-icon>
                </v-list-tile-action>
              </v-list-tile>
            </v-list>
          </v-card-text>
        </v-card>
      </div>
      <div class="remove" @click="remove"><v-icon size="15" color="white">cancel</v-icon></div>
      <div class="remove" @click="play"><v-icon size="15" color="white">play_circle_filled</v-icon></div>
      {{label_name}}
    </div>

    
    <div class="overlay" :style="{ left: startPos + 'px', width: width + 'px' }" v-show="width > 10"></div>
  </div>
</template>

<script>

import _ from 'underscore'
import { mapActions } from 'vuex';

const HANDLE_HEIGHT = 25
const BASE_TOP_POS = -35
const ELEVATION_MARGIN = 2
export default {
  props: {
    id: Number,
    offset: Number,
    length: Number,
    label_name: String,

    containerWidth: Number,
    soundDuration: Number,
    isActive: {
      type: Boolean,
      default: false
    },
    elevation: {
      type: Number,
      default: 0
    }
  },

  data () {
    return {
      isLoading: false,
      searchText: null,
      recommended_labels: []
    }
  },

  watch: {
     searchText: _.throttle(function (e) {
        this.autocompleteLabels()
    }, 500)
  },

  computed: {

    width () {
      return (this.stopPos - this.startPos) 
    },

    topPosition () {
      return BASE_TOP_POS - (this.elevation * (HANDLE_HEIGHT + ELEVATION_MARGIN))
    },

    startProgress () {
      return this.offset / this.soundDuration
    },

    startPos () {
      return this.containerWidth * this.startProgress
    },

    stopProgress () {
      return (this.offset + this.length) / this.soundDuration
    },

    stopPos () {
      return this.containerWidth * this.stopProgress
    }
  },

  methods: {
    ...mapActions('sound', ['updateSoundLabel']),
    updateLabel (value) {
      console.log('updateLabel ', value, typeof(value))
      if(value && typeof(value) === 'object') {
        this.updateSoundLabel({ id: this.id, label_name: value.name})
      } else {
        this.updateSoundLabel({ id: this.id, label_name: value})
      }
    },

    autocompleteLabels () {
      this.$http.get(`/labels`, { params: { search: this.searchText } }).then((response) => {
        this.recommended_labels = response.data
      })
    },

    remove () {
      this.$emit('remove')
    },

    play () {
      this.$emit('play', this.startProgress, this.stopProgress)
    }
  },

  mounted() {
    this.autocompleteLabels()
  }
}
</script>

<style lang="scss" scoped>
.overlay {
  position: absolute;
  z-index: 5;
  // opacity: 0.3;
  top: -5px;
  bottom: -5px;

  .annotation.active & {
    border: 2px solid rgba(0, 177, 185, 0.85);
  }
  
}

.handle {
  cursor: pointer;
  border-radius: 3px;
  border: 2px rgb(0, 177, 185) solid;
  top: -35px;
  position: absolute;
  height: 25px;
  background-color: rgb(0, 177, 185);
  color: white;

  display: flex;

  .remove {
    
    color: white;
    font-family: 'Arial Narrow', Arial, sans-serif;
    font-weight: bold;
  }

  .label {
    position: absolute;
    bottom: 130%;
    min-width: 400px;
    cursor: auto;
    z-index: 9;

    .create-label-chip {
      cursor: pointer;
    }
  }
}
</style>
