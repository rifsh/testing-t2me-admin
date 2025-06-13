import React, { useEffect, useState } from "react";
import { AutoComplete, Input, Select } from "antd";
import { useDispatch } from "react-redux";
import Flex from "components/shared-components/Flex";
import { resetSearchValue, resetStatusValue, setGlobalSearchValue, setGlobalStatusValue } from "store/slices/fliterSlice";

const { Option } = Select;
const { Search } = Input;

const SearchBarWithStatus = ({
  fetchFunction,
  additionalFilters = [],
  isStatus = true,
  isPermission = false,
  placeholder = 'Search',
  displayName = '',
  roleId = '',
  method = ''
}) => {
  const dispatch = useDispatch();
  const [searchValue, setSearchValue] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [filterValues, setFilterValues] = useState({});

  useEffect(() => {
    dispatch(resetStatusValue())
  }, []);

  const handleSearch = (value) => {
    if (isPermission && value) {
      dispatch(setGlobalSearchValue(value));
      dispatch(
        fetchFunction({
          search: value || null,
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

    if (value) {
      setSearchValue(value || null);
      dispatch(setGlobalSearchValue(value));
      dispatch(
        fetchFunction({
          search: value || null,
          page: 1,
          size: 10,
          ...(isStatus && { active: statusFilter }),
          ...filterValues,
        })
      );
    }
  };

  const handleSearchIsEmpty = (value) => {
    if (!value) {
      setSearchValue(null);
      dispatch(resetSearchValue())
      dispatch(
        fetchFunction({
          search: null,
          page: 1,
          size: 10,
          ...(isStatus && { active: statusFilter }),
          ...filterValues,
          filter_by_display_name: displayName
        })
      );
    }
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
    dispatch(setGlobalStatusValue(status))
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

    setFilterValues((prev) => ({
      ...prev,
      [formName]: selectedId,
    }));

    dispatch(
      fetchFunction({
        search: searchValue,
        page: 1,
        size: 10,
        ...(isStatus && { active: statusFilter }),
        ...filterValues,
        [formName]: selectedId,
      })
    );
  };

  return (
    <Flex className="mb-1" mobileFlex={false} >
      {/* Search Input */}
      <div className="mr-md-3 mb-3"
        style={{ width: !isStatus && "100%" }}
      >
        <Search
          placeholder={placeholder}
          onChange={(e) => handleSearchIsEmpty(e.target.value)}
          onSearch={handleSearch}
          style={{ width: isStatus ? 200 : "100%" }}
        />
      </div>

      {/* Status Dropdown - Only shown if isStatus is true */}
      {isStatus && (
        <div className="mb-3 mr-md-3">
          <Select
            defaultValue="All"
            onChange={handleStatusChange}
            className="mr-2"
            style={{ minWidth: 180 }}
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
                onChange={(e) => handleFilterItemIsEmpty(e)}
                placeholder={filter.placeholder || "Select"}
                onSelect={(value, option) =>
                  handleAutoCompleteSelect(value, option, filter.formName)
                }
                filterOption={(inputValue, option) =>
                  option?.label
                    ?.toLowerCase()
                    .includes(inputValue.toLowerCase())
                }
              />
            ) : (
              <Select
                placeholder={filter.placeholder || "Select"}
                onClick={filter.onClick}
                onSelect={(value) => handleFilterChange(value, filter.formName)}
                style={{ minWidth: 180 }}
                className="mr-2"
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
    </Flex>
  );
};

export default SearchBarWithStatus;