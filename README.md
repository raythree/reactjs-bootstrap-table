# reactjs-bootstrap-table

A React table component using Bootstrap. Supports single or multi-select, column sorting, and dynamic resizing. Features like pagination, local or remote data sorting, etc. can easily be added externally.

[A demo is here](http://demo.ray3.io/bootstrap-table/)

[Code for demo here](https://github.com/raythree/reactjs-bootstrap-table-demo)

**NOTE:** This requires Bootstrap (and Glyphicons) to be loaded. For example, if using Webpack:

```
npm install bootstrap
```

Then inside your main app:

```
require('bootstrap/dist/css/bootstrap.css');
```
### Basic Usage

The data to be displayed is an array of objects and the ```columns``` property specifies which data items should be displayed. Each item must have a unique key field *if selection is enabled*. The key defaults to ```id```. If a different field is used as the key specify it's name with the ```keyName``` property.

```
import BootstrapTable from 'reactjs-bootstrap-table';

let data = [
   { id: 1, 'firstName': '...', lastName: '...', address: '...'},
   { id: 2, 'firstName': '...', lastName: '...', address: '...'},
   ...
]
let columns = [
  { name: 'firstName' },
  { name: 'lastName' },
  { name: 'address' }
]

<BootstrapTable columns={columns} data={data} />
```

If you do not provide the ```columns``` property the keys from the first data row are used for column ```name```s.

By default no table headers are shown. If you want headers you need to set the ```headers``` property to ```true``` and should add a ```display``` property to each column. If you don't add the ```display``` property the ```name``` field will be used (not generally what you want):

```
let columns = [
  { name: 'firstName', display: 'First Name' },
  { name: 'lastName', display: 'Last Name' },
  { name: 'address', display: 'Address' }
]

<BootstrapTable columns={columns} data={data} headers={true} />
```

### Table properties
* ```data``` (required) - Array of data rows to display.
* ```columns``` (optional) - Column definitions. See below.
* ```headers``` (optional) - Set to true to show column headers. See column properties below. Default false.
* ```select``` (optional) - Enable selection. Values are single, multiple or none. (default none).
* ```selected``` (optional) - Object containing keys of selected items with truthy values e.g. {key1: true, key2: true} (see Selection below).
* ```resize``` (optional) - Display scrollable table body resizing to a specified height (see below). Default is to show all rows.
* ```disableSelectText``` (optional) - Set to true to disable selection of text (default is false).
* ```activeClass``` (optional) - className to apply to selected rows. Default is "active".


### Column properties

These are the properties for objects in the columns array:

* ```name``` (required) - Property name of the field to display.
* ```display``` (optional) - Name to display in the column header (if table headers property set to true). Defaults to ```name```.
* ```sort``` (optional) - Set to true if the column is sortable (default false).
* ```renderer``` (optional) - Function that takes the entire row as a parameter and returns a React component to be displayed in the column. Default displays content of row[name].
* ```width``` (optional) - A percent integer for the column width. All columns without width are equally spaced with remaining percentage after summing columns specifying a width.

### Table body height
By default all rows will be shown. If you want the table body to be a fixed size with the rows scrolling (auto), include the ```bodyHeight``` property:

```
<BootstrapTable bodyHeight={'40em'} .../>
```

### Dynamic resizing

If you want the table to fill the client area and dynamically resize when the browser window resizes, use the ```resize``` property. This property allows you to specify extra space to leave for other elements on the page. For example, if the other elements occupy 200 pixels and you want all elements plus the table to be visible in the client area, use:

```
<BootstrapTable resize={{extra: 200}} />
```

Alternatively, you can supply the resize object with a list of element IDs and it will get their height (offsetHeight) and subtract them. It will automatically subtract the height of the table header. Note that this does not include possible margin spacing, so you may need to adjust using both elements and extra space so that everything fits on the page:

```
<div id="header" />

<BootstrapTable resize={{extra: 80}, elements: ['header', 'footer']} />

<div id="footer" />
```

Assuming the margins stay the same you can then change the height of the other elements without needing to re-adjust. You can also specify a minimum size for the table body in pixels:

```
<BootstrapTable resize={{extra: 80}, minSize={200} elements: ['header', 'footer']} />
```

### Empty Table
If the data is empty, by default nothing will be rendered. If you would like to render an empty component to be displayed when the data length is zero, simply add it as a child component:

```
<BootstrapTable columns={columns} data={data} headers={true}>
  <div className="well">There are no items to show</div>
</BootstrapTable>
```

### Selection
The default ```select``` property is ```none```, but can be set to ```single``` or ```multiple``` to enable selection. The default className for selected rows is "active" but you can specify the ```activeClass``` property to change it to any other class, either your own or a bootstrap class like "info".

Selection is treated like a "controlled property" to allow the table container to programmatically control the selection. Each time the selection changes the ```onChange``` handler is called with the new selection. The selection is an object with keys being the IDs of the selected rows or an empty object for no items selected:

```
TableContainer extends React.Component {
  constructor(props) {
    super(props);
    // set inital selection to empty
    this.setState({selection: {}, data: getData()});

    bindmethods(['onChange', 'onDelete', 'deselectAll'], this);
  }

  onChange(newSelection) {
    this.setState({selection: newSelection})
  }

  deselectAll() {
    this.setState({}})
  }

  onDelete() {
    Object.keys(this.state.selected).forEach(k => {
      deleteDataByKey(k);
    });
    // refresh data and clear selection
    this.setState({data: getData(), selection: {}});
  }

  render() {
    return (
      <div>
        <button onClick={this.onDelete}>Delete Selected</button>
        <button onClick={this.onDeselectAll}>Deselected All</button>
        <BootstrapTable selected={this.state.selection} data={this.state.data}/>
      </div>
    );  
  }  
}
```

### Disable table text select
When multiple selection is enabled, SHIFT-click is used to select a range. If text selection in the table is enabled this sometimes looks a bit ugly with highlighed text mixed in with the selection highlight. If you don't need users to be able to select/copy text (or provide another mechanism for them to do so), you can disable text selection by setting ```disableSelectText``` to true:

```
<BootstrapTable disableSelectText={true} .../>
```
Internally this adds the following styles to the table:

```
if (this.props.disableSelectText) {
  ['WebkitUserSelect', 'MozUserSelect', 'msUserSelect'].forEach(key => { style[key] = 'none'; });
}
```
### Custom cell renderers
You can specify a renderer inside a column to handle custom rendering. The function needs to return a react component. Note that when selection is enabled, clicking on child elements will by default change the row's selction state. If you do not want this to happen, add the className "bst-no-select" to the element. For example, to place a clickable link in one of the cells such that clicking the link does not alter the current selection state:

```
let columns = [
  { name: image, renderer: myRenderer},
  ...
]

function mRenderer(row) {
  return <a href={row.image.link} className="bst-no-select">{row.image.description}</a>
}

```
Note that the renderer is passed the entire record (row), not just the data for that column.

### Column sorting

To make a column sortable, add a ```sort``` property to the column definition, with a value of ```true``` and add an ```onSort``` property to the table. When a sortable column is clicked, it will cycle through the states 'asc', 'desc' and 'none' (default order) and the column direction icon will be shown:

```
let columns = [
  { name: lastName, sort: true, display: 'Last Name' },
  ...
]

onSort(colName, dir) {
  if (dir === 'asc') ...sort ascending
  else if (dir === 'desc') ...sort descending
  else ... default order
  this.setState({data, sortedData});
}

<BootstrapTable onSort={this.onSort} data={this.state.data} .../>
```

### Row click handlers
The table ```onRowClicked``` and ```onRowDoubleClicked``` properties take callback functions that are called when rows are clicked and double clicked. Note that if specified these are called in addition to the selection ```onChange``` events. Also the single click is always called before the double click. The single click callback is most useful if selection is ```none```, and the double click handler is most useful for double-click-to edit functionality. Both are called with the row clicked on:

```
onDoubleClicked(row) {
   console.log('row double clicked: ' + row.id);
   editRow(row);  
}

<BootstrapTable onRowDoubleClicked={this.onDoubleClicked} .../>
```
