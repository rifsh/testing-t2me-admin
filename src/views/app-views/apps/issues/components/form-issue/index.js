import React, { useEffect } from "react";
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import { Tabs, Form, Button, message } from "antd";
import Flex from "components/shared-components/Flex";
import { useDispatch, useSelector } from "react-redux";
import { addOffer, setIsDateRequired } from "store/slices/offerSlice";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import moment from "moment/moment";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import Utils from "utils";
import IssueFormFields from "../IssueFormFields";
import { AddNewIssue } from "store/slices/IssueSlice";
const ADD = "ADD";
// const EDIT = "EDIT";

const IssueForm = (props) => {
  const { mode = ADD } = props;
  const { loading, error, isDateRequired, responseData, responseMessage } =
    useSelector((state) => state.offers);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(setIsDateRequired(false));
    if (error) {
      message.error(error);
    }
  }, [error]);

  const onFinish = async () => {
    try {
      const values = await form.validateFields();


      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        if (key === "files") {
          values.files.forEach((file) => {
            formData.append("files", file.originFileObj);
          });
        } else {
          formData.append(key, values[key]);
        }
      });

      const resultAction = await dispatch(AddNewIssue(formData))
      if (AddNewIssue.fulfilled.match(resultAction)) {
        message.success(`Isse created succesfully`);
        navigate(`${APP_PREFIX_PATH}/issue/list`);

      }
    } catch (error) {
      console.error("Error during submission:", error);
    }
  };

  return (
    <>
      <Form
        layout="vertical"
        form={form}
        name="advanced_search"
        className="ant-advanced-search-form"
        initialValues={{
          heightUnit: "cm",
          widthUnit: "cm",
          weightUnit: "kg",
        }}
      >
        <PageHeaderAlt className="border-bottom" overlap>
          <div className="container">
            <Flex
              className="py-2"
              mobileFlex={false}
              justifyContent="space-between"
              alignItems="center"
            >
              <h2 className="mb-3">
                {mode === "ADD" ? "Add Issue" : `Edit Issue`}{" "}
              </h2>
              <div className="mb-3">
                <DiscardButton form={form} />
                <Button
                  type="primary"
                  onClick={() => onFinish()}
                  htmlType="submit"
                  loading={loading}
                >
                  {mode === "ADD" ? "Add" : `Save`}
                </Button>
              </div>
            </Flex>
          </div>
        </PageHeaderAlt>
        <div className="container">
          <Tabs
            defaultActiveKey="1"
            style={{ marginTop: 30 }}
            items={[
              {
                label: "General",
                key: "1",
                children: <IssueFormFields />,
              },
            ]}
          />
        </div>
      </Form>
      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={addOffer}
        navigationPath={`${APP_PREFIX_PATH}/offer/list?type=general`}
        responseMessage={responseMessage}
        mode={mode}
        form={form}
        formType={"issues"}
      />
    </>
  );
};

export default IssueForm;
