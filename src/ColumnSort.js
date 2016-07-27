import React from 'react';
import Glyph from './Glyph';

module.exports = function (tableComponent) {

  function noop() {}

  let callback = tableComponent.props.onSort || noop;

  // icon components
  const up = <Glyph icon="triangle-top" />
  const down = <Glyph icon="triangle-bottom" />
  const none = <span />

  // current column state has name: 'asc', 'desc', or 'default' and icon.
  const columns = {};

  tableComponent.props.columns.forEach(col => {
    if (col.sort) {
      // initial sort state
      columns[col.name] = {
        state: 'none',
        icon: none
      }
    }
  });

  // column clicked on, update the sort state and trigger the
  // sort callback.
  this.sort = function (colName) {
    let next, icon;
    if (columns[colName]) {
      switch (columns[colName].state) {
        case 'none':
          next = 'asc';
          icon = up;
          break;

        case 'desc':
          next = 'none';
          icon = none;
          break;

        case 'asc':
          next = 'desc';
          icon = down;
          break;
      }
      console.log('SORT: sort on col ' + colName + ' ' + next);
      columns[colName].state = next;
      columns[colName].icon = icon;
      callback(colName, next);
    }
  };

  this.getIcon = function (colName) {
    console.log('getIcon for ' + colName);
    const column = columns[colName];
    if (column) return column.icon;
    return none;
  };

}
