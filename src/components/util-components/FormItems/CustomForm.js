import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Switch,
  Radio,
  Checkbox,
  Rate,
  Slider,
  Upload,
  Button,
  Card,
  Row,
  Col,
  Tooltip,
  Typography,
  message,
  Modal,
  Table,
  Space,
  Tabs,
  Spin,
  Progress,
} from "antd";
import {
  InfoCircleOutlined,
  UploadOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { ADD, EDIT, SUCCESS_CODE } from "constants/AppConstants";
import { useDispatch } from "react-redux";

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

// Enhanced form state management hook
const useAdvancedFormState = (initialData = {}, config = {}) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  const updateFormData = useCallback(
    (changedFields) => {
      const newData = { ...formData };
      const newTouched = { ...touched };

      changedFields.forEach(({ name, value }) => {
        if (Array.isArray(name)) {
          let current = newData;
          for (let i = 0; i < name.length - 1; i++) {
            if (!current[name[i]]) current[name[i]] = {};
            current = current[name[i]];
          }
          current[name[name.length - 1]] = value;
          newTouched[name.join(".")] = true;
        } else {
          newData[name] = value;
          newTouched[name] = true;
        }
      });

      setFormData(newData);
      setTouched(newTouched);
      setIsDirty(true);
      config.onDataChange?.(newData, changedFields);
    },
    [formData, touched, config]
  );

  const resetForm = useCallback(() => {
    form.resetFields();
    setFormData(initialData);
    setErrors({});
    setTouched({});
    setIsDirty(false);
  }, [form, initialData]);

  const validateField = useCallback(
    async (fieldName) => {
      try {
        await form.validateFields([fieldName]);
        setErrors((prev) => ({ ...prev, [fieldName]: null }));
        return true;
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: error.errorFields?.[0]?.errors,
        }));
        return false;
      }
    },
    [form]
  );

  const submitForm = useCallback(
    async (customValidator) => {
      try {
        setLoading(true);
        const values = await form.validateFields();

        if (customValidator) {
          const validationResult = await customValidator(values, formData);
          if (!validationResult.isValid) {
            message.error(validationResult.message || "Validation failed");
            return { success: false, data: null, error: validationResult };
          }
        }

        return { success: true, data: values, formData };
      } catch (error) {
        console.error("Form validation failed:", error);
        return { success: false, error };
      } finally {
        setLoading(false);
      }
    },
    [form, formData]
  );

  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      form.setFieldsValue(initialData);
      setFormData(initialData);
    }
  }, [form, initialData]);

  return {
    form,
    formData,
    loading,
    errors,
    touched,
    isDirty,
    setLoading,
    updateFormData,
    resetForm,
    validateField,
    submitForm,
  };
};

// Modal management hook
const useModalState = () => {
  const [modals, setModals] = useState({
    warning: { visible: false, data: null, loading: false },
    response: { visible: false, data: null, loading: false },
    validation: { visible: false, data: null },
  });

  const showModal = useCallback((type, data = null) => {
    setModals((prev) => ({
      ...prev,
      [type]: { ...prev[type], visible: true, data },
    }));
  }, []);

  const hideModal = useCallback((type) => {
    setModals((prev) => ({
      ...prev,
      [type]: { ...prev[type], visible: false, data: null, loading: false },
    }));
  }, []);

  const setModalLoading = useCallback((type, loading) => {
    setModals((prev) => ({
      ...prev,
      [type]: { ...prev[type], loading },
    }));
  }, []);

  const hideAllModals = useCallback(() => {
    setModals({
      warning: { visible: false, data: null, loading: false },
      response: { visible: false, data: null, loading: false },
      validation: { visible: false, data: null },
    });
  }, []);

  return {
    modals,
    showModal,
    hideModal,
    setModalLoading,
    hideAllModals,
  };
};

