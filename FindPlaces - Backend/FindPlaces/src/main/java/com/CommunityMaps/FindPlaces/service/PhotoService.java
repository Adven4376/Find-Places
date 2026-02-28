package com.CommunityMaps.FindPlaces.service;

import com.CommunityMaps.FindPlaces.dto.PhotoResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PhotoService {
    PhotoResponse uploadPhoto(Long placeId, MultipartFile file);
    List<PhotoResponse> getPhotosForPlace(Long placeId);
}
