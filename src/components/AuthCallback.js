import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import session from '../session';

async function getAccessToken({
  clientId,
  clientSecret,
  code,
  host,
  redirectUri,
}) {
  if (!clientId || !clientSecret || !code || !host || !redirectUri) {
    throw new TypeError('invalid params.');
  }
  const body = new FormData();
  body.append('client_id', clientId);
  body.append('client_secret', clientSecret);
  body.append('code', code);
  body.append('grant_type', 'authorization_code');
  body.append('redirect_uri', redirectUri);
  const request = new Request(`https://${host}/oauth/token`, {
    body,
    method: 'post',
  });
  const response = await fetch(request);
  const { access_token: accessToken } = await response.json();
  return { accessToken };
}

export default class AuthCallback extends Component {
  static displayName = 'AuthCallback';

  static propTypes = {
    location: PropTypes.shape({
      search: PropTypes.string.isRequired,
    }).isRequired,
  };

  state = {
    accessToken: null,
    code: this.getCode() || null,
  };

  componentWillMount() {
    getAccessToken({
      clientId: session.get('clientId'),
      clientSecret: session.get('clientSecret'),
      code: this.state.code,
      host: session.get('host'),
      redirectUri: session.delete('redirectUri'),
    }).then(({ accessToken }) => {
      this.setState({ accessToken });
    }).catch(console.error.bind(console)); // eslint-disable-line no-console
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.state.accessToken !== nextState.accessToken ||
      this.props.location.search !== nextProps.location.search
    );
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.state.accessToken !== nextState.accessToken) {
      session.set('accessToken', nextState.accessToken);
    }
  }

  getCode() {
    const { search } = this.props.location;
    const params = new URLSearchParams(search);
    return params.get('code');
  }

  render() {
    if (this.state.accessToken) {
      return (
        <Redirect push={false} to="/" />
      );
    }
    return null;
  }
}
