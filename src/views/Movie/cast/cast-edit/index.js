import React from 'react'
import CelebrityManager from '../components/AddPage'
import { useParams } from 'react-router-dom';

const Index = () => {
    const { id } = useParams();

    return (
        <div>
            <CelebrityManager mode='EDIT' id={Number(id)} />
        </div>
    )
}

export default Index