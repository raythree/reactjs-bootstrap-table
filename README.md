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

```
import BootstrapTable from 'reactjs-bootstrap-table';

let data = [Â
   { firstName: '...', lastName: '...', address: '...'},
   ...
]
let columns = [
  { name: firstName },
  { name: lastName },
  { name: address }
]

<BootstrapTable columns={columns} data={data} />
```
By default no table headers are shown. If you want headers you need to add a ```display``` property to each column, and set the ```headers``` property to ```true```:

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
