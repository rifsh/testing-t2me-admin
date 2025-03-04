import React from "react";
import { useParams } from "react-router-dom";
import PaymentFormFields from "../components/PaymentFormField";


const EditPayment = () => {
    //const { paymentId } = useParams();
    return (
        <PaymentFormFields mode="EDIT" />
    )
}

export default EditPayment;  