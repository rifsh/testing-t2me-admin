// TabbedForm.jsx
import React, { useState, useCallback, useEffect } from "react";
import {
  Form,
  Input,
  Tabs,
  Select,
  Upload,
  Button,
  message,
  Row,
  Col,
  Card,
  Modal,
  Table,
  Spin,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import debounce from "lodash.debounce";

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const inputTypes = {
  text: Input,
  email: Input,
  password: Input.Password,
  number: Input,
  select: Select,
  textarea: TextArea,
  upload: Upload,
};

const TabbedForm = ({
  sections,
  onFinish,
  onCancel,
  formatSubmitData,
  dispatch,
}) => {
  const [form] = Form.useForm();
  const formValues = Form.useWatch([], form) || {};
  const [fileList, setFileList] = useState([]);
  const [previewValues, setPreviewValues] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState({});
  const [dynamicOptions, setDynamicOptions] = useState({});
  const [activeTab, setActiveTab] = useState(sections?.[0]?.key || "");

  // Internal dispatch wrapper to handle async actions and data formatting
  const dispatchWrapper = useCallback(
    async (action, formatter, apiFormat) => {
      if (!dispatch || typeof dispatch !== "function") {
        throw new Error("Dispatch function is required");
      }

      const result = await dispatch(action);
      console.log("Raw dispatch result:", result);

      // Handle different Redux response structures
      let data = null;

      // Handle Redux Toolkit response structure
      if (result.payload) {
        if (
          apiFormat === "items" &&
          result.payload.items &&
          Array.isArray(result.payload.items)
        ) {
          data = result.payload.items;
        } else if (Array.isArray(result.payload)) {
          data = result.payload;
        } else if (result.payload.data && Array.isArray(result.payload.data)) {
          data = result.payload.data;
        } else if (
          result.payload.results &&
          Array.isArray(result.payload.results)
        ) {
          data = result.payload.results;
        } else if (
          result.payload.items &&
          Array.isArray(result.payload.items)
        ) {
          data = result.payload.items;
        }
      } else if (Array.isArray(result)) {
        data = result;
      }

      console.log("Extracted data:", data);

      // Apply formatter if provided
      if (data && formatter && typeof formatter === "function") {
        const formattedData = data.map((item) => formatter(item));
        console.log("Formatted data:", formattedData);
        return formattedData;
      }

      return data || [];
    },
    [dispatch]
  );

  // Initialize dynamic options with static options on mount
  useEffect(() => {
    const initialOptions = {};
    sections.forEach((section) => {
      section.formItems?.forEach((item) => {
        if (
          item.type === "select" &&
          item.options &&
          Array.isArray(item.options)
        ) {
          initialOptions[item.name] = item.options;
        }
      });
    });
    setDynamicOptions(initialOptions);
  }, [sections]);

  // Debounced fetch for select options
  const debouncedFetch = useCallback(
    debounce(
      async (
        fieldName,
        fetchAction,
        params,
        search,
        dataFormatter,
        apiFormat
      ) => {
        if (!fetchAction) return;

        setLoadingOptions((prev) => ({ ...prev, [fieldName]: true }));

        try {
          console.log(
            `Fetching options for ${fieldName} with search: "${search}"`
          );

          // Create action with search parameter
          const actionParams = { ...params, search };
          const options = await dispatchWrapper(
            fetchAction(actionParams),
            dataFormatter,
            apiFormat
          );

          console.log(`Received options for ${fieldName}:`, options);

          setDynamicOptions((prev) => ({
            ...prev,
            [fieldName]: Array.isArray(options) ? options : [],
          }));
        } catch (error) {
          console.error(`Failed to load options for "${fieldName}":`, error);
          message.error(`Failed to load options for "${fieldName}"`);
        } finally {
          setLoadingOptions((prev) => ({ ...prev, [fieldName]: false }));
        }
      },
      500
    ),
    [dispatchWrapper]
  );

  // Handle select search input change
  const handleSelectSearch = (
    fieldName,
    fetchAction,
    params,
    search,
    dataFormatter,
    apiFormat
  ) => {
    debouncedFetch(
      fieldName,
      fetchAction,
      params,
      search,
      dataFormatter,
      apiFormat
    );
  };

  // Track which fields have been fetched to prevent infinite calls
  const [fetchedFields, setFetchedFields] = useState(new Set());

  // Load initial options for fetchAction fields when tab becomes active
  useEffect(() => {
    const activeSection = sections.find((s) => s.key === activeTab);
    if (!activeSection?.formItems) return;

    activeSection.formItems.forEach(async (item) => {
      const visible =
        typeof item.isVisble === "function" ? item.isVisble(formValues) : true;
      const fieldKey = `${activeTab}-${item.name}`;

      if (
        item.fetchAction &&
        visible &&
        item.type === "select" &&
        !fetchedFields.has(fieldKey)
      ) {
        setFetchedFields((prev) => new Set([...prev, fieldKey]));
        setLoadingOptions((prev) => ({ ...prev, [item.name]: true }));

        try {
          console.log(`Loading initial options for ${item.name}`);
          const actionParams = { search: "", ...item.params };
          const opts = await dispatchWrapper(
            item.fetchAction(actionParams),
            item.dataFormatter,
            item.apiFormat
          );
          console.log(`Loaded initial options for ${item.name}:`, opts);

          setDynamicOptions((prev) => ({
            ...prev,
            [item.name]: Array.isArray(opts) ? opts : [],
          }));
        } catch (error) {
          console.error(
            `Failed to load initial options for "${item.name}":`,
            error
          );
          message.error(`Failed to load options for "${item.name}"`);
          // Remove from fetched fields on error so it can retry
          setFetchedFields((prev) => {
            const newSet = new Set(prev);
            newSet.delete(fieldKey);
            return newSet;
          });
        } finally {
          setLoadingOptions((prev) => ({ ...prev, [item.name]: false }));
        }
      }
    });
  }, [activeTab, formValues, dispatchWrapper, sections, fetchedFields]);

  const handleTabChange = (key) => setActiveTab(key);

  const handleUploadChange = ({ fileList }) => setFileList(fileList);

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setPreviewValues(null);
    setModalVisible(false);
    if (onCancel) onCancel();
  };

  const handleFinish = (values) => {
    const dataWithFiles = { ...values, profilePhoto: fileList };
    const finalData = formatSubmitData
      ? formatSubmitData(dataWithFiles)
      : dataWithFiles;
    setPreviewValues(finalData);
    setModalVisible(true);
  };

  const handleConfirm = async () => {
    setLoadingConfirm(true);
    try {
      if (onFinish) await onFinish(previewValues);
      message.success("Created successfully");
      setModalVisible(false);
      form.resetFields();
      setFileList([]);
    } catch {
      message.error("Submission failed");
    } finally {
      setLoadingConfirm(false);
    }
  };

  const modalData = previewValues
    ? Object.entries(previewValues).map(([key, value]) => {
        if (key === "profilePhoto") {
          value = Array.isArray(value)
            ? value.map((f) => f.name).join(", ")
            : "";
        } else if (Array.isArray(value)) {
          value = value.join(", ");
        } else if (value && typeof value === "object") {
          value = JSON.stringify(value, null, 2);
        }
        return { key, value };
      })
    : [];

  const columns = [
    {
      title: "Field",
      dataIndex: "key",
      key: "key",
      width: "40%",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      width: "60%",
      style: { whiteSpace: "pre-wrap" },
    },
  ];

  return (
    <>
      <Card>
        <Row
          justify="end"
          style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}
        >
          <Col>
            <Button style={{ marginRight: 8 }} onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="primary" onClick={() => form.submit()}>
              Submit
            </Button>
          </Col>
        </Row>

        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Tabs activeKey={activeTab} onChange={handleTabChange} type="card">
            {sections.map(
              ({ key, title, formItems, image, customContent, twoColumn }) => (
                <TabPane key={key} tab={title}>
                  {image && (
                    <img
                      src={image}
                      alt={title}
                      style={{ width: "100%", marginBottom: 16 }}
                    />
                  )}
                  {customContent}

                  {!customContent && (
                    <Row gutter={16}>
                      {formItems.map(
                        ({
                          name,
                          label,
                          type = "text",
                          rules = [],
                          options = [],
                          mode,
                          searchKey,
                          colSpan,
                          fetchAction,
                          params = {},
                          dataFormatter,
                          apiFormat,
                          isVisble,
                        }) => {
                          if (
                            typeof isVisble === "function" &&
                            !isVisble(formValues)
                          ) {
                            return null;
                          }

                          const span = colSpan || (twoColumn ? 12 : 24);

                          if (type === "select") {
                            // Use dynamic options if available, otherwise fall back to static options
                            const currentOptions =
                              dynamicOptions[name] || options || [];

                            console.log(
                              `Rendering select for ${name}, options:`,
                              currentOptions
                            );

                            return (
                              <Col
                                span={span}
                                key={name}
                                style={{ marginBottom: 16 }}
                              >
                                <Form.Item
                                  name={name}
                                  label={label}
                                  rules={rules}
                                >
                                  <Select
                                    showSearch
                                    mode={mode}
                                    placeholder={`Select ${label.toLowerCase()}`}
                                    optionFilterProp="children"
                                    filterOption={!fetchAction} // Disable client-side filtering if using fetchAction
                                    onSearch={
                                      fetchAction
                                        ? (val) =>
                                            handleSelectSearch(
                                              name,
                                              fetchAction,
                                              params,
                                              val,
                                              dataFormatter,
                                              apiFormat
                                            )
                                        : undefined
                                    }
                                    notFoundContent={
                                      loadingOptions[name] ? (
                                        <Spin size="small" />
                                      ) : currentOptions.length === 0 ? (
                                        "No data"
                                      ) : null
                                    }
                                    loading={loadingOptions[name]}
                                    allowClear
                                  >
                                    {currentOptions.map((opt) => {
                                      console.warn("lasjdkafjadfsjfsaf", opt);
                                      const id = opt.id ?? opt.value;
                                      const labelText =
                                        opt.name ?? opt.label ?? id;
                                      return (
                                        <Option key={id} value={id}>
                                          {labelText}
                                        </Option>
                                      );
                                    })}
                                  </Select>
                                </Form.Item>
                              </Col>
                            );
                          }

                          if (type === "textarea") {
                            const Comp = inputTypes[type];
                            return (
                              <Col
                                span={span}
                                key={name}
                                style={{ marginBottom: 16 }}
                              >
                                <Form.Item
                                  name={name}
                                  label={label}
                                  rules={rules}
                                >
                                  <Comp
                                    rows={4}
                                    placeholder={`Enter ${label.toLowerCase()}`}
                                  />
                                </Form.Item>
                              </Col>
                            );
                          }

                          if (type === "upload") {
                            return (
                              <Col
                                span={span}
                                key={name}
                                style={{ marginBottom: 16 }}
                              >
                                <Form.Item
                                  name={name}
                                  label={label}
                                  valuePropName="fileList"
                                  getValueFromEvent={(e) =>
                                    Array.isArray(e) ? e : e && e.fileList
                                  }
                                  rules={rules}
                                >
                                  <Upload
                                    name="file"
                                    listType="picture"
                                    maxCount={1}
                                    onChange={handleUploadChange}
                                    fileList={fileList}
                                    beforeUpload={(file) => {
                                      const isImg =
                                        file.type.startsWith("image/");
                                      if (!isImg)
                                        message.error("Only images allowed");
                                      return isImg || Upload.LIST_IGNORE;
                                    }}
                                  >
                                    <Button icon={<UploadOutlined />}>
                                      Click to Upload
                                    </Button>
                                  </Upload>
                                </Form.Item>
                              </Col>
                            );
                          }

                          const Comp = inputTypes[type] || Input;
                          return (
                            <Col
                              span={span}
                              key={name}
                              style={{ marginBottom: 16 }}
                            >
                              <Form.Item
                                name={name}
                                label={label}
                                rules={rules}
                              >
                                <Comp
                                  placeholder={`Enter ${label.toLowerCase()}`}
                                />
                              </Form.Item>
                            </Col>
                          );
                        }
                      )}
                    </Row>
                  )}
                </TabPane>
              )
            )}
          </Tabs>
        </Form>
      </Card>

      <Modal
        open={modalVisible}
        title="Confirm Your Data"
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            onClick={handleConfirm}
            loading={loadingConfirm}
          >
            Confirm
          </Button>,
        ]}
      >
        <Table
          columns={columns}
          dataSource={modalData}
          pagination={false}
          rowKey="key"
          size="small"
          bordered
        />
      </Modal>
    </>
  );
};

export default TabbedForm;
