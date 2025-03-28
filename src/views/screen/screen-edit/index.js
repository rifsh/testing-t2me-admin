import React from 'react'
import AddFrom from '../screen-add/AddFrom'
import { useParams } from 'react-router-dom'

const EditScreen = () => {
    const { screenId } = useParams();

    return (
        <div>
            <AddFrom mode={'EDIT'} screenId={screenId} />
        </div>
    )
}

export default EditScreen