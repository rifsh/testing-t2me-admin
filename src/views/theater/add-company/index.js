import React from 'react'
import { MODE } from 'constants/TextConstant'
import CompanyForm from '../components/CompanyForm'

const Index = () => {
    return (
        <>
            <CompanyForm mode={MODE.ADD} />
        </>
    )
}

export default Index