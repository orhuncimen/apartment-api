package com.example.apartment_api.repository;

import com.example.apartment_api.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AppUserRepository extends JpaRepository<AppUser, UUID> {

    List<AppUser> findByDeletedFalse();

    Optional<AppUser> findByIdAndDeletedFalse(UUID id);

    boolean existsByUsernameAndDeletedFalse(String username);

    boolean existsByUsernameAndDeletedFalseAndIdNot(String username, UUID id);
}
