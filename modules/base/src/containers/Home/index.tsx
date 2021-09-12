import { useRef, useState, useCallback } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import { Typography, Grid, Menu, MenuItem, IconButton, Tooltip, Hidden } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import {
  MoreVert as MoreIcon,
  Menu as MenuIcon,
  AddCircleOutline as AddIcon,
} from '@material-ui/icons';
import { Skeleton } from '@material-ui/lab';
import useDimensions from 'react-cool-dimensions';

import UserAvatar from '~/components/UserAvatar';
import Nav from '~/components/Nav';
import CardButton from '~/components/CardButton';
import useGlobalState from '~/hooks/useGlobalState';
import useWorkspaceMembers from '~/hooks/useWorkspaceMembers';
import useWorkspaceApps from '~/hooks/useWorkspaceApps';
import AppCard from './AppCard';
import { AddMemberDialog } from './AddMemberMenuItem';
import LeaveMenuItem from './LeaveMenuItem';
import DeleteMenuItem from './DeleteMenuItem';

const avatarSize = 30;
const cardHeight = 200;

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'row',
    },
    grid: {
      maxHeight: '100vh',
      overflowY: 'auto',
      // add  a good amount of padding on bottom so fixed positioned intercom button doesn't
      // overlap too much with items, it also looks better balanced with toolbar
      paddingBottom: 72,
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
      flexGrow: 1,

      // override spacing-3 negative margins which causes a scroll bar
      width: '100%',
      margin: 0,
    },
    titleBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 72,
    },
    titleSection: {
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden', // need it for title ellipsis

      '& .MuiIconButton-root': {
        // cancel out the padding, but don't set padding at 0 since that changes hover shape
        marginLeft: '-12px',
      },
    },
    title: {
      display: 'inline',
      lineHeight: `${avatarSize}px`,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
    avatar: {
      width: avatarSize,
      height: avatarSize,
      marginRight: theme.spacing(1),
      boxShadow: theme.shadows[3],
      cursor: 'pointer',
    },
    cardSkeleton: {
      borderRadius: theme.shape.borderRadius,
    },
    divider: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
    },
    membersList: {
      display: 'flex',
      marginLeft: theme.spacing(2),
    },
    memberNumber: {
      width: avatarSize,
      height: avatarSize,
      backgroundColor: theme.palette.secondary.main,
      lineHeight: `${avatarSize}px`,
      borderRadius: avatarSize / 2,
      fontSize: 15,
      textAlign: 'center',
      fontWeight: 'bold',
      color: 'white',
    },
    settingsContainer: {
      '& button': {
        width: avatarSize,
        height: avatarSize,
        backgroundColor: theme.palette.grey[200],
        boxShadow: theme.shadows[3],
      },
    },
    deleteButtonMenu: {
      color: theme.palette.error.main,
    },
  }),
);

const cardItemSizeProps: { [key: string]: 12 | 6 | 4 | 3 | 2 } = {
  xs: 12,
  sm: 12, // abrupt transition because of drawer hiding
  md: 6,
  lg: 3,
  xl: 2,
};

