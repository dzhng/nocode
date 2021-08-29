import { forwardRef } from 'react';
import clsx from 'clsx';
import { Avatar } from '@material-ui/core';
import makeStyles from '@material-ui/styles/makeStyles';
import { Person } from '@material-ui/icons';
import { UserDetails } from 'shared/schema';

const useStyles = makeStyles({
  textAvatar: {
    color: 'white',
    backgroundColor: '#F22F46',
    // so it matches the default one generated by Google
    fontSize: 15,
  },
});

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((text) => text[0])
    .join('')
    .toUpperCase();
}

export default forwardRef(function UserAvatar(
  {
    user,
    ...otherProps
  }: {
    user: UserDetails;
    [other: string]: any;
  },
  ref,
) {
  const classes = useStyles();
  const { displayName, photoURL } = user!;

  return photoURL ? (
    <Avatar ref={ref as React.RefObject<HTMLDivElement>} {...otherProps} src={photoURL} />
  ) : (
    <Avatar
      ref={ref as React.RefObject<HTMLDivElement>}
      {...otherProps}
      className={clsx(classes.textAvatar, otherProps.className)}
    >
      {displayName ? getInitials(displayName) : <Person data-testid="person-icon" />}
    </Avatar>
  );
});
