import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';
import Following from './Following';
import SignInForm from './SignInForm';

function generateRedirectUri({ host, protocol }) {
  return `${protocol}//${host}/auth/callback`;
}

const Title = styled.h1`
  text-align: center;
`;

export default class Home extends Component {
  static defaultProps = {
    accessToken: null,
  };

  static displayName = 'Home';

  static propTypes = {
    accessToken: PropTypes.string,
    location: PropTypes.shape({
      host: PropTypes.string.isRequired,
      protocol: PropTypes.string.isRequired,
    }).isRequired,
  };

  render() {
    const { accessToken } = this.props;
    const redirectUri = generateRedirectUri(this.props.location);
    return (
      <div id="home">
        <Title>Sayonara</Title>
        {accessToken ? (
          <Following accessToken={accessToken} />
        ) : (
          <SignInForm redirectUri={redirectUri} />
        )}
      </div>
    );
  }
}
