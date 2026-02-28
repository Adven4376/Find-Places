package com.CommunityMaps.FindPlaces.entity;

import jakarta.persistence.*;

@Entity
@Table(
        name = "place_reviews",
        uniqueConstraints = @UniqueConstraint(columnNames = {"place_id", "username"})
)
public class PlaceReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The place being reviewed
    @ManyToOne(optional = false)
    @JoinColumn(name = "place_id", nullable = false)
    private FindPlaces place;

    // Who reviewed (username from JWT)
    @Column(nullable = false)
    private String username;

    // Rating 1..5
    @Column(nullable = false)
    private Integer rating;

    // Optional comment
    @Column(length = 1000)
    private String comment;

    // getters/setters
    public Long getId() { return id; }
    public FindPlaces getPlace() { return place; }
    public void setPlace(FindPlaces place) { this.place = place; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}