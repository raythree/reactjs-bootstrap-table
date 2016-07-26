import React from 'react';

class Glyph extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let style = this.props.style || {};
    let onClick = this.props.onClick || null;
    return (
      <span style={style} onClick={onClick} className={'glyphicon glyphicon-' + this.props.icon}> </span>
    );
  }
}

module.exports = Glyph;
