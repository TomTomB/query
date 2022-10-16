import { Router, ActivatedRoute } from '@angular/router';
import { combineLatest, map, Observable, tap } from 'rxjs';
import { AnyQueryCreator } from '../query-client';
import { ReactiveQueryFieldsOf } from './reactive-query.types';
import {
  buildReactiveQueryFieldValueChangeObservables,
  buildReactiveQueryForm,
  buildReactiveQueryFormDefaults,
  buildReactiveQueryParams,
  initialPatchReactiveQueryFormFromUrlState,
  updateQueryString,
} from './reactive-query.utils';

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
    map(() => buildReactiveQueryParams(fields, form)),
    tap((params) => {
      if (router) {
        updateQueryString(params, formDefaults, router);
      }
    }),
    map(({ pathParams, queryParams, variables }) =>
      query.prepare({ queryParams, pathParams, variables, headers })
    )
  ) as Observable<ReturnType<J['prepare']>>;

  return {
    form,
    changes,
  };
};
