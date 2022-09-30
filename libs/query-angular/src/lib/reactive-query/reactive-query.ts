import { FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  startWith,
  debounceTime,
  combineLatest,
  map,
  Observable,
  tap,
  concat,
  take,
} from 'rxjs';
import { AnyQueryCreator } from '../query-client';
import {
  FieldControlsOf,
  ReactiveQueryField,
  ReactiveQueryFieldsOf,
} from './reactive-query.types';

export const createReactiveQuery = <
  J extends AnyQueryCreator,
  F extends ReactiveQueryFieldsOf<J>
>(options: {
  fields: F;
  query: J;
  headers?: Record<string, string>;
  router?: Router;
  activatedRoute?: ActivatedRoute;
}) => {
  const { fields, query, router, activatedRoute, headers } = options;

  const form = buildForm(fields);
  const formDefaults = buildFormDefaults(form, fields);

  if (router && activatedRoute) {
    initialPatchFormFromUrlState({
      form: form,
      fields: fields,
      activatedRoute: activatedRoute,
    });
  }

  const fieldValueChangeObservables = buildFieldValueChangeObservables(
    fields,
    form
  );

  const changes = combineLatest(fieldValueChangeObservables).pipe(
    map(() => buildParams(fields, form)),
    tap((params) => {
      if (router) {
        updateQueryString(params, formDefaults, router);
      }
    }),
    map(({ pathParams, queryParams }) =>
      query.prepare({ queryParams, pathParams, headers })
    )
  ) as Observable<ReturnType<J['prepare']>>;

  return {
    form,
    changes,
  };
};

const buildForm = <F extends Record<string, ReactiveQueryField>>(fields: F) => {
  const formFields = Object.keys(fields).reduce((acc, key: keyof F) => {
    const field = fields[key];
    acc[key] = field.control;
    return acc;
  }, {} as FieldControlsOf<F>);

  return new FormGroup(formFields);
};

const initialPatchFormFromUrlState = (options: {
  form: FormGroup;
  fields: Record<string, ReactiveQueryField>;
  activatedRoute: ActivatedRoute;
}) => {
  const { form, fields, activatedRoute } = options;

  const queryParams = activatedRoute.snapshot.queryParams;

  const initialFormValue = Object.entries(fields)
    .map(([key, field]) => {
      const urlValue = queryParams[key];
      const value = field.deserialize ? field.deserialize(urlValue) : urlValue;

      return value ? { [key]: value } : {};
    })
    .reduce((acc, curr) => ({ ...acc, ...curr }), {});

  form.patchValue(initialFormValue);
};

const updateQueryString = (
  params: {
    queryParams: Record<string, unknown>;
    pathParams: Record<string, unknown>;
  },
  defaults: { key: string; default: unknown }[],
  router: Router
) => {
  const mergedParams = {
    ...params.queryParams,
    ...params.pathParams,
  };

  const queryParamsWithoutDefaults = Object.keys(mergedParams).reduce(
    (acc, key) => {
      const field = defaults.find((f) => f.key === key);

      if (!field) {
        throw new Error(`Field ${key} not found`);
      }

      const value = mergedParams[key] === '' ? undefined : mergedParams[key];

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

const buildParams = (
  fields: Record<string, ReactiveQueryField>,
  form: FormGroup
) => {
  return Object.entries(fields).reduce(
    (acc, [key, field]) => {
      const originalValue = form.getRawValue()[key];
      const value = field.serialize
        ? field.serialize(originalValue)
        : originalValue;

      if (field.isPathParam) {
        acc.pathParams[key] = value;
      } else {
        acc.queryParams[key] = value;
      }

      return acc;
    },
    { queryParams: {}, pathParams: {} } as {
      queryParams: Record<string, unknown>;
      pathParams: Record<string, unknown>;
    }
  );
};

const buildFieldValueChangeObservables = (
  fields: Record<string, ReactiveQueryField>,
  form: FormGroup
) => {
  return Object.entries(fields).map(([key, field]) => {
    const formField = form.controls[key];

    if (!formField) {
      throw new Error(`Field ${key} not found in form`);
    }

    const obs = formField.valueChanges.pipe(startWith(formField.value));

    if (!field.debounce) {
      return obs;
    }

    // The initial value should get emitted immediately
    // concat switches to the debounced observable after the first observable is completed
    return concat(
      obs.pipe(take(1)),
      formField.valueChanges.pipe(debounceTime(field.debounce))
    );
  });
};

const buildFormDefaults = (
  form: FormGroup,
  fields: Record<string, ReactiveQueryField>
) => {
  return Object.entries(fields).map(([key, field]) => {
    const originalValue = form.controls[key]?.value;
    const value = field.serialize
      ? field.serialize(originalValue)
      : originalValue;

    return {
      key: key,
      default: value,
    };
  });
};
