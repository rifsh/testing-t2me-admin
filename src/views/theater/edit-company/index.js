import React from 'react'
import CompanyForm from '../components/CompanyForm'
import { MODE } from 'constants/TextConstant'
import { useParams } from 'react-router-dom';

const Index = () => {
    const { company_id } = useParams();
    const companyId = company_id ? Number(company_id) : null;
    return (
        <div>
            <CompanyForm mode={MODE.EDIT} CompanyEditId={companyId} />
        </div>
    )
}

export default Index