package com.CommunityMaps.FindPlaces.controller.admin;

import com.CommunityMaps.FindPlaces.dto.EditRequestResponse;
import com.CommunityMaps.FindPlaces.dto.PlaceResponse;
import com.CommunityMaps.FindPlaces.service.FindPlacesService;
import com.CommunityMaps.FindPlaces.service.PlaceEditService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/places")
@CrossOrigin(origins = "*")
public class AdminPlacesController {

    private final FindPlacesService service;
    private final PlaceEditService editService;


    public AdminPlacesController(FindPlacesService service, PlaceEditService editService) {
        this.service = service;
        this.editService = editService;
    }

    // Get all pending places
    @GetMapping("/pending")
    public List<PlaceResponse> getPendingPlaces() {
        return service.getPendingPlaces();
    }

    // Approve a place
    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approvePlace(@PathVariable Long id) {
        service.approvePlace(id);
        return ResponseEntity.ok("Place approved");
    }

    // Reject a place
    @PostMapping("/{id}/reject")
    public void rejectPlace(@PathVariable Long id) {
        service.rejectPlace(id);
    }

    @GetMapping("/edits/pending")
    public List<EditRequestResponse> getPendingEdits() {
        return editService.getPendingEdits();
    }

    @PostMapping("/edits/{id}/approve")
    public void approveEdit(@PathVariable Long id) {
        editService.approveEdit(id);
    }

    @PostMapping("/edits/{id}/reject")
    public void rejectEdit(@PathVariable Long id) {
        editService.rejectEdit(id);
    }

    @DeleteMapping("/{id}")
    public void softDeletePlace(@PathVariable Long id) {
        service.softDeletePlace(id);
    }
}