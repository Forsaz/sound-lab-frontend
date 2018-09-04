<template>
  <div :class="{ annotation: true, active: isActive}">
    <div class="handle" :style="{ left: startPos + 'px', width: width + 'px', top: topPosition + 'px' }" @click.stop="$emit('activate')">
      <div class="label" v-if="isActive">
        <v-card>
          <v-card-text>
            <v-list two-line>
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title><v-text-field label="Label" v-model="label"></v-text-field></v-list-tile-title>
                  <v-list-tile-sub-title>
                    <v-chip>Bird</v-chip>
                  </v-list-tile-sub-title>
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
      {{label}}
    </div>

    
    <div class="overlay" :style="{ left: startPos + 'px', width: width + 'px' }" v-show="width > 10"></div>
  </div>
</template>

<script>

const HANDLE_HEIGHT = 25
const BASE_TOP_POS = -35
const ELEVATION_MARGIN = 2
export default {
  props: {
    offset: Number,
    length: Number,

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
      label: ''
    }
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
    remove () {
      this.$emit('remove')
    },

    play () {
      this.$emit('play', this.startProgress, this.stopProgress)
    }
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
  }
}
</style>
