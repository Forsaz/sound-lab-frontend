export default class ElevationManager {
  constructor (annotations, active_annotation, setElevation) {
    this.annotations = annotations
    this.active_annotation = active_annotation
    this.all_annotations = this.allAnnotations()
    this.setElevation = setElevation
  }

  recalculateElevations () {
    this.all_annotations.forEach((annotation) => {
      this.setElevation(annotation, 0)
    })

    let i = 0;
    while (this.isConflict()) {
      this.eachPair(this.handleOverlap.bind(this))
      i = i + 1;
      if (i > 100) break;
    }
    
  }
  
  handleOverlap (a1, a2) {
    if (a1.elevation !== a2.elevation) return true
    if (!this.isOverlap(a1, a2)) return true 
    let w1 = a1.stopPos - a1.startPos
    let w2 = a2.stopPos - a2.startPos
    if (w1 >= w2) { 
      let new_elevation = a1.elevation + 1
      a1.elevation = new_elevation
      this.setElevation(a1, new_elevation)
    } else { 
      let new_elevation = a2.elevation + 1
      a2.elevation = new_elevation
      this.setElevation(a2, new_elevation)
    }
  }

  isOverlap (a1, a2) {
    return (a1.startPos <= a2.startPos && a1.stopPos >= a2.startPos)
  }

  isConflict () {
    let isConflict = false
    this.eachPair((a1, a2) => {
      if(this.isOverlap(a1, a2) && a1.elevation == a2.elevation) isConflict = true
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