// Advanced Field Renderer Component
const AdvancedFieldRenderer = ({
  field,
  form,
  formData,
  mode,
  customComponents = {},
  onFieldChange,
  loading = false,
}) => {
  const {
    type = "input",
    name,
    label,
    required = false,
    disabled = false,
    hidden = false,
    rules = [],
    props = {},
    options = [],
    tooltip,
    placeholder,
    dependencies = [],
    condition = null,
    transform = null,
    validate = null,
    asyncOptions = null,
    section,
    actionCreate,
    colProps = { xs: 24, sm: 24, md: 12 },
    ...fieldConfig
  } = field;

  // State for async options
  const [asyncLoading, setAsyncLoading] = useState(false);
  const [dynamicOptions, setDynamicOptions] = useState(options);

  // Load async options
  useEffect(() => {
    if (asyncOptions && typeof asyncOptions === "function") {
      setAsyncLoading(true);
      asyncOptions(formData, mode)
        .then(setDynamicOptions)
        .catch(console.error)
        .finally(() => setAsyncLoading(false));
    }
  }, [asyncOptions, formData, mode]);

  // Conditional rendering
  const shouldRender = useMemo(() => {
    if (hidden) return false;
    if (!condition) return true;
    return condition(formData, mode);
  }, [hidden, condition, formData, mode]);

  // Conditional disabling
  const isDisabled = useMemo(() => {
    if (loading || disabled) return true;
    if (fieldConfig.disableCondition) {
      return fieldConfig.disableCondition(formData, mode);
    }
    return false;
  }, [loading, disabled, fieldConfig.disableCondition, formData, mode]);

  // Dynamic rules generation
  const dynamicRules = useMemo(() => {
    let allRules = [...rules];

    if (required) {
      allRules.unshift({
        required: true,
        message: fieldConfig.requiredMessage || `Please enter ${label || name}`,
      });
    }

    if (fieldConfig.dynamicRules) {
      const additionalRules = fieldConfig.dynamicRules(formData, mode);
      allRules.push(...additionalRules);
    }

    if (validate) {
      allRules.push({
        validator: (_, value) => validate(value, formData, form),
      });
    }

    return allRules;
  }, [
    rules,
    required,
    fieldConfig,
    label,
    name,
    validate,
    formData,
    form,
    mode,
  ]);

  // Transform value on change
  const handleChange = useCallback(
    (value, event) => {
      let transformedValue = transform ? transform(value, formData) : value;

      onFieldChange?.({
        field: name,
        value: transformedValue,
        originalValue: value,
        event,
        formData,
      });

      fieldConfig.onChange?.(transformedValue, event, form, formData);
    },
    [name, transform, formData, onFieldChange, fieldConfig.onChange, form]
  );
  const dispatch = useDispatch();
  // Debounced search for select fields
  const handleSearch = useCallback(
    (searchValue) => {
      dispatch();
      if (fieldConfig.onSearch) {
        fieldConfig.onSearch(searchValue, formData);
      }
    },
    [fieldConfig.onSearch, formData]
  );

  // Render field label with tooltip
  const renderLabel = () => {
    if (!label) return null;

    if (tooltip) {
      return (
        <span>
          {label}
          {required && <span style={{ color: "#ff4d4f" }}> *</span>}
          <Tooltip title={tooltip}>
            <InfoCircleOutlined style={{ marginLeft: 8 }} />
          </Tooltip>
        </span>
      );
    }

    return (
      <span>
        {label}
        {required && <span style={{ color: "#ff4d4f" }}> *</span>}
      </span>
    );
  };

  // Render different field types
  const renderField = () => {
    const commonProps = {
      placeholder,
      disabled: isDisabled,
      ...props,
    };

    switch (type) {
      case "input":
        return (
          <Input
            {...commonProps}
            maxLength={fieldConfig.maxLength}
            showCount={fieldConfig.showCount}
            addonBefore={fieldConfig.addonBefore}
            addonAfter={fieldConfig.addonAfter}
            prefix={fieldConfig.prefix}
            suffix={fieldConfig.suffix}
            onChange={(e) => handleChange(e.target.value, e)}
          />
        );

      case "password":
        return (
          <Input.Password
            {...commonProps}
            maxLength={fieldConfig.maxLength}
            showCount={fieldConfig.showCount}
            iconRender={(visible) =>
              visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
            }
            onChange={(e) => handleChange(e.target.value, e)}
          />
        );

      case "textarea":
        return (
          <TextArea
            {...commonProps}
            rows={fieldConfig.rows || 4}
            maxLength={fieldConfig.maxLength}
            showCount={fieldConfig.showCount}
            autoSize={fieldConfig.autoSize}
            onChange={(e) => handleChange(e.target.value, e)}
          />
        );

      case "select":
        return (
          <Select
            {...commonProps}
            mode={fieldConfig.mode}
            allowClear={fieldConfig.allowClear !== false}
            showSearch={fieldConfig.showSearch}
            loading={asyncLoading || fieldConfig.loading}
            onChange={(value, option) => handleChange(value, { value, option })}
            onSearch={fieldConfig.showSearch ? handleSearch : undefined}
            filterOption={fieldConfig.filterOption}
            notFoundContent={
              asyncLoading ? <Spin size="small" /> : fieldConfig.notFoundContent
            }
            dropdownRender={fieldConfig.dropdownRender}
            maxTagCount={fieldConfig.maxTagCount}
            tokenSeparators={fieldConfig.tokenSeparators}
          >
            {(dynamicOptions || []).map((option, index) => (
              <Option
                key={option.value || index}
                value={option.value}
                disabled={option.disabled}
                title={option.tooltip}
              >
                {option.label}
              </Option>
            ))}
          </Select>
        );

      case "number":
        return (
          <InputNumber
            {...commonProps}
            min={fieldConfig.min}
            max={fieldConfig.max}
            step={fieldConfig.step}
            precision={fieldConfig.precision}
            formatter={fieldConfig.formatter}
            parser={fieldConfig.parser}
            style={{ width: "100%" }}
            onChange={handleChange}
            addonBefore={fieldConfig.addonBefore}
            addonAfter={fieldConfig.addonAfter}
          />
        );

      case "date":
        return (
          <DatePicker
            {...commonProps}
            format={fieldConfig.format}
            picker={fieldConfig.picker}
            showTime={fieldConfig.showTime}
            disabledDate={fieldConfig.disabledDate}
            style={{ width: "100%" }}
            onChange={(date, dateString) =>
              handleChange(date, { date, dateString })
            }
          />
        );

      case "dateRange":
        return (
          <RangePicker
            {...commonProps}
            format={fieldConfig.format}
            picker={fieldConfig.picker}
            showTime={fieldConfig.showTime}
            disabledDate={fieldConfig.disabledDate}
            style={{ width: "100%" }}
            onChange={(dates, dateStrings) =>
              handleChange(dates, { dates, dateStrings })
            }
          />
        );

      case "switch":
        return (
          <Switch
            {...commonProps}
            checkedChildren={fieldConfig.checkedChildren}
            unCheckedChildren={fieldConfig.unCheckedChildren}
            size={fieldConfig.size}
            onChange={handleChange}
          />
        );

      case "radio":
        return (
          <Radio.Group
            {...commonProps}
            buttonStyle={fieldConfig.buttonStyle}
            size={fieldConfig.size}
            onChange={(e) => handleChange(e.target.value, e)}
          >
            {(dynamicOptions || []).map((option, index) => {
              const RadioComponent = fieldConfig.buttonStyle
                ? Radio.Button
                : Radio;
              return (
                <RadioComponent
                  key={option.value || index}
                  value={option.value}
                >
                  {option.label}
                </RadioComponent>
              );
            })}
          </Radio.Group>
        );

      case "checkbox":
        if (fieldConfig.mode === "group") {
          return (
            <Checkbox.Group
              {...commonProps}
              options={dynamicOptions}
              onChange={handleChange}
            />
          );
        }
        return (
          <Checkbox
            {...commonProps}
            onChange={(e) => handleChange(e.target.checked, e)}
          >
            {fieldConfig.checkboxLabel || label}
          </Checkbox>
        );

      case "rate":
        return (
          <Rate
            {...commonProps}
            count={fieldConfig.count || 5}
            allowHalf={fieldConfig.allowHalf}
            allowClear={fieldConfig.allowClear}
            character={fieldConfig.character}
            onChange={handleChange}
          />
        );

      case "slider":
        return (
          <Slider
            {...commonProps}
            min={fieldConfig.min}
            max={fieldConfig.max}
            step={fieldConfig.step}
            marks={fieldConfig.marks}
            range={fieldConfig.range}
            vertical={fieldConfig.vertical}
            tooltipVisible={fieldConfig.tooltipVisible}
            tipFormatter={fieldConfig.tipFormatter}
            onChange={handleChange}
          />
        );

      case "upload":
        return (
          <div>
            <Upload
              {...commonProps}
              name={fieldConfig.name || name}
              listType={fieldConfig.listType || "text"}
              maxCount={fieldConfig.maxCount}
              accept={fieldConfig.accept}
              beforeUpload={fieldConfig.beforeUpload}
              customRequest={fieldConfig.customRequest}
              onChange={({ fileList }) => handleChange(fileList)}
              onPreview={fieldConfig.onPreview}
              onRemove={fieldConfig.onRemove}
              multiple={fieldConfig.multiple}
              directory={fieldConfig.directory}
              showUploadList={fieldConfig.showUploadList !== false}
            >
              {fieldConfig.uploadButton || (
                <Button
                  icon={<UploadOutlined />}
                  disabled={isDisabled}
                  loading={fieldConfig.uploading}
                >
                  {fieldConfig.uploadText || "Click to upload"}
                </Button>
              )}
            </Upload>
            {fieldConfig.uploadHint && (
              <Text
                type="secondary"
                style={{ fontSize: "11px", display: "block", marginTop: 4 }}
              >
                {fieldConfig.uploadHint}
              </Text>
            )}
          </div>
        );

      case "custom":
        const CustomComponent = customComponents[fieldConfig.componentName];
        if (CustomComponent) {
          return (
            <CustomComponent
              {...fieldConfig.componentProps}
              value={form.getFieldValue(name)}
              onChange={handleChange}
              disabled={isDisabled}
              formData={formData}
              mode={mode}
              field={field}
              form={form}
            />
          );
        }
        return (
          <div
            style={{
              padding: 16,
              border: "1px dashed #d9d9d9",
              borderRadius: 6,
            }}
          >
            <Text type="secondary">
              Custom component '{fieldConfig.componentName}' not found
            </Text>
          </div>
        );

      default:
        return (
          <Input
            {...commonProps}
            onChange={(e) => handleChange(e.target.value, e)}
          />
        );
    }
  };

  if (!shouldRender) return null;

  return (
    <Form.Item
      name={name}
      label={renderLabel()}
      rules={dynamicRules}
      dependencies={dependencies}
      className={fieldConfig.className}
      style={fieldConfig.style}
      valuePropName={fieldConfig.valuePropName}
      getValueFromEvent={fieldConfig.getValueFromEvent}
      normalize={fieldConfig.normalize}
      validateTrigger={fieldConfig.validateTrigger || ["onChange", "onBlur"]}
      hasFeedback={fieldConfig.hasFeedback !== false}
      tooltip={fieldConfig.formItemTooltip}
      extra={fieldConfig.extra}
    >
      {renderField()}
    </Form.Item>
  );
};

