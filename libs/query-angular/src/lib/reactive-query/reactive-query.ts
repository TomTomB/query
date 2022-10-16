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

// TODO: Add support for fields that reset other fields when they change.
// TODO: Keeping all fields required is a bit of a pain. (e.g. for fields that never change). Maybe make them optional?
// TODO: Add support for hiding fields from the url.
// TODO: Add support for graphql esque pagination? (usually using something like `skip`, `limit` aka pageSize and `total`). See https://www.contentful.com/blog/2021/04/23/paginating-contentful-blogposts-with-nextjs-graphql-api/
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
