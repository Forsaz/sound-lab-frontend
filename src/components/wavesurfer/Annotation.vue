<template>
  <div :class="{ annotation: true, active: isActive}">
    <div class="handle" :style="{ left: startPos + 'px', width: width + 'px' }" @click="$emit('activate')">
      <div class="remove" @click="remove">X</div>
    </div>
    <div class="overlay" :style="{ left: startPos + 'px', width: width + 'px' }" v-show="width > 10"></div>
  </div>
</template>

<script>
export default {
  props: {
    startPos: Number,
    stopPos: Number,
    isActive: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
    }
  },

  computed: {
    width () {
      return (this.stopPos - this.startPos) 
    }
  },

  methods: {
    remove () {
      this.$emit('remove')
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
  top: -30px;
  position: absolute;
  height: 18px;
  background-color: rgb(0, 177, 185);

  display: flex;

  .remove {
    
    color: white;
    font-family: 'Arial Narrow', Arial, sans-serif;
    font-weight: bold;
  }
}
</style>
