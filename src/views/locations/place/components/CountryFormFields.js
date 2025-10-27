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
  Modal, // Add this import
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
import TextEditor from "../../../../components/util-components/FormItems/TextEditor";
import { deleteS3Image } from "store/slices/s3CloudflareSlice";
import useS3ImageDelete from "utils/hooks/useS3ImageDelete";

const { Option } = Select;
const { Text } = Typography;

const rules = {
  country: [
    {
      required: true,
      message: "Please Choose a country",
    },
  ],
  description: [
    {
      required: true,
      message: "Please enter descriptions",
    },
  ],
  name: [
    {
      required: true,
      message: "Please enter country name",
    },
  ],
};

const CountryFormFields = ({ mode, form }) => {
  const dispatch = useDispatch();
  const { loading, countries, error } = useSelector((state) => state.locations);

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList || [];
  };

  const handleBeforeUpload = Utils.handleBeforeUpload;
  const [thumbnailImage, setThumbnailImage] = useState(null);
  const [bannerImages, setBannerImages] = useState([]);

  const handleThumbnailChange = (info) => {
    if (info.file.status === "done") {
      setThumbnailImage(info.file.originFileObj);
    } else if (info.file.status === "removed") {
      setThumbnailImage(null);
    }
  };

  const handleBannerChange = (info) => {
    if (info.file.status === "done") {
      setBannerImages(info.fileList.map((file) => file.originFileObj));
    } else if (info.file.status === "removed") {
      setBannerImages(info.fileList.map((file) => file.originFileObj));
    }
  };

  const { handleDeleteImage } = useS3ImageDelete("place");

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
          <Form.Item name="name" label="Place" rules={rules.name}>
            <Input placeholder="Place Name" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={rules.description}
          >
            <TextEditor />
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
              onDelete={handleDeleteImage}
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
