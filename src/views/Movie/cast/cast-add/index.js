import React from 'react'
import CelebrityManager from '../components/AddPage'
import { MODE } from 'constants/TextConstant'

const Index = () => {
    return (
        <div>
            <CelebrityManager mode={MODE.ADD} />
        </div>
    )
}

export default Index