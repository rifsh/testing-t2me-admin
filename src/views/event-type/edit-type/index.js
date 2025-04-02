import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import EventTypeForm from "../form-type";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventTypeDetails } from "store/slices/eventSlice";
import LoadingOverlay from "components/util-components/Loader/index";

const EditEventType = () => {
  const dispatch = useDispatch();
  const { typeId } = useParams();
  const { eventTypeDetails, loading } = useSelector((state) => state.event);

  useEffect(() => {
    if (typeId) {
      dispatch(fetchEventTypeDetails(typeId));
    }
  }, [dispatch, typeId]);

  if (loading || !eventTypeDetails) {
    return <LoadingOverlay loading={true} />;
  }

  return <EventTypeForm mode={"EDIT"} type={eventTypeDetails} />;
};

export default EditEventType;
