import React, { Component } from 'react';
import Glyph from './Glyph'
import { bindmethods } from './util';
import Resizer from './Resizer';
import Selection from './Selection';
import ColumnSort from './ColumnSort';
import ColumnWidths from './ColumnWidths';

function noop() {}

function forceResize() {
  setTimeout(function () {
    if (document.createEvent) { // W3C
      var ev = document.createEvent('Event');
      ev.initEvent('resize', true, true);
      window.dispatchEvent(ev);
    }
    else { // IE
      var element=document.documentElement;
      var event=document.createEventObject();
      element.fireEvent("onresize",event);
    }
  }, 100);
}

//----------------------------------------------------------------------------
// A bootstrap table with single or multiple select.
//----------------------------------------------------------------------------
class BootstrapTable extends Component {
  constructor(props, context) {
    super(props, context);
    bindmethods(['toggleSelectAll', 'rowClicked', 'setColumnWidth',
                 'colClicked', 'rowDoubleClicked', 'getKeyAndIndex'], this);

    this.keyName = this.props.keyName || 'id';
    this.onChange = this.props.onChange || noop;
    this.id = this.props.id || 'bst-table1';
    this.headerId = this.id + '-header';
    this.bodyId = this.id + '-body';
    this.lastScrollTop = 0;

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

    this.columns = [];

    if (!this.props.columns) {
      let data = this.props.data || [];
      if (data.length) {
        Object.keys(data[0]).forEach(key => {
          this.columns.push({name: key});
        });
      }
    }
    else {
      if (typeof this.props.columns.length === 'undefined') {
        throw new Error('The columns property must be an array');
      }
      this.columns = this.props.columns;
    }

    this.selection = new Selection(this);
    this.columnSort = new ColumnSort(this);
    this.columnWidths = new ColumnWidths(this);

    this.state = {
      selectAll: false,
      bodyHeight: this.props.bodyHeight || '100%',
      anchor: null
    };
  }

  //----------------------------------------------------------------------------
  // Row clicked, update selection state
  //----------------------------------------------------------------------------

  // find the row clicked and extract it's key and index
  getKeyAndIndex(e) {
    let node = e.target, rid;
    // ignore clicks if the clicked on element is marked as no-select
    if (node.className && node.className.indexOf('bst-no-select') > -1) {
      return null;
    }
    // find the parent row marked with id = bst-<key>-<index>
    while (true) {
      rid = node.id;
      if (rid && rid.indexOf('bst-') === 0) {
        break;
      }
      else {
        node = node.parentNode;
      }
    }
    // user defined keys may have dashes, everything between "bst" and "index"
    // are part of the original key.
    const parts = rid.split('-')
    const index = parts[parts.length-1];
    const keyParts = parts.slice(1, parts.length - 1);
    const key = keyParts.join('-');
    return { key, index };
  }

  rowClicked(e) {
    // update the selection and clear the selectAll flag, if currently checked.
    let keyAndIndex = this.selection.rowClicked(e);

    if (this.state.selectAll) {
      this.setState({selectAll: false});
    }

    // invoke row clicked handler
    if (keyAndIndex) {
      let { key, index } = keyAndIndex;
      let row = this.props.data[index];
      if (this.props.onRowClicked) {
        this.props.onRowClicked(row);
      }
    }
  }

  rowDoubleClicked(e) {
    let keyAndIndex = this.getKeyAndIndex(e)
    if (keyAndIndex) {
      let { key, index } = keyAndIndex;
      let row = this.props.data[index];
      if (this.props.onRowDoubleClicked) {
        this.props.onRowDoubleClicked(row);
      }
    }
  }

  colClicked(e) {
    let node = e.target, rid;
    // find the parent row marked with id = bst-col-<key>
    while (true) {
      rid = node.id;
      if (rid && rid.indexOf('bst-') === 0) {
        break;
      }
      else {
        node = node.parentNode;
      }
    }
    const parts = rid.split('-')
    const key = parts[2];

    // If the column is sortable, this changes the state internally of
    // the columnSort so force an update.
    if (this.columnSort.sort(key)) {
      this.forceUpdate();
    }
  }

