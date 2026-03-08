package com.CommunityMaps.FindPlaces.controller;

import com.CommunityMaps.FindPlaces.dto.AiSearchRequest;
import com.CommunityMaps.FindPlaces.dto.PlaceResponse;
import com.CommunityMaps.FindPlaces.service.FindPlacesService;
import com.CommunityMaps.FindPlaces.service.ReviewService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final FindPlacesService placeService;
    private final ReviewService service;

    private String extractCategory(String query) {

        List<String> categories = placeService.getAllCategories();

        for (String cat : categories) {
            if (query.contains(cat.toLowerCase())) {
                return cat;
            }
        }

        return null;
    }

    public AiController(FindPlacesService placeService, ReviewService service) {
        this.placeService = placeService;
        this.service = service;
    }

    @PostMapping("/search")
    public List<PlaceResponse> search(@RequestBody AiSearchRequest request) {

        String query = request.getQuery().toLowerCase();
        Double lat = request.getLat();
        Double lng = request.getLng();

        boolean wantsNearby = query.contains("nearby") || query.contains("near me");
        boolean wantsBest = query.contains("best") || query.contains("top");

        String category = extractCategory(query);

        double defaultRadius = 5.0;   // 5 km
        int defaultLimit = 20;

        // 🔥 1️⃣ Best Nearby Category
        if (wantsBest && wantsNearby && category != null && lat != null && lng != null) {
            return placeService.getTopRatedNearby(lat, lng, defaultRadius, defaultLimit)
                    .stream()
                    .filter(p -> p.getCategory().equalsIgnoreCase(category))
                    .toList();
        }

        // 🔥 2️⃣ Nearby Category
        if (wantsNearby && category != null && lat != null && lng != null) {
            return placeService.getNearbyApprovedPlacesByCategory(lat, lng, defaultRadius, category);
        }

        // 🔥 3️⃣ Best Nearby (no category)
        if (wantsBest && wantsNearby && lat != null && lng != null) {
            return placeService.getTopRatedNearby(lat, lng, defaultRadius, defaultLimit);
        }

        // 🔥 4️⃣ Best overall
        if (wantsBest) {
            return placeService.getTopRated(defaultLimit);
        }

        // 🔥 5️⃣ Category only
        if (category != null) {
            return placeService.getApprovedPlacesByCategory(category);
        }

        // 🔥 6️⃣ Name search fallback
        return placeService.searchByName(query);
    }
}
