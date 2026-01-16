package com.example.apartment_api.service;

import com.example.apartment_api.dto.DuyuruRequestDto;
import com.example.apartment_api.dto.DuyuruResponseDto;
import com.example.apartment_api.entity.Duyuru;
import com.example.apartment_api.exception.ResourceNotFoundException;
import com.example.apartment_api.repository.DuyuruRepository;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class DuyuruService {

    private final DuyuruRepository repository;

    public DuyuruService(DuyuruRepository repository) {
        this.repository = repository;
    }

    // GET ALL (aktif)
    public List<DuyuruResponseDto> getAllActive() {
        return repository.findByDeletedFalse()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // GET BY ID
    public DuyuruResponseDto getById(UUID id) {
        return mapToResponse(getEntity(id));
    }

    // CREATE
    public DuyuruResponseDto create(@Valid DuyuruRequestDto dto) {
        Duyuru d = new Duyuru();
        d.setType(dto.getType());
        d.setAciklama(dto.getAciklama());
        d.setExpiredate(dto.getExpiredate());
        d.setCreatedate(LocalDateTime.now());
        d.setDeleted(false);

        return mapToResponse(repository.save(d));
    }

    // UPDATE
    public DuyuruResponseDto update(UUID id, @Valid DuyuruRequestDto dto) {
        Duyuru d = getEntity(id);

        d.setType(dto.getType());
        d.setAciklama(dto.getAciklama());
        d.setExpiredate(dto.getExpiredate());
        d.setUpdatedate(LocalDateTime.now());

        return mapToResponse(repository.save(d));
    }

    // DELETE (soft)
    public void delete(UUID id) {
        Duyuru d = getEntity(id);
        d.setDeleted(true);
        d.setEnddate(LocalDateTime.now());
        repository.save(d);
    }

    // sadece süresi geçmemiş duyurular
    public List<DuyuruResponseDto> getActiveAnnouncements() {
        return repository.findByDeletedFalseAndExpiredateAfter(LocalDateTime.now())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ======================
    private Duyuru getEntity(UUID id) {
        return repository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Duyuru not found"));
    }

    private DuyuruResponseDto mapToResponse(Duyuru d) {
        DuyuruResponseDto dto = new DuyuruResponseDto();
        dto.setId(d.getId());
        dto.setType(d.getType());
        dto.setAciklama(d.getAciklama());
        dto.setExpiredate(d.getExpiredate());
        return dto;
    }
}
