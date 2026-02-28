package com.CommunityMaps.FindPlaces.dto;

import java.util.List;

/*
 * UPDATED FILE
 *
 * CHANGES:
 * 1. Removed raw field
 * 2. Added List<NavigationStep> steps
 */

public class DirectionResponse {

    private double distanceKm;
    private double durationMinutes;
    private String polyline;

    // 🔥 NEW FIELD ADDED
    private List<NavigationStep> steps;

    public DirectionResponse(double distanceKm,
                             double durationMinutes,
                             String polyline,
                             List<NavigationStep> steps) {
        this.distanceKm = distanceKm;
        this.durationMinutes = durationMinutes;
        this.polyline = polyline;
        this.steps = steps;
    }

    public double getDistanceKm() {
        return distanceKm;
    }

    public double getDurationMinutes() {
        return durationMinutes;
    }

    public String getPolyline() {
        return polyline;
    }

    // 🔥 NEW GETTER
    public List<NavigationStep> getSteps() {
        return steps;
    }
}