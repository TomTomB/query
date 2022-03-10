export interface RequestError<Detail = unknown> {
  code: number;
  message: string;
  detail?: Detail;
}

export type Params = Record<
  string | number | symbol,
  string | number | boolean | ParamArray
>;

export type ParamArray = Array<string | number | boolean>;

export type UnfilteredParams = Record<
  string | number | symbol,
  string | number | boolean | null | undefined | UnfilteredParamArray
>;

export type UnfilteredParamArray = Array<
  string | number | boolean | undefined | null
>;
