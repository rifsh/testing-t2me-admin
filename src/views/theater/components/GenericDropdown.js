import { Form, Select, Tooltip } from 'antd';
import { debounce } from 'lodash';
import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { InfoCircleOutlined } from "@ant-design/icons";

const GenericDropdown = ({
  form,
  name = "dropdown",
  label = "Choose option",
  mode = "multiple",
  disabled = false,
  rules = [],
  fetchOptions,
  optionsData = [],
  loading = false,
  optionLabelKey = "label",
  optionValueKey = "value",
  optionExtraLabel,
  searchParamKey = "search",
  isInfoVisible = false,
  maxTagCount = 5,
  hasFeedback = false
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchOptions({}));
  }, [dispatch, fetchOptions]);

  const debouncedSearch = useCallback(
    debounce((value) => {
      dispatch(fetchOptions({ [searchParamKey]: value }));
    }, 300),
    [dispatch, fetchOptions, searchParamKey]
  );

  const handleSearch = (val) => {
    if (val.trim()) {
      debouncedSearch(val);
    } else {
      dispatch(fetchOptions({}));
    }
  };

  const options = optionsData.map((item) => ({
    value: item[optionValueKey],
    label: optionExtraLabel
      ? `${item[optionLabelKey]} (${item[optionExtraLabel]})`
      : item[optionLabelKey],
    displayValue: item[optionLabelKey]
  }));

  return (
    <Form.Item
      name={name}
      label={
        isInfoVisible ? (
          <span>
            {label}&nbsp;
            <Tooltip title={`Please select your ${label}`}>
              <InfoCircleOutlined />
            </Tooltip>
          </span>
        ) : (
          <span>{label}</span>
        )
      }
      rules={rules}
      hasFeedback={hasFeedback}
    >

      <Select
        mode={mode}
        showSearch
        maxTagCount={maxTagCount}
        onSearch={handleSearch}
        placeholder={`Select ${label.toLowerCase()}`}
        disabled={disabled}
        loading={loading}
        options={options}
        optionLabelProp='displayValue'
        filterOption={(input, option) =>
          option?.label?.toLowerCase()?.includes(input.toLowerCase())
        }
        notFoundContent={
          loading ? (
            <span>Loading options...</span>
          ) : (
            <span>No options available.</span>
          )
        }
      />
    </Form.Item>
  );
};

export default GenericDropdown;
