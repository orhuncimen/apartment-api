package com.example.apartment_api.controller;

import com.example.apartment_api.dto.CustomerRequestDto;
import com.example.apartment_api.dto.CustomerResponseDto;
import com.example.apartment_api.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    // GET ALL → Response DTO
    @GetMapping
    public List<CustomerResponseDto> getAll() {
        return customerService.getAllActiveCustomers();
    }

    // GET BY ID → Response DTO
    @GetMapping("/{id}")
    public CustomerResponseDto getById(@PathVariable UUID id) {
        return customerService.getById(id);
    }

    // CREATE
    @PostMapping
    public CustomerResponseDto create(
            @Valid @RequestBody CustomerRequestDto dto) {
        return customerService.create(dto);
    }

    // UPDATE
    @PutMapping("/{id}")
    public CustomerResponseDto update(
            @PathVariable UUID id,
            @Valid @RequestBody CustomerRequestDto dto) {
        return customerService.update(id, dto);
    }

    // DELETE (soft)
    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        customerService.delete(id);
    }
}
