import PropTypes from 'prop-types';
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import session from '../session';
import AuthCallback from './AuthCallback';
import Home from './Home';
import NoMatch from './NoMatch';

export default function App({ location }) {
  const accessToken = session.get('accessToken');
  return (
    <div id="app">
      <Switch>
        <Route exact path="/">
          <Home accessToken={accessToken} location={location} />
        </Route>
        <Route exact component={AuthCallback} path="/auth/callback" />
        <Route component={NoMatch} />
      </Switch>
    </div>
  );
}

App.displayName = 'App';

App.propTypes = {
  location: PropTypes.shape({
    host: PropTypes.string.isRequired,
    protocol: PropTypes.string.isRequired,
  }).isRequired,
};
