package com.CommunityMaps.FindPlaces.dto;

public class PhotoResponse {
    private Long id;
    private String url;
    private String uploadedBy;

    public PhotoResponse(Long id, String url, String uploadedBy) {
        this.id = id;
        this.url = url;
        this.uploadedBy = uploadedBy;
    }

    public Long getId() { return id; }
    public String getUrl() { return url; }
    public String getUploadedBy() { return uploadedBy; }
}
