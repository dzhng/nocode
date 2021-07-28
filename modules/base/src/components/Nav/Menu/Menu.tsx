import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';

import { IconButton, Menu as MenuContainer, MenuItem, Tooltip } from '@material-ui/core';
import { MoreVert as MoreIcon } from '@material-ui/icons';

import { useAppState } from '~/state';
import UserAvatar from '~/components/UserAvatar/UserAvatar';
import AboutDialog from '../AboutDialog/AboutDialog';

export default function Menu() {
  const router = useRouter();
  const { userRecord, signOut } = useAppState();

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
          {userRecord ? (
            <UserAvatar data-testid="avatar" user={userRecord} />
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
        {userRecord?.displayName && (
          <MenuItem data-testid="name-item" disabled>
            {userRecord.displayName}
          </MenuItem>
        )}
        <MenuItem onClick={() => setAboutOpen(true)}>About</MenuItem>
        {userRecord && <MenuItem onClick={handleSignOut}>Logout</MenuItem>}
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
