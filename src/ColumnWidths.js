module.exports = function ColumnWidths(columns) {

  let columnWidths = {};

  let remainder = 100;
  let unspecified = columns.length;

  columns.forEach(col => {
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
    columns.forEach(col => {
      if (typeof col.width === 'undefined') {
        columnWidths[col.name] = amount;
      }
    });
  }

  this.getSize = function(tableWidth, colName) {
    let pct = columnWidths[colName];
    let width = Math.floor(tableWidth * pct / 100);
    return width;
  }

  this.getPercent = function (colName) {
    return '' + columnWidths[colName] + '%';
  };
}
