//
// Handle selection events and callbacks for the table component. this
// reads the components data and selected properties and sets the
// components anchor state when clicking for multiple select.
//
module.exports = function (tableComponent) {

    let type = 'none';
    function noop() {}
    let onChange = tableComponent.props.onChange || noop;

    const select = tableComponent.props.select;
    if (select === 'multiple' || select === 'single' || select === 'none') {
      type = select;
    }
    else {
      throw new Error('bootstrap table: select must be single, multiple or none');
    }

    this.rowClicked = function (e) {
      let node = e.target, rid;
      // ignore clicks if the clicked on element is marked as no-select
      if (node.className && node.className.indexOf('bst-no-select') > -1) {
        return;
      }
      if (type === 'none') return;

      // find the parent row marked with id = bst-<key>-<index>
      while (true) {
        rid = node.id;
        if (rid && rid.startsWith('bst-')) {
          break;
        }
        else {
          node = node.parentNode;
        }
      }

      const parts = rid.split('-')
      const key = parts[1];
      const index = parseInt(parts[2]);

      if (tableComponent.props.select === 'multiple') {
        this.multiSelect(key, index, e.shiftKey);
      }
      else {
        this.singleSelect(key);
      }
    };

    this.singleSelect = function (key) {
      let current = tableComponent.props.selected || {};
      let selected = {};

      if (current[key]) {
        onChange({}); // already selected, deselect it
      }
      else {
        selected[key] = true;
        onChange(selected);
      }
    };

    this.multiSelect = function (key, index, shiftKey) {
      let current = tableComponent.props.selected || {};
      let data = tableComponent.props.data || [];
      let selected = Object.assign({}, current);

      if (shiftKey && tableComponent.state.anchor !== null) {
        let upper = null, lower = null;
        if (tableComponent.state.anchor > index) {
          lower = index;
          upper = tableComponent.state.anchor;
        }
        else if (tableComponent.state.anchor <= index) {
          lower = tableComponent.state.anchor;
          upper = index;
        }
        else {
          tableComponent.setState({anchor: index});
          selected[key] = true;
        }
        if (lower !== null) {
          selected = {};
          for (let i = lower; i <= upper; i++) {
            let item = data[i];
            selected[item[tableComponent.keyName]] = true;
          }
        }
      }
      else {
        if (selected[key]) {
          delete selected[key];
        }
        else {
          selected[key] = true;
        }
        tableComponent.setState({anchor: index})
      }

      tableComponent.onChange(selected);
    };

}
