import React, { Component } from 'react';
import Logger from 'simple-console-logger';
import Glyph from './Glyph'
import { bindmethods, getColumnWidths } from './util';
import Resizer from './Resizer';
import Selection from './Selection';
import ColumnSort from './ColumnSort';

Logger.configure({level: 'debug', 'dateFormat': null});
const log = Logger.getLogger('BootstrapTable');

function noop() {}

//----------------------------------------------------------------------------
// A bootstrap table with single or multiple select.
//----------------------------------------------------------------------------
class BootstrapTable extends Component {
  constructor(props, context) {
    super(props, context);
    bindmethods(['toggleSelectAll', 'rowClicked', 'setColumnWidth', 'getColWidth',
                 'colClicked'], this);

    this.keyName = this.props.keyName || 'id';
    this.onChange = this.props.onChange || noop;
    this.id = this.props.id || 'bst-table1';
    this.headerId = this.id + '-header';

    this.selection = new Selection(this);
    this.columnSort = new ColumnSort(this);

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

    this.columnWidths = getColumnWidths(this.props.columns);

    this.state = {
      selectAll: false,
      bodyHeight: this.props.bodyHeight || '100%',
      anchor: null
    };
  }

  //----------------------------------------------------------------------------
  // Row clicked, update selection state
  //----------------------------------------------------------------------------
  rowClicked(e) {
    // update the selection and clear the selectAll flag, if checked
    this.selection.rowClicked(e);
    if (this.state.selectAll) {
      this.setState({selectAll: false});
    }  
  }

  colClicked(e) {
    let node = e.target, rid;
    // find the parent row marked with id = bst-col-<key>
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
    const key = parts[2];

    log.debug('onColClick ' + key)

    // If the column is sortable, this changes the state internally of
    // the columnSort so force an update.
    if (this.columnSort.sort(key)) {
      this.forceUpdate();
    }
  }

  getColWidth(name) {
    let percent = this.columnWidths[name];
    return '' + percent + '%';
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
    if (this.props.resize) {
      this.resizer = new Resizer(this, this.props.resize);
      this.resizer.addHandler();
    }
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

    //log.debug('generating headers');
    if (this.props.headers) {
      let ix = 1; // give header items a key to avoid react warning
      this.props.columns.map(function(col) {
        let title = col.display || col.name;
        let glyph = '';
        //if (col.sort) glyph = <Glyph icon="triangle-bottom"/>
        glyph = this.columnSort.getIcon(col.name);
        items.push(
          <th key={ix++} id={'bst-col-' + col.name}
              style={{width: this.getColWidth(col.name)}}
              onClick={this.colClicked}>
            {title} {glyph}
          </th>
        );
      }.bind(this));

      headers =
        <thead style={{display: 'block'}} id={this.headerId}>
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
      row = <tr style={{width: '100%'}} id={rowId} key={index} style={cursor} className={clz} onClick={this.rowClicked}>
        {items}
      </tr>

      return row;

    }.bind(this));

    let bodyHeight = this.state.bodyHeight || '100%';
    console.log('bodyHeight set to: ' + bodyHeight);

    let style = this.props.style || {};
    if (this.props.disableSelectText) {
      ['WebkitUserSelect', 'MozUserSelect', 'msUserSelect'].forEach(key => { style[key] = 'none'; });
    }
    let table =
      <table style={style}className="table table-hover table-bordered" id={this.id}>
        {headers}
        <tbody style={{height: bodyHeight, width: '100%', overflow: 'auto', display: 'block'}}>
          {rows}
        </tbody>
      </table>
    return table;
  }
}
export default BootstrapTable;
