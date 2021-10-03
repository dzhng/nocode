import useGlobalState from '~/hooks/useGlobalState';

export default function useApp(appId?: number) {
  const { apps } = useGlobalState();
  return apps.find((app) => app.id === appId);
}
