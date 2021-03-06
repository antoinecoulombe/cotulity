import { Redirect, Route } from 'react-router-dom';
import { isAuthenticated } from '../../utils/global';

export const PrivateRoute = ({
  component: Component,
  ...rest
}): JSX.Element => {
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
};

export const PublicRoute = ({ component: Component, ...rest }): JSX.Element => {
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
};
