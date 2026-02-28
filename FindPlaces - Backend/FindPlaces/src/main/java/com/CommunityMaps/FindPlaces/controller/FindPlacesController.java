package com.CommunityMaps.FindPlaces.controller;


import com.CommunityMaps.FindPlaces.dto.CreatePlaceRequest;
import com.CommunityMaps.FindPlaces.entity.FindPlaces;
import com.CommunityMaps.FindPlaces.repository.FindPlacesRepository;
import com.CommunityMaps.FindPlaces.service.FindPlacesService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import com.CommunityMaps.FindPlaces.dto.PlaceResponse;
import java.util.List;

@RestController
@RequestMapping("/api/places")
@CrossOrigin(origins = "*")
public class FindPlacesController {

    private final FindPlacesService service;

    public FindPlacesController(FindPlacesService service) {
        this.service = service;
    }


    // GET all places OR filter by category
    @GetMapping
    public Page<PlaceResponse> getPlaces(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {

        Pageable pageable = PageRequest.of(page, size);

        if (category != null && !category.isBlank()) {
            return service.getApprovedPlacesByCategory(category, pageable);
        }

        return service.getAllApprovedPlaces(pageable);
    }

    // POST add new place
    @PostMapping
    public PlaceResponse createPlace(@Valid @RequestBody CreatePlaceRequest request) {
        return service.createPlace(request);
    }

    // Top rated overall
    @GetMapping("/top-rated")
    public List<PlaceResponse> getTopRated(
            @RequestParam(defaultValue = "10") int limit
    ) {
        return service.getTopRated(limit);
    }

    // Top rated nearby
    @GetMapping("/top-rated/nearby")
    public List<PlaceResponse> getTopRatedNearby(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam double radius,
            @RequestParam(defaultValue = "10") int limit
    ) {
        return service.getTopRatedNearby(lat, lng, radius, limit);
    }


}
