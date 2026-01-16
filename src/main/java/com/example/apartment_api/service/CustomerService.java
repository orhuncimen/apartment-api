package com.example.apartment_api.service;

import com.example.apartment_api.dto.CustomerRequestDto;
import com.example.apartment_api.dto.CustomerResponseDto;
import com.example.apartment_api.entity.Customer;
import com.example.apartment_api.exception.BusinessException;
import com.example.apartment_api.exception.ResourceNotFoundException;
import com.example.apartment_api.repository.CustomerRepository;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import java.util.stream.Collectors;


@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    // ======================
    // GET ALL (DTO)
    // ======================
    public List<CustomerResponseDto> getAllActiveCustomers() {
        return customerRepository.findByDeletedFalse()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ======================
    // GET BY ID (DTO)
    // ======================
    public CustomerResponseDto getById(UUID id) {
        Customer customer = getCustomerEntityById(id);
        return mapToResponse(customer);
    }



    // ======================
    // CREATE (DTO → ENTITY → DTO)
    // ======================
    public CustomerResponseDto create(@Valid CustomerRequestDto dto) {


        if (customerRepository.existsByTelAndDeletedFalse(dto.getTel())) {
            throw new BusinessException("Telefon numarası zaten kayıtlı");
        }

        if (customerRepository.existsByEmailAndDeletedFalse(dto.getEmail())) {
            throw new BusinessException("Email adresi zaten kayıtlı");
        }


        Customer customer = mapToEntity(dto);
        customer.setCreatedate(LocalDateTime.now());
        customer.setDeleted(false);

        Customer saved = customerRepository.save(customer);
        return mapToResponse(saved);
    }

    // ======================
    // UPDATE (DTO → ENTITY → DTO)
    // ======================
    public CustomerResponseDto update(UUID id, @Valid CustomerRequestDto dto) {
        Customer customer = getCustomerEntityById(id);


        if (customerRepository.existsByTelAndDeletedFalseAndIdNot(dto.getTel(), id)) {
            throw new BusinessException("Telefon numarası başka bir müşteriye ait");
        }

        if (customerRepository.existsByEmailAndDeletedFalseAndIdNot(dto.getEmail(), id)) {
            throw new BusinessException("Email adresi başka bir müşteriye ait");
        }


        customer.setName(dto.getName());
        customer.setSurname(dto.getSurname());
        customer.setTel(dto.getTel());
        customer.setEmail(dto.getEmail());
        customer.setUpdatedate(LocalDateTime.now());

        Customer updated = customerRepository.save(customer);
        return mapToResponse(updated);
    }

    // ======================
    // DELETE (SOFT DELETE)
    // ======================
    public void delete(UUID id) {
        Customer customer = getCustomerEntityById(id);

        customer.setDeleted(true);
        customer.setEnddate(LocalDateTime.now());

        customerRepository.save(customer);
    }

    // ======================
    // PRIVATE ENTITY FETCH
    // ======================
    private Customer getCustomerEntityById(UUID id) {
        return customerRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    }

    // ======================
    // MAPPERS
    // ======================
    private CustomerResponseDto mapToResponse(Customer customer) {
        CustomerResponseDto dto = new CustomerResponseDto();
        dto.setId(customer.getId());
        dto.setName(customer.getName());
        dto.setSurname(customer.getSurname());
        dto.setTel(customer.getTel());
        dto.setEmail(customer.getEmail());
        return dto;
    }

    private Customer mapToEntity(CustomerRequestDto dto) {
        Customer customer = new Customer();
        customer.setName(dto.getName());
        customer.setSurname(dto.getSurname());
        customer.setTel(dto.getTel());
        customer.setEmail(dto.getEmail());
        return customer;
    }
}
