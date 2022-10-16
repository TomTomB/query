import { Router, ActivatedRoute } from '@angular/router';
import { combineLatest, map, tap } from 'rxjs';
import { AnyQueryCreator } from '../query-client';
import { ReactiveQueryFieldsOf } from './reactive-query.types';
import {
  buildReactiveQueryFieldValueChangeObservables,
  buildReactiveQueryForm,
  buildReactiveQueryFormDefaults,
  buildReactiveArgs,
  initialPatchReactiveQueryFormFromUrlState,
  updateQueryString,
} from './reactive-query.utils';

export const createReactiveQuery = <
  J extends AnyQueryCreator,
  F extends ReactiveQueryFieldsOf<J>
>(options: {
  fields: F;
  query: J;
  router?: Router;
  activatedRoute?: ActivatedRoute;
}) => {
  const { fields, router, activatedRoute } = options;

  const form = buildReactiveQueryForm(fields);

  const formDefaults = buildReactiveQueryFormDefaults(form, fields);

  if (router && activatedRoute) {
    initialPatchReactiveQueryFormFromUrlState({
      form: form,
      fields: fields,
      activatedRoute: activatedRoute,
    });
  }

  const fieldValueChangeObservables =
    buildReactiveQueryFieldValueChangeObservables(fields, form);

  const changes = combineLatest(fieldValueChangeObservables).pipe(
    map(() => buildReactiveArgs(fields, form)),
    tap((params) => {
      if (router) {
        updateQueryString(params, formDefaults, router);
      }
    }),
    map((data) => data as ReturnType<typeof form['getRawValue']>)
  );

  return {
    form,
    changes,
  };
};
