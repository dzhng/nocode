import withPrivateRoute from '~/components/PrivateRoute/withPrivateRoute';
import Home from '~/components/Home';

export default withPrivateRoute(function IndexPage() {
  return <Home />;
});
