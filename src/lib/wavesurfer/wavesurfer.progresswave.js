import style from 'wavesurfer.js/src/util/style'

/** 
 * @typedef {Object} ProgressWave
 * 
 * @property {!HTMLElement} wrapper
 * @property {Object} options
*/

const DEFAULT_OPTIONS = {
  cursorColor: '#aaa',
  cursorWidth: 1,
  backgroundColor: 'pink',
  opacity: 0.3
}

class ProgressWave {
  

  constructor (wavesurfer, wrapper, options) {
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);
    this.wrapper = wrapper;
    this.wavesurfer = wavesurfer;
    this.waveElement = this.createWaveElement(options);
    this.wrapper.appendChild(this.waveElement);

    this.registerEvents();
  }

  registerEvents () {
    this.wavesurfer.on('audioprocess', (e) => { this.progress(e); });
    this.wavesurfer.on('seek', (e) => { this.progress(e); });
    this.wrapper.addEventListener('click', (e) => { this.handleWrapperClick(e) });
  }

  progress (time) {
    const progress = this.wavesurfer.backend.getPlayedPercents();
    const minPxDelta = 1 / this.wavesurfer.params.pixelRatio;
    const position = Math.round(progress * this.wavesurfer.drawer.width) * minPxDelta;

    style(this.waveElement, { width: position + 'px' });
  }

  handleWrapperClick (e) {
    let wrapperBbox = this.wrapper.getBoundingClientRect();
    let progress = (e.clientX - wrapperBbox.left) / wrapperBbox.width;
    
    setTimeout(() => this.wavesurfer.seekTo(progress), 0);
  }

  createWaveElement () {
    let wave = document.createElement('wave')

    let {cursorColor, cursorWidth, backgroundColor, opacity} = this.options;

    style(wave, {
      position: 'absolute',
      zIndex: 10,
      left: 0,
      top: 0,
      bottom: 0,
      overflow: 'hidden',
      width: '0',
      display: 'block',
      boxSizing: 'border-box',
      borderRightStyle: 'solid',
      pointerEvents: 'none',
      borderRightWidth: cursorWidth + 'px',
      borderRightColor: cursorColor,
      backgroundColor: backgroundColor,
      opacity: opacity
    })

    return wave;
  }
}

export default ProgressWave;