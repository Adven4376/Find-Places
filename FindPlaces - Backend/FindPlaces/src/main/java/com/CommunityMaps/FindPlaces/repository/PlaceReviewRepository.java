package com.CommunityMaps.FindPlaces.repository;

import com.CommunityMaps.FindPlaces.entity.PlaceReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlaceReviewRepository extends JpaRepository<PlaceReview, Long> {

    Optional<PlaceReview> findByPlaceIdAndUsername(Long placeId, String username);

    List<PlaceReview> findByPlaceId(Long placeId);

    long countByPlaceId(Long placeId);


}
