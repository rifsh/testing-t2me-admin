import { Card, Col, Form, Select } from "antd";
import {
  clearSubcategories,
  fetchCategories,
  setCategoryValidationDialogVisible,
  fetchSubcategories,
} from "store/slices/categorySlice";
import { useDispatch, useSelector } from "react-redux";
import { RulesMessageConstants } from "constants/RulesConstant";
import ValidationModal from "components/util-components/ModalItems/ValidationModal";
import { useEffect } from "react";

const { Option } = Select;

const CategoryField = ({ form }) => {
  const rules = {
    category: [{ required: true, message: RulesMessageConstants.PLACE }],
    subCategory: [{ required: true, message: RulesMessageConstants.VENUE }],
  };

  const dispatch = useDispatch();
  const {
    filteredCategories,
    subcategories,
    loading,
    message: subCatValidationMessage,
    ValidateData,
    categoryValidationDialogVisible,
  } = useSelector((state) => state.category);

  useEffect(() => {
    dispatch(fetchCategories({}));
  }, [dispatch]);

  const handleCategoryChange = (value) => {
    form.setFieldsValue({ sub_category_id: null });
    if (value) {
      dispatch(fetchSubcategories({ category_id: value }));
    } else {
      dispatch(clearSubcategories());
    }
  };
  const handleValidationModalCancel = () => {
    dispatch(setCategoryValidationDialogVisible(false));
  };

  return (
    <Col xs={24} sm={24} md={17}>
      <Card xs={24} sm={24} md={17}>
        <Form.Item name="category_id" label="Category" rules={rules.category}>
          <Select
            className="w-100"
            placeholder="Choose a Category"
            onSelect={handleCategoryChange}
            loading={loading}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            notFoundContent={
              loading ? "Loading Categories..." : "No Category Available"
            }
          >
            {filteredCategories.map((elm) => (
              <Option key={elm.id} value={elm.id}>
                {elm.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="sub_category_id"
          label="Sub Category"
          rules={rules.subCategory}
        >
          <Select
            className="w-100"
            placeholder="Choose a Sub Category"
            disabled={!subcategories}
            loading={loading}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            notFoundContent={
              loading ? "Loading Subcategories..." : `No Sub Category Available`
            }
          >
            {subcategories &&
              subcategories.map((sub) => (
                <Option key={sub.id} value={sub.id}>
                  {sub.name}
                </Option>
              ))}
          </Select>
        </Form.Item>
      </Card>
      <ValidationModal
        visible={categoryValidationDialogVisible}
        data={ValidateData?.errors}
        statusMessage={subCatValidationMessage}
        onClose={handleValidationModalCancel}
      />
    </Col>
  );
};

export default CategoryField;
