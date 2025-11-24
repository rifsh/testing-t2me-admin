import React from "react";
import TicketFormFields from "../components/TicketFormFields";
import { EventType } from "constants/AppConstants";

const AddSeat = () => {
  return <TicketFormFields mode="ADD" type={EventType.EVENT} />;
};

export default AddSeat;
