import { useState, useEffect, useCallback } from 'react';
import { Collections, Member, Invite } from 'shared/schema';

import withPrivateRoute from '~/components/PrivateRoute/withPrivateRoute';
import Home from '~/components/Home';
import { useAppState } from '~/hooks/useAppState';

export default withPrivateRoute(function IndexPage() {
  return (
    <Home
      isAdmin={isAdmin}
      workspace={currentWorkspace}
      members={members}
      isLoadingMembers={isLoadingMembers}
      templates={templates}
      isLoadingTemplates={isLoadingTemplates}
      leaveWorkspace={leaveWorkspace}
      deleteWorkspace={deleteWorkspace}
      addMembers={addMembers}
      removeMembers={removeMembers}
    />
  );
});
