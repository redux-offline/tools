// @flow
import defaults from './defaults';
import {
  getQueueFunction,
  getQueueMeta,
  indexOfAction,
  methodAllowed,
  safeToProceed,
  valid
} from './utils';
import type { Config, Outbox, OfflineAction, Context } from './types';

const WARNING =
  'offline.queue must be an object which contains a valid "method" and a unique "key"';

export const enqueue = (userConfig: $Shape<Config> = {}) => {
  const config = { ...defaults, ...userConfig };

  return (outbox: Outbox, action: OfflineAction, context: Context): Outbox => {
    const queueMeta = getQueueMeta(action);

    if (!queueMeta) {
      return [...outbox, action];
    }

    if (!valid(queueMeta)) {
      // eslint-disable-next-line no-console
      console.error(new Error(WARNING));
      return outbox;
    }

    const queueFunction = getQueueFunction(queueMeta);
    const index = indexOfAction(outbox, queueMeta);

    if (
      index === -1 ||
      !safeToProceed(index, context) ||
      !methodAllowed(outbox[index], queueFunction)
    ) {
      return [...outbox, action];
    }

    return queueFunction(outbox, action, index, config);
  };
};
