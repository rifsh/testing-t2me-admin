import React from 'react';
import MovieAddForm from '../components/MovieAddForm';
import { MODE } from 'constants/TextConstant';


const Index = () => {
    const mode = "ADD"
    return (
        <>
            <MovieAddForm mode={MODE.ADD} />
        </>
    )
}

export default Index