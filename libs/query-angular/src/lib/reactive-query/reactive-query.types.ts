import { FormControl } from '@angular/forms';
import { PathParams, QueryParams } from '@tomtomb/query-core';
import { BaseArguments, EmptyObject } from '../query';
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

  /**
   * Determines if the field should be used as a path parameter instead of a query parameter.
   */
  isPathParam?: boolean;
}

export type FieldControlsOf<F extends Record<string, ReactiveQueryField>> = {
  [Property in keyof F]: F[Property]['control'];
};

export type FieldDefinitions<T extends AnyQueryCreator> =
  WithFieldsFromPathParams<QueryCreatorArgs<T>> &
    WithFieldsFromQueryParams<QueryCreatorArgs<T>>;

export type WithFieldsFromPathParams<T extends BaseArguments | undefined> =
  T extends {
    pathParams: PathParams;
  }
    ? T['pathParams']
    : EmptyObject;

export type WithFieldsFromQueryParams<T extends BaseArguments | undefined> =
  T extends {
    queryParams: QueryParams;
  }
    ? T['queryParams']
    : EmptyObject;

export type ReactiveQueryFieldsOf<T extends AnyQueryCreator> = {
  [K in keyof FieldDefinitions<T>]: ReactiveQueryField<FieldDefinitions<T>[K]>;
};
