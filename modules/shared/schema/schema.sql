-- Custom types
create type public.member_roles as enum ('owner', 'member', 'deleted');

-- WORKSPACE
create table public.workspaces (
  "id"            bigint generated by default as identity primary key,
  "name"          text not null,
  "isDeleted"     boolean not null default false,
  "createdAt"     timestamp with time zone default timezone('utc'::text, now()) not null
);
comment on table public.workspaces is 'A workspace represents a group of users.';

-- USERS
create table public.users (
  "id"            uuid not null primary key, -- UUID from auth.users
  "displayName"   text,
  "email"         text,
  "photoURL"      text,
  "bio"           text,
  "defaultWorkspaceId" bigint references public.workspaces on delete set null,
  "createdAt"     timestamp with time zone default timezone('utc'::text, now()) not null
);
comment on table public.users is 'Profile data for each user.';
comment on column public.users.id is 'References the internal Supabase Auth user.';

-- MEMBER
create table public.members (
  "id"            bigint generated by default as identity primary key,
  "role"          member_roles not null,
  "workspaceId"   bigint references public.workspaces on delete cascade not null,
  "userId"        uuid references public.users on delete cascade not null,
  "createdAt"     timestamp with time zone default timezone('utc'::text, now()) not null
);
comment on table public.members is 'Stores the user to workspace relationship';

-- INVITE
create table public.invites (
  "id"            bigint generated by default as identity primary key,
  "workspaceId"   bigint references public.workspaces on delete cascade not null,
  "inviterId"     uuid references public.users not null,
  "email"         text not null,
  "createdAt"     timestamp with time zone default timezone('utc'::text, now()) not null,

  unique("workspaceId", "email")
);
comment on table public.invites is 'Stores the user to workspace relationship';
