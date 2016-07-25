import React, { Component } from 'react';
import Logger from 'simple-console-logger';

const log = Logger.getLogger('BootstrapTable');

class Glyph extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let style = this.props.style || {};
    let onClick = this.props.onClick || null;
    return (
      <span style={style} onClick={onClick} className={'glyphicon glyphicon-' + this.props.icon}> </span>
    );
  }
}

function bindmethods(list, obj) {
  if (!list) return;
  list.forEach((name) => {
    if (typeof obj[name] === 'function') {
      obj[name] = obj[name].bind(obj);
    }
  });
}

function noop() {}

//----------------------------------------------------------------------------
// A bootstrap table with single or multiple select.
//----------------------------------------------------------------------------
class BootstrapTable extends Component {
  constructor(props, context) {
    super(props, context);
    let cnt = this.props.data ? this.props.data.length : 'zero';
    //log.debug('constructed with ' + cnt + ' items');
    bindmethods(['toggleSelectAll', 'rowClicked', 'singleSelect', 'multiSelect'], this);

    let select = 'none';
    if (this.props.select) {
      if (this.props.select === 'single' ||
          this.props.select === 'multiple' ||
          this.props.select === 'none') {
        select = this.props.select;
      }
      else {
        throw new Error('select property must be single, multiple, or none');
      }
    }

    if (!this.props.columns) {
      throw new Error('The required columns property is missing');
    }

    this.state = {
      selectAll: false,
      select: select,
      data: this.props.data || [],
      lastClicked: null,
      keyName: this.props.keyName || 'id',
      columns: []
    };

    this.onChange = this.props.onChange || noop;
  }

  //----------------------------------------------------------------------------
  // Row clicked, update selection state
  //----------------------------------------------------------------------------
  rowClicked(e) {
    let node = e.target, rid;
    // ignore clicks if the clicked on element is marked as no-select
    if (node.className && node.className.indexOf('bst-no-select') > -1) {
      return;
    }
    if (this.state.select === 'none') {
      return;
    }

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
    const index = parts[2];
    log.debug('row clicked ====> ' + key + ' index = ' + index);

    if (this.props.select === 'multiple') {
      this.multiSelect(key, index);
    }
    else {
      this.singleSelect(key);
    }
  }

  singleSelect(key) {
    let current = this.props.selected || {};
    let selected = {};

    if (current[key]) {
      this.onChange({}); // already selected, deselect it
    }
    else {
      selected[key] = true;
      this.onChange(selected);
    }
  }

  multiSelect(key, index) {
    let current = this.props.selected || {};
    let selected = Object.assign({}, current);
    if (selected[key]) {
      delete selected[key];
    }
    else {
      selected[key] = true;
    }

    this.setState({lastClicked: index})
    this.onChange(selected);
  }

  //----------------------------------------------------------------------------
  // Toggle select all state
  //----------------------------------------------------------------------------
  toggleSelectAll() {
    const all = !this.state.selectAll, selected = {};

    if (all) {
      this.props.data.forEach(function (item) {
        selected[item[this.state.keyName]] = true;
      }.bind(this));
    }
    this.setState( {selectAll: all} );
    this.onChange(selected);
  }

  //----------------------------------------------------------------------------
  // Lifecycle
  //----------------------------------------------------------------------------

  componentWillReceiveProps(newProps, oldProps) {
    log.debug('will receive props');

    //let selected = getSelection(newProps);
    //this.setState({selected: selected});
  }

  render() {
    if (!(this.props.data.length)) {
      // no data, child element used to display empty message
      return this.props.children;
    }

    let headers = <thead/>, body = '', items = [], rows, selectAll = 'unchecked';
    let selected = this.props.selected || {};

    if (this.state.selectAll) selectAll = 'check';

    // add select all header only for multiple selection
    if (this.state.select === 'multiple') {
      items.push(
        <th key="check" style={{width: '1em'}}>
          <Glyph onClick={this.toggleSelectAll} icon={selectAll}/>
        </th>
      );
    }

    //log.debug('generating headers');
    if (this.props.headers) {
      let ix = 1; // give header items a key to avoid react warning
      this.props.columns.map((col) => {
        let title = col.display || col.name;
        let glyph = '';
        if (col.sort) glyph = <Glyph icon="triangle-bottom"/>
        items.push(
          <th key={ix++}>
            {title} {glyph}
          </th>
        );
      });

      headers =
        <thead>
          <tr>
            { items }
          </tr>
        </thead>
    }

    //
    // Table rows bound to this to handle row clicks
    //
    let index = -1;
    rows = this.props.data.map(function (item) {
      ++index;
      let rowId, row, icon = 'unchecked', clz = '', items = '';

      let missingKey = 'Data item missing key. If the default "id" key is not used set the keyName property.';
      let k = item[this.state.keyName];
      if (!k) throw new Error(missingKey);

      // Used to identify the row element that was clicked. If a child is clicked, navigate up each
      // parentNode until a 'bst-' row ID is found.
      rowId = 'bst-' + k + '-' + index;

      // change styles if current row is selected
      if (selected[k]) {
        icon = 'check';
        clz = this.props.activeClass || 'active';
      }

      items = [];
      let ix = 1;

      // add select all header only for multiple selection
      if (this.state.select === 'multiple') {
        items.push(
          <td key="check" style={{width: '1em'}}><Glyph icon={icon} /></td>
        );
      }

      this.props.columns.forEach((col) => {
        let prop = col.name;
        let content = item[prop];
        if (col.renderer) {
          content = col.renderer(item);
        }
        let td = <td key={ix++}>{content}</td>
        items.push(td);
      });

      //log.debug('=====> table row with key ' + k);
      let cursor = {};
      if (this.state.select === 'single' || this.state.select === 'multiple') {
        cursor = {cursor: 'pointer'};
      }
      row = <tr id={rowId} key={index} style={cursor} className={clz} onClick={this.rowClicked}>
        {items}
      </tr>

      return row;

    }.bind(this));

    let style = this.props.style || {};
    let table =
      <table style={style}className="table table-hover table-bordered">
        {headers}
        <tbody>
          {rows}
        </tbody>
      </table>

    return table;
  }
}
export default BootstrapTable;
