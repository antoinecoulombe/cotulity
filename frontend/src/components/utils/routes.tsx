import { Redirect, Route } from 'react-router-dom';
import { isAuthenticated } from '../../utils/global';

export function PrivateRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated() === true ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: '/', state: { from: props.location } }} />
        )
      }
    />
  );
}

export function PublicRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props: any) =>
        !isAuthenticated() === true ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/apps/',
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
}
