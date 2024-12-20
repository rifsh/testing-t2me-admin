import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const DiscardButton = (form) => {
  const navigate = useNavigate();

  const handleClick = () => {
    form.form.resetFields();
    navigate(-1);
  };

  return (
    <Button className="mr-2" onClick={handleClick} type={"default"}>
      Discard
    </Button>
  );
};

export default DiscardButton;
