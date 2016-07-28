module.exports = {
  bindmethods: function (list, obj) {
    if (!list) return;
    list.forEach((name) => {
      if (typeof obj[name] === 'function') {
        obj[name] = obj[name].bind(obj);
      }
    });
  }
}
