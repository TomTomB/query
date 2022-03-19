export interface RequestError<Detail = unknown> {
  code: number;
  message: string;
  detail?: Detail;
  raw: unknown;
}

export type ParamPrimitive = string | number | boolean | null | undefined;

export type Params = Record<
  string | number | symbol,
  ParamPrimitive | ParamArray
>;

export type ParamArray = Array<ParamPrimitive>;

export type UnfilteredParamPrimitive =
  | string
  | number
  | boolean
  | null
  | undefined;

export type UnfilteredParams = Record<
  string | number | symbol,
  UnfilteredParamPrimitive | UnfilteredParamArray
>;

export type UnfilteredParamArray = Array<UnfilteredParamPrimitive>;
