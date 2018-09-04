<template>
  <div>
    <div class="audio-visual">
      <div class="waveform-container" ref="waveform-container"></div>
      <div class="spectrogram-container" ref="spectrogram-container">
        <annotation
          v-if="tmpAnnotation"
          :offset="tmpAnnotation.offset"
          :length="tmpAnnotation.length"
          :sound-duration="duration"
          :container-width="containerWidth"
          :elevation="elevations[tmpAnnotation.id]"
          :is-active="true"
          key="active">
        </annotation>
        <annotation v-if="wavesurferReady" v-for="(annotation, index) in sound_labels" 
          :offset="annotation.offset"
          :length="annotation.length"
          :elevation="elevations[annotation.id]"
          :sound-duration="duration"
          :container-width="containerWidth"
          :key="annotation.id"
          :is-active="annotation.id === activeAnnotationId"
          @remove="destroySoundLabel(annotation.id)"
          @play="playAnnotation"
          @activate="activateAnotation(annotation.id)"
          @deactivate="activateAnotation(-1)">
        </annotation>

      </div>
      <v-btn @click.prevent="togglePlay">Play / Pause (space)</v-btn>
    </div>
  </div>
</template>

<script>

const MIN_ANNOTATION_WIDTH = 10
const KEY_CODE_SPACE = 32
let COUNTER = 1

import WaveSurfer from 'wavesurfer.js/src/wavesurfer'
import Spectrogram from '@/lib/wavesurfer/wavesurfer.spectrogram'
import SpectrogramDrawer from '@/lib/wavesurfer/wavesurfer.drawer.spectrogram.js'
import Annotation from './Annotation'
import ElevationManager from '@/lib/annotations/elevation_manager'

import { mapActions, mapState } from 'vuex'

export default {
  components: { Annotation },
  props: ['sound_url'],

  data () {
    return {
      isPlaying: false,
      tmpAnnotation: null,
      playPauseIfSpace: null,
      activeAnnotationId: null,
      wavesurferReady: false,
      elevations: {}
    }
  },

  computed: {
    ...mapState('sound', ['sound_labels']),
    duration () {
      return this.wavesurfer.getDuration()
    },

    containerWidth () {
      return this.wavesurfer.container.getBoundingClientRect().width
    }
  },

  methods: {
    ...mapActions('sound', ['createSoundLabel', 'destroySoundLabel']),

    togglePlay(e) {
      if(!this.wavesurfer) return
      this.wavesurfer.playPause();
    },

    recalculateElevations() {
      let elevationManager = new ElevationManager(this.sound_labels, this.tmpAnnotation, (annotation, elevation) => {
        this.elevations[annotation.id] = elevation
      })
      elevationManager.recalculateElevations()
    },

    setActiveAnnotation ({startPos, stopPos, startProgress, stopProgress, containerWidth}) {
      let min = Math.min(startPos, stopPos)
      let max = Math.max(startPos, stopPos)

      let minProgress = Math.min(startProgress, stopProgress)
      let maxProgress = Math.max(startProgress, stopProgress)
    
      if (Math.abs(max - min) <= MIN_ANNOTATION_WIDTH) return
      this.activateAnotation(null)
      if (!this.tmpAnnotation) {
        if (this.sound_labels.filter((a) => a.startPos == min).length > 1) return
        this.tmpAnnotation = {}
      }
      this.$set(this.tmpAnnotation, 'offset', this.duration * minProgress)
      this.$set(this.tmpAnnotation, 'length', (this.duration * maxProgress) - this.tmpAnnotation.offset)
      this.$set(this.tmpAnnotation, 'isActive', false)
      this.$set(this.tmpAnnotation, 'id', 'active')
      this.recalculateElevations()
    },

    finnishActiveAnnotation ({startPos, stopPos, startProgress, stopProgress}) {
      this.setActiveAnnotation({startPos, stopPos, startProgress, stopProgress})
      
      if (!this.tmpAnnotation) return
      if (Math.abs(stopPos - startPos) >= MIN_ANNOTATION_WIDTH) { 
        let {offset, length} = this.tmpAnnotation
        this.createSoundLabel({offset, length})
      }
      this.tmpAnnotation = null
      this.recalculateElevations()
    },

    activateAnotation (id) {
      this.activeAnnotationId = id
    },

    playAnnotation(start, stop) {
      this.wavesurfer.play(this.duration * start, this.duration * stop)
    }
  },

  watch: {
    sound_labels () {
      this.recalculateElevations()
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
        this.wavesurferReady = true
        this.recalculateElevations()
        this.wavesurfer.spectrogram.on('dragStart', (dragState) => { 
          this.setActiveAnnotation(dragState)
        })

        this.wavesurfer.spectrogram.on('drag', (dragState) => { 
          this.setActiveAnnotation(dragState)
        })

        this.wavesurfer.spectrogram.on('dragStop', (dragState) => { 
          this.finnishActiveAnnotation(dragState)
        })

        this.playPauseIfSpace = function (e) {
          if (e.keyCode === KEY_CODE_SPACE) { 
            e.preventDefault()
            this.wavesurfer.playPause()
          }
        }.bind(this)
        window.addEventListener('keypress', this.playPauseIfSpace)
      })
    })
  },

  beforeDestroy() {
    if (this.wavesurfer) this.wavesurfer.destroy()
    window.removeEventListener('keypress', this.playPauseIfSpace)
  }
}
</script>

<style lang="scss" scoped>
.spectrogram-container {
  margin-top: 120px;
  margin-bottom: 20px;
  position: relative;
  cursor: crosshair;
}

.audio-visual {
  margin: 15px;
}

.waveform-container {
  height:0;
  visibility: hidden;
}
</style>

