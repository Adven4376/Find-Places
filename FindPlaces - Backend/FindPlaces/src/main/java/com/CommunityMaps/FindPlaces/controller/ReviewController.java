package com.CommunityMaps.FindPlaces.controller;

import com.CommunityMaps.FindPlaces.dto.CreateReviewRequest;
import com.CommunityMaps.FindPlaces.dto.ReviewResponse;
import com.CommunityMaps.FindPlaces.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService service;

    public ReviewController(ReviewService service) {
        this.service = service;
    }

    // Add or update a review (LOGIN REQUIRED)
    @PostMapping
    public ReviewResponse addOrUpdate(@Valid @RequestBody CreateReviewRequest request) {
        return service.addOrUpdateReview(request);
    }

    // Get all reviews for a place (PUBLIC)
    @GetMapping("/place/{placeId}")
    public List<ReviewResponse> getForPlace(@PathVariable Long placeId) {
        return service.getReviewsForPlace(placeId);
    }

    // Get average rating (PUBLIC)
    @GetMapping("/place/{placeId}/average")
    public double getAverage(@PathVariable Long placeId) {
        return service.getAverageRating(placeId);
    }
}
