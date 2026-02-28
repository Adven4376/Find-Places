package com.CommunityMaps.FindPlaces.repository;

import com.CommunityMaps.FindPlaces.entity.PlacePhoto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlacePhotoRepository extends JpaRepository<PlacePhoto, Long> {
    List<PlacePhoto> findByPlaceId(Long placeId);
}
