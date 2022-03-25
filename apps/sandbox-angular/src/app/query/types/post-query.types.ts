export interface GetPostQuery {
  pathParams: {
    id: number;
  };
  queryParams?: {
    userId?: number;
  };
}

export interface CreatePostQuery {
  body: {
    title: string;
    body: string;
    userId: number;
  };
}

export interface UpdatePostQuery {
  pathParams: {
    id: number;
  };
  body: {
    id: number;
    title: string;
    body: string;
    userId: number;
  };
}

export interface PatchPostQuery {
  pathParams: {
    id: number;
  };
  body: {
    title?: string;
    body?: string;
    userId?: number;
  };
}

export interface DeletePostQuery {
  pathParams: {
    id: number;
  };
}
