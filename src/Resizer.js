module.exports = function (tableComponent, resizeObj, columnWidths) {

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
    let tableBody = document.getElementById(tableComponent.bodyId);
    if (!table) {
      return;
    }

    let th = table.offsetHeight;
    let tw = table.width;
    if (extra) {
      th = h - extra;
    }
    if (th < minSize) {
      th = minSize;
    }
    tableBody.style.height = '' + th + 'px';

    tableComponent.props.columns.forEach(col => {
      let width = columnWidths.getSize(tw, col.name) + extra;
      let className = 'cbst-' + col.name;
      console.log('COL ' + col.name + ' width = ' + width);

      let cols = document.getElementsByClassName(className);
      for (let i = 0; i < cols.length; i++) {
        let col = cols[i];
        col.style.width = '' + width + 'px';
      }
    });
  }

  this.addHandler = function () {
    window.addEventListener('resize', resize);
    resize();
  };

  this.removeHandler = function() {
    document.body.removeEventListener('resize', resize);
  }
}
