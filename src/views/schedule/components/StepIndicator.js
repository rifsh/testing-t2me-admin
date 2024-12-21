import React from "react";
import { Select, Typography } from "antd";
import { FaCheckCircle } from "react-icons/fa";

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
