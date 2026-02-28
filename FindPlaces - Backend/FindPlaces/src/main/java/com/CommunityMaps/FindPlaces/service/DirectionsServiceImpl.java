package com.CommunityMaps.FindPlaces.service;

import com.CommunityMaps.FindPlaces.dto.DirectionResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class DirectionsServiceImpl implements DirectionsService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public DirectionResponse getRoute(double fromLat, double fromLng, double toLat, double toLng) {

        // OSRM expects: lng,lat;lng,lat
        String url = String.format(
                "https://router.project-osrm.org/route/v1/driving/%f,%f;%f,%f?overview=full&geometries=polyline&steps=true",
                fromLng, fromLat, toLng, toLat
        );

        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        if (response == null || !"Ok".equals(response.get("code"))) {
            throw new RuntimeException("Failed to get route from OSRM");
        }

        List<Map<String, Object>> routes = (List<Map<String, Object>>) response.get("routes");
        Map<String, Object> route = routes.get(0);

        double distanceMeters = ((Number) route.get("distance")).doubleValue();
        double durationSeconds = ((Number) route.get("duration")).doubleValue();
        String polyline = (String) route.get("geometry");

        double distanceKm = distanceMeters / 1000.0;
        double durationMinutes = durationSeconds / 60.0;

        return new DirectionResponse(
                distanceKm,
                durationMinutes,
                polyline,
                response   // full OSRM JSON
        );
    }
}
