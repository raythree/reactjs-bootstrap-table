//
// Handle selection events and callbacks for the table component. this
// reads the components data and selected properties and sets the
// components anchor state when clicking for multiple select.
//
module.exports = function (tableComponent) {

    let type;
    function noop() {}
    let onChange = tableComponent.props.onChange || noop;

    const select = tableComponent.select || 'none';
    if (select === 'multiple' || select === 'single' || select === 'none') {
      type = select;
    }
    else {
      throw new Error('bootstrap table: select must be single, multiple or none');
    }

    this.getType = function () {
      return type;
    };

    this.rowClicked = function (e) {
      let row = tableComponent.getKeyAndIndex(e)
      if (type === 'none') return row; // nothing to select, just return the row clicked

      if (!row) {
        return null;
      }
      let { key, index } = row;

      if (tableComponent.props.select === 'multiple') {
        this.multiSelect(key, index, e.shiftKey);
      }
      else {
        this.singleSelect(key, index);
      }
      return row;
    };

    this.singleSelect = function (key, index) {
      let data = tableComponent.props.data || [];
      let current = tableComponent.props.selected || {};
      let selected = {};

      if (current[key]) {
        onChange({}); // already selected, deselect it
      }
      else {
        selected[key] = data[index];
        onChange(selected);
      }
    };

    this.multiSelect = function (key, index, shiftKey) {
      let current = tableComponent.props.selected || {};
      let data = tableComponent.props.data || [];
      let selected = {};
      Object.keys(current).forEach(prop => {
        selected[prop] = current[prop];
      })

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
          selected[key] = data[index];
        }
        if (lower !== null) {
          selected = {};
          for (let i = lower; i <= upper; i++) {
            let item = data[i];
            selected[item[tableComponent.keyName]] = item;
          }
        }
      }
      else {
        if (selected[key]) {
          delete selected[key];
        }
        else {
          selected[key] = data[index];
        }
        tableComponent.setState({anchor: index})
      }

      tableComponent.onChange(selected);
    };

}
