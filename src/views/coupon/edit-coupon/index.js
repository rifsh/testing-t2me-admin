import React from 'react'
import { useParams } from 'react-router-dom';
import CouponForm from '../form-coupon';

const EditEvent = () => {
	const params = useParams();

	return (
		<CouponForm mode="EDIT" param={params}/>
	)
}

export default EditEvent
