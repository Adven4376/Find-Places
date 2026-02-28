package com.CommunityMaps.FindPlaces.dto;

public class EditRequestResponse {

    private Long id;
    private Long placeId;
    private String suggestedBy;
    private String status;

    private String name;
    private String category;
    private Double latitude;
    private Double longitude;
    private String description;

    public EditRequestResponse(Long id, Long placeId, String suggestedBy, String status,
                               String name, String category, Double latitude, Double longitude, String description) {
        this.id = id;
        this.placeId = placeId;
        this.suggestedBy = suggestedBy;
        this.status = status;
        this.name = name;
        this.category = category;
        this.latitude = latitude;
        this.longitude = longitude;
        this.description = description;
    }

    // getters

    public Long getId() {
        return id;
    }

    public Long getPlaceId() {
        return placeId;
    }

    public String getSuggestedBy() {
        return suggestedBy;
    }

    public String getStatus() {
        return status;
    }

    public String getName() {
        return name;
    }

    public String getCategory() {
        return category;
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
}
