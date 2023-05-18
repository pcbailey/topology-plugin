import React, { FC, useCallback } from 'react';

import { useUserSettings } from '@openshift-console/dynamic-plugin-sdk-internal';
import { DrawerPanelContent } from '@patternfly/react-core';
import { TopologySideBar as PFTopologySideBar } from '@patternfly/react-topology';

import CloseButton from '../../__tests__/CloseButton/CloseButton';
import { TOPOLOGY_SIDE_BAR_WIDTH_STORAGE_KEY } from '../../const';

import './TopologySideBarTabSection.scss';

type TopologySideBarProps = {
  onClose: () => void;
};

const DEFAULT_SIDE_BAR_SIZE = 500;

const TopologySideBar: FC<TopologySideBarProps> = ({ children, onClose }) => {
  const [sideBarSize, setSideBarSize, sideBarSizeLoaded] = useUserSettings(
    TOPOLOGY_SIDE_BAR_WIDTH_STORAGE_KEY,
    DEFAULT_SIDE_BAR_SIZE,
  );
  const handleResizeCallback = useCallback(
    (width: number) => {
      setSideBarSize(width);
    },
    [setSideBarSize],
  );
  return (
    <DrawerPanelContent
      isResizable
      minSize="400px"
      defaultSize={`${sideBarSizeLoaded ? sideBarSize : DEFAULT_SIDE_BAR_SIZE}px`}
      onResize={handleResizeCallback}
      className="ocs-sidebar-index"
    >
      <PFTopologySideBar resizable className="pf-topology-side-bar-resizable">
        <div className="pf-topology-side-bar__body">
          <div className="co-sidebar-dismiss clearfix">
            <CloseButton
              onClick={onClose}
              dataTestID="sidebar-close-button"
              additionalClassName="co-close-button--float-right co-sidebar-dismiss__close-button"
            />
          </div>
          {children}
        </div>
      </PFTopologySideBar>
    </DrawerPanelContent>
  );
};

export default TopologySideBar;