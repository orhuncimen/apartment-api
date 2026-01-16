package com.example.apartment_api.service;

import com.example.apartment_api.dto.AppRoleRequestDto;
import com.example.apartment_api.dto.AppRoleResponseDto;
import com.example.apartment_api.entity.AppRole;
import com.example.apartment_api.exception.BusinessException;
import com.example.apartment_api.exception.ResourceNotFoundException;
import com.example.apartment_api.repository.AppRoleRepository;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AppRoleService {

    private final AppRoleRepository appRoleRepository;

    public AppRoleService(AppRoleRepository appRoleRepository) {
        this.appRoleRepository = appRoleRepository;
    }

    public List<AppRoleResponseDto> getAllActive() {
        return appRoleRepository.findByDeletedFalse()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public AppRoleResponseDto getById(UUID id) {
        AppRole role = getEntityById(id);
        return mapToResponse(role);
    }

    public AppRoleResponseDto create(@Valid AppRoleRequestDto dto) {
        if (appRoleRepository.existsByCodeAndDeletedFalse(dto.getCode())) {
            throw new BusinessException("Role code zaten kayıtlı");
        }

        AppRole role = new AppRole();
        role.setCode(dto.getCode());
        role.setAciklama(dto.getAciklama());
        role.setCreatedate(LocalDateTime.now());
        role.setDeleted(false);

        AppRole saved = appRoleRepository.save(role);
        return mapToResponse(saved);
    }

    public AppRoleResponseDto update(UUID id, @Valid AppRoleRequestDto dto) {
        AppRole role = getEntityById(id);

        if (appRoleRepository.existsByCodeAndDeletedFalseAndIdNot(dto.getCode(), id)) {
            throw new BusinessException("Role code başka bir role ait");
        }

        role.setCode(dto.getCode());
        role.setAciklama(dto.getAciklama());
        role.setUpdatedate(LocalDateTime.now());

        AppRole updated = appRoleRepository.save(role);
        return mapToResponse(updated);
    }

    public void delete(UUID id) {
        AppRole role = getEntityById(id);

        role.setDeleted(true);
        role.setEnddate(LocalDateTime.now());

        appRoleRepository.save(role);
    }

    private AppRole getEntityById(UUID id) {
        return appRoleRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));
    }

    private AppRoleResponseDto mapToResponse(AppRole role) {
        AppRoleResponseDto dto = new AppRoleResponseDto();
        dto.setId(role.getId());
        dto.setCode(role.getCode());
        dto.setAciklama(role.getAciklama());
        return dto;
    }
}
