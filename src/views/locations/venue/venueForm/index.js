import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PageHeaderAlt from 'components/layout-components/PageHeaderAlt'
import { Form } from 'antd';
import {
	getPlaces,
	getSingleVenues,
	getVenues,
	setEditItemId,
	setLocationDialogVisible,
	setLocationModalLoading,
} from "store/slices/locationSlice";
import ProductListData from "assets/data/product-list.data.json"
import VenueFormFields from '../components/VenueFormFields';



const ADD = 'ADD'
const EDIT = 'EDIT'

const VenueForm = ({ mode, venueId }) => {
	const dispatch = useDispatch();
	console.log("MODEEEEEEEEEEE", mode);
	console.log("VENUEEEEEEIDDDDD", venueId);

	const { filteredVenues, singleVenues } = useSelector((state) => state.locations);

	useEffect(() => {
		if (venueId) {
			console.log("fetching single venues--------");

			dispatch(getSingleVenues(venueId));
		}
	}, [dispatch]);





	return (
		<>
			<Form
				layout="vertical"

				name="advanced_search"
				className="ant-advanced-search-form"
				initialValues={{
					heightUnit: 'cm',
					widthUnit: 'cm',
					weightUnit: 'kg'
				}}
			>
				<PageHeaderAlt className="border-bottom" overlap>
					<div className="container">

					</div>
				</PageHeaderAlt>
				<div className="container" style={{ marginTop: 100 }}>
					<VenueFormFields
						mode={mode}
						venue={singleVenues}
					/>
				</div>
			</Form>
		</>
	)
}

export default VenueForm
