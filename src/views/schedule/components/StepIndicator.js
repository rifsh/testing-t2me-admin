import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Select,
  DatePicker,
  Typography,
  Row,
  Col,
  Button,
  message,
} from "antd";
import { FaCheckCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setSubmitLoading,
  setCurrentStep,
  resetState,
} from "store/slices/eventSlice";
import {
  toggleSelectedOffer,
  toggleSelectedCoupon,
} from "store/slices/scheduleSlice";

const { Option } = Select;
const { Text } = Typography;
export const StepIndicator = ({ steps, currentStep }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      margin: "50px 0",
    }}
  >
    {steps.map((step, index) => (
      <div key={index} style={{ textAlign: "center" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: currentStep > index ? "#1890ff" : "#d9d9d9",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
          }}
        >
          {currentStep > index ? <FaCheckCircle /> : index + 1}
        </div>
        <Text style={{ marginTop: "8px" }}>{step}</Text>
      </div>
    ))}
  </div>
);
