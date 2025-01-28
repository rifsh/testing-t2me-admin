import React from "react";
import TaxForm from '../taxForm';
import { useParams } from "react-router-dom";

const EditTax = () => {
  const { taxId } = useParams();
  
  return (
    <TaxForm mode="EDIT" taxId={taxId} />
  )
};

export default EditTax;
