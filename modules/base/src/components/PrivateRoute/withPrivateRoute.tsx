import PrivateRoute from './PrivateRoute';

export default function withPrivateRoute<T>(Component: React.ComponentType<T>) {
  return (props: T) => (
    <PrivateRoute>
      <Component {...props} />
    </PrivateRoute>
  );
}
