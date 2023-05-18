import React from 'react';
import sortBy from 'lodash.sortby';

import {
  CatalogExtensionHookOptions,
  CatalogItem,
  CatalogItemMetadataProviderFunction,
} from '@openshift-console/dynamic-plugin-sdk';
import { IncompleteDataError } from '@openshift-console/dynamic-plugin-sdk/lib/utils/error/http-error';
import { applyCatalogItemMetadata, keywordCompare } from '@topology-utils/catalog-utils';
import useCatalogExtensions from '@topology-utils/hooks/useCatalogExtensions';
import useGetAllDisabledSubCatalogs from '@topology-utils/hooks/useGetAllDisabledSubCatalogs';
import useTimeout from '@topology-utils/hooks/useTimeout';
import { CatalogService } from '@topology-utils/types/catalog-types';

import CatalogExtensionHookResolver from './CatalogExtensionHookResolver';

type CatalogServiceProviderProps = {
  namespace: string;
  catalogId: string;
  catalogType?: string;
  showAlreadyLoadedItemsAfter?: number;
  children: (service: CatalogService) => React.ReactNode;
};

const CatalogServiceProvider: React.FC<CatalogServiceProviderProps> = ({
  namespace,
  catalogId,
  catalogType,
  showAlreadyLoadedItemsAfter = 3000,
  children,
}) => {
  const defaultOptions: CatalogExtensionHookOptions = { namespace };
  const [
    catalogTypeExtensions,
    catalogProviderExtensions,
    catalogFilterExtensions,
    catalogBadgeProviderExtensions,
    extensionsResolved,
  ] = useCatalogExtensions(catalogId, catalogType);
  const [disabledSubCatalogs] = useGetAllDisabledSubCatalogs();
  const [extItemsMap, setExtItemsMap] = React.useState<{ [uid: string]: CatalogItem[] }>({});
  const [extItemsErrorMap, setItemsErrorMap] = React.useState<{ [uid: string]: Error }>({});
  const [metadataProviderMap, setMetadataProviderMap] = React.useState<{
    [type: string]: { [id: string]: CatalogItemMetadataProviderFunction };
  }>({});

  const showAlreadyLoadedItems = useTimeout(showAlreadyLoadedItemsAfter);

  const loaded =
    extensionsResolved &&
    (catalogProviderExtensions.length === 0 ||
      (showAlreadyLoadedItems
        ? catalogProviderExtensions.some(({ uid }) => extItemsMap[uid] || extItemsErrorMap[uid])
        : catalogProviderExtensions.every(({ uid }) => extItemsMap[uid] || extItemsErrorMap[uid])));

  const enabledCatalogProviderExtensions = catalogProviderExtensions.filter((item) => {
    return !disabledSubCatalogs?.includes(item?.properties?.type);
  });
  const preCatalogItems = React.useMemo(() => {
    if (!loaded) {
      return [];
    }

    const itemMap = enabledCatalogProviderExtensions
      .map((e) =>
        catalogFilterExtensions
          .filter((fe) => fe.properties.type === e.properties.type)
          .reduce((acc, ext) => acc.filter(ext.properties.filter), extItemsMap[e.uid] ?? []),
      )
      .flat()
      .reduce((acc, item) => {
        if (!item) return acc;
        acc[item.uid] = item;
        return acc;
      }, {} as { [uid: string]: CatalogItem });

    return sortBy(Object.values(itemMap), 'name');
  }, [extItemsMap, loaded, enabledCatalogProviderExtensions, catalogFilterExtensions]);

  const catalogItems = React.useMemo(() => {
    if (!loaded) {
      return preCatalogItems;
    }
    return applyCatalogItemMetadata(preCatalogItems, metadataProviderMap);
  }, [loaded, preCatalogItems, metadataProviderMap]);

  const onValueResolved = React.useCallback((items, uid) => {
    setExtItemsMap((prev) => ({ ...prev, [uid]: items }));
  }, []);

  const onValueError = React.useCallback((error, uid) => {
    setItemsErrorMap((prev) => ({ ...prev, [uid]: error }));
  }, []);

  const onMetadataValueResolved = React.useCallback((provider, uid, type) => {
    setMetadataProviderMap((prev) => ({
      ...prev,
      [type]: { ...(prev?.[type] ?? {}), [uid]: provider },
    }));
  }, []);

  const searchCatalog = React.useCallback(
    (query: string) => {
      return keywordCompare(query, catalogItems);
    },
    [catalogItems],
  );

  const catalogItemsMap = React.useMemo(() => {
    const result: { [type: string]: CatalogItem[] } = {};
    catalogProviderExtensions.forEach((e) => {
      result[e.properties.type] = [];
    });
    catalogItems.forEach((item) => {
      result[item.type].push(item);
    });
    return result;
  }, [catalogProviderExtensions, catalogItems]);

  const failedExtensions = [
    ...new Set(
      catalogProviderExtensions
        .filter(({ uid }) => extItemsErrorMap[uid])
        .map((e) => e.properties.title),
    ),
  ];

  const failedCalls = catalogProviderExtensions.filter(({ uid }) => extItemsErrorMap[uid]).length;
  const totalCalls = catalogProviderExtensions.length;
  const loadError =
    // eslint-disable-next-line no-nested-ternary
    !loaded || failedCalls === 0
      ? null
      : failedCalls === totalCalls
      ? new Error('failed loading catalog data')
      : new IncompleteDataError(failedExtensions);

  const catalogService: CatalogService = {
    type: catalogType,
    items: catalogItems,
    itemsMap: catalogItemsMap,
    loaded,
    loadError,
    searchCatalog,
    catalogExtensions: catalogTypeExtensions,
  };

  return (
    <>
      {extensionsResolved &&
        catalogProviderExtensions.map((extension) => (
          <CatalogExtensionHookResolver<CatalogItem[]>
            key={extension.uid}
            id={extension.uid}
            useValue={extension.properties.provider}
            options={defaultOptions}
            onValueResolved={onValueResolved}
            onValueError={onValueError}
          />
        ))}
      {extensionsResolved &&
        catalogBadgeProviderExtensions.map((extension) => (
          <CatalogExtensionHookResolver<CatalogItemMetadataProviderFunction>
            key={extension.uid}
            id={extension.uid}
            useValue={extension.properties.provider}
            options={defaultOptions}
            onValueResolved={(value, uid) =>
              onMetadataValueResolved(value, uid, extension.properties.type)
            }
          />
        ))}
      {children(catalogService)}
    </>
  );
};

export default CatalogServiceProvider;