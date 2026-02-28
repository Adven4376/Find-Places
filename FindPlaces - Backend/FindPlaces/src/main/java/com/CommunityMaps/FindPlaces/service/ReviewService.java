package com.CommunityMaps.FindPlaces.service;

import com.CommunityMaps.FindPlaces.dto.CreateReviewRequest;
import com.CommunityMaps.FindPlaces.dto.ReviewResponse;

import java.util.List;

public interface ReviewService {
    ReviewResponse addOrUpdateReview(CreateReviewRequest request);
    List<ReviewResponse> getReviewsForPlace(Long placeId);
    double getAverageRating(Long placeId);
}
