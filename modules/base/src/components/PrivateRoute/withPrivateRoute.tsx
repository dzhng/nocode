import PrivateRoute from './index';

export default function withPrivateRoute<T>(Component: React.ComponentType<T>) {
  // eslint-disable-next-line react/display-name
  return (props: T) => (
    <PrivateRoute>
      <Component {...props} />
    </PrivateRoute>
  );
}
