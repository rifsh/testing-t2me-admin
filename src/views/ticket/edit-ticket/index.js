import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import TicketFormFields from "../components/TicketFormFields";


const EditTicket = () => {
  const dispatch = useDispatch();
  const { ticketId } = useParams();
  const { filteredTickets } = useSelector((state) => state.tickets);
  const selectedTicket = filteredTickets.find(
    (ticket) => ticket.id === parseInt(ticketId, 10)
  );

  console.log(JSON.stringify(selectedTicket), "FOUND TICKET");

  return <TicketFormFields mode={"EDIT"} ticket={selectedTicket} />;
};

export default EditTicket;
