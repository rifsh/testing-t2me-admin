import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import MultyStepEventForm from '../components/MultyStepForm';
import MultyStepEventFormOrganizer from 'views/track-team/event-organizer/components/MultyStepForm';
import { UserRoleConstants } from "constants/UserRoleConstant";
import { getCurrentUser } from "configs/UserAccessConfig";
import EventForm from '../new-components/EventForm';


const EditEvent = () => {
  const currentUser = getCurrentUser();
  const location = useLocation();
  const { eventId } = useParams();
  const { mode = "EDIT", id = eventId } = location.state || {};
  if (currentUser.role_id === UserRoleConstants.eventOrganizerRoleId) {
    return (
      <MultyStepEventFormOrganizer eventId={id} mode="EDIT" />
    );
  } else {
    return (
      <EventForm eventId={id} mode="EDIT" />
    );
  }

}

export default EditEvent;
