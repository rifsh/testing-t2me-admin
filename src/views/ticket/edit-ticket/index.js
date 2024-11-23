import React from 'react'
import { useParams } from 'react-router-dom';
import TicketForm from '../form-ticket';

const EditTicket = () => {
	const params = useParams();

	return (
		<TicketForm mode="EDIT" param={params}/>
	)
}

export default EditTicket
