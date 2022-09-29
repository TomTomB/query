import { FormGroup } from '@angular/forms';

export interface ReactiveQueryField<T extends FormGroup> {
  key: keyof T['controls'];
  debounce?: number;
  default?: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serialize?: (val: any) => unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deserialize?: (val: any) => unknown;
}
