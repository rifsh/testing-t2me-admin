import React from 'react'
import EventForm from '../CreateForm';
import { useParams } from 'react-router-dom';

const EditEvent = () => {
	const params = useParams();

	return (
		<EventForm mode="EDIT" param={params}/>
	)
}

export default EditEvent
