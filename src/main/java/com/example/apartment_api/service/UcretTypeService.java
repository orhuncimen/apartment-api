package com.example.apartment_api.service;

import com.example.apartment_api.dto.UcretTypeRequestDto;
import com.example.apartment_api.dto.UcretTypeResponseDto;
import com.example.apartment_api.entity.UcretType;
import com.example.apartment_api.exception.BusinessException;
import com.example.apartment_api.exception.ResourceNotFoundException;
import com.example.apartment_api.repository.UcretTypeRepository;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class UcretTypeService {

    private final UcretTypeRepository ucretTypeRepository;

    public UcretTypeService(UcretTypeRepository ucretTypeRepository) {
        this.ucretTypeRepository = ucretTypeRepository;
    }

    // GET ALL
    public List<UcretTypeResponseDto> getAllActive() {
        return ucretTypeRepository.findByDeletedFalse()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // GET BY ID
    public UcretTypeResponseDto getById(UUID id) {
        UcretType entity = getEntityById(id);
        return mapToResponse(entity);
    }

    // CREATE
    public UcretTypeResponseDto create(@Valid UcretTypeRequestDto dto) {

        if (ucretTypeRepository.existsByCodeAndDeletedFalse(dto.getCode())) {
            throw new BusinessException("Bu code zaten tanımlı");
        }

        UcretType type = new UcretType();
        type.setCode(dto.getCode());
        type.setAciklama(dto.getAciklama());
        type.setCreatedate(LocalDateTime.now());
        type.setDeleted(false);

        UcretType saved = ucretTypeRepository.save(type);
        return mapToResponse(saved);
    }

    // UPDATE
    public UcretTypeResponseDto update(UUID id, @Valid UcretTypeRequestDto dto) {
        UcretType type = getEntityById(id);

        if (ucretTypeRepository.existsByCodeAndDeletedFalseAndIdNot(dto.getCode(), id)) {
            throw new BusinessException("Bu code başka bir kayıt tarafından kullanılıyor");
        }

        type.setCode(dto.getCode());
        type.setAciklama(dto.getAciklama());
        type.setUpdatedate(LocalDateTime.now());

        UcretType updated = ucretTypeRepository.save(type);
        return mapToResponse(updated);
    }

    // DELETE (soft)
    public void delete(UUID id) {
        UcretType type = getEntityById(id);

        type.setDeleted(true);
        type.setEnddate(LocalDateTime.now());

        ucretTypeRepository.save(type);
    }

    // ============
    // helpers
    // ============
    private UcretType getEntityById(UUID id) {
        return ucretTypeRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("UcretType not found"));
    }

    private UcretTypeResponseDto mapToResponse(UcretType entity) {
        UcretTypeResponseDto dto = new UcretTypeResponseDto();
        dto.setId(entity.getId());
        dto.setCode(entity.getCode());
        dto.setAciklama(entity.getAciklama());
        return dto;
    }
}
