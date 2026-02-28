package com.CommunityMaps.FindPlaces.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class RegisterRequest {

    // getters & setters
    @NotBlank
    private String username;

    @NotBlank
    private String password;

}