module.exports = function (tableComponent, resizeObj) {

  function getSizeOfElements(ids) {
    if (!(ids && ids.length)) return 0;
    let total = 0;
    ids.forEach(id => {
      let elem = document.getElementById(id);
      if (elem && elem.offsetHeight) {
        total += elem.offsetHeight;
      }
    });
    return total;
  }

  var id = tableComponent.id;
  let extra = 0;
  let minSize = 0

  if (typeof resizeObj.minSize === 'number') {
    minSize = resizeObj.minSize;
  }

  if (typeof resizeObj.extra === 'number') {
    extra = resizeObj.extra;
  }
  if (resizeObj.elements && resizeObj.elements.length) {
    extra = extra + getSizeOfElements(resizeObj.elements);
  }
  if (extra) {
    let headerElement = document.getElementById(tableComponent.headerId);
    if (headerElement) {
      extra = extra + headerElement.offsetHeight;
    }
  }

  function resize() {
    let h = window.innerHeight;
    let table = document.getElementById(tableComponent.id);
    if (!table) {
      return;
    }

    let th = table.offsetHeight;
    if (extra) {
      th = h - extra;
    }
    if (th < minSize) {
      th = minSize;
    }
    tableComponent.setState({bodyHeight: '' + th + 'px'});
  }

  this.addHandler = function () {
    window.addEventListener('resize', resize);
    resize();
  };

  this.removeHandler = function() {
    document.body.removeEventListener('resize', resize);
  }
}
