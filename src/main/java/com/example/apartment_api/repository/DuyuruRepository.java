package com.example.apartment_api.repository;

import com.example.apartment_api.entity.Duyuru;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DuyuruRepository extends JpaRepository<Duyuru, UUID> {

    List<Duyuru> findByDeletedFalse();

    Optional<Duyuru> findByIdAndDeletedFalse(UUID id);

    // süresi geçmemiş duyurular
    List<Duyuru> findByDeletedFalseAndExpiredateAfter(LocalDateTime now);
}
