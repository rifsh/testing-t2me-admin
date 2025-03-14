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
import { fetchAppInfo, updateInfo } from "store/slices/AppInfoSlice";
import Flex from "components/shared-components/Flex";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import { RulesMessageConstants } from "constants/RulesConstant";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import LoadingOverlay from "components/util-components/Loader/index";
import { filterOption } from "components/util-components/FormItems/dropDownSearch";
import ResizedImgePicker from "components/util-components/Image/ResizedImgePicker";

const { Option } = Select;
const { Text } = Typography;

const TaxFormFields = ({ mode, tax }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    appInfoData,
    loading: tableLoader,
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
        isComingSoonImage:
          maintenanceData.isComingSoonImage &&
          maintenanceData.isComingSoonImage !== "images"
            ? [
                {
                  uid: "-1",
                  name: maintenanceData.isComingSoonImage.split("/").pop(),
                  status: "done",
                  url: maintenanceData.isComingSoonImage,
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
                url: url,
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
                  url: maintenanceData.maintenance_image,
                },
              ]
            : [],
      };
      form.setFieldsValue(formData);
    }
  }, [form, maintenanceData]);

  const onFinish = async () => {
    const values = await form.validateFields();
    console.log("Form values:", values);

    const data = {
      ...values,
    };

    const resultAction = await dispatch(updateInfo(data)).unwrap();
    navigate(`${APP_PREFIX_PATH}/app/management/layout/app-info/list`);
    dispatch(fetchAppInfo());
    message.success("INFO updated successfully");
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
            </Form.Item>{" "}
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
                beforeUpload={(file) =>
                  Utils.handleBeforeUpload(file, ResolutionByServices.place)
                }
                accept={`.${SupportImageFormat.join(",.")}`}
              >
                <Button icon={<UploadOutlined />}>Click to upload</Button>
              </Upload>
            </Form.Item>
            <Text
              type="warning"
              style={{ padding: "00px 00px", fontSize: "11px" }}
            >
              {SupportFormatContent.join(",")}: {SupportImageFormat.join(", ")}{" "}
              &{" resolution "}
              {ResolutionByServices.place} pixels.{" "}
            </Text>
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
                beforeUpload={(file) =>
                  Utils.handleBeforeUpload(file, ResolutionByServices.place)
                }
                accept={`.${SupportImageFormat.join(",.")}`}
              >
                <Button icon={<UploadOutlined />}>Click to upload</Button>
              </Upload>
            </Form.Item>
            <Text
              type="warning"
              style={{ padding: "00px 00px", fontSize: "11px" }}
            >
              {SupportFormatContent.join(",")}: {SupportImageFormat.join(", ")}{" "}
              &{" resolution "}
              {ResolutionByServices.place} pixels.{" "}
            </Text>
            <Form.Item
              name="banner"
              label="Home Banner"
              valuePropName="value"
              getValueFromEvent={normFile}
              style={{ marginBottom: "0px", padding: "0px" }}
            >
              <ResizedImgePicker
                maxCount={20}
                targetResolution={ThumbnailImageResolutions.LANDING_PAGE_BANNER}
              />
            </Form.Item>
            <Flex
              className="py-2"
              mobileFlex={false}
              justifyContent="space-between"
            >
              <DiscardButton form={form} />
              <Button type="primary" onClick={onFinish} loading={tableLoader}>
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
