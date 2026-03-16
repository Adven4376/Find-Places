package com.CommunityMaps.FindPlaces.service;

import com.CommunityMaps.FindPlaces.dto.DirectionResponse;
import com.CommunityMaps.FindPlaces.dto.NavigationStep;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class DirectionsServiceImpl implements DirectionsService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public DirectionResponse getRoute(double fromLat, double fromLng, double toLat, double toLng, String mode) {

        // Map frontend modes to OSRM profiles
        String osrmProfile = "driving";
        if (mode != null) {
            if (mode.equalsIgnoreCase("TWO_WHEELER") || mode.equalsIgnoreCase("bike") || mode.equalsIgnoreCase("cycling")) {
                osrmProfile = "cycling"; 
            } else if (mode.equalsIgnoreCase("WALK") || mode.equalsIgnoreCase("foot") || mode.equalsIgnoreCase("walking")) {
                osrmProfile = "foot";
            }
        }

        String url = String.format(
                "https://router.project-osrm.org/route/v1/%s/%f,%f;%f,%f?overview=full&geometries=polyline&steps=true",
                osrmProfile, fromLng, fromLat, toLng, toLat
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

        /*
         * 🔥 NEW BLOCK ADDED
         * Extract step-based navigation from OSRM
         */

        List<NavigationStep> navigationSteps = new ArrayList<>();

        List<Map<String, Object>> legs =
                (List<Map<String, Object>>) route.get("legs");

        Map<String, Object> firstLeg = legs.get(0);

        List<Map<String, Object>> steps =
                (List<Map<String, Object>>) firstLeg.get("steps");

        for (Map<String, Object> step : steps) {

            Map<String, Object> maneuver =
                    (Map<String, Object>) step.get("maneuver");

            String type = (String) maneuver.get("type");
            String modifier = maneuver.get("modifier") != null
                    ? (String) maneuver.get("modifier")
                    : "";

            String instruction = (type + " " + modifier).trim();

            double stepDistance =
                    ((Number) step.get("distance")).doubleValue();

            double stepDuration =
                    ((Number) step.get("duration")).doubleValue();

            String stepGeometry =
                    (String) step.get("geometry");

            List<Number> location =
                    (List<Number>) maneuver.get("location");

            double[] maneuverLocation = new double[]{
                    location.get(0).doubleValue(), // lng
                    location.get(1).doubleValue()  // lat
            };

            navigationSteps.add(
                    new NavigationStep(
                            instruction,
                            stepDistance,
                            stepDuration,
                            stepGeometry,
                            maneuverLocation
                    )
            );
        }

        /*
         * 🔥 CONSTRUCTOR UPDATED
         */

        return new DirectionResponse(
                distanceKm,
                durationMinutes,
                polyline,
                navigationSteps
        );
    }
}