import React from 'react'
import Card from 'components/shared-components/Card';
import PropTypes from "prop-types";
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const AnnualStatistic = ({ title1, value1, title2, value2 }) => {
	return (
		<Card>
			{title1 && <h4 className="mb-0">{title1}:</h4>}
			<div className="mt-3">
				{/* {prefix ? <div className="mr-2">{prefix}</div> : null} */}
				<div>
					<div className="d-flex align-items-center">
						<h2 className="mb-0 font-weight-bold text-success">{value1}</h2>						
					</div>
					{title2 && <div className="text-gray-light mt-1">{title2}:</div>}
					<h2 className="mb-0 font-weight-bold">{value2}</h2>															
				</div>
			</div>
		</Card>
	)
}

AnnualStatistic.propTypes = {
  	title1: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.element
	]),
	value1: PropTypes.number,
	title2: PropTypes.string,
	value2: PropTypes.number	
};

export default AnnualStatistic