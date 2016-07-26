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
