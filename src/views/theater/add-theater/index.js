import React from 'react'
import TheaterForm from '../components/TheaterForm'
import { MODE } from 'constants/TextConstant'

const Index = () => {
    return (
        <div>
            <TheaterForm mode={MODE.ADD} />
        </div>
    )
}

export default Index