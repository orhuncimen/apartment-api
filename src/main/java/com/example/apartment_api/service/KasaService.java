package com.example.apartment_api.service;

import com.example.apartment_api.dto.KasaRequestDto;
import com.example.apartment_api.dto.KasaResponseDto;
import com.example.apartment_api.entity.Kasa;
import com.example.apartment_api.exception.BusinessException;
import com.example.apartment_api.exception.ResourceNotFoundException;
import com.example.apartment_api.repository.KasaRepository;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class KasaService {

    private final KasaRepository kasaRepository;

    public KasaService(KasaRepository kasaRepository) {
        this.kasaRepository = kasaRepository;
    }

    public List<KasaResponseDto> getAllActive() {
        return kasaRepository.findByDeletedFalse()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public KasaResponseDto getById(UUID id) {
        Kasa kasa = getEntityById(id);
        return mapToResponse(kasa);
    }

    public KasaResponseDto create(@Valid KasaRequestDto dto) {

        if (kasaRepository.existsByYearsAndDeletedFalse(dto.getYears())) {
            throw new BusinessException("Bu yıl için kasa zaten mevcut");
        }

        Kasa kasa = new Kasa();
        kasa.setYears(dto.getYears());
        kasa.setCreatedate(LocalDateTime.now());
        kasa.setDeleted(false);

        Kasa saved = kasaRepository.save(kasa);
        return mapToResponse(saved);
    }

    public KasaResponseDto update(UUID id, @Valid KasaRequestDto dto) {
        Kasa kasa = getEntityById(id);

        if (kasaRepository.existsByYearsAndDeletedFalseAndIdNot(dto.getYears(), id)) {
            throw new BusinessException("Bu yıl başka bir kasa tarafından kullanılıyor");
        }

        kasa.setYears(dto.getYears());
        kasa.setUpdatedate(LocalDateTime.now());

        Kasa updated = kasaRepository.save(kasa);
        return mapToResponse(updated);
    }

    public void delete(UUID id) {
        Kasa kasa = getEntityById(id);

        kasa.setDeleted(true);
        kasa.setEnddate(LocalDateTime.now());

        kasaRepository.save(kasa);
    }

    // ============
    // helpers
    // ============
    private Kasa getEntityById(UUID id) {
        return kasaRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kasa not found"));
    }

    private KasaResponseDto mapToResponse(Kasa kasa) {
        KasaResponseDto dto = new KasaResponseDto();
        dto.setId(kasa.getId());
        dto.setYears(kasa.getYears());
        return dto;
    }
}
