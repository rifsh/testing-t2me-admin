import React, { useState, useEffect } from 'react'
import PageHeaderAlt from 'components/layout-components/PageHeaderAlt'
import { Form, Button, message } from 'antd';
import Flex from 'components/shared-components/Flex'

import ProductListData from "assets/data/product-list.data.json"
import VenueFormFields from '../components/VenueFormFields';

const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

const ADD = 'ADD'
const EDIT = 'EDIT'

const VenueForm = props => {

	const { mode = ADD, param } = props

	const [form] = Form.useForm();
	const [uploadedImg, setImage] = useState('')
	const [uploadLoading, setUploadLoading] = useState(false)
	const [submitLoading, setSubmitLoading] = useState(false)

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
			setImage(product.image)
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
