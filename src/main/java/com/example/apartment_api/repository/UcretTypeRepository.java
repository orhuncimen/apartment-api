package com.example.apartment_api.repository;

import com.example.apartment_api.entity.UcretType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UcretTypeRepository extends JpaRepository<UcretType, UUID> {

    List<UcretType> findByDeletedFalse();

    Optional<UcretType> findByIdAndDeletedFalse(UUID id);

    boolean existsByCodeAndDeletedFalse(String code);

    boolean existsByCodeAndDeletedFalseAndIdNot(String code, UUID id);
}
