import React from 'react';
import { shallow } from 'enzyme';

import { useUserSettings } from '@openshift-console/dynamic-plugin-sdk-internal';
import { Button } from '@patternfly/react-core';

import TopologySideBar from '../components/side-bar/TopologySideBar';

import CloseButton from './CloseButton/CloseButton';

jest.mock('@console/shared/src/hooks/useUserSettings', () => ({
  useUserSettings: jest.fn(),
}));

const mockUserSettings = useUserSettings as jest.Mock;

describe('TopologySideBar:', () => {
  const props = {
    show: true,
    onClose: () => '',
  };

  it('renders a SideBar', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    mockUserSettings.mockReturnValue([100, () => {}, true]);
    const wrapper = shallow(<TopologySideBar {...props} />);
    expect(wrapper.exists()).toBeTruthy();
  });

  it('clicking on close button should call the onClose callback function', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    mockUserSettings.mockReturnValue([100, () => {}, true]);
    const onClose = jest.fn();
    const wrapper = shallow(<TopologySideBar onClose={onClose} />);
    wrapper.find(CloseButton).shallow().find(Button).simulate('click');
    expect(onClose).toHaveBeenCalled();
  });
});