import React, { useEffect } from "react";
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import { Tabs, Form, Button, message } from "antd";
import Flex from "components/shared-components/Flex";
import OfferFormFields from "../components/OfferFormFields";
import { useDispatch, useSelector } from "react-redux";
import { addOffer, setIsDateRequired } from "store/slices/offerSlice";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import moment from "moment/moment";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import Utils from "utils";
import LoadingOverlay from "components/util-components/Loader/index";

const ADD = "ADD";
// const EDIT = "EDIT";

const OfferForm = (props) => {
  const { mode = ADD } = props;
  const {  loading, error, isDateRequired, responseData, responseMessage } =
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
      if (isDateRequired) {
        // values.start_date = moment(values.start_date).format("YYYY-MM-DD");
        // values.end_date = moment(values.end_date).format("YYYY-MM-DD");
        values.start_date =Utils.formatDate(values.start_date);
        values.end_date = Utils.formatDate(values.end_date);
      }
      values.key_words = values.key_words ?? [];
      values.date_required = values.date_required ?? isDateRequired;
      //  dispatch(setSelectedSubmitItem(values));
      const formData = {
                      ...values,
                      
      
                    };
                
                dispatch(setSelectedSubmitItem(formData));
      // const resultAction = await dispatch(addOffer(values));
      // if (addOffer.fulfilled.match(resultAction)) {
      //   message.success(`Offer ${values.name} added successfully`);
      //   form.resetFields();
      //   navigate(`${APP_PREFIX_PATH}/offer/list`);
      // } else {
      //   message.error("Failed to add the offer. Please try again.");
      // }
    } catch (info) {
      console.error("Validation Failed:", info);
      message.error("Please enter all required fields.");
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
                {mode === "ADD" ? "Add New Offer" : `Edit Offer`}{" "}
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
                children: <OfferFormFields />,
              },
            ]}
          />
        </div>
      </Form>
      <LoadingOverlay 
        loading={loading}
      />
      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={addOffer}
        navigationPath={`${APP_PREFIX_PATH}/offer/list`}
        responseMessage={responseMessage}
      />
    </>
  );
};

export default OfferForm;
