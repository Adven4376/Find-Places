package com.CommunityMaps.FindPlaces.dto;

/*
 * NEW FILE ADDED
 * Represents one navigation maneuver step from OSRM
 */

public class NavigationStep {

    private String instruction;
    private double distanceMeters;
    private double durationSeconds;
    private String geometry; // encoded step polyline
    private double[] maneuverLocation; // [lng, lat]

    public NavigationStep(String instruction,
                          double distanceMeters,
                          double durationSeconds,
                          String geometry,
                          double[] maneuverLocation) {
        this.instruction = instruction;
        this.distanceMeters = distanceMeters;
        this.durationSeconds = durationSeconds;
        this.geometry = geometry;
        this.maneuverLocation = maneuverLocation;
    }

    public String getInstruction() {
        return instruction;
    }

    public double getDistanceMeters() {
        return distanceMeters;
    }

    public double getDurationSeconds() {
        return durationSeconds;
    }

    public String getGeometry() {
        return geometry;
    }

    public double[] getManeuverLocation() {
        return maneuverLocation;
    }
}