import { QueryState } from './query-state';

describe('QueryState', () => {
  it('should work', () => {
    const queryState = new QueryState();
    expect(queryState.get('foo')).toBeUndefined();

    queryState.set('foo', 'bar');
    expect(queryState.get('foo')).toBe('bar');

    queryState.delete('foo');
    expect(queryState.get('foo')).toBeUndefined();

    queryState.set('foo', 'bar');
    queryState.set('bar', 'baz');

    expect(queryState.has('foo')).toBeTruthy();
    expect(queryState.has('bar')).toBeTruthy();

    queryState.clear();

    expect(queryState.get('foo')).toBeUndefined();
    expect(queryState.get('bar')).toBeUndefined();
  });
});
