import FFT from './fft.js'

const DEFAULT_OPTIONS = {
  buffer: null, // wavesurfer.backend.buffer
  canvas: null,
  fftSamples: 512, // this.fftSamples (this = Spectrogram Plugin)
  noverlap: null, // this.noverlap (this = Spectrogram Plugin)
  windowFunc: 'hann', // this.windowFunc (this = Spectrogram Plugin)
  alpha: null, // this.alpha (this = Spectrogram Plugin)
  duration: null, // wavesurfer.backend.getDuration();
  hegith: null, // this.height
  heightScale: 1,
  colormap: null,
  width: null // drawer.width

};

export default class SpectrogramRenderer {
  constructor (options) {
    this.options = Object.assign({}, DEFAULT_OPTIONS, options)
    this.buffer = options.buffer
    this.sampleRate = this.buffer.sampleRate

    this.canvas = options.canvas
  }

  render () {
    let frequenciesData = this.getFrequencies()
    this.drawSpectrogram(frequenciesData)
  }

  drawSpectrogram (frequenciesData, my) {
    const spectrCc = this.canvas.getContext('2d');
    const length = this.options.duration
    const height = this.options.height
    const pixels = this.resample(frequenciesData);
    // const heightFactor = (this.buffer ? 2 / this.buffer.numberOfChannels : 1) * this.options.heightScale;
    const heightFactor = this.options.heightScale;
    let i;
    let j;

    for (i = 0; i < pixels.length; i++) {
      for (j = 0; j < pixels[i].length; j++) {
        const colorValue = pixels[i][j];
        spectrCc.fillStyle = this.options.colormap[colorValue];;
        spectrCc.fillRect(
                i,
                height - j * heightFactor,
                1,
                heightFactor
            );
      }
    }
  }

  getFrequencies () {
    const fftSamples = this.options.fftSamples;
    const buffer = this.buffer
    const channelOne = buffer.getChannelData(0)
    const sampleRate = buffer.sampleRate;
    const frequencies = [];

    if (!buffer) {
      this.fireEvent('error', 'Web Audio buffer is not available');
      return;
    }

    let noverlap = this.options.noverlap;
    if (!noverlap) {
      const uniqueSamplesPerPx = buffer.length / this.canvas.width;
      noverlap = Math.max(0, Math.round(fftSamples - uniqueSamplesPerPx));
    }

    const fft = new FFT(
      this.options.fftSamples,
      this.options.sampleRate,
      this.options.windowFunc,
      this.options.alpha
    );
    const maxSlicesCount = Math.floor(
      buffer.length / (fftSamples - noverlap)
    );
    let currentOffset = 0;

    while (currentOffset + fftSamples < channelOne.length) {
      const segment = channelOne.slice(
            currentOffset,
            currentOffset + fftSamples
        );
      const spectrum = fft.calculateSpectrum(segment);
      const array = new Uint8Array(fftSamples / 2);
      let j;
      for (j = 0; j < fftSamples / 2; j++) {
        array[j] = Math.max(-255, Math.log10(spectrum[j]) * 45);
      }
      frequencies.push(array);
      currentOffset += fftSamples - noverlap;
    }

    return frequencies;
  }

  resample (oldMatrix) {
    const columnsNumber = this.options.width;
    const newMatrix = [];

    const oldPiece = 1 / oldMatrix.length;
    const newPiece = 1 / columnsNumber;
    let i;

    for (i = 0; i < columnsNumber; i++) {
      const column = new Array(oldMatrix[0].length);
      let j;

      for (j = 0; j < oldMatrix.length; j++) {
        const oldStart = j * oldPiece;
        const oldEnd = oldStart + oldPiece;
        const newStart = i * newPiece;
        const newEnd = newStart + newPiece;

        const overlap =
                oldEnd <= newStart || newEnd <= oldStart
                    ? 0
                    : Math.min(
                          Math.max(oldEnd, newStart),
                          Math.max(newEnd, oldStart)
                      ) -
                      Math.max(
                          Math.min(oldEnd, newStart),
                          Math.min(newEnd, oldStart)
                      );
        let k;
            /* eslint-disable max-depth */
        if (overlap > 0) {
          for (k = 0; k < oldMatrix[0].length; k++) {
            if (column[k] == null) {
              column[k] = 0;
            }
            column[k] += overlap / newPiece * oldMatrix[j][k];
          }
        }
            /* eslint-enable max-depth */
      }

      const intColumn = new Uint8Array(oldMatrix[0].length);
      let m;

      for (m = 0; m < oldMatrix[0].length; m++) {
        intColumn[m] = column[m];
      }

      newMatrix.push(intColumn);
    }

    return newMatrix;
  }
}