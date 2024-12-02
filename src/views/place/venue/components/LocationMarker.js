import React from "react";
import { Marker, useMapEvents } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import { setCoordinates } from "store/slices/locationSlice";

const LocationMarker = ({ form }) => {
  const dispatch = useDispatch();
  const { coordinates } = useSelector((state) => state.locations);

  useMapEvents({
    click: ({ latlng }) => {
      const { lat, lng } = latlng;
      dispatch(setCoordinates({ lat, lng }));
      form.setFieldsValue({
        latitude: lat,
        longitude: lng,
      });
    },
  });

  return coordinates ? <Marker position={coordinates} /> : null;
};

export default LocationMarker;
