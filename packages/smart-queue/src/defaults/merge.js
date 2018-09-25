const mergeActions = (queuedAction, incomingAction) => {
  const queuedActionOffline = queuedAction.meta.offline;
  const incomingActionOffline = incomingAction.meta.offline;

  return {
    ...queuedAction,
    ...incomingAction,
    payload: {
      ...queuedAction.payload,
      ...incomingAction.payload
    },
    meta: {
      ...queuedAction.meta,
      ...incomingAction.meta,
      offline: {
        ...queuedActionOffline,
        effect: {
          ...queuedActionOffline.effect
          // TODO: Body/Json support
        },
        // TODO: These are optional, treat as such
        commit: {
          ...queuedActionOffline.commit,
          meta: {
            ...(queuedActionOffline.commit.meta || {}),
            ...(incomingActionOffline.commit.meta || {})
          }
        },
        rollback: {
          ...queuedActionOffline.rollback,
          meta: {
            ...(queuedActionOffline.rollback.meta || {}),
            ...(incomingActionOffline.rollback.meta || {})
          }
        }
      }
    }
  };
};

export default mergeActions;
