package com.CommunityMaps.FindPlaces.auth;

import com.CommunityMaps.FindPlaces.auth.dto.AuthResponse;
import com.CommunityMaps.FindPlaces.auth.dto.LoginRequest;
import com.CommunityMaps.FindPlaces.auth.dto.RegisterRequest;
import com.CommunityMaps.FindPlaces.security.JwtService;
import com.CommunityMaps.FindPlaces.user.Role;
import com.CommunityMaps.FindPlaces.user.User;
import com.CommunityMaps.FindPlaces.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // Register
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // hash password
        user.setRole(Role.USER);
        user.setEnabled(true);

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully");
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {

        User user = userRepository.findByUsername(request.getUsername()).orElse(null);
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("Invalid username or password");
        }

        String token = jwtService.generateToken(user.getUsername(), user.getRole());
        return ResponseEntity.ok(new AuthResponse(token));
    }
}
