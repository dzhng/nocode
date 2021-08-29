import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';

import { IconButton, Menu as MenuContainer, MenuItem, Tooltip } from '@material-ui/core';
import { MoreVert as MoreIcon } from '@material-ui/icons';

import { useAppState } from '~/hooks/useAppState';
import UserAvatar from '~/components/UserAvatar';
import AboutDialog from '../AboutDialog';

export default function Menu() {
  const router = useRouter();
  const { userDetails, signOut } = useAppState();

  const [aboutOpen, setAboutOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const anchorRef = useRef<HTMLDivElement>(null);

  const handleSignOut = useCallback(() => {
    signOut?.();
    // hard reload the page after signing out
    router.reload();
  }, [signOut, router]);

  return (
    <div ref={anchorRef}>
      <IconButton color="inherit" onClick={() => setMenuOpen((state) => !state)}>
        <Tooltip title="Settings" placement="bottom">
          {userDetails ? (
            <UserAvatar data-testid="avatar" user={userDetails} />
          ) : (
            <MoreIcon data-testid="more-icon" />
          )}
        </Tooltip>
      </IconButton>
      <MenuContainer
        open={menuOpen}
        onClose={() => setMenuOpen((state) => !state)}
        anchorEl={anchorRef.current}
        data-testid="menu"
      >
        {userDetails?.displayName && (
          <MenuItem data-testid="name-item" disabled>
            {userDetails.displayName}
          </MenuItem>
        )}
        <MenuItem onClick={() => setAboutOpen(true)}>About</MenuItem>
        {userDetails && <MenuItem onClick={handleSignOut}>Logout</MenuItem>}
      </MenuContainer>
      <AboutDialog
        open={aboutOpen}
        onClose={() => {
          setAboutOpen(false);
          setMenuOpen(false);
        }}
      />
    </div>
  );
}
