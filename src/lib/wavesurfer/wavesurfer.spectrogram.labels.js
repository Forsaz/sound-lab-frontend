

function freqType(freq) {
    return freq >= 1000 ? (freq / 1000).toFixed(1) : Math.round(freq);
}

function unitType(freq) {
    return freq >= 1000 ? 'KHz' : 'Hz';
}

const DEFAULT_OPTIONS = {
    bgFill: 'rgba(68,68,68,0)',
    fontSizeFreq: '12px',
    fontSizeUnit: '10px',
    fontType: 'Helvetica',
    textColorFreq: '#fff',
    textColorUnit: '#f7f7f7',
    textAlign: 'center',
    container: '#specLabels'
}

function loadLabels(
    height, // this.height
    pixelRatio, // this.pixelRatio
    sampleRate, // wavesurfer.backend.ac.sampleRate
    fftSamples, // this.fftSamples
    style, // this.drawer.style
    opts
) {
    const labelsEl = document.createElement('canvas');
    labelsEl.classList.add('spec-labels');
    style(labelsEl, {
        left: 0,
        position: 'absolute',
        zIndex: 9,
        height: `${height / pixelRatio}px`,
        width: `${55 / pixelRatio}px`
    })

    const options = Object.assign({}, DEFAULT_OPTIONS, opts || {})

    const frequenciesHeight = height;
    const bgFill = options.bgFill
    const fontSizeFreq = options.fontSizeFreq
    const fontSizeUnit = options.fontSizeUnit
    const fontType = options.fontType
    const textColorFreq = options.textColorFreq
    const textColorUnit = options.textColorUnit
    const textAlign = options.textAlign
    const container = options.container
    const getMaxY = frequenciesHeight || 512;
    const labelIndex = 5 * (getMaxY / 256);
    const freqStart = 0;
    const step =
        (sampleRate / 2 - freqStart) /
        labelIndex;

    const ctx = labelsEl.getContext('2d');
    labelsEl.height = height;
    labelsEl.width = 55;

    ctx.fillStyle = bgFill;
    ctx.fillRect(0, 0, 55, getMaxY);
    ctx.fill();
    let i;

    for (i = 0; i <= labelIndex; i++) {
        ctx.textAlign = textAlign;
        ctx.textBaseline = 'middle';

        const freq = freqStart + step * i;
        const index = Math.round(
            freq / (sampleRate / 2) * fftSamples
        );
        const label = freqType(freq);
        const units = unitType(freq);
        const x = 16;
        const yLabelOffset = 2;

        if (i == 0) {
            ctx.fillStyle = textColorUnit;
            ctx.font = fontSizeUnit + ' ' + fontType;
            ctx.fillText(units, x + 24, getMaxY + i - 10);
            ctx.fillStyle = textColorFreq;
            ctx.font = fontSizeFreq + ' ' + fontType;
            ctx.fillText(label, x, getMaxY + i - 10);
        } else {
            ctx.fillStyle = textColorUnit;
            ctx.font = fontSizeUnit + ' ' + fontType;
            ctx.fillText(units, x + 24, getMaxY - i * 50 + yLabelOffset);
            ctx.fillStyle = textColorFreq;
            ctx.font = fontSizeFreq + ' ' + fontType;
            ctx.fillText(label, x, getMaxY - i * 50 + yLabelOffset);
        }
    }

    return labelsEl;
}

export default loadLabels;