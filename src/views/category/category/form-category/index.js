
import PageHeaderAlt from 'components/layout-components/PageHeaderAlt'
import { Tabs, Form } from 'antd';
import Flex from 'components/shared-components/Flex'

import CategoryFormFields from '../components/CategoryFormFields';
import SubCategoryFormFields from '../components/SubCategoryFormFields';

const ADD = 'ADD'
// const EDIT = 'EDIT'

const CategoryForm = ({ mode = ADD }) => {
	

	return (
		<Form
			layout="vertical"
			
			name="category-form"
			className="ant-advanced-search-form"
		>
			<PageHeaderAlt className="border-bottom" overlap>
				<div className="container">
					<Flex className="py-2" mobileFlex={false} justifyContent="space-between" alignItems="center">
						<h2 className="mb-3">{mode === ADD ? 'Add New Category' : `Edit Category`}</h2>
					</Flex>
				</div>
			</PageHeaderAlt>
			<div className="container">
				<Tabs 
					defaultActiveKey="1" 
					style={{marginTop: 30}}
					items={[
						{
							label: 'Category',
							key: '1',
							children: <CategoryFormFields mode={mode} />,
						},
						{
							label: 'Sub Category',
							key: '2',
							children: <SubCategoryFormFields mode={mode} />,
						},
					]}
				/>
			</div>
		</Form>
	)
}

export default CategoryForm;