export default function Home() {
  const classes = useStyles();
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const { currentWorkspace, isWorkspacesReady, leaveWorkspace, deleteWorkspace } = useGlobalState();
  const { apps, isLoadingApps } = useWorkspaceApps(currentWorkspace?.id);
  const { members, isAdmin, isLoadingMembers, inviteMembers, removeMembers } = useWorkspaceMembers(
    currentWorkspace?.id,
  );

  // measure width of header bar to calculate how many avatars to show
  const { observe, width } = useDimensions<HTMLDivElement>({ useBorderBoxSize: true });

  const handleMenuClick = useCallback(() => {
    setSettingsMenuOpen(false);
  }, []);

  const loadingAppSkeletons = [0, 1, 2].map((key) => (
    <Grid item {...cardItemSizeProps} key={key}>
      <Skeleton variant="rect" height={cardHeight} className={classes.cardSkeleton} />
    </Grid>
  ));

  const loadingMemberSkeletons = (
    <Skeleton variant="circle" height={avatarSize} width={avatarSize} className={classes.avatar} />
  );

  const numberOfAvatars = Math.max(Math.floor((width * 0.5) / avatarSize) - 2, 1);

  // if still loading, just show skeletons
  if (!isWorkspacesReady) {
    return (
      <div className={classes.container}>
        <Nav mobileOpen={mobileOpen} closeModal={() => setMobileOpen(false)} />
        <Grid container className={classes.grid} spacing={3}>
          <Grid item xs={12} className={classes.titleBar} ref={observe}>
            <div className={classes.titleSection}>
              <Hidden smUp implementation="css">
                <IconButton onClick={() => setMobileOpen(true)}>
                  <MenuIcon />
                </IconButton>
              </Hidden>
              <Typography variant="h1" className={classes.title}>
                <Skeleton width={150} height={avatarSize} />
              </Typography>
            </div>

            <span className={classes.membersList}>{loadingMemberSkeletons}</span>
          </Grid>
          {loadingAppSkeletons}
        </Grid>
      </div>
    );
  }

  // if loaded and no currentworkspace exist, this means this user has no workspaces
  if (!currentWorkspace) {
    return (
      <div className={classes.container}>
        <Nav mobileOpen={mobileOpen} closeModal={() => setMobileOpen(false)} />
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justifyContent="center"
          style={{ height: '100vh' }}
        >
          <Typography variant="h1">No Workspace Exists</Typography>
          <Typography variant="h2">Create A Workspace To Get Started</Typography>
        </Grid>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <Nav mobileOpen={mobileOpen} closeModal={() => setMobileOpen(false)} />

      <Grid container className={classes.grid} spacing={3}>
        <Grid item xs={12} className={classes.titleBar} ref={observe}>
          <div className={classes.titleSection}>
            <Hidden smUp implementation="css">
              <IconButton onClick={() => setMobileOpen(true)}>
                <MenuIcon />
              </IconButton>
            </Hidden>
            <Typography variant="h1" className={classes.title}>
              {currentWorkspace ? (
                currentWorkspace.name
              ) : (
                <Skeleton width={150} height={avatarSize} />
              )}
            </Typography>
          </div>

          <span className={classes.membersList}>
            {!currentWorkspace || isLoadingMembers
              ? loadingMemberSkeletons
              : members.slice(0, numberOfAvatars).map((member) => (
                  <Tooltip key={member.id} title={member.displayName ?? ''} placement="bottom">
                    <UserAvatar
                      className={classes.avatar}
                      user={member}
                      onClick={() => setMembersDialogOpen(true)}
                    />
                  </Tooltip>
                ))}

            {currentWorkspace && !isLoadingMembers && numberOfAvatars < members.length && (
              <Tooltip title={`${members.length} members in this workspace`} placement="bottom">
                <div
                  className={clsx(classes.memberNumber, classes.avatar)}
                  onClick={() => setMembersDialogOpen(true)}
                >
                  +{members.length - numberOfAvatars}
                </div>
              </Tooltip>
            )}

            <div className={classes.settingsContainer} ref={anchorRef}>
              <Tooltip title="Settings" placement="bottom">
                {/* wrap in div so tooltip still works even with the button disabled */}
                <div>
                  <IconButton
                    color="inherit"
                    disabled={!currentWorkspace}
                    onClick={() => setSettingsMenuOpen((state) => !state)}
                  >
                    <MoreIcon />
                  </IconButton>
                </div>
              </Tooltip>
              <Menu
                open={settingsMenuOpen}
                onClose={() => setSettingsMenuOpen((state) => !state)}
                anchorEl={anchorRef.current}
              >
                <MenuItem disabled>Settings</MenuItem>

                {isAdmin && (
                  <MenuItem
                    onClick={() => {
                      setSettingsMenuOpen((state) => !state);
                      setMembersDialogOpen(true);
                    }}
                  >
                    Manage Workspace Members
                  </MenuItem>
                )}

                <LeaveMenuItem onClick={handleMenuClick} leaveWorkspace={leaveWorkspace} />

                {isAdmin && (
                  <DeleteMenuItem
                    onClick={handleMenuClick}
                    deleteWorkspace={deleteWorkspace}
                    className={classes.deleteButtonMenu}
                  />
                )}
              </Menu>
            </div>
          </span>
        </Grid>

        {currentWorkspace && !isLoadingApps && (
          <Grid item {...cardItemSizeProps}>
            <Link href="/app/create" passHref>
              {/* Need to wrap Card in div since Link doesn't work with functional components. See: https://github.com/vercel/next.js/issues/7915 */}
              <div>
                <CardButton
                  title="New App"
                  height={cardHeight}
                  icon={
                    <AddIcon
                      style={{
                        fontSize: '3rem',
                        color: 'white',
                      }}
                    />
                  }
                />
              </div>
            </Link>
          </Grid>
        )}

        {isLoadingApps
          ? loadingAppSkeletons
          : apps.map((app) => (
              <Grid item {...cardItemSizeProps} key={app.id}>
                <Link href={`/app/${app.id}`} passHref>
                  {/* Need to wrap Card in div since Link doesn't work with functional components. See: https://github.com/vercel/next.js/issues/7915 */}
                  <div>
                    <AppCard app={app} height={cardHeight} />
                  </div>
                </Link>
              </Grid>
            ))}
      </Grid>

      <AddMemberDialog
        open={membersDialogOpen}
        setOpen={setMembersDialogOpen}
        addMembers={inviteMembers}
        removeMembers={removeMembers}
        members={members}
      />
    </div>
  );
}
