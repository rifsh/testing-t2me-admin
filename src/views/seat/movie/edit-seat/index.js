import React from 'react'
import EventForm from '../components';
import { useParams } from 'react-router-dom';

const EditSeat = () => {
	const params = useParams();

	return (
		<EventForm mode="EDIT" param={params}/>
	)
}

export default EditSeat
