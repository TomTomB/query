import { QueryState } from './query-state';
import { QueryStateErrorItem } from './query-state.types';

const generateDummyQueryStateItem = (error: unknown) => {
  const item: QueryStateErrorItem = {
    error,
    state: 'error',
  };

  return item;
};

describe('QueryState', () => {
  it('should work', () => {
    const queryState = new QueryState();
    const fooItem = generateDummyQueryStateItem('foo');
    const barItem = generateDummyQueryStateItem('bar');
    const bazItem = generateDummyQueryStateItem('baz');

    expect(queryState.get('foo')).toBeNull();

    queryState.set('foo', fooItem);
    expect(queryState.get('foo')).toBe(fooItem);

    queryState.delete('foo');
    expect(queryState.get('foo')).toBeNull();

    queryState.set('foo', barItem);
    queryState.set('bar', bazItem);

    expect(queryState.has('foo')).toBeTruthy();
    expect(queryState.has('bar')).toBeTruthy();

    queryState.clear();

    expect(queryState.get('foo')).toBeNull();
    expect(queryState.get('bar')).toBeNull();
  });
});
