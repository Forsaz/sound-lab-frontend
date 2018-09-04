class Dragger {
  constructor (eventTarget, container) {
    this.eventTarget = eventTarget;
    this.container = container;
    this.containerBbox = container.getBoundingClientRect();
    this.dragState = {};
    this.reset()
    this.registerEvents();
  }

  registerEvents () {
    this.container.addEventListener('mousedown', (e) => { this.startDrag(e); });
    this.container.addEventListener('mouseup', (e) => { this.stopDrag(e); });
    this.container.addEventListener('mousemove', (e) => { this.drag(e); });
  }

  startDrag (e) {
    this.setStartPos(e.clientX)
    this.dragState.startProgress = this.getProgress({clientX: e.clientX});
    this.setStopPos(e.clientX)
    this.dragState.stopProgress = this.getProgress({clientX: e.clientX});
    this.log();
    this.fireEvent('dragStart', this.dragState);
  }

  stopDrag (e) {
    this.setStopPos(e.clientX)
    this.dragState.stopProgress = this.getProgress({clientX: e.clientX});
    this.log();
    this.fireEvent('dragStop', this.dragState);
    this.reset();
  }

  drag (e) {
    if (!this.dragState.startPos) return;
    this.setStopPos(e.clientX)
    this.dragState.stopProgress = this.getProgress({clientX: e.clientX});
    this.log();
    this.fireEvent('drag', this.dragState);
  }

  reset () {
    this.dragState.startPos = null;
    this.dragState.stopPos = null;
    this.dragState.startProgress = null;
    this.dragState.stopProgress = null;
    this.dragState.containerWidth = this.containerBbox.width;
  }

  getProgress ({clientX}) {
    let bbox = this.containerBbox;
    return (clientX - bbox.left) / bbox.width;
  }

  setStartPos (startPos) {
    this.dragState.startPos = startPos - this.containerBbox.left;
  }

  setStopPos (stopPos) {
    this.dragState.stopPos = stopPos - this.containerBbox.left;
  }

  log () {
    // console.log(this.dragState);
  }

  fireEvent (eventName, state) {
    this.eventTarget.fireEvent(eventName, state);
  }
}

export default Dragger;