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

let data = [
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
### Table height
By default all rows will be shown. If you want the table body to be a fixed size with the rows scrolling (auto), include the ```bodyHeight``` property:

```
<BootstrapTable bodyHeight={'40em'} .../>
```

If you want the table to fill the client area and dynamically resize when the browser window resizes, use the ```resize``` property. This property allows you to specify extra space to leave for other elements on the page. For example, if the other elements occupy 200 pixels and you want all elements plus the table to be visible in the client area, use:

```
<BootstrapTable resize={{extra: 200}} />
```
