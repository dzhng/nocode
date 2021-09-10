import AppContainer from '~/containers/App';
import withPrivateRoute from '~/components/PrivateRoute/withPrivateRoute';

export default withPrivateRoute(function AppPage() {
  return <AppContainer />;
});
