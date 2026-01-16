package com.example.apartment_api.repository;

import com.example.apartment_api.entity.Kasa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface KasaRepository extends JpaRepository<Kasa, UUID> {

    List<Kasa> findByDeletedFalse();

    Optional<Kasa> findByIdAndDeletedFalse(UUID id);

    boolean existsByYearsAndDeletedFalse(Integer years);

    boolean existsByYearsAndDeletedFalseAndIdNot(Integer years, UUID id);
}
