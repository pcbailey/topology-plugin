import { useEffect } from 'react';

import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

type ResolveAdapterProps<D, T> = {
  resource: K8sResourceCommon;
  data?: T;
  useAdapterHook: (resource: K8sResourceCommon, data: T) => D;
  onAdapterDataResolved: (data: D) => void;
};

// eslint-disable-next-line
const ResolveAdapter = <D extends {}, T = {}>({
  resource,
  data: customData,
  useAdapterHook,
  onAdapterDataResolved,
}: ResolveAdapterProps<D, T>) => {
  const data = useAdapterHook(resource, customData);

  useEffect(() => {
    if (data) {
      onAdapterDataResolved(data);
    }
    // We do not want to run the effect every time onAdapterDataResolved changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return null;
};

export default ResolveAdapter;