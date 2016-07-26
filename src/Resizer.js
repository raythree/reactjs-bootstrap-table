module.exports = function (tableComponent) {
  var id = tableComponent.id;

  function resize() {
    let h = window.innerHeight;
    let table = document.getElementById(tableComponent.id);
    if (!table) return;

    let th = table.offsetHeight;
    console.log('window resize height: ' + h + ' table height ' + th);
    //table.style.height = '' + h + 'px';
    tableComponent.setState({bodyHeight: '' + h + 'px'});
  }

  this.addHandler = function () {
    window.addEventListener('resize', resize);
    console.log('resize handler added');
  };

  this.removeHandler = function() {
    document.body.removeEventListener('resize', resize);
    console.log('resize handler removed');
  }

  console.log('Resizer constructed for table ' + tableComponent.id);
}
