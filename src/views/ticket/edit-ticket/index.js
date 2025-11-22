import React, { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import TicketFormFields from "../components/TicketFormFields";

const EditTicket = () => {
  const dispatch = useDispatch();
  const { ticketId } = useParams();

  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const isMakeChange = params.get("isMakeChange");
  return (
    <TicketFormFields
      mode={"EDIT"}
      ticketId={ticketId}
      isMakeChange={isMakeChange}
    />
  );
};

export default EditTicket;
