import React, { useEffect, useState } from "react";
import Utils from "utils/index";
import {
  Input,
  Row,
  Col,
  Card,
  Form,
  Select,
  Button,
  message,
  Upload,
  Checkbox,
  Typography,
  Switch,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  SupportImageFormat,
  SupportFormatContent,
  ResolutionByServices,
  SmallThumbnailresolution,
  ThumbnailImageResolutions,
} from "constants/SupportFileConstants";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { EditWarningAlert } from "components/util-components/EditWarningComponent/index";
import { ActionType } from "utils/api/warning-submit-util";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import {
  fetchAppInfo,
  updateInfo,
  uploadImageToCdn,
} from "store/slices/AppInfoSlice";
import Flex from "components/shared-components/Flex";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import { RulesMessageConstants } from "constants/RulesConstant";
import { APP_PREFIX_PATH, CDN_PATH } from "configs/AppConfig";
import LoadingOverlay from "components/util-components/Loader/index";
import { filterOption } from "components/util-components/FormItems/dropDownSearch";
import ResizedImgePicker from "components/util-components/Image/ResizedImgePicker";

const { Option } = Select;
const { Text } = Typography;

const TaxFormFields = ({ mode, tax }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State to hold the public URLs of uploaded images
  const [uploadedImages, setUploadedImages] = useState({
    maintenance_image: null,
    isComingSoonImage: null,
    banner: [],
  });

  const {
    appInfoData,
    loading: tableLoader,
    uploadingImages,
    maintenanceData,
    error,
  } = useSelector((state) => state.appinfo);

  useEffect(() => {
    dispatch(fetchAppInfo());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (maintenanceData) {
      const formData = {
        enabled: maintenanceData.enabled,
        footer_message: maintenanceData.footer_message,
        isComingSoonMessage: maintenanceData.isComingSoonMessage,
        isComingSoonFlag: maintenanceData.isComingSoonFlag,
        reason_for_maintenance: maintenanceData.reason_for_maintenance,
        playstore_url: maintenanceData.playstore_url,
        appstore_url: maintenanceData.appstore_url,
        home_title: maintenanceData.home_title,
        home_subtitle: maintenanceData.home_subtitle,
        isComingSoonImage:
          maintenanceData.isComingSoonImage &&
          maintenanceData.isComingSoonImage !== "images"
            ? [
                {
                  uid: "-1",
                  name: maintenanceData.isComingSoonImage.split("/").pop(),
                  status: "done",
                  url: `${CDN_PATH}/${maintenanceData.isComingSoonImage}`,
                },
              ]
            : [],
        banner:
          maintenanceData.banner &&
          Array.isArray(maintenanceData.banner) &&
          maintenanceData.banner.length > 0
            ? maintenanceData.banner.map((url, index) => ({
                uid: `-${index + 1}`,
                name: url.split("/").pop(),
                status: "done",
                url: `${CDN_PATH}/${url}`,
              }))
            : [],
        maintenance_image:
          maintenanceData.maintenance_image &&
          maintenanceData.maintenance_image !== "images"
            ? [
                {
                  uid: "-1",
                  name: maintenanceData.maintenance_image.split("/").pop(),
                  status: "done",
                  url: `${CDN_PATH}/${maintenanceData.maintenance_image}`,
                },
              ]
            : [],
      };
      form.setFieldsValue(formData);

      setUploadedImages({
        maintenance_image:
          maintenanceData.maintenance_image !== "images"
            ? maintenanceData.maintenance_image
            : null,
        isComingSoonImage:
          maintenanceData.isComingSoonImage !== "images"
            ? maintenanceData.isComingSoonImage
            : null,
        banner: maintenanceData.banner || [],
      });
    }
  }, [form, maintenanceData]);

  // Custom upload handler for single images
  const handleImageUpload = async (file, fieldName, moduleName = "footer") => {
    console.log("handleImageUpload called for:", fieldName, file);

    try {
      // Validate image before upload
      const isValid = Utils.handleBeforeUpload(
        file,
        ResolutionByServices.place
      );
      console.log("Image validation result:", isValid);

      if (!isValid) {
        message.error("Invalid image format or size");
        return Upload.LIST_IGNORE;
      }

      message.loading({ content: "Uploading image to CDN...", key: fieldName });

      // Upload to CDN
      console.log("Dispatching uploadImageToCdn for:", fieldName);
      const result = await dispatch(
        uploadImageToCdn({ file: file, moduleName })
      ).unwrap();

      console.log("Upload result:", result);

      if (result.public_url) {
        // Store the public URL
        setUploadedImages((prev) => ({
          ...prev,
          [fieldName]: result.public_url,
        }));

        message.success({
          content: "Image uploaded successfully!",
          key: fieldName,
        });

        // Return false to prevent default upload behavior
        return false;
      }
    } catch (error) {
      console.error("Upload error:", error);
      message.error({ content: `Upload failed: ${error}`, key: fieldName });
      return Upload.LIST_IGNORE;
    }
  };

  // Custom upload handler for banner images (multiple)
  const handleBannerUpload = async (file, moduleName = "footer") => {
    console.log("handleBannerUpload called for:", file);

    try {
      const isValid = Utils.handleBeforeUpload(
        file,
        ResolutionByServices.place
      );
      console.log("Banner validation result:", isValid);

      if (!isValid) {
        message.error("Invalid banner image format or size");
        return Upload.LIST_IGNORE;
      }

      const uploadKey = `banner-${file.uid}`;
      message.loading({
        content: "Uploading banner image to CDN...",
        key: uploadKey,
      });

      console.log("Dispatching uploadImageToCdn for banner");
      const result = await dispatch(
        uploadImageToCdn({ file: file, moduleName })
      ).unwrap();

      console.log("Banner upload result:", result);

      if (result.public_url) {
        setUploadedImages((prev) => ({
          ...prev,
          banner: [...prev.banner, result.public_url],
        }));

        message.success({
          content: "Banner uploaded successfully!",
          key: uploadKey,
        });
        return false;
      }
    } catch (error) {
      console.error("Banner upload error:", error);
      message.error({
        content: `Upload failed: ${error}`,
        key: `banner-${file.uid}`,
      });
      return Upload.LIST_IGNORE;
    }
  };

  // Handle banner image removal
  const handleBannerRemove = (file) => {
    console.log("Removing banner:", file);
    const fileUrl = file.url || file.response?.public_url;
    setUploadedImages((prev) => ({
      ...prev,
      banner: prev.banner.filter((url) => url !== fileUrl),
    }));
  };

  const onFinish = async () => {
    try {
      const values = await form.validateFields();
      console.log("Form values:", values);
      console.log("Uploaded images:", uploadedImages);

      // Prepare data with public URLs instead of file objects
      const data = {
        ...values,
        maintenance_image: uploadedImages.maintenance_image,
        isComingSoonImage: uploadedImages.isComingSoonImage,
        banner: uploadedImages.banner,
      };

      console.log("Submitting data with public URLs:", data);

      await dispatch(updateInfo(data)).unwrap();
      navigate(`${APP_PREFIX_PATH}/app/management/layout/app-info/list`);
      dispatch(fetchAppInfo());
      message.success("INFO updated successfully");
    } catch (error) {
      message.error("Failed to update info");
      console.error("Update error:", error);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList || [];
  };

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Form
          layout="vertical"
          form={form}
          name="venue_form"
          className="ant-advanced-search-form"
        >
          <Card>
            <h2 className="mb-3">Update Maintainance Info</h2>
            <Form.Item
              name="home_title"
              label="Home Title"
              rules={[
                { required: true, message: "Please enter the home title" },
              ]}
            >
              <Input placeholder="Enter the footer message" />
            </Form.Item>
            <Form.Item
              name="home_subtitle"
              label="Home Subtitle"
              rules={[
                { required: true, message: "Please enter the home subtitle" },
              ]}
            >
              <Input placeholder="Enter the footer message" />
            </Form.Item>
            <Form.Item
              name="footer_message"
              label="Footer Message"
              rules={[
                { required: true, message: "Please enter the footer message" },
              ]}
            >
              <Input placeholder="Enter the footer message" />
            </Form.Item>
            <Form.Item
              name="isComingSoonMessage"
              label="Coming Soon Message"
              rules={[
                {
                  required: true,
                  message: "Please enter the coming soon message",
                },
              ]}
            >
              <Input placeholder="Enter the coming soon message" />
            </Form.Item>
            <Form.Item
              name="reason_for_maintenance"
              label="Maintenance Reason"
              rules={[
                { required: true, message: "Please enter maintenance reason" },
              ]}
            >
              <Input placeholder="Enter the reason" />
            </Form.Item>
            <Form.Item
              name="playstore_url"
              label="PlayStore Url"
              rules={[
                { required: true, message: "Please enter playstore url" },
              ]}
            >
              <Input placeholder="Enter the url" />
            </Form.Item>
            <Form.Item
              name="appstore_url"
              label="AppStore url"
              rules={[
                { required: true, message: "Please enter the appstore url" },
              ]}
            >
              <Input placeholder="Enter the url" />
            </Form.Item>
            <Form.Item
              name="enabled"
              label="Maintenance Status"
              valuePropName="checked"
            >
              <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                defaultChecked
              />
            </Form.Item>
            <Form.Item
              name="isComingSoonFlag"
              label="Coming Soon Status"
              valuePropName="checked"
            >
              <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                defaultChecked
              />
            </Form.Item>

            {/* Maintenance Image Upload */}
            <Form.Item
              name="maintenance_image"
              label="Maintenance Image"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              style={{ marginBottom: "0px", padding: "0px" }}
            >
              <Upload
                name="maintenance_image"
                listType="picture"
                maxCount={1}
                customRequest={({ file, onSuccess }) => {
                  console.log("Custom request triggered for maintenance_image");
                  handleImageUpload(file, "maintenance_image").then(() => {
                    onSuccess("ok");
                  });
                }}
                accept={`.${SupportImageFormat.join(",.")}`}
                onRemove={() => {
                  console.log("Removing maintenance_image");
                  setUploadedImages((prev) => ({
                    ...prev,
                    maintenance_image: null,
                  }));
                }}
              >
                <Button icon={<UploadOutlined />} loading={uploadingImages}>
                  Click to upload
                </Button>
              </Upload>
            </Form.Item>
            <Text
              type="warning"
              style={{ padding: "00px 00px", fontSize: "11px" }}
            >
              {SupportFormatContent.join(",")}: {SupportImageFormat.join(", ")}{" "}
              & resolution {ResolutionByServices.place} pixels.
            </Text>

            {/* Coming Soon Image Upload */}
            <Form.Item
              name="isComingSoonImage"
              label="Coming Soon Image"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              style={{ marginBottom: "0px", padding: "0px" }}
            >
              <Upload
                name="isComingSoonImage"
                listType="picture"
                maxCount={1}
                customRequest={({ file, onSuccess }) => {
                  console.log("Custom request triggered for isComingSoonImage");
                  handleImageUpload(file, "isComingSoonImage").then(() => {
                    onSuccess("ok");
                  });
                }}
                accept={`.${SupportImageFormat.join(",.")}`}
                onRemove={() => {
                  console.log("Removing isComingSoonImage");
                  setUploadedImages((prev) => ({
                    ...prev,
                    isComingSoonImage: null,
                  }));
                }}
              >
                <Button icon={<UploadOutlined />} loading={uploadingImages}>
                  Click to upload
                </Button>
              </Upload>
            </Form.Item>
            <Text
              type="warning"
              style={{ padding: "00px 00px", fontSize: "11px" }}
            >
              {SupportFormatContent.join(",")}: {SupportImageFormat.join(", ")}{" "}
              & resolution {ResolutionByServices.place} pixels.
            </Text>

            {/* Banner Images Upload */}
            <Form.Item
              name="banner"
              label="Home Banner"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              style={{ marginBottom: "0px", padding: "0px" }}
            >
              <Upload
                name="banner"
                listType="picture"
                maxCount={20}
                customRequest={({ file, onSuccess }) => {
                  console.log("Custom request triggered for banner");
                  handleBannerUpload(file).then(() => {
                    onSuccess("ok");
                  });
                }}
                onRemove={handleBannerRemove}
                accept={`.${SupportImageFormat.join(",.")}`}
                multiple
              >
                <Button icon={<UploadOutlined />} loading={uploadingImages}>
                  Click to upload
                </Button>
              </Upload>
            </Form.Item>

            <Flex
              className="py-2"
              mobileFlex={false}
              justifyContent="space-between"
            >
              <DiscardButton form={form} />
              <Button
                type="primary"
                onClick={onFinish}
                loading={tableLoader || uploadingImages}
                disabled={uploadingImages}
              >
                Save Info
              </Button>
            </Flex>
          </Card>
          {mode === "EDIT" && <EditWarningAlert />}
        </Form>
      </Col>

      <LoadingOverlay loading={tableLoader} />
    </Row>
  );
};

export default TaxFormFields;
