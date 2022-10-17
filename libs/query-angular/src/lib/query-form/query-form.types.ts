import { FormControl } from '@angular/forms';
import { QueryField } from './query-form';

export interface QueryFieldOptions<T = unknown> {
  /**
   * Debounce time in milliseconds.
   */
  debounce?: number;

  /**
   * The form control for the field.
   */
  control: FormControl<T | null>;

  /**
   * Append the field's value to the url.
   *
   * The field wont be appended to the url if one of the following is true:
   * - It is the default value
   * - It is an empty string
   * - It is `null`
   * - It is `undefined`
   *
   * @default true
   */
  appendToUrl?: boolean;

  /**
   * A function that transforms the the value gotten from the url query params to a value required by the field.
   * E.g. for a number field, the value from the url query params is a string, but the field requires a number.
   *
   * The following common transformations are already implemented:
   * - `transformToNumber`
   * - `transformToNumberArray`
   * - `transformToBoolean`
   * - `transformToBooleanArray`
   * - `transformToDate` (expects a string in the default js format)
   * - `transformToDateArray` (expects strings in the default js format)
   */
  queryParamTransformFn?: (val: unknown) => T | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QueryFormGroup<T extends Record<string, QueryField<any>>> = {
  [Property in keyof T]: T[Property]['control'];
};
