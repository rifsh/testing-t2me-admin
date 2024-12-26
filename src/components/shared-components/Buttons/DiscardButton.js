import React from "react";
import { Button, Modal } from "antd";
import { useNavigate } from "react-router-dom";

const DiscardButton = (form) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Show the confirmation modal before discarding
    Modal.confirm({
      title: "Are you sure you want to discard the changes?",
      content: "Your unsaved changes will be lost.",
      onOk: () => {
        // Reset the form and navigate back if the user confirms
        form.form.resetFields();
        navigate(-1);
      },
      onCancel: () => {
        // Do nothing if the user cancels
      },
      okText: "Yes, discard",
      cancelText: "No, keep changes",
    });
  };

  return (
    <Button className="mr-2" onClick={handleClick} type={"default"}>
      Discard
    </Button>
  );
};

export default DiscardButton;