  //----------------------------------------------------------------------------
  // Toggle select all state
  //----------------------------------------------------------------------------
  toggleSelectAll() {
    const all = !this.state.selectAll, selected = {};
    const data = this.props.data || [];

    if (all) {
      data.forEach(function (item) {
        selected[item[this.keyName]] = item;
      }.bind(this));
    }
    this.setState( {selectAll: all} );
    this.onChange(selected);
  }

  onScroll(e) {
  }

  //----------------------------------------------------------------------------
  // Lifecycle
  //----------------------------------------------------------------------------

  componentDidMount() {
    if (this.props.resize) {
      this.resizer = new Resizer(this, this.props.resize, this.columnWidths);
      this.resizer.addHandler();
      forceResize();
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.select && newProps.select !== this.select) {
      this.select = newProps.select;
      this.selection = new Selection(this);
    }
    if (newProps.data && newProps.data.length === 0) {
      this.setState({selectAll: false});
    }
    if (this.props.resize) forceResize();
  }

  componentWillUnmount() {
    if (this.resizer) this.resizer.removeHandler();
  }

  render() {
    if (!(this.props.data && this.props.data.length)) {
      // no data, child element used to display empty message
      return this.props.children || <span/>;
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
    else {
      items.push(
        <th key="check" style={{width: '1px', borderColor: 'transparent', padding: 0}} />
      );
    }

    if (this.props.headers) {
      let ix = 1; // give header items a key to avoid react warning
      this.columns.map(function(col) {
        let title = col.display || col.name;
        let glyph = '';
        //if (col.sort) glyph = <Glyph icon="triangle-bottom"/>
        glyph = this.columnSort.getIcon(col.name);
        let thStyle = {width: this.columnWidths.getPercent(col.name)}
        items.push(
          <th key={ix++} id={'bst-col-' + col.name}
              className={'cbst-' + col.name}
              style={thStyle}
              onClick={this.colClicked}>
            {title} {glyph}
          </th>
        );
      }.bind(this));

      let tstyle = {};
      if (this.props.resize) tstyle = {display: 'block'};
      headers =
        <thead id={this.headerId} style={tstyle}>
          <tr style={{width: '100%', cursor: 'pointer'}}>
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
      if (!k) {
        if (this.selection.getType() != 'none') {
          throw new Error(missingKey);
        }
      }

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
      else {
        items.push(
          <th key="check" style={{width: '1px', borderColor: 'transparent', padding: 0}} />
        );
      }

      this.columns.forEach((col) => {
        let prop = col.name;
        let content = item[prop];
        if (col.renderer) {
          content = col.renderer(item);
          //for cases where content is true or false.
          content = (typeof content === 'boolean') ? ('' + content) : content;
        }
        let tdStyle = { width: this.columnWidths.getPercent(col.name) }
        let td =
          <td key={ix++}
              className={'cbst-' + col.name}
              style={tdStyle}>
            {content}
          </td>
        items.push(td);
      });

      let cursor = {};
      if (this.select === 'single' || this.select === 'multiple') {
        cursor = {cursor: 'pointer'};
      }
      row =
        <tr style={{width: '100%'}} id={rowId} key={index} style={cursor} className={clz}
            onClick={this.rowClicked} onDoubleClick={this.rowDoubleClicked}>
        {items}
      </tr>

      return row;

    }.bind(this));

    let bodyHeight = this.state.bodyHeight || '100%';

    let style = this.props.style || {};
    if (this.props.disableSelectText) {
      ['WebkitUserSelect', 'MozUserSelect', 'msUserSelect'].forEach(key => { style[key] = 'none'; });
    }
    let bstyle = {};
    if (this.props.resize) {
      bstyle = {
        height: bodyHeight,
        width: '100%',
        overflowY: 'auto',
        display: 'block',
        msOverflowStyle: '-ms-autohiding-scrollbar'
      };
    }

    let tableClass = this.props.tableClass || 'table table-hover table-bordered';
    let table = (
      <table style={style} className={tableClass} id={this.id}>
        {headers}
        <tbody id={this.bodyId} style={bstyle} onScroll={this.onScroll.bind(this)}>
          {rows}
        </tbody>
      </table>
    );
    return table;
  }
}
export default BootstrapTable;
