import React, { useState, useEffect } from 'react'
import PageHeaderAlt from 'components/layout-components/PageHeaderAlt'
import { Tabs, Form, Button, message } from 'antd';
import Flex from 'components/shared-components/Flex'

import ProductListData from "assets/data/product-list.data.json"
import CouponFormFields from '../components/CouponFormFields';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { addOffer } from 'store/slices/offerSlice';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import { addCoupon } from 'store/slices/couponSlice';


const ADD = 'ADD'
const EDIT = 'EDIT'

const OfferForm = props => {

	
	const { mode = ADD, param } = props;
	const { loading, error } = useSelector((state) => state.offers);
	const [form] = Form.useForm();
	const dispatch = useDispatch();
	const navigate = useNavigate();
  
	useEffect(() => {
	  if (error) {
		message.error(error);
	  }
	}, [error]);
  
	const onFinish = async () => {
	  try {
		const values = await form.validateFields();
		values.start_date = moment(values.start_date).format("YYYY-MM-DD");
		values.end_date = moment(values.end_date).format("YYYY-MM-DD");
		const resultAction = await dispatch(addCoupon(values));
		if (addCoupon.fulfilled.match(resultAction)) {
		  message.success(`Offer ${values.name} added successfully`);
		  form.resetFields();
		  navigate(`${APP_PREFIX_PATH}/coupon/list`);
		} else {
		  message.error("Failed to add the coupon. Please try again.");
		}
	  } catch (info) {
		console.error("Validation Failed:", info);
		message.error("Please enter all required fields.");
	  }
	};

	return (
		<>
			<Form
				layout="vertical"
				form={form}
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
						<Flex className="py-2" mobileFlex={false} justifyContent="space-between" alignItems="center">
							<h2 className="mb-3">{mode === 'ADD'? 'Add New Offer' : `Edit Offer`} </h2>
							<div className="mb-3">
								<Button className="mr-2">Discard</Button>
								<Button type="primary" onClick={() => onFinish()} htmlType="submit" loading={loading} >
									{mode === 'ADD'? 'Add' : `Save`}
								</Button>
							</div>
						</Flex>
					</div>
				</PageHeaderAlt>
				<div className="container">
					<Tabs 
						defaultActiveKey="1" 
						style={{marginTop: 30}}
						items={[
							{
								label: 'General',
								key: '1',
								children: <CouponFormFields
									
								/>,
							},
						]}
					/>
				</div>
			</Form>
		</>
	)
}

export default OfferForm
