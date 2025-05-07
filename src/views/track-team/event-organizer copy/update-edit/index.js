import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import MultyStepEventFormOrganizer from 'views/track-team/event-organizer/components/MultyStepForm';


const EditOrganizerEvent = () => {
  const location = useLocation();
  const { eventId } = useParams();
  const { mode = "EDIT", id = eventId } = location.state || {};

  return (
    <MultyStepEventFormOrganizer eventId={id} mode="ORGEDIT" />
  );


}

export default EditOrganizerEvent;
