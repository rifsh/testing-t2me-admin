import React, { useEffect, useState } from "react";
import {
  Input,
  Row,
  Col,
  Card,
  Form,
  Select,
  Spin,
  Upload,
  Button,
  Typography,
  Tooltip,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { fetchAllCountires } from "store/slices/locationSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  SupportImageFormat,
  SupportFormatContent,
  ResolutionByServices,
  SmallThumbnailresolution,
  ThumbnailImageResolutions,
} from "constants/SupportFileConstants";
import { EditWarningAlert } from "components/util-components/EditWarningComponent/index";
import Utils from "utils/index";
import ResizedImgePicker from "components/util-components/Image/ResizedImgePicker";
import ReactQuill from "react-quill";

const { Option } = Select;
const { Text } = Typography;

const rules = {
  country: [
    {
      required: true,
      message: "Please Choose a country",
    },
  ],
  name: [
    {
      required: true,
      message: "Please enter country name",
    },
  ],
  // thumbnail_image: [
  //   {
  //     required: true,
  //     message: "Please upload a thumbnail image",
  //   },
  // ],
  // banner_images: [
  //   {
  //     required: true,
  //     message: "Please upload banner images",
  //   },
  // ],
};

const CountryFormFields = ({ mode, form }) => {
  const dispatch = useDispatch();
  const { loading, countries, error } = useSelector((state) => state.locations);

  useEffect(() => {
    if (countries.length === 0) {
      dispatch(fetchAllCountires());
    }
  }, [dispatch, countries]);

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList || [];
  };

  const handleBeforeUpload = Utils.handleBeforeUpload;
  const [thumbnailImage, setThumbnailImage] = useState(null); // State for thumbnail image
  const [bannerImages, setBannerImages] = useState([]);
  const handleThumbnailChange = (info) => {
    if (info.file.status === "done") {
      setThumbnailImage(info.file.originFileObj);
    } else if (info.file.status === "removed") {
      setThumbnailImage(null);
    }
  };

  // Handle banner images selection
  const handleBannerChange = (info) => {
    if (info.file.status === "done") {
      setBannerImages(info.fileList.map((file) => file.originFileObj));
    } else if (info.file.status === "removed") {
      setBannerImages(info.fileList.map((file) => file.originFileObj));
    }
  };

  if (loading) {
    return (
      <Row justify="center" align="middle" style={{ minHeight: "200px" }}>
        <Spin size="large" />
      </Row>
    );
  }

  if (error) {
    message.error(error || "Failed to load countries");
  }

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Basic Info">
          <Form.Item
            name="country_id"
            label="Country name"
            rules={rules.country}
          >
            <Select
              className="w-100"
              placeholder="Choose a Country"
              loading={loading}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {countries && countries.length > 0 ? (
                countries.map((country) => (
                  <Option key={country.id} value={country.id}>
                    {country.country}
                  </Option>
                ))
              ) : (
                <Option disabled>No countries available</Option>
              )}
            </Select>
          </Form.Item>
          <Form.Item name="name" label="Place" rules={rules.name}>
            <Input placeholder="Place Name" />
          </Form.Item>
          <Form.Item name="description" label="Description" >
            <ReactQuill />
          </Form.Item>
          <Form.Item
            name="thumbnail_image"
            label="Thumbnail Image"
            valuePropName="value"
            getValueFromEvent={normFile}
            style={{ marginBottom: "0px", padding: "0px" }}
          >
            <ResizedImgePicker
              maxCount={1}
              targetResolution={ThumbnailImageResolutions.PLACE}
              form={form}
            />
          </Form.Item>

          <Text
            type="warning"
            style={{ padding: "00px 00px", fontSize: "11px" }}
          >
            {SupportFormatContent.join(",")}: {SupportImageFormat.join(", ")} &
            {" resolution "}
            {ResolutionByServices.place} pixels.{" "}
          </Text>
          <Form.Item
            name="banner_images"
            label="Banner Images"
            valuePropName="value"
            getValueFromEvent={normFile}
            style={{ marginBottom: "0px", padding: "0px" }}
          >
            <ResizedImgePicker
              maxCount={20}
              targetResolution={ThumbnailImageResolutions.PLACE}
              form={form}
            />
          </Form.Item>

          <Text
            type="warning"
            style={{ padding: "00px 00px", fontSize: "11px" }}
          >
            {SupportFormatContent.join(",")}: {SupportImageFormat.join(", ")} &
            {" resolution "}
            {ResolutionByServices.place} pixels.{" "}
          </Text>
        </Card>
        {mode === "EDIT" && <EditWarningAlert />}
        
      </Col>
    </Row>
  );
};

export default CountryFormFields;
