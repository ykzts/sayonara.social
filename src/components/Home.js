import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';
import session from '../session';
import Button from './Button';
import Following from './Following';
import SignInForm from './SignInForm';

function generateRedirectUri({ host, protocol }) {
  return `${protocol}//${host}/auth/callback`;
}

const Root = styled.div`
`;

const Title = styled.h1`
  text-align: center;
`;

const SignOutButton = styled(Button)`
  display: ${props => (props.visible ? 'block' : 'none')};
  position: absolute;
  right: 1rem;
  top: 1rem;
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

  state = {
    accessToken: this.props.accessToken,
  };

  handleClick = () => {
    session.clear();
    this.setState({
      accessToken: null,
    });
  }

  render() {
    const { accessToken } = this.state;
    const redirectUri = generateRedirectUri(this.props.location);
    return (
      <Root>
        <Title>Sayonara</Title>
        {accessToken ? (
          <Following accessToken={accessToken} />
        ) : (
          <SignInForm redirectUri={redirectUri} />
        )}
        <SignOutButton
          onClick={this.handleClick}
          type="button"
          visible={!!accessToken}
        >Logout</SignOutButton>
      </Root>
    );
  }
}
