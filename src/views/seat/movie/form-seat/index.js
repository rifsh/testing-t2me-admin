import React, { useState, useEffect } from "react";
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import { Tabs, Form, Button } from "antd";
import Flex from "components/shared-components/Flex";

import ProductListData from "assets/data/product-list.data.json";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";

import { useSelector } from "react-redux";
import TheaterLayout from "../components/TheaterLayout";
import SeatFormFields from "views/seat/stadium/components/SeatFormFields";
import MovieSeatDetailForm from "../components/MovieSeatDetailForm";

const ADD = "ADD";
const EDIT = "EDIT";

const SeatForm = (props) => {
  const { mode = ADD, param } = props;

  const [form] = Form.useForm();
  const [uploadedImg, setImage] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState("1");

 const { selectedSeats, seats, selectedSeatType, seatTypes, zoomLevel } =
    useSelector((state) => state.movieSeatSlice);
  const onFinish = () => {
    if (activeTabKey === "1") {
      setActiveTabKey("2");
    } else {
      // submit function
      console.log("seats", seats)
    }
  };

  const handleTabChange = (key) => {
    setActiveTabKey(key);
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
                  loading={submitLoading}
                >
                  {activeTabKey === "1" ? "Next" : "Submit"}
                </Button>
              </div>
            </Flex>
          </div>
        </PageHeaderAlt>
        <div className="container">
          <Tabs
            activeKey={activeTabKey}
            onChange={handleTabChange}
            style={{ marginTop: 30 }}
            items={[
              {
                label: "Screen Selection",
                key: "1",
                children: <MovieSeatDetailForm form={form} />,
              },
              {
                label: "Seat Layout",
                key: "2",
                children: <TheaterLayout />,
              },
            ]}
          />
        </div>
      </Form>
    </>
  );
};

export default SeatForm;
