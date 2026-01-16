package com.example.apartment_api.repository;

import com.example.apartment_api.entity.Daire;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DaireRepository extends JpaRepository<Daire, UUID> {

    List<Daire> findByDeletedFalse();

    Optional<Daire> findByIdAndDeletedFalse(UUID id);

    boolean existsByDairenoAndDeletedFalse(String daireno);

    boolean existsByDairenoAndDeletedFalseAndIdNot(String daireno, UUID id);

    List<Daire> findByUserIdAndDeletedFalse(UUID userid);
}
