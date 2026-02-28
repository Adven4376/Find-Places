package com.CommunityMaps.FindPlaces.repository;

import com.CommunityMaps.FindPlaces.entity.PlaceEditRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlaceEditRequestRepository extends JpaRepository<PlaceEditRequest, Long> {
    List<PlaceEditRequest> findByStatusIgnoreCase(String status);
}