// Enhanced Response Modal Component with Timer and API Response
const EnhancedResponseModal = ({
  visible,
  onConfirm,
  onCancel,
  data = null,
  loading = false,
  warningMessage = "",
  title = "Confirm Submission",
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  const [countdown, setCountdown] = useState(null);

  // Extract data from modal data
  const apiResponseData = data?.apiResponseData || data;
  const timer = data?.timer || null;
  const apiResponse = data?.apiResponse || null;
  const displayMessage = data?.warningMessage || warningMessage;

  // Countdown effect
  useEffect(() => {
    if (visible && timer && timer > 0) {
      setCountdown(timer);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onCancel(); // Auto cancel when timer expires
            message.warning("Confirmation time expired. Please try again.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setCountdown(null);
    }
  }, [visible, timer, onCancel]);

  const formatData = (obj) => {
    if (!obj) return [];

    return Object.entries(obj).map(([key, value], index) => ({
      key: index,
      field: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      value: (() => {
        if (value === null || value === undefined) return "N/A";
        if (Array.isArray(value))
          return value.length ? value.join(", ") : "Empty";
        if (typeof value === "object") return JSON.stringify(value, null, 2);
        if (typeof value === "boolean") return value ? "Yes" : "No";
        return value.toString();
      })(),
    }));
  };

  const columns = [
    {
      title: "Field",
      dataIndex: "field",
      key: "field",
      width: 150,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      render: (text) => (
        <Text ellipsis={{ tooltip: text }} style={{ whiteSpace: "pre-wrap" }}>
          {text}
        </Text>
      ),
    },
  ];

  const renderConfirmButton = () => {
    if (countdown !== null && countdown > 0) {
      return (
        <Button
          key="confirm"
          type="primary"
          loading={loading}
          onClick={onConfirm}
          icon={<ClockCircleOutlined />}
          disabled={countdown === 0}
        >
          {confirmText} ({countdown}s)
        </Button>
      );
    }

    return (
      <Button
        key="confirm"
        type="primary"
        loading={loading}
        onClick={onConfirm}
        disabled={countdown === 0}
      >
        {confirmText}
      </Button>
    );
  };

  return (
    <Modal
      open={visible}
      title={
        <Space>
          {timer ? (
            <ExclamationCircleOutlined style={{ color: "#faad14" }} />
          ) : (
            <CheckCircleOutlined style={{ color: "#52c41a" }} />
          )}
          {title}
          {countdown !== null && countdown > 0 && (
            <Text type="secondary">({countdown}s remaining)</Text>
          )}
        </Space>
      }
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={loading}>
          {cancelText}
        </Button>,
        renderConfirmButton(),
      ]}
      width={800}
      destroyOnClose
      maskClosable={false}
      closable={!loading}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        {/* Warning/Confirmation Message */}
        {displayMessage && (
          <div
            style={{
              background: timer ? "#fff7e6" : "#f6ffed",
              border: timer ? "1px solid #ffd666" : "1px solid #b7eb8f",
              borderRadius: 6,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Space>
              {timer ? (
                <ExclamationCircleOutlined style={{ color: "#faad14" }} />
              ) : (
                <InfoCircleOutlined style={{ color: "#1890ff" }} />
              )}
              <Text
                strong
                style={{
                  color: timer ? "#d48806" : "#389e0d",
                }}
              >
                {displayMessage}
              </Text>
            </Space>
          </div>
        )}

        {/* Main Data Table */}
        {apiResponseData && Object.keys(apiResponseData).length > 0 && (
          <div>
            <Title level={5}>
              {timer
                ? "Review details to be created:"
                : "Review your submission:"}
            </Title>
            <Table
              columns={columns}
              dataSource={formatData(apiResponseData)}
              size="small"
              pagination={false}
              scroll={{ y: 400 }}
              bordered
            />
          </div>
        )}

        {/* Instructions */}
        <div
          style={{
            background: "#f0f5ff",
            border: "1px solid #adc6ff",
            borderRadius: 6,
            padding: 12,
          }}
        >
          <Space>
            <InfoCircleOutlined style={{ color: "#1890ff" }} />
            <Text type="secondary">
              {countdown !== null
                ? `Please confirm within ${countdown} seconds to proceed.`
                : "Please review the details above and click Confirm to continue."}
            </Text>
          </Space>
        </div>
      </Space>
    </Modal>
  );
};

// Main Advanced Form Component
export const AdvancedConfigurableForm = ({
  // Core Configuration
  config = {},
  fields = [],
  initialData = {},
  mode = ADD,

  // Event Handlers
  onSubmit,
  onCancel,
  onFieldChange,

  // Custom Components & Validation
  customComponents = {},
  customValidation = null,

  // API Configuration
  apiConfig = {},

  // Styling & Layout
  className = "",
  style = {},
  loading: externalLoading = false,
}) => {
  // Default configuration with comprehensive options
  const defaultConfig = {
    layout: "vertical",
    title: mode === ADD ? "Add New Item" : "Edit Item",
    subtitle: null,
    showHeader: true,
    showTabs: false,
    submitText: mode === ADD ? "Add" : "Save",
    cancelText: "Cancel",
    cardTitle: "Details",
    gutter: 16,
    responsive: true,
    showWarningModal: true,
    showResponseModal: true,
    validateOnChange: true,
    showProgress: false,
    autoSave: false,
    confirmOnCancel: false,
    size: "default",
    labelCol: null,
    wrapperCol: null,
    ...config,
  };

  // Hooks
  const formState = useAdvancedFormState(initialData, {
    onDataChange: onFieldChange,
  });
  const modalState = useModalState();

  // Loading state
  const isLoading = externalLoading || formState.loading;

  // Group fields by sections
  const groupedFields = useMemo(() => {
    const groups = {};

    fields.forEach((field) => {
      const section = field.section || "default";
      if (!groups[section]) groups[section] = [];
      groups[section].push(field);
    });

    return groups;
  }, [fields]);

  // Create tabs if configured
  const tabItems = useMemo(() => {
    if (!defaultConfig.showTabs) return null;

    return Object.entries(groupedFields).map(([sectionKey, sectionFields]) => {
      const sectionConfig = sectionFields[0]?.sectionConfig || {};

      return {
        key: sectionKey,
        label:
          sectionConfig.title ||
          sectionKey
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase()),
        children: (
          <Card
            title={sectionConfig.cardTitle}
            className={sectionConfig.cardClassName}
            extra={sectionConfig.cardExtra}
          >
            <Row gutter={sectionConfig.gutter || defaultConfig.gutter}>
              {sectionFields.map((field, index) => (
                <Col
                  key={field.name || index}
                  {...(field.colProps || { xs: 24, md: 12 })}
                >
                  <AdvancedFieldRenderer
                    field={field}
                    form={formState.form}
                    formData={formState.formData}
                    mode={mode}
                    customComponents={customComponents}
                    loading={isLoading}
                    onFieldChange={(changeData) => {
                      formState.updateFormData([
                        { name: changeData.field, value: changeData.value },
                      ]);
                    }}
                  />
                </Col>
              ))}
            </Row>
          </Card>
        ),
      };
    });
  }, [
    groupedFields,
    defaultConfig,
    formState,
    mode,
    customComponents,
    isLoading,
  ]);

  // Updated form handler methods in AdvancedConfigurableForm component

  // Handle form submission with enhanced flow
  // Updated form handler methods in AdvancedConfigurableForm component

  // Handle form submission with enhanced flow
  const handleSubmit = useCallback(async () => {
    const result = await formState.submitForm(customValidation);

    if (!result.success) return;

    try {
      // Pre-submit validation
      if (apiConfig.preSubmitValidation) {
        const preValidationResult = await apiConfig.preSubmitValidation(
          formState.formData,
          mode
        );
        if (!preValidationResult.isValid) {
          message.error(preValidationResult.message);
          return;
        }
      }

      // Warning/Validation modal flow (this calls your submit API)
      if (apiConfig.validateBeforeSubmit && defaultConfig.showWarningModal) {
        try {
          const validationResult = await apiConfig.validateBeforeSubmit(
            formState.formData,
            mode
          );

          if (validationResult.showWarning) {
            // Show the response modal with API data and timer
            modalState.showModal("response", validationResult);
            return;
          }
        } catch (error) {
          console.error("Validation before submit failed:", error);
          message.error(
            "Validation failed: " + (error.message || "Unknown error")
          );
          return;
        }
      }

      // Direct submission if no warning modal needed
      if (!defaultConfig.showResponseModal) {
        await finalSubmit(formState.formData);
      } else {
        // Regular response modal (without API validation)
        modalState.showModal("response", {
          apiResponseData: result.data,
          originalFormData: formState.formData,
          additionalInfo: apiConfig.responseModalInfo?.(
            formState.formData,
            mode
          ),
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      message.error("Submission failed: " + (error.message || "Unknown error"));

      if (apiConfig.onError) {
        apiConfig.onError(error, mode);
      }
    }
  }, [formState, customValidation, apiConfig, defaultConfig, modalState, mode]);

  // Final submission handler
  const finalSubmit = useCallback(
    async (formData) => {
      try {
        formState.setLoading(true);

        let apiResponse;
        if (onSubmit) {
          apiResponse = await onSubmit(formData, mode);
        } else if (apiConfig.submitFunction) {
          apiResponse = await apiConfig.submitFunction(formData, mode);
        }
        modalState.hideAllModals();
        if (apiResponse.status.status_code === SUCCESS_CODE) {
          if (apiConfig.onSuccess) {
            apiConfig.onSuccess(apiResponse || formData, mode);
          } else {
            message.success(
              `Item ${mode === ADD ? "added" : "updated"} successfully`
            );
          }
        } else {
          if (apiConfig.onError) {
            apiConfig.onError(apiResponse.status.message, mode, null);
          }
        }

        // Reset form if configured
        if (apiConfig.resetOnSuccess && mode === ADD) {
          formState.resetForm();
        }
      } catch (error) {
        console.error("Final submission error:", error);
        message.error(
          "Submission failed: " + (error.message || "Unknown error")
        );

        if (apiConfig.onError) {
          apiConfig.onError(error, mode, null);
        }
      } finally {
        formState.setLoading(false);
      }
    },
    [formState, onSubmit, apiConfig, mode, modalState]
  );

  // Enhanced response confirmation
  const handleResponseConfirm = useCallback(async () => {
    const responseData = modalState.modals.response.data;
    modalState.setModalLoading("response", true);

    try {
      // Use the original form data that was validated
      const formDataToSubmit =
        responseData.originalFormData || formState.formData;

      modalState.hideModal("response");
      await finalSubmit(formDataToSubmit);
    } catch (error) {
      console.error("Response confirmation error:", error);
      message.error("Confirmation failed: " + error.message);
    } finally {
      modalState.setModalLoading("response", false);
    }
  }, [modalState, finalSubmit, formState.formData]);
  // Enhanced cancel handler
  const handleCancel = useCallback(() => {
    if (defaultConfig.confirmOnCancel && formState.isDirty) {
      Modal.confirm({
        title: "Confirm Cancel",
        content: "You have unsaved changes. Are you sure you want to cancel?",
        icon: <ExclamationCircleOutlined />,
        okText: "Yes, Cancel",
        cancelText: "Continue Editing",
        okType: "danger",
        onOk: () => {
          if (onCancel) {
            onCancel(formState.form, formState.formData);
          } else {
            formState.resetForm();
          }
        },
      });
    } else {
      if (onCancel) {
        onCancel(formState.form, formState.formData);
      } else {
        formState.resetForm();
      }
    }
  }, [defaultConfig.confirmOnCancel, formState, onCancel]);

  // Render header with enhanced features
  const renderHeader = () => {
    if (!defaultConfig.showHeader) return null;

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
          padding: "16px 0",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0, marginBottom: 4 }}>
            {defaultConfig.title}
          </Title>
          {defaultConfig.subtitle && (
            <Text type="secondary">{defaultConfig.subtitle}</Text>
          )}
        </div>
        <Space size="middle">
          <Button onClick={handleCancel} disabled={isLoading}>
            {defaultConfig.cancelText}
          </Button>
          <Button
            type="primary"
            loading={isLoading}
            onClick={handleSubmit}
            disabled={!formState.isDirty && mode === EDIT}
          >
            {defaultConfig.submitText}
          </Button>
        </Space>
      </div>
    );
  };

  // Render form content with sections or tabs
  const renderFormContent = () => {
    if (defaultConfig.showTabs && tabItems) {
      return (
        <Tabs
          items={tabItems}
          size={defaultConfig.size}
          type={defaultConfig.tabType || "line"}
          tabPosition={defaultConfig.tabPosition || "top"}
          destroyInactiveTabPane={defaultConfig.destroyInactiveTabPane}
        />
      );
    }

    return Object.entries(groupedFields).map(([sectionKey, sectionFields]) => {
      const sectionConfig = sectionFields[0]?.sectionConfig || {};

      return (
        <Card
          key={sectionKey}
          title={
            sectionConfig.title ||
            (sectionKey !== "default"
              ? sectionKey
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())
              : defaultConfig.cardTitle)
          }
          style={{ marginBottom: 16, ...sectionConfig.style }}
          className={sectionConfig.className}
          extra={sectionConfig.extra}
          size={defaultConfig.size}
          loading={sectionConfig.loading}
        >
          <Row gutter={sectionConfig.gutter || defaultConfig.gutter}>
            {sectionFields.map((field, index) => (
              <Col
                key={field.name || index}
                {...(defaultConfig.responsive
                  ? {
                      xs: 24,
                      sm: 24,
                      md: 12,
                      ...field.colProps,
                    }
                  : field.colProps || { span: 24 })}
              >
                <AdvancedFieldRenderer
                  field={field}
                  form={formState.form}
                  formData={formState.formData}
                  mode={mode}
                  customComponents={customComponents}
                  loading={isLoading}
                  onFieldChange={(changeData) => {
                    formState.updateFormData([
                      { name: changeData.field, value: changeData.value },
                    ]);
                  }}
                />
              </Col>
            ))}
          </Row>
        </Card>
      );
    });
  };

  return (
    <div className={className} style={style}>
      <Spin
        spinning={
          isLoading &&
          !modalState.modals.warning.visible &&
          !modalState.modals.response.visible
        }
        tip="Processing..."
      >
        <Form
          form={formState.form}
          layout={defaultConfig.layout}
          size={defaultConfig.size}
          labelCol={defaultConfig.labelCol}
          wrapperCol={defaultConfig.wrapperCol}
          onFieldsChange={(changedFields) => {
            formState.updateFormData(changedFields);
          }}
          onFinish={handleSubmit}
          validateTrigger={
            defaultConfig.validateOnChange
              ? ["onChange", "onBlur"]
              : ["onSubmit"]
          }
          scrollToFirstError={true}
          preserve={false}
        >
          {renderHeader()}
          {renderFormContent()}
        </Form>
      </Spin>

      <EnhancedResponseModal
        visible={modalState.modals.response.visible}
        data={modalState.modals.response.data}
        warningMessage={modalState.modals.response.warningMessage}
        onConfirm={handleResponseConfirm}
        onCancel={() => modalState.hideModal("response")}
        loading={modalState.modals.response.loading}
        title={apiConfig.responseModalTitle || "Confirm Submission"}
        confirmText={apiConfig.responseConfirmText || "Confirm"}
        cancelText={apiConfig.responseCancelText || "Cancel"}
      />
    </div>
  );
};
