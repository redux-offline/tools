import { CREATE, READ, UPDATE, DELETE } from '../src/method-types';
import { enqueue as initEnqueue } from '../src/enqueue';

export const createAction = (method, key = 1, payload = {}) => ({
  ...payload,
  meta: {
    offline: {
      queue: { method, key }
    }
  }
});

const enqueue = initEnqueue({ merge: (x, y) => ({ ...y, ...x }) });
const create1 = createAction(CREATE, 1, { foo: 1 });
const read1 = createAction(READ, 2, { foo: 1 });
const update1 = createAction(UPDATE, 3, { foo: 1 });
const delete1 = createAction(DELETE, 4, { foo: 1 });
const plain1 = { meta: { offline: {} } };
const invalid1 = { meta: { offline: { queue: {} } } };
const context = { offline: {} };
const contextBusy = { offline: { busy: true } };
const outbox = [read1, create1, update1, delete1];

global.console.warn = jest.fn();

test('offline action added to outbox if queue meta not defined', () => {
  expect(enqueue(outbox, plain1, context)).toEqual([...outbox, plain1]);
});

test('outbox returned without changes and error logged if queue meta present but invalid', () => {
  global.console.error = jest.fn();
  expect(enqueue(outbox, invalid1, context)).toBe(outbox);
  expect(global.console.error).toHaveBeenCalled();
});

test('if offline action cannot be paired with outbox action via key, it is added to the outbox', () => {
  const update2 = createAction(UPDATE, 5);
  expect(enqueue(outbox, update2, context)).toEqual([...outbox, update2]);
});

test('if offline action can be paired with outbox action via key, but currently resolving, it is added to the outbox', () => {
  expect(enqueue(outbox, read1, contextBusy)).toEqual([...outbox, read1]);
});

test('if offline action is paired but does not match an allowedMethod for the specified queueFunction, it is added to the outbox', () => {
  const read2 = createAction(READ, 3);
  expect(enqueue(outbox, read2, context)).toEqual([...outbox, read2]);
});

test.each([
  [
    'it ignores duplicate CREATE actions with same key and returns outbox untouched',
    createAction(CREATE, 1),
    outbox
  ],
  [
    'it merges incoming READ action with existing READ action with the same key into outbox',
    createAction(READ, 2, { bar: 2 }),
    [createAction(READ, 2, { foo: 1, bar: 2 }), create1, update1, delete1]
  ],
  [
    'it merges UPDATE actions into existing CREATE action with the same key into outbox',
    createAction(UPDATE, 1, { bar: 2 }),
    [read1, createAction(CREATE, 1, { foo: 1, bar: 2 }), update1, delete1]
  ],
  [
    'it removes CREATE outbox action when incoming DELETE action has the same key from outbox',
    createAction(DELETE, 1),
    [read1, update1, delete1]
  ],
  [
    'it merges UPDATE action into existing UPDATE with the same key into outbox',
    createAction(UPDATE, 3, { bar: 2 }),
    [read1, create1, createAction(UPDATE, 3, { foo: 1, bar: 2 }), delete1]
  ],
  [
    'it ignores incoming DELETE action if existing DELETE action with same key in outbox',
    createAction(DELETE, 4),
    outbox
  ]
])('%s', (_, action, expected) => {
  expect(enqueue(outbox, action, context)).toEqual(expected);
});
