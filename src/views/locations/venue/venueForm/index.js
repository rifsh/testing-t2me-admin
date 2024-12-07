import React, {  useEffect } from 'react'
import PageHeaderAlt from 'components/layout-components/PageHeaderAlt'
import { Form } from 'antd';

import ProductListData from "assets/data/product-list.data.json"
import VenueFormFields from '../components/VenueFormFields';



const ADD = 'ADD'
const EDIT = 'EDIT'

const VenueForm = props => {

	const { mode = ADD, param } = props

	const [form] = Form.useForm();
	
	useEffect(() => {
    	if (mode === EDIT) {
			console.log('is edit')
			console.log('props', props)
			const { id } = param
			const productId = parseInt(id)
			const productData = ProductListData.filter(product => product.id === productId)
			const product = productData[0]
			form.setFieldsValue({
				comparePrice: 0.00,
				cost: 0.00,
				taxRate: 6,
				description: 'There are many variations of passages of Lorem Ipsum available.',
				category: product.category,
				name: product.name,
				price: product.price
			});
		
		}
  	}, [form, mode, param, props]);

	

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
					/>
				</div>
			</Form>
		</>
	)
}

export default VenueForm
