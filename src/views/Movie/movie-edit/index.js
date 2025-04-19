import React from 'react'
import MovieAddForm from '../components/MovieAddForm'
import { MODE } from 'constants/TextConstant'
import { useParams } from 'react-router-dom';

const Index = () => {
    const { id } = useParams();

    return (
        <div>
            <MovieAddForm mode={MODE.EDIT} editId={Number(id)} />
        </div>
    )
}

export default Index