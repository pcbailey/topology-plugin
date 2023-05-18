import React, { FC, ReactNode, useCallback } from 'react';
import classNames from 'classnames';

import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import {
  DefaultNode,
  LabelBadge,
  Node,
  observer,
  useAnchor,
  useHover,
  useSize,
  WithContextMenuProps,
  WithDndDropProps,
  WithDragNodeProps,
  WithSelectionProps,
} from '@patternfly/react-topology';
import { shouldTruncate, truncateMiddle, TruncateOptions } from '@topology-utils/truncate-utils';
import { OdcNodeModel } from '@topology-utils/types/topology-types';

import { RESOURCE_NAME_TRUNCATE_LENGTH } from '../../../../const';
import { useSearchFilter } from '../../../../filters';
import SvgCircledIcon from '../../../svg/SvgCircledIcon';

import GroupNodeAnchor from './GroupNodeAnchor';
import ResourceKindsInfo from './ResourceKindsInfo';

import './GroupNode.scss';

const TOP_MARGIN = 20;
const LEFT_MARGIN = 20;
const TEXT_MARGIN = 10;

const truncateOptions: TruncateOptions = {
  length: RESOURCE_NAME_TRUNCATE_LENGTH,
};

type GroupNodeProps = {
  element: Node;
  bgClassName: string;
  badge?: string;
  badgeColor?: string;
  badgeClassName?: string;
  emptyValue?: ReactNode;
  groupResources?: OdcNodeModel[];
  children?: ReactNode;
  typeIconClass?: string;
  canDrop?: boolean;
  dropTarget?: boolean;
  dragging?: boolean;
  dragRegroupable?: boolean;
} & Partial<WithSelectionProps & WithDndDropProps & WithContextMenuProps & WithDragNodeProps>;

const GroupNode: FC<GroupNodeProps> = ({
  element,
  bgClassName,
  badge,
  badgeColor,
  badgeClassName,
  children,
  emptyValue,
  typeIconClass,
  ...rest
}) => {
  const [filtered] = useSearchFilter(element.getLabel());
  const [textHover, textHoverRef] = useHover();
  const [iconSize, iconRef] = useSize([badge]);
  const iconWidth = iconSize ? iconSize.width : 0;
  const iconHeight = iconSize ? iconSize.height : 0;
  const title = element.getLabel();
  const { groupResources } = element.getData();
  const [groupSize, groupRef] = useSize([groupResources]);
  const width = groupSize ? groupSize.width : 0;
  const height = groupSize ? groupSize.height : 0;
  useAnchor(
    useCallback((node: Node) => new GroupNodeAnchor(node, width, height, 1.5), [width, height]),
  );

  const getCustomShape = () => () =>
    (
      <rect
        className={classNames('odc-group-node__bg', bgClassName)}
        x={0}
        y={0}
        width={width}
        height={height}
        rx="5"
        ry="5"
      />
    );

  return (
    <DefaultNode
      element={element}
      className={classNames('odc-group-node', { 'is-filtered': filtered })}
      badge={badge}
      badgeColor={badgeColor}
      badgeClassName={badgeClassName}
      showLabel={false}
      getCustomShape={getCustomShape}
      {...rest}
    >
      <g ref={groupRef}>
        {typeIconClass && (
          <SvgCircledIcon
            className="odc-group-node__type-icon"
            x={10}
            y={-10}
            width={20}
            height={20}
            iconClass={typeIconClass}
          />
        )}
        <g ref={groupRef}>
          <LabelBadge
            ref={iconRef}
            x={LEFT_MARGIN}
            y={TOP_MARGIN - 2}
            badge={badge}
            badgeClassName={badgeClassName}
            badgeColor={badgeColor}
          />
          {title && (
            <Tooltip
              content={title}
              position={TooltipPosition.top}
              trigger="manual"
              isVisible={textHover && shouldTruncate(title)}
            >
              <text
                ref={textHoverRef}
                className="odc-group-node__title"
                x={LEFT_MARGIN + iconWidth + TEXT_MARGIN}
                y={TOP_MARGIN + iconHeight}
                textAnchor="start"
                dy="-0.25em"
              >
                {truncateMiddle(title, truncateOptions)}
              </text>
            </Tooltip>
          )}
          {(children || groupResources || emptyValue) && (
            <g transform={`translate(${LEFT_MARGIN}, ${TOP_MARGIN + iconHeight})`}>
              {(groupResources || emptyValue) && (
                <ResourceKindsInfo groupResources={groupResources} emptyValue={emptyValue} />
              )}
              {children}
            </g>
          )}
        </g>
      </g>
    </DefaultNode>
  );
};

export default observer(GroupNode);