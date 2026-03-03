package com.CommunityMaps.FindPlaces.repository;

import com.CommunityMaps.FindPlaces.entity.FindPlaces;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FindPlacesRepository extends JpaRepository<FindPlaces, Long> {

    // Only approved places
    List<FindPlaces> findByStatusIgnoreCase(String status);
    Page<FindPlaces> findByCategoryIgnoreCaseAndStatusIgnoreCase(
            String category,
            String status,
            Pageable pageable
    );

    // Filter by category + status
    List<FindPlaces> findByCategoryIgnoreCaseAndStatusIgnoreCase(String category, String status);

    // manages if we have like 1,00,000 also, soft delete
    Page<FindPlaces> findByStatusIgnoreCaseAndDeletedFalse(String status, Pageable pageable);

    List<FindPlaces> findByNameContainingIgnoreCase(String name);

    // Nearby approved places using Haversine formula (distance in KM)
    @Query(value = """
        SELECT p.* FROM places p
        WHERE p.status = :status
        AND (
            6371 * acos(
                cos(radians(:lat)) * cos(radians(p.latitude)) *
                cos(radians(p.longitude) - radians(:lng)) +
                sin(radians(:lat)) * sin(radians(p.latitude))
            )
        ) < :radius
        """, nativeQuery = true)
    List<FindPlaces> findNearbyByStatus(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radius") double radius,
            @Param("status") String status
    );

    @Query(value = """
    SELECT p.* FROM places p
    WHERE p.status = :status
    AND p.category = :category
    AND (
        6371 * acos(
            cos(radians(:lat)) * cos(radians(p.latitude)) *
            cos(radians(p.longitude) - radians(:lng)) +
            sin(radians(:lat)) * sin(radians(p.latitude))
        )
    ) < :radius
    """, nativeQuery = true)
    List<FindPlaces> findNearbyByCategoryAndStatus(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radius") double radius,
            @Param("category") String category,
            @Param("status") String status
    );

    // 1) Top rated overall (only APPROVED, only places that have reviews)
    @Query(value = """
        SELECT p.*
        FROM places p
        JOIN place_reviews r ON r.place_id = p.id
        WHERE p.status = 'APPROVED'
        GROUP BY p.id
        ORDER BY AVG(r.rating) DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<FindPlaces> findTopRated(@Param("limit") int limit);

    // 2) Top rated nearby
    @Query(value = """
        SELECT p.*
        FROM places p
        JOIN place_reviews r ON r.place_id = p.id
        WHERE p.status = 'APPROVED'
          AND (6371 * acos(
                cos(radians(:lat)) * cos(radians(p.latitude)) *
                cos(radians(p.longitude) - radians(:lng)) +
                sin(radians(:lat)) * sin(radians(p.latitude))
          )) <= :radius
        GROUP BY p.id
        ORDER BY AVG(r.rating) DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<FindPlaces> findTopRatedNearby(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radius") double radius,
            @Param("limit") int limit
    );

    @Query("SELECT DISTINCT p.category FROM FindPlaces p")
    List<String> findDistinctCategories();
}