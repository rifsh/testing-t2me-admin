import React from 'react'
import CelebrityManager from '../components/AddPage'
import { useParams } from 'react-router-dom';
import { MODE } from 'constants/TextConstant';

const Index = () => {
    const { id } = useParams();

    return (
        <div>
            <CelebrityManager mode={MODE.EDIT} id={Number(id)} />
        </div>
    )
}

export default Index