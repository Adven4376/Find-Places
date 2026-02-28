package com.CommunityMaps.FindPlaces.service;

import com.CommunityMaps.FindPlaces.dto.EditRequestResponse;
import com.CommunityMaps.FindPlaces.dto.SuggestEditRequest;
import com.CommunityMaps.FindPlaces.entity.FindPlaces;
import com.CommunityMaps.FindPlaces.entity.PlaceEditRequest;
import com.CommunityMaps.FindPlaces.repository.FindPlacesRepository;
import com.CommunityMaps.FindPlaces.repository.PlaceEditRequestRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlaceEditServiceImpl implements PlaceEditService {

    private final PlaceEditRequestRepository editRepo;
    private final FindPlacesRepository placesRepo;

    public PlaceEditServiceImpl(PlaceEditRequestRepository editRepo, FindPlacesRepository placesRepo) {
        this.editRepo = editRepo;
        this.placesRepo = placesRepo;
    }

    @Override
    public void suggestEdit(Long placeId, SuggestEditRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        FindPlaces place = placesRepo.findById(placeId)
                .orElseThrow(() -> new IllegalArgumentException("Place not found"));

        PlaceEditRequest edit = new PlaceEditRequest();
        edit.setPlace(place);
        edit.setSuggestedName(request.getName());
        edit.setSuggestedCategory(request.getCategory());
        edit.setSuggestedLatitude(request.getLatitude());
        edit.setSuggestedLongitude(request.getLongitude());
        edit.setSuggestedDescription(request.getDescription());
        edit.setSuggestedBy(username);
        edit.setStatus("PENDING");

        editRepo.save(edit);
    }

    @Override
    public List<EditRequestResponse> getPendingEdits() {
        return editRepo.findByStatusIgnoreCase("PENDING")
                .stream()
                .map(e -> new EditRequestResponse(
                        e.getId(),
                        e.getPlace().getId(),
                        e.getSuggestedBy(),
                        e.getStatus(),
                        e.getSuggestedName(),
                        e.getSuggestedCategory(),
                        e.getSuggestedLatitude(),
                        e.getSuggestedLongitude(),
                        e.getSuggestedDescription()
                ))
                .toList();
    }

    @Override
    public void approveEdit(Long editRequestId) {
        PlaceEditRequest edit = editRepo.findById(editRequestId)
                .orElseThrow(() -> new IllegalArgumentException("Edit request not found"));

        FindPlaces place = edit.getPlace();

        place.setName(edit.getSuggestedName());
        place.setCategory(edit.getSuggestedCategory());
        place.setLatitude(edit.getSuggestedLatitude());
        place.setLongitude(edit.getSuggestedLongitude());
        place.setDescription(edit.getSuggestedDescription());

        placesRepo.save(place);

        edit.setStatus("APPROVED");
        editRepo.save(edit);
    }

    @Override
    public void rejectEdit(Long editRequestId) {
        PlaceEditRequest edit = editRepo.findById(editRequestId)
                .orElseThrow(() -> new IllegalArgumentException("Edit request not found"));

        edit.setStatus("REJECTED");
        editRepo.save(edit);
    }
}
