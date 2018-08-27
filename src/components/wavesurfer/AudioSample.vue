<template>
  <div>
    <a href="#" class="btn btn-primary" @click="togglePlay">Play / Pause</a>
    <div class="audio-visual">
      <div class="waveform-container"></div>
      <div class="spectrogram-container">
        <annotation
          v-if="activeAnnotaion"
          :start-pos="activeAnnotaion.startPos"
          :stop-pos="activeAnnotaion.stopPos"
          :is-active="true"
          key="active">
        </annotation>
        <annotation v-for="(annotation, index) in annotations" 
          :start-pos="annotation.startPos"
          :stop-pos="annotation.stopPos"
          :key="index"
          :is-active="annotation.isActive"
          @remove="annotations.splice(index, 1)"
          @activate="activateAnotation(index)">
        </annotation>

      </div>
    </div>
  </div>
</template>

<script>

import WaveSurfer from 'wavesurfer.js/src/wavesurfer'
import Spectrogram from '@/lib/wavesurfer/wavesurfer.spectrogram'
import SpectrogramDrawer from '@/lib/wavesurfer/wavesurfer.drawer.spectrogram.js'
import Annotation from './Annotation'


export default {
  components: { Annotation },
  props: ['sound_url'],

  data () {
    return {
      isPlaying: false,
      activeAnnotaion: null,
      annotations: []
    }
  },

  methods: {
    togglePlay(e) {
      if(!this.wavesurfer) return
      this.wavesurfer.playPause();
    },

    setActiveAnnotation (startPos, stopPos) {
      if (!this.activeAnnotaion) {
        if (this.annotations.filter((a) => a.startPos == startPos).length > 1) return
        this.activeAnnotaion = {}
      }
      this.$set(this.activeAnnotaion, 'startPos', startPos)
      this.$set(this.activeAnnotaion, 'stopPos', stopPos)
      this.$set(this.activeAnnotaion, 'isActive', false)
    },

    finnishActiveAnnotation (startPos, stopPos) {
      this.setActiveAnnotation(startPos, stopPos)
      if (stopPos - startPos >= 20) this.annotations.push(this.activeAnnotaion)
      this.activeAnnotaion = null
      this.activateAnotation(this.annotations.length - 1)
    },

    activateAnotation (index) {
      this.annotations.forEach((a) => a.isActive = false)
      this.annotations[index].isActive = true
    }
  },

  mounted() {
    this.$nextTick(() => {
      this.wavesurfer = WaveSurfer.create({
        container: '.waveform-container',
        waveColor: 'violet',
        progressColor: 'purple',
        renderer: SpectrogramDrawer,
        responsive: true,
        barHeight: 5,
        normalize: true,
        // splitChannels: true,

        plugins: [
          Spectrogram.create({ 
            container: '.spectrogram-container', 
            labels: false,
            heightScale: 2
          })
        ]
      })

      this.wavesurfer.load(this.sound_url)

      this.wavesurfer.on('ready', () => {
        this.wavesurfer.spectrogram.on('dragStart', (e) => { 
          this.setActiveAnnotation(e.startPos, e.stopPos)
        })

        this.wavesurfer.spectrogram.on('drag', (e) => { 
          this.setActiveAnnotation(e.startPos, e.stopPos)
        })

        this.wavesurfer.spectrogram.on('dragStop', (e) => { 
          this.finnishActiveAnnotation(e.startPos, e.stopPos)
         })
      })
    })
  }
}
</script>

<style lang="scss" scoped>
.spectrogram-container {
  margin-top: 50px;
  margin-bottom: 20px;
  position: relative;
}

.audio-visual {
  margin: 15px;
}

.waveform-container {
  height:0;
}
</style>

