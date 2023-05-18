import React, { FC, SyntheticEvent, useState } from 'react';

import { Dropdown, DropdownItem, DropdownToggle } from '@patternfly/react-core';
import { CaretDownIcon, FilterIcon } from '@patternfly/react-icons';
import { useTopologyTranslation } from '@topology-utils/hooks/useTopologyTranslation';
import { K8sResourceKind } from '@topology-utils/types/k8s-types';

import AutocompleteInput from '../components/common/AutocompleteInput/AutocompleteInput';
import { TextFilter } from '../components/common/AutocompleteInput/components/TextFilter';

import { NameLabelFilterValues } from './filter-utils';

type NameLabelFilterDropdownProps = {
  isDisabled: boolean;
  data: K8sResourceKind[];
  onChange: (type: string, value: string, endOfString: boolean) => void;
  nameFilterInput: string;
  labelFilterInput: string;
};

const NameLabelFilterDropdown: FC<NameLabelFilterDropdownProps> = (props) => {
  const { data, onChange, nameFilterInput, labelFilterInput, isDisabled } = props;

  const [isOpen, setOpen] = useState(false);
  const [selected, setSelected] = useState(NameLabelFilterValues.Name);

  const { t } = useTopologyTranslation();

  const onToggle = (open: boolean) => setOpen(open);
  const onSelect = (event: SyntheticEvent) => {
    setSelected((event.target as HTMLInputElement).name as NameLabelFilterValues);
    setOpen(!isOpen);
  };
  const dropdownItems = [
    <DropdownItem key="name-action" name={NameLabelFilterValues.Name} component="button">
      {t(NameLabelFilterValues.Name)}
    </DropdownItem>,
    <DropdownItem key="label-action" name={NameLabelFilterValues.Label} component="button">
      {t(NameLabelFilterValues.Label)}
    </DropdownItem>,
  ];

  const handleInputValue = (value: string) => {
    onChange(selected, value, false);
  };

  return (
    <div className="pf-c-input-group">
      <Dropdown
        onSelect={onSelect}
        toggle={
          <DropdownToggle
            isDisabled={isDisabled}
            id="toggle-id"
            onToggle={onToggle}
            toggleIndicator={CaretDownIcon}
          >
            <>
              <FilterIcon className="span--icon__right-margin" /> {t(selected)}
            </>
          </DropdownToggle>
        }
        isOpen={isOpen}
        dropdownItems={dropdownItems}
      />
      {selected === NameLabelFilterValues.Label ? (
        <AutocompleteInput
          onSuggestionSelect={(label) => {
            onChange(NameLabelFilterValues.Label, label, true);
          }}
          showSuggestions
          textValue={labelFilterInput}
          setTextValue={handleInputValue}
          placeholder={t('Find by label...')}
          data={data}
          className="co-text-node"
          labelPath={'metadata.labels'}
        />
      ) : (
        <TextFilter
          onChange={handleInputValue}
          placeholder={t('Find by name...')}
          value={nameFilterInput}
          aria-labelledby="toggle-id"
          isDisabled={isDisabled}
          autoFocus
        />
      )}
    </div>
  );
};

export default NameLabelFilterDropdown;