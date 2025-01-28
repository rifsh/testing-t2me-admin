import React, { useEffect } from 'react'
import PageHeaderAlt from 'components/layout-components/PageHeaderAlt'
import { Form } from 'antd';
import { useSelector } from "react-redux";
import ProductListData from "assets/data/product-list.data.json"
import TaxFormFields from '../components/TaxFormFields';



const ADD = 'ADD'
const EDIT = 'EDIT'

const TaxForm = ({ mode, taxId }) => {

console.log("MODEEEEEEEEEEEE",mode);
console.log("MODEEEEEEEEEEEE ID",taxId);

	const {  filteredTax } = useSelector((state) => state.tax);

	let taxData;
	if (filteredTax && filteredTax.length > 0) {
		const numericCatId = parseInt(taxId, 10);
		const foundData = filteredTax.find(cat => cat.id === numericCatId);
		console.log('Category Data:', foundData);
		taxData = foundData
	} else {
		console.log('filteredTax is empty or undefined.');
	}

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
					<TaxFormFields
						mode={mode}
						tax={taxData}
					/>
				</div>
			</Form>
		</>
	)
}

export default TaxForm
