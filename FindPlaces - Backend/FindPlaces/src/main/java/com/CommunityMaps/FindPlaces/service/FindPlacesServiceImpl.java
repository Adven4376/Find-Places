package com.CommunityMaps.FindPlaces.service;

import com.CommunityMaps.FindPlaces.dto.CreatePlaceRequest;
import com.CommunityMaps.FindPlaces.dto.PlaceResponse;
import com.CommunityMaps.FindPlaces.entity.FindPlaces;
import com.CommunityMaps.FindPlaces.repository.FindPlacesRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;



@Service
public class FindPlacesServiceImpl implements FindPlacesService {

    private final FindPlacesRepository repository;
    private final ReviewService reviewService;

    public FindPlacesServiceImpl(FindPlacesRepository repository,
                                 ReviewService reviewService) {
        this.repository = repository;
        this.reviewService = reviewService;
    }

    private PlaceResponse mapToResponse(FindPlaces place) {

        PlaceResponse response = new PlaceResponse();

        response.setId(place.getId());
        response.setName(place.getName());
        response.setCategory(place.getCategory());
        response.setLatitude(place.getLatitude());
        response.setLongitude(place.getLongitude());
        response.setDescription(place.getDescription());

        // 🔥 Fetch rating dynamically from ReviewService
        double avgRating = reviewService.getAverageRating(place.getId());
        response.setAverageRating(avgRating);
        response.setReviewCount(reviewService.getReviewCount(place.getId()));

        return response;
    }


    @Override
    public List<PlaceResponse> getAllApprovedPlaces() {
        return repository.findByStatusIgnoreCase("APPROVED")
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public Page<PlaceResponse> getApprovedPlacesByCategory(
            String category,
            Pageable pageable
    ) {
        return repository
                .findByCategoryIgnoreCaseAndStatusIgnoreCase(
                        category,
                        "APPROVED",
                        pageable
                )
                .map(this::mapToResponse);
    }

    @Override
    public List<PlaceResponse> getApprovedPlacesByCategory(String category) {
        return repository.findByCategoryIgnoreCaseAndStatusIgnoreCase(category, "APPROVED")
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<PlaceResponse> getNearbyApprovedPlaces(double lat, double lng, double radius) {
        return repository.findNearbyByStatus(lat, lng, radius, "APPROVED")
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public Page<PlaceResponse> getAllApprovedPlaces(Pageable pageable) {

        return repository.findByStatusIgnoreCaseAndDeletedFalse("APPROVED", pageable)
                .map(this::mapToResponse);
    }


    @Override
    public PlaceResponse createPlace(CreatePlaceRequest request) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        System.out.println("AUTH = " + auth);
        System.out.println("USERNAME = " + auth.getName());

        String username = auth.getName(); // ✅ ACTUAL LOGGED-IN USER

        FindPlaces place = new FindPlaces();
        place.setName(request.getName());
        place.setLatitude(request.getLatitude());
        place.setLongitude(request.getLongitude());
        String normalizedCategory = request.getCategory()
                .trim()
                .toUpperCase()
                .replaceAll("\\s+", "_");

        place.setCategory(normalizedCategory);
        place.setDescription(request.getDescription());

        // ✅ SET CREATED BY PROPERLY
        place.setCreatedBy(username);
        place.setStatus("PENDING");

        repository.save(place);
        return mapToResponse(place);
    }

    @Override
    public List<PlaceResponse> getNearbyApprovedPlacesByCategory(double lat, double lng, double radius, String category) {
        return repository.findNearbyByCategoryAndStatus(lat, lng, radius, category, "APPROVED")
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    //admin methods
    @Override
    public List<PlaceResponse> getPendingPlaces() {
        return repository.findByStatusIgnoreCase("PENDING")
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void approvePlace(Long id) {

        FindPlaces place = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Place not found"));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String adminUsername = auth.getName();

        place.setStatus("APPROVED");
        place.setApprovedBy(adminUsername);

        repository.save(place);
    }

    @Override
    public void rejectPlace(Long id) {
        FindPlaces place = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Place not found with id: " + id));

        place.setStatus("REJECTED");
        repository.save(place);
    }

    @Override
    public List<PlaceResponse> getTopRated(int limit) {
        return repository.findTopRated(limit)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<PlaceResponse> getTopRatedNearby(double lat, double lng, double radius, int limit) {
        return repository.findTopRatedNearby(lat, lng, radius, limit)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void softDeletePlace(Long id) {
        FindPlaces place = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Place not found"));

        place.setDeleted(true);
        repository.save(place);
    }

    public List<String> getAllCategories() {
        return repository.findDistinctCategories();
    }

    @Override
    public List<PlaceResponse> searchByName(String name) {
        return repository
                .findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


}