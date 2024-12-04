import React, { useState, useEffect } from "react";
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import { Tabs, Form, Button, message } from "antd";
import Flex from "components/shared-components/Flex";

import ProductListData from "assets/data/product-list.data.json";
import CountryFormFields from "../components/CountryFormFields";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createPlace as addPlace } from "store/slices/locationSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";

const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
};

const ADD = "ADD";
const EDIT = "EDIT";

const CountryForm = (props) => {
  const { mode = ADD, param } = props;

  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { placeWithCountryList, coordinates, loading, error } = useSelector(
    (state) => state.locations
  );

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const onFinish = async () => {
    try {
      const values = await form.validateFields();
      const resultAction = await dispatch(addPlace(values));

      if (addPlace.fulfilled.match(resultAction)) {
        message.success(`Place ${values.name} added successfully`);
        form.resetFields();
        navigate(`${APP_PREFIX_PATH}/place/list`);
      }
    } catch (errorInfo) {
      console.error("Validation Failed:", errorInfo);
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
                {mode === "ADD" ? "Add New Country" : `Edit Country`}{" "}
              </h2>
              <div className="mb-3">
                <Button className="mr-2">Discard</Button>
                <Button
                  type="primary"
                  onClick={onFinish}
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
                children: (
                  <CountryFormFields
                
                  />
                ),
              },
            ]}
          />
        </div>
      </Form>
    </>
  );
};

export default CountryForm;
