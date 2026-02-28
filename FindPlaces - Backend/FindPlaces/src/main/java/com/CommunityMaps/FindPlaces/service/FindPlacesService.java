package com.CommunityMaps.FindPlaces.service;

import com.CommunityMaps.FindPlaces.dto.CreatePlaceRequest;
import com.CommunityMaps.FindPlaces.dto.PlaceResponse;
import com.CommunityMaps.FindPlaces.entity.FindPlaces;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface FindPlacesService {

    List<PlaceResponse> getAllApprovedPlaces();

    Page<PlaceResponse> getApprovedPlacesByCategory(
            String category,
            Pageable pageable
    );

    List<PlaceResponse> getApprovedPlacesByCategory(String category);

    List<PlaceResponse> getNearbyApprovedPlaces(double lat, double lng, double radius);

    public Page<PlaceResponse> getAllApprovedPlaces(Pageable pageable);

    public PlaceResponse createPlace(CreatePlaceRequest request);

    List<PlaceResponse> getNearbyApprovedPlacesByCategory(double lat, double lng, double radius, String category);



    //admin methods
    List<PlaceResponse> getPendingPlaces();

    void approvePlace(Long id);

    void rejectPlace(Long id);

    public void softDeletePlace(Long id);

    //rating based methods
    List<PlaceResponse> getTopRated(int limit);

    List<PlaceResponse> getTopRatedNearby(double lat, double lng, double radius, int limit);

}