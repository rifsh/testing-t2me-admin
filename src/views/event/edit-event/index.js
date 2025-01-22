import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import MultyStepEventForm from '../components/MultyStepForm';

const EditEvent = () => {
  const location = useLocation();
  const { eventId } = useParams();
  const { mode = "EDIT", id = eventId } = location.state || {};

  return (
    <MultyStepEventForm eventId={id} mode="EDIT" />
  );
}

export default EditEvent;
