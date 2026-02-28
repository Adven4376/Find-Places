package com.CommunityMaps.FindPlaces.dto;

public class ReviewResponse {
    private Long id;
    private String username;
    private Integer rating;
    private String comment;

    public ReviewResponse(Long id, String username, Integer rating, String comment) {
        this.id = id;
        this.username = username;
        this.rating = rating;
        this.comment = comment;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public Integer getRating() { return rating; }
    public String getComment() { return comment; }
}
