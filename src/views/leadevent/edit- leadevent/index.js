import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import MultyStepEventForm from './components/MultyStepForm';
import { UserRoleConstants } from "constants/UserRoleConstant";
import { getCurrentUser } from "configs/UserAccessConfig";
import MultyStepEventFormOrganizer from 'views/track-team/event-organizer/components/LeadMultyStepForm';

const LeadAddEvent = () => {
	const currentUser = getCurrentUser();
	const location = useLocation();
	const { eventId } = useParams();
	const { mode = "EDITLEAD", id = eventId } = location.state || {};

	if (currentUser.role_id === UserRoleConstants.eventOrganizerRoleId) {
		return <MultyStepEventFormOrganizer eventId={id} mode="ORGEDITLEAD" />;
	} else {
		return <MultyStepEventForm eventId={id} mode="EDITLEAD" />;
	}
};

export default LeadAddEvent;
