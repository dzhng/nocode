import React from 'react';
import Link from 'next/link';
import { IconButton } from '@material-ui/core';
import { BackIcon } from '~/components/Icons';

export default function BackButton({ href }: { href?: string }) {
  return (
    <Link href={href ?? '/'} passHref>
      <IconButton>
        <BackIcon />
      </IconButton>
    </Link>
  );
}
