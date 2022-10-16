import { FormControl, FormGroup } from '@angular/forms';
import {
  EmptyObject,
  WithPathParams,
  WithQueryParams,
  WithVariables,
} from '../query';
import { AnyQueryCreator, QueryCreatorArgs } from '../query-client';

export interface ReactiveQueryField<T = unknown> {
  /**
   * Debounce time in milliseconds.
   */
  debounce?: number;

  /**
   * The form control for the field.
   */
  control: FormControl<T | null>;

  /**
   * A function that serializes the field's value to a value required by the query.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serialize?: (val: any) => unknown;

  /**
   * A function that deserializes the the value gotten from the url to a value required by the field.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deserialize?: (val: any) => unknown;
}

export type StripUndefined<T> = T extends undefined ? never : T;

export type FieldControlsOf<F extends Record<string, ReactiveQueryField>> = {
  [Property in keyof F]: F[Property]['control'];
};

export type ReactiveQueryFieldsOfFields<T extends Record<string, unknown>> = {
  [K in keyof T]: ReactiveQueryField<T[K]>;
};

export type MayWithQueryParams<T extends AnyQueryCreator> = StripUndefined<
  QueryCreatorArgs<T>
> extends WithQueryParams
  ? {
      queryParams: ReactiveQueryFieldsOfFields<
        StripUndefined<QueryCreatorArgs<T>>['queryParams']
      >;
    }
  : EmptyObject;

export type MayWithPathParams<T extends AnyQueryCreator> = StripUndefined<
  QueryCreatorArgs<T>
> extends WithPathParams
  ? {
      pathParams: ReactiveQueryFieldsOfFields<
        StripUndefined<QueryCreatorArgs<T>>['pathParams']
      >;
    }
  : EmptyObject;

export type MayWithVariables<T extends AnyQueryCreator> = StripUndefined<
  QueryCreatorArgs<T>
> extends WithVariables
  ? {
      variables: ReactiveQueryFieldsOfFields<
        StripUndefined<QueryCreatorArgs<T>>['variables']
      >;
    }
  : EmptyObject;

export type ReactiveQueryFieldsOf<T extends AnyQueryCreator> =
  MayWithQueryParams<T> & MayWithPathParams<T> & MayWithVariables<T>;

export type ReactiveQueryFields = {
  queryParams?: ReactiveQuerySubFields;
  pathParams?: ReactiveQuerySubFields;
  variables?: ReactiveQuerySubFields;
};

export type ReactiveQuerySubFields = Record<
  string,
  ReactiveQueryField<unknown>
>;

export type MayWithQueryParamsFormGroup<T extends ReactiveQueryFields> =
  T extends {
    queryParams: Record<string, ReactiveQueryField>;
  }
    ? {
        queryParams: FormGroup<{
          [K in keyof T['queryParams']]: T['queryParams'][K]['control'];
        }>;
      }
    : Record<string, never>;

export type MayWithPathParamsFormGroup<T extends ReactiveQueryFields> =
  T extends {
    pathParams: Record<string, ReactiveQueryField>;
  }
    ? {
        pathParams: FormGroup<{
          [K in keyof T['pathParams']]: T['pathParams'][K]['control'];
        }>;
      }
    : Record<string, never>;

export type MayWithVariablesFormGroup<T extends ReactiveQueryFields> =
  T extends {
    variables: Record<string, ReactiveQueryField>;
  }
    ? {
        variables: FormGroup<{
          [K in keyof T['variables']]: T['variables'][K]['control'];
        }>;
      }
    : Record<string, never>;

export type ReactiveFormGroupsOf<T extends ReactiveQueryFields> =
  MayWithQueryParamsFormGroup<T> &
    MayWithPathParamsFormGroup<T> &
    MayWithVariablesFormGroup<T>;
