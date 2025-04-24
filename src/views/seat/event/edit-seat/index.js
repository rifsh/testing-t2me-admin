import React from 'react'
import { useParams } from 'react-router-dom';
import SeatForm from '../form-seat';

const EditSeat = () => {
	const {seatId} = useParams();

	return (
		<SeatForm mode="EDIT" seatId={seatId}/>
	)
}

export default EditSeat
