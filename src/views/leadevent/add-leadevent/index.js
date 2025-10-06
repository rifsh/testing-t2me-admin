import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
// import MultyStepEventForm from '../components/MultyStepForm';
import MultyStepEventForm from "../../event/components/MultyStepForm"
import MultyStepEventFormOrganizer from 'views/track-team/event-organizer/components/MultyStepForm';
import { UserRoleConstants } from "constants/UserRoleConstant";
import { getCurrentUser } from "configs/UserAccessConfig";
import EventForm from 'views/event/new-components/EventForm';

const LeadAddEvent = () => {
	const currentUser = getCurrentUser();
	const location = useLocation();
	const { eventId } = useParams();
	const { mode = "LEAD", id = eventId } = location.state || {};
	return (
		

		<EventForm eventId={id} mode="LEAD" />
	)
}

export default LeadAddEvent


