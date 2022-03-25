import { Post } from '../types';
import { query } from './query.core';
import {
  CreatePostQuery,
  DeletePostQuery,
  GetPostQuery,
  PatchPostQuery,
  UpdatePostQuery,
} from './types';

export const getPost = query.create<Post, GetPostQuery>({
  route: (p) => `/posts/${p.id}`,
  method: 'GET',
});

export const getPosts = query.create<Post[]>({
  route: '/posts',
  method: 'GET',
});

export const createPost = query.create<Post, CreatePostQuery>({
  route: '/posts',
  method: 'POST',
});

export const updatePost = query.create<Post, UpdatePostQuery>({
  route: (p) => `/posts/${p.id}`,
  method: 'PUT',
});

export const patchPost = query.create<Post, PatchPostQuery>({
  route: (p) => `/posts/${p.id}`,
  method: 'PATCH',
});

export const deletePost = query.create<void, DeletePostQuery>({
  route: (p) => `/posts/${p.id}`,
  method: 'DELETE',
});
