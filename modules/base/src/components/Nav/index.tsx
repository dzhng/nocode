import { useCallback, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createStyles, makeStyles } from '@mui/styles';
import { Box, IconButton, Tooltip } from '@mui/material';
import {
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Skeleton,
  SelectChangeEvent,
} from '@mui/material';
import { isBrowser } from 'shared/utils';
import { Logo, AppIcon, PlainAddIcon } from '~/components/Icons';
import useGlobalState from '~/hooks/useGlobalState';
import useWorkspaceApps from '~/hooks/useWorkspaceApps';
import Menu from './Menu';

const NewWorkspaceValue = -1;
const sidebarWidth = 250;

const useStyles = makeStyles((theme) =>
  createStyles({
    drawer: {
      [theme.breakpoints.up('sm')]: {
        width: sidebarWidth,
        flexShrink: 0,
      },
    },
    select: {
      // width minus margin, subtract an extra 2 for the border
      width: sidebarWidth - 10 * 2 - 2,
      margin: 10,
    },
    createWorkspaceItem: {
      color: theme.palette.primary.main,
    },
    menuButton: {
      marginRight: theme.spacing(2),
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
    },
    drawerPaper: {
      width: sidebarWidth,
    },
    drawerContent: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
    drawerContentFooter: {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
    },
    profileMenu: {
      display: 'flex',
      alignItems: 'stretch',
      padding: theme.spacing(1),

      '& .MuiTypography-root': {
        marginTop: 'auto',
        marginBottom: 'auto',
      },
    },
    title: {
      padding: theme.spacing(1.5),
      objectFit: 'contain',
      width: 120,
      height: 60,
    },
    divider: {
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
    },
  }),
);

export default function Nav({ isOpen, onClose }: { isOpen: boolean; onClose(): void }) {
  const classes = useStyles();
  const router = useRouter();
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const {
    userDetails,
    workspaces,
    isWorkspacesReady,
    currentWorkspaceId,
    setCurrentWorkspaceId,
    createWorkspace,
  } = useGlobalState();
  const { apps, isLoadingApps } = useWorkspaceApps(currentWorkspaceId);

  router.prefetch('/app/create');

  const isRouteSelected = useCallback(
    (route) => {
      return route === router.pathname;
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

  const handleCreateWorkspace = useCallback(() => {
    setIsCreatingWorkspace(false);
    createWorkspace(newWorkspaceName);
    onClose();
  }, [newWorkspaceName, createWorkspace, onClose]);

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
      <div className={classes.drawerContent}>
        <Link href="/" passHref>
          <a style={{ lineHeight: 0 }}>
            <Logo className={classes.title} />
          </a>
        </Link>
        <Divider className={classes.divider} />

        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', ml: 2, mt: 2 }}>
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
                      color: isRouteSelected(`/app/${app.id}`) ? 'secondary.main' : 'grey.900',
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
                          color: 'grey.800',
                        }}
                      >
                        {app.name}
                      </Typography>
                    </ListItemText>
                  </ListItem>
                </Link>
              ))}
        </List>

        <div className={classes.drawerContentFooter}>
          {isWorkspacesReady && workspaces ? (
            <FormControl variant="outlined" className={classes.select}>
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
                  <Typography variant="h5" className={classes.createWorkspaceItem}>
                    <b>+ New Workspace</b>
                  </Typography>
                </MenuItem>
              </Select>
            </FormControl>
          ) : (
            <Skeleton variant="rectangular" height={45} className={classes.select} />
          )}

          <Divider className={classes.divider} />

          <div className={classes.profileMenu}>
            <Menu />
            <Typography sx={{ textAlign: 'right' }} variant="h2">
              {userDetails?.displayName ?? ''}
            </Typography>
          </div>
        </div>
      </div>
    ),
    [
      classes,
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

  const createWorkspaceModal = useMemo(
    () => (
      <Dialog open={isCreatingWorkspace} onClose={() => setIsCreatingWorkspace(false)}>
        <DialogTitle>Create New Workspace</DialogTitle>
        <DialogContent>
          <DialogContentText>
            A workspace allows you to collaborate with a group of co-workers on calls.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Workspace Name"
            type="text"
            fullWidth
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreatingWorkspace(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateWorkspace} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    ),
    [handleCreateWorkspace, isCreatingWorkspace, newWorkspaceName],
  );

  const container = isBrowser ? () => window.document.body : undefined;

  return (
    <nav className={classes.drawer} aria-label="mailbox folders">
      {createWorkspaceModal}

      <Hidden smUp implementation="css">
        <Drawer
          container={container}
          variant="temporary"
          anchor="left"
          open={isOpen}
          onClose={onClose}
          classes={{
            paper: classes.drawerPaper,
          }}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          {drawer}
        </Drawer>
      </Hidden>
      <Hidden xsDown implementation="css">
        <Drawer
          classes={{
            paper: classes.drawerPaper,
          }}
          variant="permanent"
          open
        >
          {drawer}
        </Drawer>
      </Hidden>
    </nav>
  );
}
