import React, { FC, Fragment, ReactElement, ReactNode, useMemo } from 'react';
import { observer } from 'mobx-react-lite';

import {
  DetailsTab,
  DetailsTabSection,
  ResolvedExtension,
} from '@openshift-console/dynamic-plugin-sdk';
import { GraphElement, isEdge } from '@patternfly/react-topology';
import { getResource } from '@topology-utils';
import { useTopologyTranslation } from '@topology-utils/hooks/useTopologyTranslation';
import { Tab } from '@topology-utils/types/commonTypes';

import { orderExtensionBasedOnInsertBeforeAndAfter } from '../../ActionMenu/components/ActionMenuContent/utils/utils';
import DefaultResourceSideBar from '../DefaultResourceSideBar';
import TopologyEdgeResourcesPanel from '../TopologyEdgeResourcesPanel';

type ResolvedTabSection = Omit<DetailsTabSection['properties'], 'tab' | 'provider' | 'section'> & {
  contentElement: ReactNode;
};

type ResolvedTabSections = {
  [tabId: string]: ResolvedTabSection[];
};

type TabBarTabHookResolverProps = {
  element: GraphElement;
  children: (tabs: Tab[], loaded: boolean) => ReactElement;
  tabSectionExtensions: ResolvedExtension<DetailsTabSection>['properties'][];
  tabExtensions: DetailsTab['properties'][];
};

const blamedDeprecatedPlugins: Record<string, boolean> = {};
const renderNullNoop = () => null;

const TabBarTabHookResolver: FC<TabBarTabHookResolverProps> = ({
  element: graphElement,
  children,
  tabSectionExtensions,
  tabExtensions,
}) => {
  const { t } = useTopologyTranslation();

  // resolving hooks in loop since number of extensions will remain the same
  // TODO: Render each hook in its own child component...
  const resolvedTabSections = tabSectionExtensions.reduce<ResolvedTabSections>(
    (acc, { provider, section, tab: tabId, ...rest }) => {
      let contentElement: ReactNode;

      if (provider) {
        const hookResult = provider(graphElement);
        if (!hookResult) {
          return acc;
        }
        [contentElement] = hookResult;
      } else if (section) {
        if (!blamedDeprecatedPlugins[rest.id]) {
          blamedDeprecatedPlugins[rest.id] = true;
          // eslint-disable-next-line no-console
          console.warn(
            `TabSectionExtension "${rest.id}" should be updated from section to provider (hook)`,
          );
        }
        // Fallback to deprecated section
        contentElement = section(graphElement, renderNullNoop);
      }

      if (!contentElement) {
        return acc;
      }
      return {
        ...acc,
        ...(acc[tabId]
          ? { [tabId]: [...acc[tabId], { ...rest, contentElement }] }
          : { [tabId]: [{ ...rest, contentElement }] }),
      };
    },
    {},
  );

  const [tabs, tabsLoaded] = useMemo(() => {
    if (Object.keys(resolvedTabSections).length === 0) return [[], true];

    const resolvedTabs: Tab[] = tabExtensions.reduce((acc, { id: tabId, label }) => {
      if (!resolvedTabSections[tabId]) {
        return acc;
      }

      const orderedResolvedExtensions = orderExtensionBasedOnInsertBeforeAndAfter<{
        id: string;
        contentElement: ReactNode;
      }>(resolvedTabSections[tabId]);

      const tabContent = orderedResolvedExtensions.map(({ id: tabSectionId, contentElement }) => (
        <Fragment key={tabSectionId}>{contentElement}</Fragment>
      ));
      return [...acc, { name: label, component: tabContent }];
    }, []);

    return [resolvedTabs, true];
  }, [tabExtensions, resolvedTabSections]);

  // show default side bar
  if (tabsLoaded && tabs.length === 0) {
    const resource = getResource(graphElement);
    resource &&
      tabs.push({
        name: t('Details'),
        component: () => <DefaultResourceSideBar resource={resource} />,
      });
    isEdge(graphElement) &&
      tabs.push({
        name: t('Resources'),
        component: () => <TopologyEdgeResourcesPanel edge={graphElement} />,
      });
  }

  return children(tabs, tabsLoaded);
};

// TODO: Replace observer for full all childs to individual observer per section content element
export default observer(TabBarTabHookResolver);