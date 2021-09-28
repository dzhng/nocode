import { useCallback, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createStyles, makeStyles } from '@mui/styles';
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
import { Logo, AppsIcon } from '~/components/Icons';
import useGlobalState from '~/hooks/useGlobalState';
import Menu from './Menu';

const NewWorkspaceValue = -1;
const sidebarWidth = 300;

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
    list: {
      '& .MuiListItemIcon-root': {
        minWidth: 40,
        color: theme.palette.secondary.main,
      },
      '& .MuiListItem-root': {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        width: 'auto',
        borderRadius: 21,
        color: theme.palette.grey[900],
      },
      '& .selected': {
        color: theme.palette.secondary.main,
      },
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
    displayName: {
      textAlign: 'right',
    },
    title: {
      padding: theme.spacing(2.5),
      objectFit: 'contain',
      width: 140,
      height: 85,
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

  const routeSelectedClassname = useCallback(
    (route) => {
      return route === router.pathname ? 'selected' : undefined;
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

  const drawer = useMemo(
    () => (
      <div className={classes.drawerContent}>
        <Logo className={classes.title} />
        <Divider className={classes.divider} />

        <List className={classes.list}>
          <Link href="/" passHref>
            <ListItem button onClick={onClose} className={routeSelectedClassname('/')}>
              <ListItemIcon>
                <AppsIcon />
              </ListItemIcon>
              <ListItemText>
                <Typography variant="h3">Apps</Typography>
              </ListItemText>
            </ListItem>
          </Link>

          <Link href="/settings" passHref>
            <ListItem button onClick={onClose} className={routeSelectedClassname('/settings')}>
              <ListItemIcon>
                <AppsIcon />
              </ListItemIcon>
              <ListItemText>
                <Typography variant="h3">Settings</Typography>
              </ListItemText>
            </ListItem>
          </Link>
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
            <Typography className={classes.displayName} variant="h2">
              {userDetails?.displayName ?? ''}
            </Typography>
          </div>
        </div>
      </div>
    ),
    [
      classes,
      routeSelectedClassname,
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
