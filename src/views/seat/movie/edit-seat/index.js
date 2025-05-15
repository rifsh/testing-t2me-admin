import React from 'react'
import { useParams } from 'react-router-dom';
import SeatForm from '../form-seat';

const EditSeat = () => {
	const { seatId } = useParams();
	const { pageType } = useParams();

	return (
		<SeatForm mode="EDIT" seatId={seatId} pageType={pageType ? pageType : null} />
	)
}

export default EditSeat
