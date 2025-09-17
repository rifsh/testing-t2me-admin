import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { AutoComplete, Input, Select, Button } from "antd";
import { useDispatch } from "react-redux";
import Flex from "components/shared-components/Flex";
import { resetSearchValue, resetStatusValue, setGlobalSearchValue, setGlobalStatusValue } from "store/slices/fliterSlice";

const { Option } = Select;
const { Search } = Input;

const SearchBarWithStatus = forwardRef(({
  fetchFunction,
  additionalFilters = [],
  isStatus = true,
  clearBtnVisibility = true,
  isPermission = false,
  placeholder = 'Search',
  displayName = '',
  roleId = '',
  method = ''
}, ref) => {
  const dispatch = useDispatch();
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [filterValues, setFilterValues] = useState({});

  useImperativeHandle(ref, () => ({
    clearAllFilters,
  }));


  // Initialize filter state
  useEffect(() => {
    dispatch(resetStatusValue());
  }, []);

  // Check if any filters are active
  const hasActiveFilters = () => {
    return searchValue !== '' ||
      statusFilter !== null ||
      Object.values(filterValues).some(value => value !== null && value !== undefined && value !== '');
  };

  // Clear all filters
  const clearAllFilters = () => {
    // Reset local state
    setSearchValue('');
    setStatusFilter(null);
    setFilterValues({});

    // Reset Redux state
    dispatch(resetSearchValue());
    dispatch(resetStatusValue());

    // Fetch data with all filters cleared
    const fetchParams = {
      search: null,
      page: 1,
      size: 10,
    };

    if (isPermission) {
      fetchParams.filter_by_display_name = displayName;
      fetchParams.order_id = roleId;
      fetchParams.filter_by_method = method;
    }

    dispatch(fetchFunction(fetchParams));
  };

  const handleSearch = (value) => {
    const searchTerm = value.trim();

    if (isPermission) {
      dispatch(setGlobalSearchValue(searchTerm));
      dispatch(
        fetchFunction({
          search: searchTerm || null,
          page: 1,
          size: 10,
          ...(isStatus && { active: statusFilter }),
          ...filterValues,
          filter_by_display_name: displayName,
          order_id: roleId,
          filter_by_method: method
        })
      );
      return;
    }

    setSearchValue(searchTerm);
    dispatch(setGlobalSearchValue(searchTerm));
    dispatch(
      fetchFunction({
        search: searchTerm || null,
        page: 1,
        size: 10,
        ...(isStatus && { active: statusFilter }),
        ...filterValues,
      })
    );
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    // If search input is cleared, trigger search with empty value
    if (!value) {
      handleSearchIsEmpty();
    }
  };

  const handleSearchIsEmpty = () => {
    setSearchValue('');
    dispatch(resetSearchValue());

    const fetchParams = {
      search: null,
      page: 1,
      size: 10,
      ...(isStatus && { active: statusFilter }),
      ...filterValues,
    };

    if (isPermission) {
      fetchParams.filter_by_display_name = displayName;
    }

    dispatch(fetchFunction(fetchParams));
  };

  const handleFilterItemIsEmpty = (value) => {
    if (!value) {
      dispatch(
        fetchFunction({
          search: searchValue,
          page: 1,
          size: 10,
          ...(isStatus && { active: statusFilter }),
        })
      );
      setFilterValues({});
    }
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    dispatch(setGlobalStatusValue(status));
    dispatch(
      fetchFunction({
        search: searchValue,
        page: 1,
        size: 10,
        active: status,
        ...filterValues,
      })
    );
  };

  const handleFilterChange = (value, formName) => {
    const newFilterValues = {
      ...filterValues,
      [formName]: value,
    };
    setFilterValues(newFilterValues);

    dispatch(
      fetchFunction({
        search: searchValue,
        page: 1,
        size: 10,
        ...(isStatus && { active: statusFilter }),
        ...newFilterValues,
      })
    );
  };

  const getAutoCompleteOptions = (options = []) => {
    if (!Array.isArray(options)) return [];

    return options
      .map((option) => {
        if (!option || !option.name) return null;

        return {
          label: option.name,
          id: option.id ? option.id.toString() : "",
          value: option.name,
        };
      })
      .filter(Boolean);
  };

  const handleAutoCompleteSelect = (value, option, formName) => {
    const selectedId = option.id;

    const newFilterValues = {
      ...filterValues,
      [formName]: selectedId,
    };

    setFilterValues(newFilterValues);

    dispatch(
      fetchFunction({
        search: searchValue,
        page: 1,
        size: 10,
        ...(isStatus && { active: statusFilter }),
        ...newFilterValues,
      })
    );
  };

  // Reset AutoComplete value when filter is cleared
  const getAutoCompleteValue = (formName) => {
    const filterValue = filterValues[formName];
    if (!filterValue) return '';

    const filterConfig = additionalFilters.find(f => f.formName === formName);
    if (!filterConfig || !filterConfig.options) return '';

    const selectedOption = filterConfig.options.find(opt =>
      opt.id.toString() === filterValue.toString()
    );

    return selectedOption ? selectedOption.name : '';
  };

  return (
    <Flex className="mb-1" mobileFlex={false} alignItems="center">
      {/* Search Input */}
      <div className="mr-md-3 mb-3"
        style={{ width: !isStatus && "100%" }}
      >
        <Search
          placeholder={placeholder}
          onChange={handleSearchChange}
          onSearch={handleSearch}
          style={{ width: isStatus ? 200 : "100%" }}
          value={searchValue}
          allowClear
        />
      </div>

      {/* Status Dropdown - Only shown if isStatus is true */}
      {isStatus && (
        <div className="mb-3 mr-md-3">
          <Select
            value={statusFilter}
            onChange={handleStatusChange}
            className="mr-2"
            style={{ minWidth: 180 }}
            allowClear
            onClear={() => handleStatusChange(null)}
          >
            <Option value={null}>All</Option>
            <Option value={true}>Active</Option>
            <Option value={false}>Inactive</Option>
          </Select>
        </div>
      )}

      {/* Dynamic Additional Filters */}
      {additionalFilters.map((filter, index) => {
        if (!filter || !Array.isArray(filter.options)) return null;

        return (
          <div key={index} className="mb-3 mr-md-3">
            {filter.isAutoComplete ? (
              <AutoComplete
                options={getAutoCompleteOptions(filter.options)}
                style={{ width: 180 }}
                onClick={filter.onClick}
                placeholder={filter.placeholder || "Select"}
                value={getAutoCompleteValue(filter.formName) || filterValues[`${filter.formName}_text`] || ""}
                onChange={(value) => {
                  // Store raw text for showing in input
                  setFilterValues({
                    ...filterValues,
                    [`${filter.formName}_text`]: value,
                  });

                  if (!value) {
                    const newFilterValues = { ...filterValues };
                    delete newFilterValues[filter.formName];
                    delete newFilterValues[`${filter.formName}_text`];
                    setFilterValues(newFilterValues);

                    dispatch(
                      fetchFunction({
                        search: searchValue,
                        page: 1,
                        size: 10,
                        ...(isStatus && { active: statusFilter }),
                        ...newFilterValues,
                      })
                    );
                  }
                }}
                onSelect={(value, option) => {
                  handleAutoCompleteSelect(value, option, filter.formName);

                  // Store both id and text
                  setFilterValues({
                    ...filterValues,
                    [filter.formName]: option.id,
                    [`${filter.formName}_text`]: option.label,
                  });
                }}
                filterOption={(inputValue, option) =>
                  option?.label?.toLowerCase().includes(inputValue.toLowerCase())
                }
                allowClear
              />

            ) : (
              <Select
                placeholder={filter.placeholder || "Select"}
                onClick={filter.onClick}
                onChange={(value) => handleFilterChange(value, filter.formName)}
                style={{ minWidth: 180 }}
                className="mr-2"
                value={filterValues[filter.formName] || null}
                allowClear
                onClear={() => handleFilterChange(null, filter.formName)}
              >
                <Option value={null}>All</Option>
                {filter.options.map((option) => {
                  if (!option) return null;
                  const value = option.id;
                  const label = filter.additionalField ? option[filter.additionalField] : option.name;
                  return value && label ? (
                    <Option key={value} value={value}>
                      {label}
                    </Option>
                  ) : null;
                })}
              </Select>
            )}
          </div>
        );
      })}

      {/* Clear Button - Only shown when filters are active */}
      {hasActiveFilters() && clearBtnVisibility && (
        <div className="mb-3">
          <Button
            type="default"
            onClick={clearAllFilters}
            style={{
              borderColor: '#d9d9d9',
              color: '#595959'
            }}
          >
            Clear All
          </Button>
        </div>
      )}
    </Flex>
  );
});

export default SearchBarWithStatus;