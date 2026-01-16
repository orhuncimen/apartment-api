package com.example.apartment_api.service;

import com.example.apartment_api.dto.AppUserRequestDto;
import com.example.apartment_api.dto.AppUserResponseDto;
import com.example.apartment_api.entity.AppRole;
import com.example.apartment_api.entity.AppUser;
import com.example.apartment_api.entity.Customer;
import com.example.apartment_api.exception.BusinessException;
import com.example.apartment_api.exception.ResourceNotFoundException;
import com.example.apartment_api.repository.AppRoleRepository;
import com.example.apartment_api.repository.AppUserRepository;
import com.example.apartment_api.repository.CustomerRepository;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AppUserService {

    private final AppUserRepository appUserRepository;
    private final CustomerRepository customerRepository;
    private final AppRoleRepository appRoleRepository;

    public AppUserService(AppUserRepository appUserRepository,
                          CustomerRepository customerRepository,
                          AppRoleRepository appRoleRepository) {
        this.appUserRepository = appUserRepository;
        this.customerRepository = customerRepository;
        this.appRoleRepository = appRoleRepository;
    }

    // GET ALL
    public List<AppUserResponseDto> getAllActive() {
        return appUserRepository.findByDeletedFalse()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // GET BY ID
    public AppUserResponseDto getById(UUID id) {
        AppUser user = getEntityById(id);
        return mapToResponse(user);
    }

    // CREATE
    public AppUserResponseDto create(@Valid AppUserRequestDto dto) {

        if (appUserRepository.existsByUsernameAndDeletedFalse(dto.getUsername())) {
            throw new BusinessException("username zaten kayıtlı");
        }

        Customer customer = customerRepository.findByIdAndDeletedFalse(dto.getCustomerId())
                .orElseThrow(() -> new BusinessException("customerId geçersiz (aktif müşteri bulunamadı)"));

        AppRole role = appRoleRepository.findByIdAndDeletedFalse(dto.getRoleId())
                .orElseThrow(() -> new BusinessException("roleId geçersiz (aktif rol bulunamadı)"));

        AppUser user = new AppUser();
        user.setUsername(dto.getUsername());
        user.setPassword(dto.getPassword()); // şimdilik plain, sonra hash’leriz
        user.setCustomer(customer);
        user.setRole(role);
        user.setCreatedate(LocalDateTime.now());
        user.setDeleted(false);

        AppUser saved = appUserRepository.save(user);
        return mapToResponse(saved);
    }

    // UPDATE
    public AppUserResponseDto update(UUID id, @Valid AppUserRequestDto dto) {
        AppUser user = getEntityById(id);

        if (appUserRepository.existsByUsernameAndDeletedFalseAndIdNot(dto.getUsername(), id)) {
            throw new BusinessException("username başka bir kullanıcıya ait");
        }

        Customer customer = customerRepository.findByIdAndDeletedFalse(dto.getCustomerId())
                .orElseThrow(() -> new BusinessException("customerId geçersiz (aktif müşteri bulunamadı)"));

        AppRole role = appRoleRepository.findByIdAndDeletedFalse(dto.getRoleId())
                .orElseThrow(() -> new BusinessException("roleId geçersiz (aktif rol bulunamadı)"));

        user.setUsername(dto.getUsername());
        user.setPassword(dto.getPassword());
        user.setCustomer(customer);
        user.setRole(role);
        user.setUpdatedate(LocalDateTime.now());

        AppUser updated = appUserRepository.save(user);
        return mapToResponse(updated);
    }

    // DELETE (soft)
    public void delete(UUID id) {
        AppUser user = getEntityById(id);
        user.setDeleted(true);
        user.setEnddate(LocalDateTime.now());
        appUserRepository.save(user);
    }

    // ==============
    // Private helpers
    // ==============
    private AppUser getEntityById(UUID id) {
        return appUserRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private AppUserResponseDto mapToResponse(AppUser user) {
        AppUserResponseDto dto = new AppUserResponseDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setCustomerId(user.getCustomer() != null ? user.getCustomer().getId() : null);
        dto.setRoleId(user.getRole() != null ? user.getRole().getId() : null);
        return dto;
    }
}
