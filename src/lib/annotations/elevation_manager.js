function startPos (a) {
  return a.offset
}

function stopPos (a) {
  return a.offset + a.length
}

export default class ElevationManager {
  constructor (annotations, active_annotation, emmitElevationChange) {
    this.annotations = annotations
    this.active_annotation = active_annotation
    this.all_annotations = this.allAnnotations()
    this.emmitElevationChange = emmitElevationChange
    this.elevations = {}
  }

  elevation (a) {
    return this.elevations[a.id] || 0
  }

  setElevation (a, elevation) {
    this.elevations[a.id] = elevation
  }

  recalculateElevations () {
    this.all_annotations.forEach((annotation) => {
      this.emmitElevationChange(annotation, 0)
    })

    let i = 0;
    while (this.isConflict()) {
      this.eachPair(this.handleOverlap.bind(this))
      i = i + 1;
      if (i > 100) break;
    }
  }

  handleOverlap (a1, a2) {
    if (this.elevation(a1) !== this.elevation(a2)) return true
    if (!this.isOverlap(a1, a2)) return true 
    let w1 = stopPos(a1) - startPos(a1)
    let w2 = stopPos(a2) - startPos(a2)
    if (w1 <= w2) { 
      let new_elevation = this.elevation(a1) + 1
      this.setElevation(a1, new_elevation)
      this.emmitElevationChange(a1, new_elevation)
    } else { 
      let new_elevation = this.elevation(a2) + 1
      this.setElevation(a2, new_elevation)
      this.emmitElevationChange(a2, new_elevation)
    }
  }

  isOverlap (a1, a2) {
    return (startPos(a1) <= startPos(a2) && stopPos(a1) >= startPos(a2))
  }

  isConflict () {
    let isConflict = false
    this.eachPair((a1, a2) => {
      if (this.isOverlap(a1, a2) && this.elevation(a1) == this.elevation(a2)) isConflict = true
    })
    return isConflict
  }

  eachPair (resolvePair) {
    this.all_annotations.forEach((a1, i1) => {
      this.all_annotations.forEach((a2, i2) => {
        if (i1 !== i2) {
          resolvePair(a1, a2)
        }
      })
    })
  }

  allAnnotations () {
    let array = []
    if (this.active_annotation) array.push(this.active_annotation)
    this.annotations.forEach((annotation, index) => {
      array.push(annotation)
    })
    return array
  }
}