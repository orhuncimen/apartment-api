package com.example.apartment_api.service;

import com.example.apartment_api.dto.StatusCountResponseDto;
import com.example.apartment_api.dto.YapilacakRequestDto;
import com.example.apartment_api.dto.YapilacakResponseDto;
import com.example.apartment_api.entity.Yapilacak;
import com.example.apartment_api.enums.YapilacakStatus;
import com.example.apartment_api.exception.ResourceNotFoundException;
import com.example.apartment_api.repository.YapilacakRepository;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;
import java.util.EnumMap;
import java.util.Map;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class YapilacakService {

    private final YapilacakRepository repository;

    public YapilacakService(YapilacakRepository repository) {
        this.repository = repository;
    }

    public List<YapilacakResponseDto> getAllActive() {
        return repository.findByDeletedFalse()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public YapilacakResponseDto getById(UUID id) {
        return mapToResponse(getEntity(id));
    }

    public YapilacakResponseDto create(@Valid YapilacakRequestDto dto) {
        Yapilacak y = new Yapilacak();
        y.setType(dto.getType());
        y.setAciklama(dto.getAciklama());
        y.setExpiredate(dto.getExpiredate());
        y.setStatus(dto.getStatus());
        y.setCreatedate(LocalDateTime.now());
        y.setDeleted(false);

        return mapToResponse(repository.save(y));
    }

    public YapilacakResponseDto update(UUID id, @Valid YapilacakRequestDto dto) {
        Yapilacak y = getEntity(id);

        y.setType(dto.getType());
        y.setAciklama(dto.getAciklama());
        y.setExpiredate(dto.getExpiredate());
        y.setStatus(dto.getStatus());
        y.setUpdatedate(LocalDateTime.now());

        return mapToResponse(repository.save(y));
    }

    public void delete(UUID id) {
        Yapilacak y = getEntity(id);
        y.setDeleted(true);
        y.setEnddate(LocalDateTime.now());
        repository.save(y);
    }

    // expire geçmemiş yapılacaklar
    public List<YapilacakResponseDto> getNotExpired() {
        return repository.findByDeletedFalseAndExpiredateAfter(LocalDateTime.now())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // status’a göre liste
    public List<YapilacakResponseDto> getByStatus(YapilacakStatus status) {
        return repository.findByDeletedFalseAndStatus(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private Yapilacak getEntity(UUID id) {
        return repository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Yapilacak not found"));
    }

    private YapilacakResponseDto mapToResponse(Yapilacak y) {
        YapilacakResponseDto dto = new YapilacakResponseDto();
        dto.setId(y.getId());
        dto.setType(y.getType());
        dto.setAciklama(y.getAciklama());
        dto.setExpiredate(y.getExpiredate());
        dto.setStatus(y.getStatus());
        return dto;
    }

    public Map<YapilacakStatus, Long> getStatusCount() {

        // default 0'larla başlat
        Map<YapilacakStatus, Long> result = new EnumMap<>(YapilacakStatus.class);
        for (YapilacakStatus s : YapilacakStatus.values()) {
            result.put(s, 0L);
        }

        // db'den gelenleri overwrite et
        List<StatusCountResponseDto> list = repository.countByStatus();
        for (StatusCountResponseDto row : list) {
            result.put(row.getStatus(), row.getCount());
        }

        return result;
    }

    public Map<YapilacakStatus, Long> getActiveStatusCount() {

        // tüm statüler 0 ile başlasın
        Map<YapilacakStatus, Long> result = new EnumMap<>(YapilacakStatus.class);
        for (YapilacakStatus status : YapilacakStatus.values()) {
            result.put(status, 0L);
        }

        // db'den gelen aktif sayılar
        List<StatusCountResponseDto> list = repository.countActiveByStatus();
        for (StatusCountResponseDto row : list) {
            result.put(row.getStatus(), row.getCount());
        }

        return result;
    }
}
