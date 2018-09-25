// @flow
import queueFunctions from './queue-functions';
import type {
  Queue,
  OfflineAction,
  Outbox,
  QueueFunction,
  Context
} from './types';

/**
 * Returns queue function by method
 * @param {object} queueMeta
 * @return {function}
 */
export const getQueueFunction = ({ method }: Queue): QueueFunction =>
  queueFunctions[method];

/**
 * Returns an offline action's queue meta
 * @param {action} action
 * @return {object}
 */
export const getQueueMeta = ({ meta }: OfflineAction): ?Queue =>
  meta.offline.queue;

/**
 * Asserts whether an offline action's queue metadata is valid
 * @param {action} queueMeta
 * @return {boolean}
 */
export const valid = (queueMeta: Queue): boolean =>
  typeof queueMeta === 'object' &&
  !!getQueueFunction(queueMeta) &&
  {}.hasOwnProperty.call(queueMeta, 'key');

/**
 * Checks whether an action is safe to be operated on in the queue
 * if the action is the first in the queue and redux-offline is currently
 * busy, assume that the action is currently being resolved and is not safe
 * to operate on
 * @param {number} index
 * @param {object} context
 * @return {boolean}
 */
export const safeToProceed = (index: number, { offline }: Context): boolean =>
  !(index === 0 && offline.busy);

/**
 * Checks whether action's queue method is a queueFunctions allowed methods
 * @param {*} action
 * @param {function} queueFunction
 * @return {boolean}
 */
export const methodAllowed = (
  action: OfflineAction,
  queueFunction: QueueFunction
): boolean =>
  queueFunction.allowedMethods.includes((getQueueMeta(action) || {}).method);

/**
 * Finds the index of an action in the outbox that carries the corresponding
 * key in it's queueMeta
 * @param {array} outbox
 * @param {object} queueMeta
 * @return {number}
 */
export const indexOfAction = (outbox: Outbox, { key }: Queue): number =>
  outbox.findIndex(action => {
    const queueMeta = getQueueMeta(action);
    return queueMeta && queueMeta.key === key;
  });

/**
 * Replaces item in an array at specified index
 * @param {array} outbox
 * @param {object} action
 * @param {number} index
 * @return {array}
 */
export const replaceAtIndex = (
  outbox: Outbox,
  action: OfflineAction,
  index: number
): Outbox => outbox.map((val, i) => (i === index ? action : val));

/**
 * Removes an item by index from an array
 * @param {array} outbox
 * @param {number} index
 * @return {array}
 */
export const removeAtIndex = (outbox: Outbox, index: number): Outbox =>
  outbox.filter((_, i) => i !== index);
