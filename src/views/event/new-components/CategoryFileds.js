import React, { useEffect, useCallback } from "react";
import * as antd from "antd";
import {
  clearSubcategories,
  fetchCategories,
  fetchSubcategories,
} from "store/slices/categorySlice";
import { useDispatch, useSelector } from "react-redux";

const { Row, Col, Card, Form, Select, Space, Typography } = antd;
const { Option } = Select;
const { Text } = Typography;

const CategoryField = ({
  mode,
  form,
  currentValues,
  validationErrors = [],
  onFieldChange,
}) => {
  const isEdit = mode === "EDITLEAD";
  const dispatch = useDispatch();

  const { filteredCategories, subcategories, loading } = useSelector(
    (state) => state.category
  );

  // Load categories on component mount
  useEffect(() => {
    dispatch(fetchCategories({}));
  }, [dispatch]);

  // Enhanced category change handler
  const onCategoryChange = useCallback(
    (value) => {
      console.log("📂 Category changing to:", value);

      if (value) {
        // Fetch subcategories for selected category
        dispatch(fetchSubcategories({ category_id: value }));

        // Clear subcategory field when category changes
        form.setFieldsValue({
          sub_category_id: null,
          category_id: value,
        });

        console.log("🔄 Subcategory field cleared");

        // Trigger field change callback
        if (onFieldChange) {
          onFieldChange(
            [
              { name: ["category_id"], value },
              { name: ["sub_category_id"], value: null },
            ],
            form.getFieldsValue()
          );
        }
      } else {
        // Clear both fields if category is cleared
        dispatch(clearSubcategories());
        form.setFieldsValue({
          category_id: null,
          sub_category_id: null,
        });

        console.log("🗑️ Both category and subcategory cleared");
      }
    },
    [dispatch, form, onFieldChange]
  );

  // Enhanced subcategory change handler
  const onSubcategoryChange = useCallback(
    (value) => {
      console.log("📋 Subcategory changed to:", value);

      // Update form field
      form.setFieldValue("sub_category_id", value);

      // Trigger field change callback
      if (onFieldChange) {
        onFieldChange(
          [{ name: ["sub_category_id"], value }],
          form.getFieldsValue()
        );
      }
    },
    [form, onFieldChange]
  );

  // Get validation status for a field
  const getFieldValidationStatus = (fieldName) => {
    const fieldError = validationErrors.find(
      (error) => error.name && error.name.includes(fieldName)
    );
    return fieldError ? "error" : "";
  };

  // Get field error message
  const getFieldErrorMessage = (fieldName) => {
    const fieldError = validationErrors.find(
      (error) => error.name && error.name.includes(fieldName)
    );
    return fieldError ? fieldError.errors?.join(", ") : "";
  };

  return (
    <Row gutter={24}>
      <Col span={24}>
        <Card
          title={<Space>Event Category</Space>}
          bordered
          style={{ width: "100%" }}
        >
          {/* Remove the nested Form - use parent form instead */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="category_id"
                label={"Category"}
                rules={[
                  { required: !isEdit, message: "Event category is required" },
                ]}
                validateStatus={getFieldValidationStatus("category_id")}
              >
                <Select
                  placeholder="Select Category"
                  size="large"
                  loading={loading}
                  onChange={onCategoryChange}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {filteredCategories?.map((cat) => (
                    <Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="sub_category_id"
                label={<Space>Subcategory</Space>}
                rules={[
                  { required: !isEdit, message: "Sub-category is required" },
                ]}
                validateStatus={getFieldValidationStatus("sub_category_id")}
              >
                <Select
                  placeholder="Select Subcategory"
                  size="large"
                  disabled={
                    !currentValues?.category_id || !subcategories?.length
                  }
                  loading={loading}
                  onChange={onSubcategoryChange}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {subcategories?.map((sub) => (
                    <Option key={sub.id} value={sub.id}>
                      {sub.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default CategoryField;
