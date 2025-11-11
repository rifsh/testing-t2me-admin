import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import TicketFormFields from "../components/TicketFormFields";

const EditTicket = () => {
  const dispatch = useDispatch();
  const { ticketId } = useParams();

  console.log(JSON.stringify(ticketId), "FOUND TICKET");

  return <TicketFormFields mode={"EDIT"} ticketId={ticketId} />;
};

export default EditTicket;
