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

export const { getPost, ...getPostQuery } = query.create({
  name: 'Post',
  route: (p) => `/posts/${p.id}`,
  method: 'GET',
  types: {
    args: def<GetPostQuery>(),
    response: def<Post>(),
  },
});

export const { getPosts, ...getPostsQuery } = query.create({
  name: 'Posts',
  route: '/posts',
  method: 'GET',
  types: {
    args: def<GetPostsQuery>(),
    response: def<Post[]>(),
  },
});

export const { postPost, ...postPostQuery } = query.create({
  name: 'Post',
  route: '/posts',
  method: 'POST',
  types: {
    args: def<CreatePostQuery>(),
    response: def<Post>(),
  },
});

export const { putPost, ...putPostQuery } = query.create({
  name: 'Post',
  route: (p) => `/posts/${p.id}`,
  method: 'PUT',
  types: {
    args: def<UpdatePostQuery>(),
    response: def<Post>(),
  },
});

export const { patchPost, ...patchPostQuery } = query.create({
  name: 'Post',
  route: (p) => `/posts/${p.id}`,
  method: 'PATCH',
  types: {
    args: def<PatchPostQuery>(),
    response: def<Post>(),
  },
});

export const { deletePost, ...deletePostQuery } = query.create({
  name: 'Post',
  route: (p) => `/posts/${p.id}`,
  method: 'DELETE',
  types: {
    args: def<DeletePostQuery>(),
    response: def<void>(),
  },
});
