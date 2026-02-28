package com.CommunityMaps.FindPlaces.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "place_edit_requests")
public class PlaceEditRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "place_id", nullable = false)
    private FindPlaces place;

    @Column(nullable = false)
    private String suggestedName;

    @Column(nullable = false)
    private String suggestedCategory;

    @Column(nullable = false)
    private Double suggestedLatitude;

    @Column(nullable = false)
    private Double suggestedLongitude;

    @Column(length = 500)
    private String suggestedDescription;

    @Column(nullable = false)
    private String suggestedBy; // username

    @Column(nullable = false)
    private String status; // PENDING / APPROVED / REJECTED

    // getters and setters

    public Long getId() {
        return id;
    }

    public FindPlaces getPlace() {
        return place;
    }

    public String getSuggestedName() {
        return suggestedName;
    }

    public String getSuggestedCategory() {
        return suggestedCategory;
    }

    public Double getSuggestedLatitude() {
        return suggestedLatitude;
    }

    public Double getSuggestedLongitude() {
        return suggestedLongitude;
    }

    public String getSuggestedDescription() {
        return suggestedDescription;
    }

    public String getSuggestedBy() {
        return suggestedBy;
    }

    public String getStatus() {
        return status;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setPlace(FindPlaces place) {
        this.place = place;
    }

    public void setSuggestedName(String suggestedName) {
        this.suggestedName = suggestedName;
    }

    public void setSuggestedCategory(String suggestedCategory) {
        this.suggestedCategory = suggestedCategory;
    }

    public void setSuggestedLatitude(Double suggestedLatitude) {
        this.suggestedLatitude = suggestedLatitude;
    }

    public void setSuggestedLongitude(Double suggestedLongitude) {
        this.suggestedLongitude = suggestedLongitude;
    }

    public void setSuggestedDescription(String suggestedDescription) {
        this.suggestedDescription = suggestedDescription;
    }

    public void setSuggestedBy(String suggestedBy) {
        this.suggestedBy = suggestedBy;
    }

    public void setStatus(String status) {
        this.status = status;
    }
    // (Generate with IntelliJ)
}
