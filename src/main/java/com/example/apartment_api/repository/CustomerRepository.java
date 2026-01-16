package com.example.apartment_api.repository;

import com.example.apartment_api.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CustomerRepository extends JpaRepository<Customer, UUID> {

    List<Customer> findByDeletedFalse();

    Optional<Customer> findByIdAndDeletedFalse(UUID id);

    boolean existsByTelAndDeletedFalse(String tel);

    boolean existsByEmailAndDeletedFalse(String email);

    boolean existsByTelAndDeletedFalseAndIdNot(String tel, UUID id);

    boolean existsByEmailAndDeletedFalseAndIdNot(String email, UUID id);
}
