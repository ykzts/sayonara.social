import LinkHeader from 'http-link-header';
import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';
import session from '../session';
import UserCard from './UserCard';

async function getCurrentUser({ accessToken }) {
  const headers = new Headers();
  headers.append('Authorization', `bearer ${accessToken}`);
  const request = new Request(`https://${session.get('host')}/api/v1/accounts/verify_credentials`, {
    headers,
  });
  const response = await fetch(request);
  if (!(response.status >= 200 && response.status < 300)) {
    throw new TypeError();
  }
  return response.json();
}

async function getFollowing({ accessToken, maxId = null }) {
  const { id } = await getCurrentUser({ accessToken });
  const host = session.get('host');
  const headers = new Headers();
  headers.append('Authorization', `bearer ${accessToken}`);
  const params = new URLSearchParams();
  if (maxId) {
    params.append('max_id', maxId);
  }
  const request = new Request(`https://${host}/api/v1/accounts/${id}/following?${params.toString()}`, {
    headers,
  });
  const response = await fetch(request);
  if (!(response.status >= 200 && response.status < 300)) {
    throw new TypeError('error');
  }
  const users = await response.json();
  const link = LinkHeader.parse(response.headers.get('Link'));
  const next = (link.rel('next'))[0];
  return {
    nextUri: next ? next.uri : null,
    users,
  };
}

const Root = styled.div`
  margin: 0 auto;
  max-width: 750px;
`;

const LoadMoreButton = styled.button`
  background-color: #4fc3f7;
  border: 0;
  border-radius: 0.3rem;
  color: #fff;
  display: block;
  font-size: 1.25rem;
  margin: 2rem auto 1rem;
  padding: 0.5rem 0.5rem;
  text-align: center;
  width: 75%;

  &:disabled {
    background-color: #9e9e9e;
  }
`;

export default class Following extends Component {
  static displayName = 'Following';

  static propTypes = {
    accessToken: PropTypes.string.isRequired,
  };

  constructor(...args) {
    super(...args);
    this.observer = null;
    this.loadMoreButton = null;
  }

  state = {
    loading: false,
    nextUri: null,
    users: [],
  };

  componentWillMount() {
    const { accessToken } = this.props;
    getFollowing({ accessToken }).then(({ nextUri, users }) => {
      this.setState({ nextUri, users }, this.setObserve);
    }).catch(console.error.bind(console)); // eslint-disable-line no-console
  }

  componentDidMount() {
    this.observer = new IntersectionObserver(this.observerCallback, {
      rootMargin: '300px',
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.state.loading !== nextState.loading ||
      this.state.nextUri !== nextState.nextUri ||
      !isEqual(this.state.users, nextState.users) ||
      this.props.accessToken !== nextProps.accessToken
    );
  }

  componentWillUnmount() {
    this.observer.disconnect();
  }

  setObserve() {
    if (this.loadMoreButton) {
      this.observer.observe(this.loadMoreButton);
    }
  }

  observerCallback = (entries) => {
    entries.forEach(({ isIntersecting }) => {
      if (isIntersecting) {
        this.handleClick();
      }
    });
  }

  handleClick = () => {
    const { nextUri: uri } = this.state;
    const queryString = new URL(uri).search;
    const { accessToken } = this.props;
    const params = new URLSearchParams(queryString);
    const maxId = params.get('max_id');
    this.setState({ loading: true }, () => {
      getFollowing({ accessToken, maxId }).then(({ nextUri, users }) => {
        this.setState(({ users: prevUsers }) => ({
          loading: false,
          nextUri,
          users: prevUsers.concat(users),
        }));
      }).catch(console.error.bind(console)); // eslint-disable-line no-console
    });
  }

  render() {
    const { nextUri, users } = this.state;
    return (
      <Root>
        {users.map(user => (
          <UserCard key={`user-${user.id}`} user={user} />
        ))}
        {users.length > 0 && nextUri && (
          <LoadMoreButton
            disabled={this.state.loading}
            innerRef={(c) => { this.loadMoreButton = c; }}
            onClick={this.handleClick}
            type="button"
          >
            Load more
          </LoadMoreButton>
        )}
      </Root>
    );
  }
}
