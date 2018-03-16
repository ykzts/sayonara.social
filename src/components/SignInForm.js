import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';
import { name as clientName } from '../../package.json';
import session from '../session';
import Button from './Button';
import FieldSet from './FieldSet';

async function createApplication({ host, redirectUri }) {
  const uri = `https://${host}/api/v1/apps`;
  const body = new FormData();
  body.append('client_name', clientName);
  body.append('redirect_uris', redirectUri);
  body.append('scopes', 'read follow');
  const request = new Request(uri, {
    body,
    method: 'post',
  });
  const response = await fetch(request);
  const {
    client_id: clientId,
    client_secret: clientSecret,
  } = await response.json();
  return { clientId, clientSecret };
}

const Form = styled.form`
  margin: 0;
  padding: 0;
`;

export default class SignInForm extends Component {
  static displayName = 'SignInForm';

  static propTypes = {
    redirectUri: PropTypes.string.isRequired,
  };

  state = {
    clientId: '',
    clientSecret: '',
    host: session.get('host') || '',
  };

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.state.host !== nextState.host ||
      this.state.clientId !== nextState.clientId ||
      this.state.clientSecret !== nextState.clientSecret ||
      this.props.redirectUri !== nextProps.redirectUri
    );
  }

  componentWillUpdate(nextProps, nextState) {
    if (
      this.state.clientId !== nextState.clientId &&
      this.state.clientSecret !== nextState.clientSecret
    ) {
      session.set('clientId', nextState.clientId);
      session.set('clientSecret', nextState.clientSecret);
      session.set('host', nextState.host);
      session.set('redirectUri', nextProps.redirectUri);
      const params = new URLSearchParams();
      params.append('client_id', nextState.clientId);
      params.append('redirect_uri', nextProps.redirectUri);
      params.append('response_type', 'code');
      params.append('scope', 'read follow');
      window.location.href = `https://${nextState.host}/oauth/authorize?${params.toString()}`;
    }
  }

  handleChange = ({ target }) => {
    const { value: nextHost } = target;
    this.setState({
      host: nextHost,
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const host = session.get('host');
    if (this.state.host !== host) {
      session.clear();
    }
    const clientId = session.get('clientId');
    const clientSecret = session.get('clientSecret');
    if (!clientId || !clientSecret) {
      this.signIn().catch(console.error.bind(console)); // eslint-disable-line no-console
    } else {
      this.setState({ clientId, clientSecret });
    }
    return false;
  }

  async signIn() {
    const { redirectUri } = this.props;
    const { host } = this.state;
    if (!host || !redirectUri) {
      throw new TypeError('invalid params.');
    }
    const { clientId, clientSecret } = await createApplication({ host, redirectUri });
    this.setState({ clientId, clientSecret });
  }

  render() {
    return (
      <Form action="/auth/sign-in" method="post" onSubmit={this.handleSubmit}>
        <FieldSet htmlFor="host" label="Host">
          <span>https://</span>
          <input
            id="host"
            name="host"
            onChange={this.handleChange}
            placeholder="mastodon.social"
            required
            type="text"
            value={this.state.host}
          />
        </FieldSet>
        <Button type="submit">Login</Button>
      </Form>
    );
  }
}
