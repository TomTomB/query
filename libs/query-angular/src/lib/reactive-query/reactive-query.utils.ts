import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { startWith, concat, take, debounceTime } from 'rxjs';
import {
  FieldControlsOf,
  ReactiveQueryFields,
  ReactiveFormGroupsOf,
  ReactiveQueryField,
  ReactiveQuerySubFields,
} from './reactive-query.types';

export const buildReactiveQueryForm = <F extends ReactiveQueryFields>(
  fields: F
) => {
  const formFieldsOf = <X extends Record<string, ReactiveQueryField>>(
    subFields: X
  ) =>
    Object.keys(subFields).reduce((acc, key: keyof typeof subFields) => {
      const field = subFields[key];
      acc[key] = field.control;
      return acc;
    }, {} as FieldControlsOf<typeof subFields>);

  const form = new FormGroup({} as ReactiveFormGroupsOf<F>);

  if (fields.queryParams) {
    form.addControl(
      'queryParams',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new FormGroup(formFieldsOf(fields.queryParams)) as any
    );
  }

  if (fields.pathParams) {
    form.addControl(
      'pathParams',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new FormGroup(formFieldsOf(fields.pathParams)) as any
    );
  }

  if (fields.variables) {
    form.addControl(
      'variables',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new FormGroup(formFieldsOf(fields.variables)) as any
    );
  }

  return form;
};

export const initialPatchReactiveQueryFormFromUrlState = (options: {
  form: FormGroup;
  fields: ReactiveQueryFields;
  activatedRoute: ActivatedRoute;
}) => {
  const { form, fields, activatedRoute } = options;

  const queryParams = activatedRoute.snapshot.queryParams;

  const subInitialFormValue = (subFields: ReactiveQuerySubFields) =>
    Object.entries(subFields)
      .map(([key, field]) => {
        const urlValue = queryParams[key];
        const value = field.deserialize
          ? field.deserialize(urlValue)
          : urlValue;

        return value ? { [key]: value } : {};
      })
      .reduce((acc, curr) => ({ ...acc, ...curr }), {});

  const initialFormValue = {
    ...(fields.queryParams && {
      queryParams: subInitialFormValue(fields.queryParams),
    }),
    ...(fields.pathParams && {
      pathParams: subInitialFormValue(fields.pathParams),
    }),
    ...(fields.variables && {
      variables: subInitialFormValue(fields.variables),
    }),
  };

  form.patchValue(initialFormValue);
};

export const updateQueryString = (
  params: {
    variables?: Record<string, unknown> | undefined;
    pathParams?: Record<string, unknown> | undefined;
    queryParams?: Record<string, unknown> | undefined;
  },
  defaults: {
    variables?: { key: string; default: unknown }[];
    pathParams?: { key: string; default: unknown }[];
    queryParams?: { key: string; default: unknown }[];
  },
  router: Router
) => {
  const mergedParams = {
    ...params.queryParams,
    ...params.pathParams,
    ...params.variables,
  };

  const queryParamsWithoutDefaults = Object.keys(mergedParams).reduce(
    (acc, key) => {
      const field =
        defaults.pathParams?.find((f) => f.key === key) ||
        defaults.queryParams?.find((f) => f.key === key) ||
        defaults.variables?.find((f) => f.key === key);

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

export const buildReactiveArgs = (
  fields: ReactiveQueryFields,
  form: FormGroup
) => {
  const subFieldArgs = (
    subFields: ReactiveQuerySubFields,
    group: keyof ReactiveQueryFields
  ) =>
    Object.entries(subFields).reduce((acc, [key, field]) => {
      const originalValue = form.getRawValue()[group][key];
      const value = field.serialize
        ? field.serialize(originalValue)
        : originalValue;

      acc[key] = value;

      return acc;
    }, {} as Record<string, unknown>);

  const args = {
    ...(fields.queryParams && {
      queryParams: subFieldArgs(fields.queryParams, 'queryParams'),
    }),
    ...(fields.pathParams && {
      pathParams: subFieldArgs(fields.pathParams, 'pathParams'),
    }),
    ...(fields.variables && {
      variables: subFieldArgs(fields.variables, 'variables'),
    }),
  };

  return args;
};

export const buildReactiveQueryFieldValueChangeObservables = (
  fields: ReactiveQueryFields,
  form: FormGroup
) => {
  const subFieldObservables = (
    subFields: ReactiveQuerySubFields,
    group: keyof ReactiveQueryFields
  ) =>
    Object.entries(subFields).map(([key, field]) => {
      const formField = (form.controls[group] as FormGroup).controls[key];

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

  const observables = [];

  if (fields.queryParams) {
    observables.push(...subFieldObservables(fields.queryParams, 'queryParams'));
  }

  if (fields.pathParams) {
    observables.push(...subFieldObservables(fields.pathParams, 'pathParams'));
  }

  if (fields.variables) {
    observables.push(...subFieldObservables(fields.variables, 'variables'));
  }

  return observables;
};

export const buildReactiveQueryFormDefaults = (
  form: FormGroup,
  fields: ReactiveQueryFields
) => {
  const defaultsFor = (
    subFields: ReactiveQuerySubFields,
    group: keyof ReactiveQueryFields
  ) =>
    Object.entries(subFields).map(([key, field]) => {
      const originalValue = (form.controls[group] as FormGroup).controls[key]
        ?.value;
      const value = field.serialize
        ? field.serialize(originalValue)
        : originalValue;

      return {
        key: key,
        default: value,
      };
    });

  const defaults = {
    queryParams: fields.queryParams
      ? defaultsFor(fields.queryParams, 'queryParams')
      : [],
    pathParams: fields.pathParams
      ? defaultsFor(fields.pathParams, 'pathParams')
      : [],
    variables: fields.variables
      ? defaultsFor(fields.variables, 'variables')
      : [],
  };

  return defaults;
};
