package com.CommunityMaps.FindPlaces.service;

import com.CommunityMaps.FindPlaces.dto.EditRequestResponse;
import com.CommunityMaps.FindPlaces.dto.SuggestEditRequest;

import java.util.List;

public interface PlaceEditService {

    void suggestEdit(Long placeId, SuggestEditRequest request);

    List<EditRequestResponse> getPendingEdits();

    void approveEdit(Long editRequestId);

    void rejectEdit(Long editRequestId);
}
