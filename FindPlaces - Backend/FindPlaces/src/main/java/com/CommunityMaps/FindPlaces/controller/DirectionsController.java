package com.CommunityMaps.FindPlaces.controller;

import com.CommunityMaps.FindPlaces.dto.DirectionResponse;
import com.CommunityMaps.FindPlaces.service.DirectionsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/directions")
public class DirectionsController {

    private final DirectionsService service;

    public DirectionsController(DirectionsService service) {
        this.service = service;
    }

    @GetMapping
    public DirectionResponse getDirections(
            @RequestParam double fromLat,
            @RequestParam double fromLng,
            @RequestParam double toLat,
            @RequestParam double toLng,
            @RequestParam(required = false, defaultValue = "driving") String mode
    ) {
        return service.getRoute(fromLat, fromLng, toLat, toLng, mode);
    }
}
