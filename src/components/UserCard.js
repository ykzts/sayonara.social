import {
  distanceInWordsStrict,
  isBefore,
  subDays,
} from 'date-fns';
import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';
import session from '../session';
import Button from './Button';

const Root = styled.div`
  align-items: center;
  background-color: ${props => (props.past ? '#eee' : '#fff')};
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  margin: 1rem 0;
  width: 100%;
`;

const Info = styled.div`
  display: flex;
  justify-content: flex-start;
`;

const Avatar = styled.a`
  align-items: center;
  display: flex;
  justify-content: center;
`;

const AvatarImage = styled.img`
  height: auto;
  border: 0;
  border-radius: 32px;
  margin: 1rem;
  max-width: 64px;
`;

const Content = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Name = styled.div`
`;

const NameLink = styled.a`
  color: #1565c0;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const Status = styled.div`
  font-size: 0.9rem;
`;

const Action = styled.div`
  padding: 1rem;
`;

export default class UserCard extends Component {
  static displayName = 'UserCard';

  static propTypes = {
    user: PropTypes.shape({
      avatar: PropTypes.string.isRequired,
      display_name: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired,
      url: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
    }).isRequired,
  };

  state = {
    followed: true,
    statuses: [],
  };

  componentWillMount() {
    this.getStatuses().then((statuses) => {
      this.setState({ statuses });
    }).catch(console.error.bind(console)); // eslint-disable-line no-console
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.state.followed !== nextState.followed ||
      !isEqual(this.state.statuses, nextState.statuses) ||
      !isEqual(this.props.user, nextProps.user)
    );
  }

  async getStatuses() {
    const { user } = this.props;
    const host = session.get('host');
    const accessToken = session.get('accessToken');
    const headers = new Headers();
    headers.append('Authorization', `bearer ${accessToken}`);
    const request = new Request(`https://${host}/api/v1/accounts/${user.id}/statuses?limit=1`, {
      headers,
    });
    const response = await fetch(request);
    return response.json();
  }

  handleClick = () => {
    if (this.state.followed) {
      this.unfollow().then(() => {
        this.setState({ followed: false });
      }).catch(console.error.bind(console)); // eslint-disable-line no-console
    } else {
      this.follow().then(() => {
        this.setState({ followed: true });
      }).catch(console.error.bind(console)); // eslint-disable-line no-console
    }
  }

  async unfollow() {
    const { user } = this.props;
    const host = session.get('host');
    const accessToken = session.get('accessToken');
    const headers = new Headers();
    headers.append('Authorization', `bearer ${accessToken}`);
    const request = new Request(`https://${host}/api/v1/accounts/${user.id}/unfollow`, {
      headers,
      method: 'post',
    });
    const response = await fetch(request);
    return response.json();
  }

  async follow() {
    const { user } = this.props;
    const host = session.get('host');
    const accessToken = session.get('accessToken');
    const headers = new Headers();
    headers.append('Authorization', `bearer ${accessToken}`);
    const request = new Request(`https://${host}/api/v1/accounts/${user.id}/follow`, {
      headers,
      method: 'post',
    });
    const response = await fetch(request);
    return response.json();
  }

  render() {
    const { user } = this.props;
    const status = (this.state.statuses || [])[0];
    const avatarUri = new URL(user.avatar, user.url).href;
    const nDaysAgo = subDays(new Date(), 14);
    const lastUpdate = status ? new Date(status.created_at) : new Date();
    return (
      <Root past={isBefore(lastUpdate, nDaysAgo)}>
        <Info>
          <Avatar href={user.url} rel="noopener" target="_blank">
            <AvatarImage height={120} src={avatarUri} width={120} />
          </Avatar>
          <Content>
            <Name>
              <NameLink href={user.url} rel="noopener" target="_blank">{user.display_name || user.username}</NameLink>
            </Name>
            <Status>
              <span>Last update: </span>
              <span>{status ? distanceInWordsStrict(new Date(), lastUpdate, { addSuffix: true }) : '...'}</span>
            </Status>
          </Content>
        </Info>
        <Action>
          <Button onClick={this.handleClick} type="button">{this.state.followed ? 'Unfollow' : 'Follow'}</Button>
        </Action>
      </Root>
    );
  }
}
