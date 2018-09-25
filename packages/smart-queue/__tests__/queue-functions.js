import { CREATE, READ, UPDATE, DELETE } from '../src/method-types';
import {
  deleteInQueue,
  readInQueue,
  updateInQueue,
  createInQueue
} from '../src/queue-functions';

export const createAction = (method, key = 1) => ({
  meta: {
    offline: {
      queue: { method, key }
    }
  }
});

const create1 = createAction(CREATE);
const read1 = createAction(READ);
const update1 = createAction(UPDATE);
const delete1 = createAction(DELETE);
const outbox = [read1, create1, update1, delete1];
const config = {
  merge: (y, x) => `${x}${y ? 'y' : 'undefined'}`
};

describe('createInQueue', () => {
  global.console.warn = jest.fn();

  test('when matched outbox action is CREATE, warns user and returns outbox untouched', () => {
    expect(createInQueue(outbox)).toEqual(outbox);
    expect(global.console.warn).toHaveBeenCalled();
  });
});

describe('readInQueue', () => {
  test('when matched outbox action is READ, merges actions together', () => {
    expect(readInQueue(outbox, 'x', 0, config)).toEqual([
      'xy',
      create1,
      update1,
      delete1
    ]);
  });
});

describe('updateInQueue', () => {
  test('when matched outbox action is CREATE, merges actions together', () => {
    expect(updateInQueue(outbox, 'x', 1, config)).toEqual([
      read1,
      'xy',
      update1,
      delete1
    ]);
  });

  test('when matched outbox action is UPDATE, merges actions together', () => {
    expect(updateInQueue(outbox, 'x', 2, config)).toEqual([
      read1,
      create1,
      'xy',
      delete1
    ]);
  });
});

describe('deleteInQueue', () => {
  test('when matched outbox action is CREATE removes action from outbox', () => {
    expect(deleteInQueue(outbox, 'x', 1)).toEqual([read1, update1, delete1]);
  });

  test('when matched outbox action is UPDATE replaces action in outbox', () => {
    expect(deleteInQueue(outbox, 'x', 2)).toEqual([
      read1,
      create1,
      'x',
      delete1
    ]);
  });

  test('when matched outbox action DELETE, ignores and returns outbox untouched', () => {
    expect(deleteInQueue(outbox, 'x', 3)).toEqual(outbox);
  });
});
