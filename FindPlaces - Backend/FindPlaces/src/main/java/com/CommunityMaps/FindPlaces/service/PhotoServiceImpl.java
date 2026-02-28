package com.CommunityMaps.FindPlaces.service;

import com.CommunityMaps.FindPlaces.dto.PhotoResponse;
import com.CommunityMaps.FindPlaces.entity.FindPlaces;
import com.CommunityMaps.FindPlaces.entity.PlacePhoto;
import com.CommunityMaps.FindPlaces.repository.FindPlacesRepository;
import com.CommunityMaps.FindPlaces.repository.PlacePhotoRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
public class PhotoServiceImpl implements PhotoService{
    private final PlacePhotoRepository photoRepo;
    private final FindPlacesRepository placesRepo;

    // Change this if you want another folder
    private final String uploadDir = System.getProperty("user.dir") + "/uploads/places";

    public PhotoServiceImpl(PlacePhotoRepository photoRepo, FindPlacesRepository placesRepo) {
        this.photoRepo = photoRepo;
        this.placesRepo = placesRepo;
    }


    @Override
    public PhotoResponse uploadPhoto(Long placeId, MultipartFile file) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        FindPlaces place = placesRepo.findById(placeId)
                .orElseThrow(() -> new IllegalArgumentException("Place not found"));

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        try {
            // Absolute base dir
            File baseDir = new File(uploadDir, String.valueOf(placeId));

            if (!baseDir.exists()) {
                boolean created = baseDir.mkdirs();
                if (!created) {
                    throw new RuntimeException("Could not create directory: " + baseDir.getAbsolutePath());
                }
            }

            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            File dest = new File(baseDir, filename);

            // Save file
            file.transferTo(dest);

            String url = "/uploads/places/" + placeId + "/" + filename;

            PlacePhoto photo = new PlacePhoto();
            photo.setPlace(place);
            photo.setUrl(url);
            photo.setUploadedBy(username);

            PlacePhoto saved = photoRepo.save(photo);

            return new PhotoResponse(saved.getId(), saved.getUrl(), saved.getUploadedBy());

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to upload file", e);
        }
    }

    @Override
    public List<PhotoResponse> getPhotosForPlace(Long placeId) {
        return photoRepo.findByPlaceId(placeId)
                .stream()
                .map(p -> new PhotoResponse(p.getId(), p.getUrl(), p.getUploadedBy()))
                .toList();
    }
}
