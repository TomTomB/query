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

export const getPost = query.get({
  route: (p) => `/posts/${p.id}`,
  types: {
    args: def<GetPostQuery>(),
    response: def<Post>(),
  },
});

export const getPosts = query.get({
  route: '/posts',
  types: {
    args: def<GetPostsQuery>(),
    response: def<Post[]>(),
  },
});

export const postPost = query.post({
  route: '/posts',
  types: {
    args: def<CreatePostQuery>(),
    response: def<Post>(),
  },
});

export const putPost = query.put({
  route: (p) => `/posts/${p.id}`,
  types: {
    args: def<UpdatePostQuery>(),
    response: def<Post>(),
  },
});

export const patchPost = query.patch({
  route: (p) => `/posts/${p.id}`,
  types: {
    args: def<PatchPostQuery>(),
    response: def<Post>(),
  },
});

export const deletePost = query.delete({
  route: (p) => `/posts/${p.id}`,
  types: {
    args: def<DeletePostQuery>(),
  },
});
