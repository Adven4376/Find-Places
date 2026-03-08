package com.CommunityMaps.FindPlaces.controller;

import com.CommunityMaps.FindPlaces.dto.PhotoResponse;
import com.CommunityMaps.FindPlaces.service.PhotoService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/places")
public class PlacePhotoController {

    private final PhotoService service;

    public PlacePhotoController(PhotoService service) {
        this.service = service;
    }

    // Upload photo (LOGIN REQUIRED)
    @PostMapping("/{placeId}/photos")
    public PhotoResponse uploadPhoto(
            @PathVariable Long placeId,
            @RequestParam("file") MultipartFile file
    ) {
        return service.uploadPhoto(placeId, file);
    }

    // Get photos for a place (PUBLIC)
    @GetMapping("/{placeId}/photos")
    public List<PhotoResponse> getPhotos(@PathVariable Long placeId) {
        return service.getPhotosForPlace(placeId);
    }
}
