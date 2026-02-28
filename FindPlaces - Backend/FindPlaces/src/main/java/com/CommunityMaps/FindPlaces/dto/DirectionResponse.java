package com.CommunityMaps.FindPlaces.dto;

public class DirectionResponse {

    private double distanceKm;
    private double durationMinutes;
    private String polyline;

    // This will hold full OSRM response
    private Object raw;

    public DirectionResponse(double distanceKm,
                             double durationMinutes,
                             String polyline,
                             Object raw) {
        this.distanceKm = distanceKm;
        this.durationMinutes = durationMinutes;
        this.polyline = polyline;
        this.raw = raw;
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

    public Object getRaw() {
        return raw;
    }
}