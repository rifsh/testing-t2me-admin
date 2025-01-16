import React from 'react';
import { useParams } from 'react-router-dom';
import MultyStepEventForm from '../components/MultyStepForm';

const EditEvent = () => {
  const params = useParams();

  return (
    <MultyStepEventForm eventId={params.eventId} />
  );
}

export default EditEvent;
