module.exports = {
  bindmethods: function (list, obj) {
    if (!list) return;
    list.forEach((name) => {
      if (typeof obj[name] === 'function') {
        obj[name] = obj[name].bind(obj);
      }
    });
  },

  getColumnWidths: function (columns) {
    let remainder = 100;
    let unspecified = columns.length;
    let columnWidths = {};

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
    return columnWidths;
  }
}
