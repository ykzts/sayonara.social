import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class NoMatch extends Component {
  static displayName = 'NoMatch';

  static propTypes = {
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
    }).isRequired,
  };

  shouldComponentUpdate({ location: nextLocation }) {
    const { location } = this.props;
    return location.pathname !== nextLocation.pathname;
  }

  render() {
    const { pathname: path } = this.props.location;
    return (
      <div id="no-match">
        <h1>Page Not Found</h1>
        <p>{path}</p>
      </div>
    );
  }
}
