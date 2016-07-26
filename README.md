# reactjs-bootstrap-table

A React table component using Bootstrap. Supports single or multi-select, column sorting, and dynamic resizing.

**NOTE:** This requires Bootstrap (and Glyphicons) to be loaded. For example, if using Webpack:

```
npm install Bootstrap
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
   { id: 1, firstName: '...', lastName: '...', address: '...'},
   { id: 2, firstName: '...', lastName: '...', address: '...'},
   ...
]
let columns = [
  { name: firstName },
  { name: lastName },
  { name: address }
]

<BootstrapTable columns={columns} data={data} />
```
By default no table headers are shown. If you want headers you need to set the ```headers``` property to ```true``` and should add a ```display``` property to each column. If you don't add the ```display``` property the ```name``` field will be used (not generally what you want):

```
let columns = [
  { name: firstName, display: 'First Name' },
  { name: lastName, display: 'Last Name' },
  { name: address, display: 'Address' }
]

<BootstrapTable columns={columns} data={data} headers={true} />
```

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
Assuming the margins stay the same you can then change the height of the other elements without needing to re-adjust.

### Empty Table
If the data is empty, by default nothing will be rendered. If you would like to render an empty component to be displayed when the data length is zero, simply add it as a child component:

```
<BootstrapTable columns={columns} data={data} headers={true}>
  <div className="well">There are no items to show</div>
</BootstrapTable>
```

### Selection
The default ```select``` property is ```none```, but can be set to ```single``` or ```multiple``` to enable selection. Selection is treated like a "controlled property" to allow the table container to programmatically control the selection. Each time the selection changes the ```onChange``` handler is called with the new selection. The selection is an object with keys being the IDs of the selected rows or an empty object for no items selected:

```
TableContainer extends React.Component {
  constructor(props) {
    super(props);
    // set inital selection to empty
    this.setState({selection: {}, data: getData()});

    bindmethods(['onChange', 'onDelete'], this);
  }

  onChange(newSelection) {
    this.setState(newSelection)
  }

  onDelete() {
    Object.keys(this.state.selected).forEach(k => {
      deleteDataByKey(k);
    });
    this.setState({data: getData()});
  }

  render() {
    return (
      <div>
        <button onClick={this.onDelete}>Delete Selected</button>
        <BootstrapTable selected={this.state.selected} data={this.state.data}/>
      </div>
    );  
  }  
}
```
