import React from 'react'
import TheaterForm from '../components/TheaterForm'
import { FORM_TYPE, MODE } from 'constants/TextConstant'
import { useParams } from 'react-router-dom'

const Index = () => {
    const { theaterId } = useParams();
    const theater_id = theaterId ? Number(theaterId) : null;
    return (
        <div>
            <TheaterForm mode={MODE.EDIT} formType={FORM_TYPE.THEATER} theaterEditId={theater_id ? theater_id : null} />
        </div>
    )
}

export default Index