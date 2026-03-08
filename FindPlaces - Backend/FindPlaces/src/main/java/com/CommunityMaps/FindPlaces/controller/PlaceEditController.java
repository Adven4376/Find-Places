package com.CommunityMaps.FindPlaces.controller;

import com.CommunityMaps.FindPlaces.dto.SuggestEditRequest;
import com.CommunityMaps.FindPlaces.service.PlaceEditService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/places")
public class PlaceEditController {

    private final PlaceEditService service;

    public PlaceEditController(PlaceEditService service) {
        this.service = service;
    }

    // USER suggests edit (LOGIN REQUIRED)
    @PostMapping("/{placeId}/suggest-edit")
    public void suggestEdit(@PathVariable Long placeId,
                            @RequestBody SuggestEditRequest request) {
        service.suggestEdit(placeId, request);
    }
}
