import React, { useEffect } from 'react'
import PageHeaderAlt from 'components/layout-components/PageHeaderAlt'
import { Tabs, Form, Button, message } from 'antd';
import Flex from 'components/shared-components/Flex'
import ProductListData from "assets/data/product-list.data.json"
import CountryFormFields from '../components/CountryFormFields';
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { createPlace } from 'store/slices/locationSlice';
import { APP_PREFIX_PATH } from "configs/AppConfig";




const ADD = 'ADD'
const EDIT = 'EDIT'

const CountryForm = props => {

	const { mode = ADD, param } = props
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [form] = Form.useForm();
	const createPlaceLoading = useSelector(state => state.location.createPlaceLoading);
	const selectedCountry = useSelector((state) => state.location.selectedCountry);

	useEffect(() => {
		if (mode === EDIT) {
			console.log('is edit')
			console.log('props', props)
			const { id } = param
			const produtId = parseInt(id)
			const productData = ProductListData.filter(product => product.id === produtId)
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

	const onFinish = () => {
		if (!selectedCountry) {
			message.error('Please select a country.');
			return;
		}

		form.validateFields().then(async values => {
			if (!selectedCountry) {
				message.error('Please select a country.');
				return;
			}
			const placeData = {
				name: values.emailAddress,
				country_name: values.userName,
				timezone: values.password,
				code: values.code
			}

			if (mode === ADD) {

				dispatch(createPlace(placeData))
					.unwrap()
					.then(() => {
						message.success(`Place ${values.userName} added successfully.`);
						form.resetFields();
						navigate(`${APP_PREFIX_PATH}/place/country/list`);
					})
					.catch(error => {
						console.error("Error:", error);
						message.error("Failed to create Place.");
					});
			}
		}).catch(info => {
			console.log('info', info)
			message.error('Please enter all required field ');
		});
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
							<h2 className="mb-3">{mode === 'ADD' ? 'Add New Country' : `Edit Country`} </h2>
							<div className="mb-3">
								<Button className="mr-2">Discard</Button>
								<Button type="primary" onClick={() => onFinish()} htmlType="submit" loading={createPlaceLoading} >
									{mode === 'ADD' ? 'Add' : `Save`}
								</Button>
							</div>
						</Flex>
					</div>
				</PageHeaderAlt>
				<div className="container">
					<Tabs
						defaultActiveKey="1"
						style={{ marginTop: 30 }}
						items={[
							{
								label: 'General',
								key: '1',
								children: <CountryFormFields />,
							},
						]}
					/>
				</div>
			</Form>
		</>
	)
}

export default CountryForm
