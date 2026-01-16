package com.example.apartment_api.repository;

import com.example.apartment_api.dto.StatusCountResponseDto;
import com.example.apartment_api.entity.Yapilacak;
import com.example.apartment_api.enums.YapilacakStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface YapilacakRepository extends JpaRepository<Yapilacak, UUID> {

    List<Yapilacak> findByDeletedFalse();

    Optional<Yapilacak> findByIdAndDeletedFalse(UUID id);

    // süresi geçmemiş yapılacaklar
    List<Yapilacak> findByDeletedFalseAndExpiredateAfter(LocalDateTime now);

    // status filtreli liste
    List<Yapilacak> findByDeletedFalseAndStatus(YapilacakStatus status);

    @Query("""
    select new com.example.apartment_api.dto.StatusCountResponseDto(y.status, count(y))
    from Yapilacak y
    where y.deleted = false
    group by y.status
""")
    List<StatusCountResponseDto> countByStatus();

    @Query("""
    select new com.example.apartment_api.dto.StatusCountResponseDto(y.status, count(y))
    from Yapilacak y
    where y.deleted = false
      and y.expiredate >= CURRENT_TIMESTAMP
    group by y.status
""")
    List<StatusCountResponseDto> countActiveByStatus();
}
