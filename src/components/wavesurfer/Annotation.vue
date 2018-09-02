<template>
  <div :class="{ annotation: true, active: isActive}">
    <div class="handle" :style="{ left: startPos + 'px', width: width + 'px', top: topPosition + 'px' }" @click.stop="$emit('activate')">
      <div class="remove" @click.stop="remove"><v-icon size="15" color="white">cancel</v-icon></div>
      <div class="remove" @click.stop="play"><v-icon size="15" color="white">play_circle_filled</v-icon></div>
      {{name}}
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
    startPos: Number,
    stopPos: Number,
    startProgress: Number,
    stopProgress: Number,
    isActive: {
      type: Boolean,
      default: false
    },
    elevation: {
      type: Number,
      default: 0
    },
    name: {
      type: String,
      default: 'Z'
    }
  },

  data () {
    return {
    }
  },

  computed: {
    width () {
      return (this.stopPos - this.startPos) 
    },

    topPosition () {
      return BASE_TOP_POS - (this.elevation * (HANDLE_HEIGHT + ELEVATION_MARGIN))
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
}
</style>
