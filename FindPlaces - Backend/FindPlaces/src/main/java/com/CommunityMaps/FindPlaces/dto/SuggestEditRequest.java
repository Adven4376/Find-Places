package com.CommunityMaps.FindPlaces.dto;

import jakarta.validation.constraints.NotNull;


public class SuggestEditRequest {

    @NotNull
    private String name;

    @NotNull
    private String category;

    @NotNull
    private Double latitude;

    public String getCategory() {
        return category;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public String getDescription() {
        return description;
    }

    @NotNull
    private Double longitude;

    private String description;

    // getters and setters
}