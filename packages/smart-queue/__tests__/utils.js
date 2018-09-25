import * as methods from '../src/method-types';
import {
  getQueueFunction,
  getQueueMeta,
  valid,
  safeToProceed,
  methodAllowed,
  indexOfAction,
  replaceAtIndex,
  removeAtIndex
} from '../src/utils';

const action = {
  meta: {
    offline: {
      queue: {
        key: 1,
        method: methods.CREATE
      }
    }
  }
};

describe('getQueueFunction', () => {
  test.each(Object.values(methods))(
    'it returns a function for method %s',
    method => {
      const queueFunction = getQueueFunction({ method });
      expect(typeof queueFunction).toBe('function');
      expect(queueFunction.allowedMethods).toBeDefined();
    }
  );
});

describe('getQueueMeta', () => {
  test('returns an offline actions queue object', () => {
    expect(getQueueMeta(action)).toEqual(action.meta.offline.queue);
  });
});

describe('valid', () => {
  test.each([
    ['', false],
    [{ method: 'foo', key: 1 }, false],
    [{ method: methods.CREATE }, false],
    ...Object.values(methods).map((method, i) => [{ method, key: i }, true])
  ])('validates %o and returns %s', (value, expected) => {
    expect(valid(value)).toBe(expected);
  });
});

describe('safeToProceed', () => {
  test.each([
    [1, { offline: { busy: true } }, true],
    [2, { offline: { busy: true } }, true],
    [1, { offline: { busy: false } }, true],
    [0, { offline: { busy: false } }, true],
    [0, { offline: { busy: true } }, false]
  ])(
    'outbox index %i, context "%o" safeToProceed is %s',
    (index, context, expected) => {
      expect(safeToProceed(index, context)).toBe(expected);
    }
  );
});

describe('methodAllowed', () => {
  const mockQueueFunc = () => {};
  mockQueueFunc.allowedMethods = [methods.CREATE];

  test('returns true when queueMeta method in allowedMethods array in function', () => {
    expect(methodAllowed(action, mockQueueFunc)).toBe(true);
  });

  test('returns false when queueMeta method not in allowedMethods array in function', () => {
    const fakeMethodAction = { ...action };
    fakeMethodAction.meta.offline.queue.method = 'FAKE';
    expect(methodAllowed(fakeMethodAction, mockQueueFunc)).toBe(false);
  });
});

describe('indexOfAction', () => {
  const outbox = [{ meta: { offline: {} } }, { meta: { offline: {} } }];

  test('returns index of action in outbox by queueMeta key', () => {
    expect(indexOfAction([...outbox, action], getQueueMeta(action))).toBe(2);
  });

  test('returns -1 when action cannot be found in outbox by queueMeta key', () => {
    expect(indexOfAction(outbox, action)).toBe(-1);
  });
});

describe('replaceAtIndex', () => {
  test('replaces an item in an array at the specified index', () => {
    expect(replaceAtIndex([0, 1, 1, 3], 2, 2)).toEqual([0, 1, 2, 3]);
  });
});

describe('removeAtIndex', () => {
  test('removes an item from an array at the specified index', () => {
    expect(removeAtIndex([0, 1, 2, 2, 3], 2)).toEqual([0, 1, 2, 3]);
  });
});
