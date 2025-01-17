import React, { useEffect } from "react";
import { Input, Row, Col, Card, Form, Button, Select, message, Upload } from "antd";
import { addAdCategory, fetchAdCategories } from "store/slices/adCategorySlice";
import { createAdBanner } from "store/slices/advertisementSlice";
import { getPlaces } from "store/slices/locationSlice";
import { fetchEventOnPlaces } from "store/slices/eventSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import { UploadOutlined } from "@ant-design/icons";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";

const { Option } = Select;
const ADD = "ADD";
const EDIT = "EDIT";

const rules = {
  name: [{ required: true, message: "Please enter category name" }],
  category: [{ required: true, message: "Please choose country" }],
  event: [{ required: false, message: "Please choose event" }],
  place: [{ required: true, message: "Please choose place" }],
  description: [
    { required: true, message: "Please enter category description" },
  ],
};

const CategoryFormFields = ({ mode = ADD, category }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { countries, places } = useSelector((state) => state.locations);
  const { eventOnPlaces } = useSelector((state) => state.event);
  const { filteredAdCategories } = useSelector(
    (state) => state.adCategory
  );
  const { loading, error, responseData, responseMessage, } = useSelector(
    (state) => state.advertisement
  );

  useEffect(() => {
    if (filteredAdCategories.length === 0) {
      dispatch(fetchAdCategories({}));
      console.log(filteredAdCategories.length)
    }
    if (places.length === 0) {
      dispatch(getPlaces({}));
      console.log("fetching places ---------------------------------------------->")
    }
  }, [dispatch, filteredAdCategories, places]);

  // Handle error message
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  // Populate form fields if editing
  useEffect(() => {
    if (mode === EDIT && category) {
      form.setFieldsValue({
        name: category.name,
        description: category.description,
      });
    }
  }, [mode, category, form]);
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };


  const handleOnSelect = (placeId) => {
    console.log("Selected Place ID:", placeId);
    dispatch(fetchEventOnPlaces(placeId))
  }


  const onFinish = async () => {
    try {
      const values = await form.validateFields();
      console.log({ values });

      // const formData = new FormData();
      // Object.keys(values).forEach((key) => {
      //   formData.append(key, values[key]);
      // });
      
      if (mode === ADD) {

        dispatch(setSelectedSubmitItem(values));

      } else if (mode === EDIT) {
      }

      form.resetFields();
    } catch (errorInfo) {
      console.log("Validation Failed:", errorInfo);
    }
  };

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Basic Info">
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="Name" rules={rules.name}>
              <Input placeholder="Name" />
            </Form.Item>
            <Form.Item name="description" label="Description" rules={rules.description}>
              <Input placeholder="Description" />
            </Form.Item>
            <Form.Item
              name="media_path"
              label="Banner Media"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              rules={rules.thumbnail_image}
            >
              <Upload name="thumbnail_image" listType="picture" maxCount={1} beforeUpload={() => false}>
                <Button icon={<UploadOutlined />}>Click to upload</Button>

              </Upload>
            </Form.Item>
            <Form.Item
              name="ads_url"
              label="Banner Redirect Url"
              rules={rules.name}
            >
              <Input placeholder="Enter banner url" />
            </Form.Item>
            <Form.Item name="banner_category_id" label="Category" rules={rules.category}>
              <Select className="w-100" placeholder="Choose a Category" loading={loading} >
                {filteredAdCategories && filteredAdCategories.length > 0 ? (
                  filteredAdCategories.map((category) => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))
                ) : (
                  <Option disabled>No category available</Option>
                )}
              </Select>
            </Form.Item>
            <Form.Item name="place_id" label="Place" rules={rules.place}>
              <Select className="w-100" placeholder="Choose a Place" loading={loading} onSelect={(value) => handleOnSelect(value)}>
                {places && places.length > 0 ? (
                  places.map((place) => (
                    <Option key={place.id} value={place.id}>
                      {place.name}
                    </Option>
                  ))
                ) : (
                  <Option disabled>No Place available</Option>
                )}
              </Select>
            </Form.Item>
            <Form.Item name="event_id" label="Event" rules={rules.event}>
              <Select className="w-100" placeholder="Choose a Event" loading={loading}>
                {eventOnPlaces && eventOnPlaces.length > 0 ? (
                  eventOnPlaces.map((event) => (
                    <Option key={event.id} value={event.id}>
                      {event.event_name}
                    </Option>
                  ))
                ) : (
                  <Option disabled>No Event available</Option>
                )}
              </Select>
            </Form.Item>


            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 20,
                gap: 10,
              }}
            >
              <DiscardButton form={form} />

              <Button type="primary" onClick={onFinish} loading={loading}>
                {mode === ADD ? "Add" : "Update"}
              </Button>
            </div>
          </Form>
        </Card>
      </Col>
      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={createAdBanner}
        navigationPath={`${APP_PREFIX_PATH}/advertisement/banner/list`}
        responseMessage={responseMessage}
      />
    </Row>
  );
};

export default CategoryFormFields;
