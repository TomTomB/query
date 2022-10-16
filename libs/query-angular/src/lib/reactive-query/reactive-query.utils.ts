import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { startWith, concat, take, debounceTime } from 'rxjs';
import { FieldControlsOf, ReactiveQueryField } from './reactive-query.types';

export const buildReactiveQueryForm = <
  F extends Record<string, ReactiveQueryField>
>(
  fields: F
) => {
  const formFields = Object.keys(fields).reduce((acc, key: keyof F) => {
    const field = fields[key];
    acc[key] = field.control;
    return acc;
  }, {} as FieldControlsOf<F>);

  return new FormGroup(formFields);
};

export const initialPatchReactiveQueryFormFromUrlState = (options: {
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

export const updateQueryString = (
  params: {
    queryParams: Record<string, unknown>;
    pathParams: Record<string, unknown>;
    variables: Record<string, unknown>;
  },
  defaults: { key: string; default: unknown }[],
  router: Router
) => {
  const mergedParams = {
    ...params.queryParams,
    ...params.pathParams,
    ...params.variables,
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

export const buildReactiveQueryParams = (
  fields: Record<string, ReactiveQueryField>,
  form: FormGroup
) => {
  return Object.entries(fields).reduce(
    (acc, [key, field]) => {
      const originalValue = form.getRawValue()[key];
      const value = field.serialize
        ? field.serialize(originalValue)
        : originalValue;

      if (!field.type || field.type === 'query') {
        acc.queryParams[key] = value;
      } else if (field.type === 'path') {
        acc.pathParams[key] = value;
      } else if (field.type === 'variable') {
        acc.variables[key] = value;
      }

      return acc;
    },
    { queryParams: {}, pathParams: {}, variables: {} } as {
      queryParams: Record<string, unknown>;
      pathParams: Record<string, unknown>;
      variables: Record<string, unknown>;
    }
  );
};

export const buildReactiveQueryFieldValueChangeObservables = (
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

export const buildReactiveQueryFormDefaults = (
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
