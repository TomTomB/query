import { FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { startWith, debounceTime, combineLatest, map } from 'rxjs';
import { AnyQueryCreator } from '../query-client';
import { ReactiveQueryField } from './reactive-query.types';

export const createReactiveQuery = <
  T extends FormGroup,
  J extends AnyQueryCreator
>(options: {
  form: T;
  fields: ReactiveQueryField<T>[];
  query: J;
  router?: Router;
  activatedRoute?: ActivatedRoute;
}) => {
  const { form, fields, query, router, activatedRoute } = options;

  const formDefaults = buildFormDefaults<T>(fields, form);

  if (router && activatedRoute) {
    initialPatchFormFromUrlState<T>({
      form: form,
      fields: fields,
      activatedRoute: activatedRoute,
    });
  }

  const fieldValueChangeObservables = buildFieldValueChangeObservables<T>(
    fields,
    form
  );

  return combineLatest(fieldValueChangeObservables).pipe(
    map(() => {
      const queryParams = buildQueryParams<T>(fields, form);

      if (router) {
        updateQueryString<T>(queryParams, formDefaults, router);
      }

      return query.prepare({ queryParams });
    })
  );
};

const initialPatchFormFromUrlState = <T extends FormGroup>(options: {
  form: T;
  fields: ReactiveQueryField<T>[];
  activatedRoute: ActivatedRoute;
}) => {
  const { form, fields, activatedRoute } = options;

  const queryParams = activatedRoute.snapshot.queryParams;

  const initialFormValue = fields
    .map((field) => {
      const urlValue = queryParams[field.key as string];
      const value = field.deserialize ? field.deserialize(urlValue) : urlValue;

      return value ? { [field.key]: value } : {};
    })
    .reduce((acc, curr) => ({ ...acc, ...curr }), {});

  form.patchValue(initialFormValue);
};

const updateQueryString = <T extends FormGroup>(
  queryParams: Record<keyof T['controls'], unknown>,
  defaults: { key: keyof T['controls']; default: any }[],
  router: Router
) => {
  const queryParamsWithoutDefaults = Object.keys(queryParams).reduce(
    (acc, key) => {
      const field = defaults.find((f) => f.key === key);

      if (!field) {
        throw new Error(`Field ${key} not found`);
      }

      const value = queryParams[key] === '' ? undefined : queryParams[key];

      if (value != field.default) {
        acc[key] = value;
      } else {
        acc[key] = undefined;
      }

      return acc;
    },
    {} as Record<string, unknown>
  );

  router.navigate([], {
    queryParams: queryParamsWithoutDefaults,
    queryParamsHandling: 'merge',
    replaceUrl: true,
  });
};

const buildQueryParams = <T extends FormGroup>(
  fields: ReactiveQueryField<T>[],
  form: T
) => {
  return fields.reduce((acc, field) => {
    const fieldName = field.key;
    const originalValue = form.getRawValue()[fieldName];
    const value = field.serialize
      ? field.serialize(originalValue)
      : originalValue;
    acc[fieldName] = value;

    return acc;
  }, {} as Record<keyof T['controls'], unknown>);
};

const buildFieldValueChangeObservables = <T extends FormGroup>(
  fields: ReactiveQueryField<T>[],
  form: T
) => {
  return fields.map((field) => {
    const formField = form.controls[field.key as string];

    if (!formField) {
      throw new Error(`Field ${field.key as string} not found in form`);
    }

    const obs = formField.valueChanges.pipe(startWith(formField.value));

    return field.debounce ? obs.pipe(debounceTime(field.debounce)) : obs;
  });
};

const buildFormDefaults = <T extends FormGroup>(
  fields: ReactiveQueryField<T>[],
  form: T
) => {
  return fields.map((field) => {
    const originalValue = form.controls[field.key as string]?.value;
    const value =
      field.default ??
      (field.serialize ? field.serialize(originalValue) : originalValue);

    return {
      key: field.key,
      default: value,
    };
  });
};
