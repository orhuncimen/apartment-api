package com.example.apartment_api.repository;

import com.example.apartment_api.entity.AppRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AppRoleRepository extends JpaRepository<AppRole, UUID> {

    List<AppRole> findByDeletedFalse();

    Optional<AppRole> findByIdAndDeletedFalse(UUID id);

    boolean existsByCodeAndDeletedFalse(String code);

    boolean existsByCodeAndDeletedFalseAndIdNot(String code, UUID id);
}
