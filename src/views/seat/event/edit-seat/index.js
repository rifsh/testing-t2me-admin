import React from 'react'
import { useLocation, useParams } from 'react-router-dom';
import SeatForm from '../form-seat';

const EditSeat = () => {
	const {seatId} = useParams();
	  const location = useLocation();
	  const params = new URLSearchParams(location.search);
	  const isMakeChange = params.get("isMakeChange");

	return (
		<SeatForm mode="EDIT" seatId={seatId} isMakeChange={isMakeChange}/>
	)
}

export default EditSeat
