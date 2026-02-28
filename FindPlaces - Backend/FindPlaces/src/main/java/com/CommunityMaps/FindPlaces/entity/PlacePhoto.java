package com.CommunityMaps.FindPlaces.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "place_photos")
public class PlacePhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Which place this photo belongs to
    @ManyToOne(optional = false)
    @JoinColumn(name = "place_id", nullable = false)
    private FindPlaces place;

    // File path or URL
    @Column(nullable = false)
    private String url;

    // Who uploaded
    @Column(nullable = false)
    private String uploadedBy;

    // getters/setters
    public Long getId() { return id; }

    public FindPlaces getPlace() { return place; }
    public void setPlace(FindPlaces place) { this.place = place; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }
}
