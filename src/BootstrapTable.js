import React, { Component } from 'react';
import Logger from 'simple-console-logger';
import $ from 'jquery';

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
    bindmethods(['toggleSelectAll', 'rowClicked', 'singleSelect', 'multiSelect',
                 'setColumnWidth', 'getColWidth'], this);

    this.keyName = this.props.keyName || 'id';
    this.onChange = this.props.onChange || noop;

    this.select = 'none';
    if (this.props.select) {
      if (this.props.select === 'single' ||
          this.props.select === 'multiple' ||
          this.props.select === 'none') {
        this.select = this.props.select;
      }
      else {
        throw new Error('select property must be single, multiple, or none');
      }
    }

    if (!this.props.columns) {
      throw new Error('The required columns property is missing');
    }
    if (typeof this.props.columns.length === 'undefined') {
      throw new Error('The columns property must be an array');
    }

    this.setColumnWidths();

    this.state = {
      selectAll: false,
      anchor: null
    };
  }

  //----------------------------------------------------------------------------
  // Adjust column width
  //----------------------------------------------------------------------------
  setColumnWidths() {
    let remainder = 100;
    let unspecified = this.props.columns.length;
    let columnWidths = {};

    this.props.columns.forEach(col => {
      if (typeof col.width !== 'undefined') {
        if (typeof col.width !== 'number') {
          throw new Error('column width property must be a percent number');
        }
        if (col.width < 0 || col.width > 100) {
          throw new Error('column width must be between 0 and 100')
        }
        --unspecified;
        remainder = remainder - col.width;
        columnWidths[col.name] = col.width;
      }
    });
    if (remainder < 0) {
      throw new Error('total column widths may not exceed 100 percent');
    }
    if (remainder > 0 && unspecified) {
      let amount = remainder / unspecified;
      this.props.columns.forEach(col => {
        if (typeof col.width === 'undefined') {
          columnWidths[col.name] = amount;
        }
      });
    }
    Object.keys(columnWidths).forEach(name => {
      log.debug('column name: ' + name + ' width: ' + columnWidths[name].width);
    });

    this.columnWidths = columnWidths;
  }

  getColWidth(name) {
    let percent = this.columnWidths[name];
    return '' + percent + '%';
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
    if (this.select === 'none') {
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
    const index = parseInt(parts[2]);
    log.debug('row clicked ====> ' + key + ' index = ' + index + ' shift ' + e.shiftKey);

    if (this.props.select === 'multiple') {
      this.multiSelect(key, index, e.shiftKey);
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

  multiSelect(key, index, shiftKey) {
    log.debug('processing multiselect');
    let current = this.props.selected || {};
    let data = this.props.data || [];
    let selected = Object.assign({}, current);

    if (shiftKey && this.state.anchor !== null) {
      let upper = null, lower = null;
      if (this.state.anchor > index) {
        lower = index;
        upper = this.state.anchor;
      }
      else if (this.state.anchor <= index) {
        lower = this.state.anchor;
        upper = index;
      }
      else {
        this.setState({anchor: index});
        selected[key] = true;
      }
      if (lower !== null) {
        selected = {};
        log.debug('SELECT: anchor: ' + this.state.anchor +
          ' lower: ' + lower + ' upper: ' + upper
        );
        for (let i = lower; i <= upper; i++) {
          let item = data[i];
          selected[item[this.keyName]] = true;
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
      this.setState({anchor: index})
    }

    this.onChange(selected);
  }

  //----------------------------------------------------------------------------
  // Toggle select all state
  //----------------------------------------------------------------------------
  toggleSelectAll() {
    const all = !this.state.selectAll, selected = {};
    const data = this.props.data || [];

    if (all) {
      data.forEach(function (item) {
        selected[item[this.keyName]] = true;
      }.bind(this));
    }
    this.setState( {selectAll: all} );
    this.onChange(selected);
  }

  //----------------------------------------------------------------------------
  // Lifecycle
  //----------------------------------------------------------------------------

  componentDidMount() {
  }

  componentWillReceiveProps(newProps, oldProps) {
    log.debug('will receive props');
  }

  render() {
    if (!(this.props.data && this.props.data.length)) {
      // no data, child element used to display empty message
      return this.props.children;
    }

    let headers = <thead/>, body = '', items = [], rows, selectAll = 'unchecked';
    let selected = this.props.selected || {};

    if (this.state.selectAll) selectAll = 'check';

    // add select all header only for multiple selection
    if (this.select === 'multiple') {
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
          <th key={ix++} style={{width: this.getColWidth(col.name)}}>
            {title} {glyph}
          </th>
        );
      });

      headers =
        <thead style={{display: 'block'}}>
          <tr>
            { items }
          </tr>
        </thead>
    }

    //
    // Table rows bound to this to handle row clicks
    //
    let index = -1, data = this.props.data || [];
    rows = data.map(function (item) {
      ++index;
      let rowId, row, icon = 'unchecked', clz = '', items = '';

      let missingKey = 'Data item missing key. If the default "id" key is not used set the keyName property.';
      let k = item[this.keyName];
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
      if (this.select === 'multiple') {
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
        let td = <td key={ix++} style={{width: this.getColWidth(col.name)}}>{content}</td>
        items.push(td);
      });

      //log.debug('=====> table row with key ' + k);
      let cursor = {};
      if (this.select === 'single' || this.select === 'multiple') {
        cursor = {cursor: 'pointer'};
      }
      row = <tr id={rowId} key={index} style={cursor} className={clz} onClick={this.rowClicked}>
        {items}
      </tr>

      return row;

    }.bind(this));

    let bodyHeight = this.props.bodyHeight || '100%';
    let style = this.props.style || {};
    let table =
      <div style={{msUserSelect: 'none'}}>
        <table style={style}className="table table-hover table-bordered">
          {headers}
          <tbody style={{height: bodyHeight, width: '100%', overflow: 'auto', display: 'block'}}>
            {rows}
          </tbody>
        </table>
      </div>
    return table;
  }
}
export default BootstrapTable;
