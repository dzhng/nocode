import { useEffect, useCallback, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Hidden,
  Divider,
  Drawer,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  SelectChangeEvent,
} from '@mui/material';
import { isBrowser } from 'shared/utils';
import { Logo, AppIcon, PlainAddIcon } from '~/components/Icons';
import useGlobalState from '~/hooks/useGlobalState';
import CreateWorkspace from './CreateWorkspace';
import Menu from './Menu';

const NewWorkspaceValue = -1;
const sidebarWidth = 250;

export default function Nav({ isOpen, onClose }: { isOpen: boolean; onClose(): void }) {
  const router = useRouter();
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const {
    apps,
    isLoadingApps,
    queryForApps,
    queryForWorkspaces,
    userDetails,
    workspaces,
    isWorkspacesReady,
    currentWorkspaceId,
    setCurrentWorkspaceId,
  } = useGlobalState();

  useEffect(() => {
    queryForWorkspaces();
  }, [queryForWorkspaces]);

  useEffect(() => {
    queryForApps();
  }, [queryForApps]);

  useEffect(() => {
    router.prefetch('/app/create');
  }, [router]);

  const isRouteSelected = useCallback(
    (route) => {
      return route === router.asPath;
    },
    [router],
  );

  const handleWorkspaceChange = useCallback(
    (event: SelectChangeEvent<string | number>) => {
      const value = Number(event.target.value);
      if (value === NewWorkspaceValue) {
        setIsCreatingWorkspace(true);
      } else {
        setCurrentWorkspaceId(value);
        onClose();
      }
    },
    [setCurrentWorkspaceId, onClose],
  );

  const loadingAppSkeletons = [0, 2, 1].map((key) => (
    <Skeleton
      key={key}
      variant="rectangular"
      sx={{ borderRadius: 12, width: `${60 - key * 10}%`, mt: '5px', mb: '5px', ml: 1, mr: 1 }}
      height={25}
    />
  ));

  const drawer = useMemo(
    () => (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Link href="/" passHref>
          <Box
            component="a"
            sx={{
              lineHeight: 0,
              '& img': {
                padding: 1,
                paddingTop: 1.5,
                paddingBottom: 1.5,
                objectFit: 'contain',
                width: 120,
                height: (theme) => theme.headerBarHeight,
              },
            }}
          >
            <Logo />
          </Box>
        </Link>

        <Divider sx={{ ml: 2, mr: 2 }} />

        <Link href="/" passHref>
          <Typography
            component="a"
            variant="h5"
            sx={{
              ml: 1,
              mr: 1,
              mt: 1,
              padding: 1,
              color: 'grey.700',
              fontWeight: 600,
              textDecoration: 'none',
              '&:hover': { color: 'primary.main', borderRadius: 18, backgroundColor: 'grey.100' },
            }}
          >
            Home
          </Typography>
        </Link>

        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', ml: 2 }}>
          <Typography
            variant="h5"
            sx={{
              color: 'grey.700',
              fontWeight: 600,
              flexGrow: 1,
            }}
          >
            Apps
          </Typography>

          <Link href="/app/create" passHref>
            <Tooltip title="Create new app">
              <IconButton
                size="small"
                sx={{
                  width: 25,
                  height: 25,
                  mr: 1.5,
                  '& svg': { width: 20, height: 20 },
                  '&:hover': { color: 'primary.main' },
                }}
              >
                <PlainAddIcon />
              </IconButton>
            </Tooltip>
          </Link>
        </Box>

        <List>
          {isLoadingApps
            ? loadingAppSkeletons
            : apps.map((app) => (
                <Link key={app.id ?? -1} href={`/app/${app.id}`} passHref>
                  <ListItem
                    button
                    onClick={onClose}
                    sx={{
                      marginLeft: 1,
                      marginRight: 1,
                      paddingLeft: 1,
                      paddingRight: 1,
                      paddingTop: 0,
                      paddingBottom: 0,
                      width: 'auto',
                      borderRadius: 18,
                      color: isRouteSelected(`/app/${app.id}`) ? 'secondary.main' : 'grey.800',
                      '&:hover': {
                        color: isRouteSelected(`/app/${app.id}`)
                          ? 'secondary.main'
                          : 'primary.main',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 25,
                        color: 'secondary.main',
                        '& svg': { width: 15, height: 15 },
                      }}
                    >
                      <AppIcon />
                    </ListItemIcon>
                    <ListItemText>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 500,
                        }}
                      >
                        {app.name}
                      </Typography>
                    </ListItemText>
                  </ListItem>
                </Link>
              ))}
        </List>

        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          {isWorkspacesReady && workspaces ? (
            <FormControl
              sx={{
                // width minus margin, subtract an extra 2 for the border
                width: sidebarWidth - 10 * 2 - 2,
                margin: '10px',
              }}
              variant="outlined"
            >
              <InputLabel>Workspace</InputLabel>
              <Select
                label="Workspace"
                value={currentWorkspaceId ?? ''}
                onChange={handleWorkspaceChange}
              >
                {workspaces.map((workspace) => (
                  <MenuItem key={workspace.id} value={workspace.id}>
                    <Typography variant="h4">{workspace.name}</Typography>
                  </MenuItem>
                ))}
                <MenuItem value={NewWorkspaceValue}>
                  <Typography
                    variant="h5"
                    sx={{
                      color: 'primary.main',
                    }}
                  >
                    <b>+ New Workspace</b>
                  </Typography>
                </MenuItem>
              </Select>
            </FormControl>
          ) : (
            <Skeleton
              variant="rectangular"
              height={45}
              sx={{
                // copies styles from FormControl
                width: sidebarWidth - 10 * 2 - 2,
                margin: '10px',
                borderRadius: 1,
              }}
            />
          )}

          <Divider sx={{ ml: 2, mr: 2 }} />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'stretch',
              padding: 1,

              '& .MuiTypography-root': {
                marginTop: 'auto',
                marginBottom: 'auto',
              },
            }}
          >
            <Menu />
            <Typography sx={{ textAlign: 'right' }} variant="h2">
              {userDetails?.displayName ?? ''}
            </Typography>
          </Box>
        </Box>
      </Box>
    ),
    [
      apps,
      isLoadingApps,
      loadingAppSkeletons,
      isRouteSelected,
      currentWorkspaceId,
      handleWorkspaceChange,
      isWorkspacesReady,
      workspaces,
      userDetails,
      onClose,
    ],
  );

  const container = isBrowser ? () => window.document.body : undefined;

  return (
    <Box
      component="nav"
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
      }}
    >
      <CreateWorkspace
        open={isCreatingWorkspace}
        onClose={() => setIsCreatingWorkspace(false)}
        onCreate={onClose}
      />

      <Hidden smUp implementation="css">
        <Drawer
          sx={{
            '& .MuiDrawer-paper': { width: sidebarWidth },
          }}
          container={container}
          variant="temporary"
          anchor="left"
          open={isOpen}
          onClose={onClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          {drawer}
        </Drawer>
      </Hidden>
      <Hidden xsDown implementation="css">
        <Drawer
          sx={{
            '& .MuiDrawer-paper': { width: sidebarWidth },
          }}
          variant="permanent"
          open
        >
          {drawer}
        </Drawer>
      </Hidden>
    </Box>
  );
}
