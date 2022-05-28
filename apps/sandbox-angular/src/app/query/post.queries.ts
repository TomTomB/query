import { def } from '@tomtomb/query-core';
import { Post } from '../types';
import { query } from './query.core';
import {
  CreatePostQuery,
  DeletePostQuery,
  GetPostQuery,
  GetPostsQuery,
  PatchPostQuery,
  UpdatePostQuery,
} from './types';

export const { execute: getPost, ...getPostQuery } = query.create({
  route: (p) => `/posts/${p.id}`,
  method: 'GET',
  types: {
    args: def<GetPostQuery>(),
    response: def<Post>(),
  },
});

export const { execute: getPosts, ...getPostsQuery } = query.create({
  route: '/posts',
  method: 'GET',
  types: {
    args: def<GetPostsQuery>(),
    response: def<Post[]>(),
  },
});

export const { execute: postPost, ...postPostQuery } = query.create({
  route: '/posts',
  method: 'POST',
  types: {
    args: def<CreatePostQuery>(),
    response: def<Post>(),
  },
});

export const { execute: putPost, ...putPostQuery } = query.create({
  route: (p) => `/posts/${p.id}`,
  method: 'PUT',
  types: {
    args: def<UpdatePostQuery>(),
    response: def<Post>(),
  },
});

export const { execute: patchPost, ...patchPostQuery } = query.create({
  route: (p) => `/posts/${p.id}`,
  method: 'PATCH',
  types: {
    args: def<PatchPostQuery>(),
    response: def<Post>(),
  },
});

export const { execute: deletePost, ...deletePostQuery } = query.create({
  route: (p) => `/posts/${p.id}`,
  method: 'DELETE',
  types: {
    args: def<DeletePostQuery>(),
    response: def<void>(),
  },
});
