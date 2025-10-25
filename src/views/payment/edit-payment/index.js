import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import PaymentFormFields from "../components/paymentFormField";

const EditPayment = () => {
  const { paymentId } = useParams();
  console.log("PAYMENT ID:- ", paymentId);

  return <PaymentFormFields mode="EDIT" paymentId={paymentId} />;
};

export default EditPayment;
