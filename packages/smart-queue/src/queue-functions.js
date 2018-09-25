// @flow
import { CREATE, UPDATE, DELETE, READ } from './method-types';
import { getQueueMeta, removeAtIndex, replaceAtIndex } from './utils';
import type { QueueFunction } from './types';

/**
 *
 * @param {array} outbox
 * @param {object} action
 * @param {number} index
 */
export const createInQueue: QueueFunction = Object.assign(
  outbox => {
    // eslint-disable-next-line no-console
    console.warn(
      'Duplicate CREATE action found, every CREATE action should have unique key!'
    );

    return outbox;
  },
  { allowedMethods: [CREATE] }
);

/**
 *
 * @param {array} outbox
 * @param {object} action
 * @param {number} index
 */
export const readInQueue: QueueFunction = Object.assign(
  (outbox, action, index, { merge }) =>
    replaceAtIndex(outbox, merge(outbox[index], action), index),
  { allowedMethods: [READ] }
);

/**
 *
 * @param {array} outbox
 * @param {object} action
 * @param {number} index
 */
export const updateInQueue: QueueFunction = Object.assign(
  (outbox, action, index, { merge }) =>
    replaceAtIndex(outbox, merge(outbox[index], action), index),
  { allowedMethods: [CREATE, UPDATE] }
);

/**
 *
 * @param {array} outbox
 * @param {object} action
 * @param {number} index
 */
export const deleteInQueue: QueueFunction = Object.assign(
  (outbox, action, index) => {
    const { method } = getQueueMeta(outbox[index]) || {};

    // if create, remove queued action
    if (method === CREATE) {
      return removeAtIndex(outbox, index);
    }

    // if update, replace queued action with delete
    if (method === UPDATE) {
      return replaceAtIndex(outbox, action, index);
    }

    // delete method already exists, ignore incoming action
    return outbox;
  },
  { allowedMethods: [CREATE, UPDATE, DELETE] }
);

export default {
  [CREATE]: createInQueue,
  [READ]: readInQueue,
  [UPDATE]: updateInQueue,
  [DELETE]: deleteInQueue
};
