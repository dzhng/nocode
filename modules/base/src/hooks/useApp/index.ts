import useGlobalState from '~/hooks/useGlobalState';

export default function useApp(appId?: number) {
  const { apps, updateAppName } = useGlobalState();

  return {
    app: apps.find((app) => app.id === appId),
    updateName: (newName: string) => appId && updateAppName(appId, newName),
  };
}
