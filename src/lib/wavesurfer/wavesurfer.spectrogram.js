/**
* @typedef {Object} SpectrogramPluginParams
* @property {string|HTMLElement} container Selector of element or element in
* which to render
* @property {number} fftSamples=512 number of samples to fetch to FFT. Must be
* a pwer of 2.
* @property {number} noverlap Size of the overlapping window. Must be <
* fftSamples. Auto deduced from canvas size by default.
* @property {string} windowFunc='hann' The window function to be used. One of
* these: `'bartlett'`, `'bartlettHann'`, `'blackman'`, `'cosine'`, `'gauss'`,
* `'hamming'`, `'hann'`, `'lanczoz'`, `'rectangular'`, `'triangular'`
* @property {?number} alpha Some window functions have this extra value.
* (Between 0 and 1)
* @property {number} pixelRatio=wavesurfer.params.pixelRatio to control the
* size of the spectrogram in relation with its canvas. 1 = Draw on the whole
* canvas. 2 = Draw on a quarter (1/2 the length and 1/2 the width)
* @property {?boolean} deferInit Set to true to manually call
* `initPlugin('spectrogram')`
*/

/**
* Render a spectrogram visualisation of the audio.
*
* @implements {PluginClass}
* @extends {Observer}
* @example
* // es6
* import SpectrogramPlugin from 'wavesurfer.spectrogram.js';
*
* // commonjs
* var SpectrogramPlugin = require('wavesurfer.spectrogram.js');
*
* // if you are using <script> tags
* var SpectrogramPlugin = window.WaveSurfer.spectrogram;
*
* // ... initialising wavesurfer with the plugin
* var wavesurfer = WaveSurfer.create({
*   // wavesurfer options ...
*   plugins: [
*     SpectrogramPlugin.create({
*       // plugin options ...
*     })
*   ]
* });
*/

import FFT from './fft.js'
import colormap from 'colormap'
import loadLabels from './wavesurfer.spectrogram.labels'
import SpectrogramRenderer from './spectrogram_renderer'
import ProgressWave from './wavesurfer.progresswave'
import Dragger from './wavesurfer.spectrogram.dragger'

export default class SpectrogramPlugin {
  /**
   * Spectrogram plugin definition factory
   *
   * This function must be used to create a plugin definition which can be
   * used by wavesurfer to correctly instantiate the plugin.
   *
   * @param  {SpectrogramPluginParams} params parameters use to initialise the plugin
   * @return {PluginDefinition} an object representing the plugin
   */
  static create (params) {
      return {
          name: 'spectrogram',
          deferInit: params && params.deferInit ? params.deferInit : false,
          params: params,
          staticProps: {
              FFT: FFT
          },
          instance: SpectrogramPlugin
      };
  }

  constructor (params, ws) {
    this.params = params;
    this.wavesurfer = ws;
    this.util = ws.util;

    this.colormap = colormap({
      colormap: 'magma',
      nshades: 256,
      format: 'hex'
    });
    
    this.triggerReady = () => { this.onReady() }
  }

  onReady () {
    const drawer = (this.drawer = this.wavesurfer.drawer);

    this.container =
        'string' == typeof this.params.container
        ? document.querySelector(this.params.container)
        : this.params.container;

    if (!this.container) throw Error('No container for WaveSurfer spectrogram');

    this.width = drawer.width;
    this.pixelRatio = this.params.pixelRatio || this.wavesurfer.params.pixelRatio;
    this.fftSamples = this.params.fftSamples || this.wavesurfer.params.fftSamples || 512;
    this.height = (this.fftSamples / 2) * (this.params.heightScale || 1);
    this.noverlap = this.params.noverlap;
    this.windowFunc = this.params.windowFunc;
    this.alpha = this.params.alpha;

    this.createWrapper();
    this.createCanvas();
    this.progressWave = new ProgressWave(this.wavesurfer, this.container, { backgroundColor: 'transparent' });
    this.dragger = new Dragger(this, this.container);
    this.render();

    drawer.wrapper.addEventListener('scroll', this.updateScroll);
    this.wavesurfer.on('redraw', () => this.render());
  }

  init () {
    // Check if ws is ready
    if (this.wavesurfer.isReady) this.onReady();
    this.wavesurfer.on('ready', this.triggerReady);
  }

  destroy () {
    this.unAll();
    this.wavesurfer.un('ready', this.triggerReady);
    this.drawer.wrapper.removeEventListener('scroll', this.updateScroll);
    this.wavesurfer = null;
    this.util = null;
    this.params = null;
    if (this.wrapper) {
        this.wrapper.parentNode.removeChild(this.wrapper);
        this.wrapper = null;
    }
  }

  createWrapper () {
    const prevSpectrogram = this.container.querySelector('spectrogram');
    if (prevSpectrogram) this.container.removeChild(prevSpectrogram);
    const wsParams = this.wavesurfer.params;
    this.wrapper = document.createElement('spectrogram');
    // if labels are active
    this.createLabels();

    this.drawer.style(this.wrapper, {
        display: 'block',
        position: 'relative',
        userSelect: 'none',
        webkitUserSelect: 'none',
        height: `${this.height / this.pixelRatio}px`
    });

    if (wsParams.fillParent || wsParams.scrollParent) {
        this.drawer.style(this.wrapper, {
            width: '100%',
            overflowX: 'hidden',
            overflowY: 'hidden'
        });
    }
    this.container.appendChild(this.wrapper);

    this.wrapper.addEventListener('click', e => {
        e.preventDefault();
        const relX = 'offsetX' in e ? e.offsetX : e.layerX;
        this.fireEvent('click', relX / this.scrollWidth || 0);
    });
  }

  createCanvas () {
      const canvas = (this.canvas = this.wrapper.appendChild(
          document.createElement('canvas')
      ));

      this.util.style(canvas, {
        position: 'absolute',
        zIndex: 4,
        left: 0
      });
  }

  render () {
    this.updateCanvasStyle();
    let renderer = new SpectrogramRenderer({
      canvas: this.canvas,
      buffer: this.wavesurfer.backend.buffer,
      fftSamples: this.fftSamples,
      noverlap: this.noverlap,
      windowFunc: this.windowFunc,
      alpha: this.alpha,
      duration: this.wavesurfer.backend.getDuration(),
      height: this.height,
      width: this.drawer.width,
      colormap: this.colormap,
      heightScale: this.params.heightScale
    })
    renderer.render()
  }

  updateCanvasStyle () {
    const width = Math.round(this.width / this.pixelRatio) + 'px';
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.width = width;
  }

  updateScroll (e) {
    if (this.wrapper) {
      this.wrapper.scrollLeft = e.target.scrollLeft;
    }
  }

  createLabels () {
    if (!this.params.labels) return;
    this.labelsEl = loadLabels(
      this.height,
      this.pixelRatio,
      this.wavesurfer.backend.ac.sampleRate,
      this.fftSamples,
      this.drawer.style
    );
    this.wrapper.appendChild(this.labelsEl);
  }
}