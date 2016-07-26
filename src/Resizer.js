module.exports = function (tableComponent, resizeObj) {

  function getSizeOfElements(ids) {
    if (!(ids && ids.length)) return 0;
    let total = 0;
    ids.forEach(id => {
      let elem = document.getElementById(id);
      if (elem && elem.offsetHeight) {
        total += elem.offsetHeight;
        console.log('height for: ' + id + ' = ' + elem.offsetHeight);
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
  console.log('minSize: ' + minSize);

  if (typeof resizeObj.extra === 'number') {
    console.log('resize number: ' + resizeObj.extra);
    extra = resizeObj.extra;
  }
  if (resizeObj.elements && resizeObj.elements.length) {
    console.log('resize array of : ' + resizeObj.elements.length);
    extra = extra + getSizeOfElements(resizeObj.elements);
  }
  if (extra) {
    let headerElement = document.getElementById(tableComponent.headerId);
    if (headerElement) {
      console.log('extra space for header: ' + headerElement.offsetHeight);
      extra = extra + headerElement.offsetHeight;
    }
  }


  console.log('extra space: ' + extra);

  function resize() {
    let h = window.innerHeight;
    let table = document.getElementById(tableComponent.id);
    if (!table) return;

    console.log('extra space: ' + extra);

    let th = table.offsetHeight;
    if (extra) {
      th = h - extra;
      console.log('new table height: ' + th);
    }
    if (th < minSize) {
      th = minSize;
    }
    console.log('window resize height: ' + h + ' table height ' + th);
    tableComponent.setState({bodyHeight: '' + th + 'px'});
  }

  this.addHandler = function () {
    window.addEventListener('resize', resize);
    console.log('resize handler added');
    resize();
  };

  this.removeHandler = function() {
    document.body.removeEventListener('resize', resize);
    console.log('resize handler removed');
  }

  console.log('Resizer constructed for table ' + tableComponent.id);
}
