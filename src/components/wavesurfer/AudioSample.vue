<template>
  <div>
    <a href="#" class="btn btn-primary" @click.prevent="togglePlay">Play / Pause</a>
    <div class="audio-visual">
      <div class="waveform-container"></div>
      <div class="spectrogram-container">
        <annotation
          v-if="activeAnnotaion"
          :start-pos="activeAnnotaion.startPos"
          :stop-pos="activeAnnotaion.stopPos"
          :elevation="activeAnnotaion.elevation"
          :is-active="true"
          key="active">
        </annotation>
        <annotation v-for="(annotation, index) in annotations" 
          :start-pos="annotation.startPos"
          :stop-pos="annotation.stopPos"
          :start-progress="annotation.startProgress"
          :stop-progress="annotation.stopProgress"
          :elevation="annotation.elevation"
          :name="annotation.name"
          :key="index"
          :is-active="annotation.isActive"
          @remove="removeAnnotation(index)"
          @play="playAnnotation"
          @activate="activateAnotation(index)">
        </annotation>

      </div>
    </div>
  </div>
</template>

<script>

const MIN_ANNOTATION_WIDTH = 10
let NAMES = ['A','B','C','D','E','F','G','H']

import WaveSurfer from 'wavesurfer.js/src/wavesurfer'
import Spectrogram from '@/lib/wavesurfer/wavesurfer.spectrogram'
import SpectrogramDrawer from '@/lib/wavesurfer/wavesurfer.drawer.spectrogram.js'
import Annotation from './Annotation'
import ElevationManager from '@/lib/annotations/elevation_manager'


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

  computed: {
    duration () {
      return this.wavesurfer.getDuration()
    }
  },

  methods: {
    togglePlay(e) {
      if(!this.wavesurfer) return
      this.wavesurfer.playPause();
    },

    removeAnnotation(index) {
      this.annotations.splice(index, 1)
      this.recalculateElevations()
    },

    recalculateElevations() {
      let elevationManager = new ElevationManager(this.annotations, this.activeAnnotaion, (annotation, elevation) => {
        this.$set(annotation, 'elevation', elevation)
      })
      elevationManager.recalculateElevations()
    },

    setActiveAnnotation (startPos, stopPos, startProgress, stopProgress) {
      let min = Math.min(startPos, stopPos)
      let max = Math.max(startPos, stopPos)

      let minProgress = Math.min(startProgress, stopProgress)
      let maxProgress = Math.max(startProgress, stopProgress)
    
      if (max - min <= MIN_ANNOTATION_WIDTH) return
      if (!this.activeAnnotaion) {
        if (this.annotations.filter((a) => a.startPos == min).length > 1) return
        this.activeAnnotaion = {}
      }
      this.$set(this.activeAnnotaion, 'startPos', min)
      this.$set(this.activeAnnotaion, 'stopPos', max)
      this.$set(this.activeAnnotaion, 'startProgress', minProgress)
      this.$set(this.activeAnnotaion, 'stopProgress', maxProgress)
      this.$set(this.activeAnnotaion, 'isActive', false)
      this.$set(this.activeAnnotaion, 'elevation', 0)
      this.recalculateElevations()
    },

    finnishActiveAnnotation (startPos, stopPos, startProgress, stopProgress) {
      this.setActiveAnnotation(startPos, stopPos, startProgress, stopProgress)
      
      if (!this.activeAnnotaion) return
      if (this.activeAnnotaion.stopPos - this.activeAnnotaion.startPos >= MIN_ANNOTATION_WIDTH) { 
        this.activeAnnotaion.name = NAMES.splice(0,1)[0]
        this.annotations.push(this.activeAnnotaion)
      }
      this.activeAnnotaion = null
      this.activateAnotation(this.annotations.length - 1)
    },

    activateAnotation (index) {
      this.annotations.forEach((a) => a.isActive = false)
      this.annotations[index].isActive = true
    },

    playAnnotation(start, stop) {
      this.wavesurfer.play(this.duration * start, this.duration * stop)
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
          this.setActiveAnnotation(e.startPos, e.stopPos, e.startProgress, e.stopProgress)
        })

        this.wavesurfer.spectrogram.on('drag', (e) => { 
          this.setActiveAnnotation(e.startPos, e.stopPos, e.startProgress, e.stopProgress)
        })

        this.wavesurfer.spectrogram.on('dragStop', (e) => { 
          this.finnishActiveAnnotation(e.startPos, e.stopPos, e.startProgress, e.stopProgress)
         })
      })
    })
  }
}
</script>

<style lang="scss" scoped>
.spectrogram-container {
  margin-top: 120px;
  margin-bottom: 20px;
  position: relative;
}

.audio-visual {
  margin: 15px;
}

.waveform-container {
  height:0;
  visibility: hidden;
}
</style>

