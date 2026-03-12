package com.CommunityMaps.FindPlaces.service;

import com.CommunityMaps.FindPlaces.dto.DirectionResponse;

public interface DirectionsService {
    DirectionResponse getRoute(double fromLat, double fromLng, double toLat, double toLng, String mode);
}
