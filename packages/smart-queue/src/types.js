// @flow
import { CREATE, READ, UPDATE, DELETE } from './method-types';

type Method = typeof CREATE | typeof READ | typeof UPDATE | typeof DELETE;

export type Queue = {
  method: Method,
  key: string | number
};

export type OfflineMetadata = {
  effect: {},
  commit?: {},
  rollback?: {},
  queue?: Queue
};

export type OfflineAction = {
  type: string,
  payload: ?{},
  meta: {
    transaction?: number,
    offline: OfflineMetadata
  }
};

export type Outbox = OfflineAction[];

export type Merge = (
  queuedAction: OfflineAction,
  incomingAction: OfflineAction
) => OfflineAction;

export type Config = {
  merge: Merge
};

export type NetInfo = {
  isConnectionExpensive: ?boolean,
  reach: string
};

export type Context = {
  offline: {
    busy: boolean,
    lastTransaction: number,
    online: boolean,
    outbox: Outbox,
    netInfo?: NetInfo,
    retryCount: number,
    retryScheduled: boolean
  }
};

export type QueueFunction = {
  (Outbox, OfflineAction, number, Config): Outbox,
  allowedMethods: Method[]
};
