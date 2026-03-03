package com.CommunityMaps.FindPlaces.service;

import com.CommunityMaps.FindPlaces.dto.CreateReviewRequest;
import com.CommunityMaps.FindPlaces.dto.ReviewResponse;
import com.CommunityMaps.FindPlaces.entity.FindPlaces;
import com.CommunityMaps.FindPlaces.entity.PlaceReview;
import com.CommunityMaps.FindPlaces.repository.FindPlacesRepository;
import com.CommunityMaps.FindPlaces.repository.PlaceReviewRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewServiceImpl implements ReviewService {
    private final PlaceReviewRepository reviewRepo;
    private final FindPlacesRepository placesRepo;

    public ReviewServiceImpl(PlaceReviewRepository reviewRepo, FindPlacesRepository placesRepo) {
        this.reviewRepo = reviewRepo;
        this.placesRepo = placesRepo;
    }

    @Override
    public ReviewResponse addOrUpdateReview(CreateReviewRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        FindPlaces place = placesRepo.findById(request.getPlaceId())
                .orElseThrow(() -> new IllegalArgumentException("Place not found"));

        PlaceReview review = reviewRepo
                .findByPlaceIdAndUsername(place.getId(), username)
                .orElseGet(PlaceReview::new);

        review.setPlace(place);
        review.setUsername(username);
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        PlaceReview saved = reviewRepo.save(review);

        return new ReviewResponse(saved.getId(), saved.getUsername(), saved.getRating(), saved.getComment());
    }

    @Override
    public List<ReviewResponse> getReviewsForPlace(Long placeId) {
        return reviewRepo.findByPlaceId(placeId)
                .stream()
                .map(r -> new ReviewResponse(r.getId(), r.getUsername(), r.getRating(), r.getComment()))
                .toList();
    }

    @Override
    public double getAverageRating(Long placeId) {
        List<PlaceReview> reviews = reviewRepo.findByPlaceId(placeId);
        if (reviews.isEmpty()) return 0.0;
        double sum = reviews.stream().mapToInt(PlaceReview::getRating).sum();
        return sum / reviews.size();
    }

    @Override
    public long getReviewCount(Long placeId) {
        return reviewRepo.countByPlaceId(placeId);
    }


}
