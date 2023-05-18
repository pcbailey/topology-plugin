import React, { ReactElement } from 'react';
import { TFunction } from 'i18next';

import { TopologyViewType } from '../../utils/types/topology-types';

import Shortcut from './components/Shortcut/Shortcut';
import ShortcutTable from './components/ShortcutTable';

export type Options = {
  supportedFileTypes: string[];
  isEmptyModel: boolean;
  viewType: TopologyViewType;
  allImportAccess: boolean;
};

export const getTopologyShortcuts = (t: TFunction, options: Options): ReactElement => {
  const { supportedFileTypes, isEmptyModel, viewType, allImportAccess } = options;
  return (
    <ShortcutTable>
      {!isEmptyModel && viewType === TopologyViewType.graph && (
        <>
          <Shortcut data-test-id="move" drag>
            {t('plugin__topology-plugin~Move')}
          </Shortcut>
          {allImportAccess && (
            <>
              <Shortcut data-test-id="edit-application-grouping" shift drag>
                {t('plugin__topology-plugin~Edit application grouping')}
              </Shortcut>
              <Shortcut data-test-id="context-menu" rightClick>
                {t('plugin__topology-plugin~Access context menu')}
              </Shortcut>
              <Shortcut data-test-id="create-connector-handle" hover>
                {t('plugin__topology-plugin~Access create connector handle')}
              </Shortcut>
            </>
          )}
        </>
      )}
      {!isEmptyModel && (
        <Shortcut data-test-id="view-details" click>
          {t('plugin__topology-plugin~View details in side panel')}
        </Shortcut>
      )}
      <Shortcut data-test-id="open-quick-search" ctrl keyName="Spacebar">
        {t('plugin__topology-plugin~Open quick search modal')}
      </Shortcut>
      {supportedFileTypes?.length > 0 && allImportAccess && (
        <Shortcut data-test-id="upload-file" dragNdrop>
          {t('plugin__topology-plugin~Upload file ({{fileTypes}}) to project', {
            fileTypes: supportedFileTypes.map((ex) => `.${ex}`).toString(),
          })}
        </Shortcut>
      )}
    </ShortcutTable>
  );
};