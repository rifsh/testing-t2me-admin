import React, {  useEffect } from 'react'
import PageHeaderAlt from 'components/layout-components/PageHeaderAlt'
import { Form } from 'antd';

import ProductListData from "assets/data/product-list.data.json"
import TaxFormFields from '../components/TaxFormFields';



const ADD = 'ADD'
const EDIT = 'EDIT'

const TaxForm = props => {

	

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
					
					/>
				</div>
			</Form>
		</>
	)
}

export default TaxForm
