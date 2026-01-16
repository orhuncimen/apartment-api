package com.example.apartment_api.service;

import com.example.apartment_api.dto.DaireRequestDto;
import com.example.apartment_api.dto.DaireResponseDto;
import com.example.apartment_api.entity.AppUser;
import com.example.apartment_api.entity.Daire;
import com.example.apartment_api.exception.BusinessException;
import com.example.apartment_api.exception.ResourceNotFoundException;
import com.example.apartment_api.repository.AppUserRepository;
import com.example.apartment_api.repository.DaireRepository;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class DaireService {

    private final DaireRepository daireRepository;
    private final AppUserRepository appUserRepository;

    public DaireService(DaireRepository daireRepository, AppUserRepository appUserRepository) {
        this.daireRepository = daireRepository;
        this.appUserRepository = appUserRepository;
    }

    // GET ALL
    public List<DaireResponseDto> getAllActive() {
        return daireRepository.findByDeletedFalse()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // GET BY ID
    public DaireResponseDto getById(UUID id) {
        Daire daire = getEntityById(id);
        return mapToResponse(daire);
    }

    // GET BY USERID (kullanıcıya bağlı daireler)
    public List<DaireResponseDto> getByUserId(UUID userid) {
        return daireRepository.findByUserIdAndDeletedFalse(userid)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // CREATE
    public DaireResponseDto create(@Valid DaireRequestDto dto) {

        if (daireRepository.existsByDairenoAndDeletedFalse(dto.getDaireno())) {
            throw new BusinessException("daireno zaten kayıtlı");
        }

        AppUser user = appUserRepository.findByIdAndDeletedFalse(dto.getUserid())
                .orElseThrow(() -> new BusinessException("userid geçersiz (aktif kullanıcı bulunamadı)"));

        Daire daire = new Daire();
        daire.setDaireno(dto.getDaireno());
        daire.setUser(user);
        daire.setCreatedate(LocalDateTime.now());
        daire.setDeleted(false);

        Daire saved = daireRepository.save(daire);
        return mapToResponse(saved);
    }

    // UPDATE
    public DaireResponseDto update(UUID id, @Valid DaireRequestDto dto) {
        Daire daire = getEntityById(id);

        if (daireRepository.existsByDairenoAndDeletedFalseAndIdNot(dto.getDaireno(), id)) {
            throw new BusinessException("daireno başka bir daireye ait");
        }

        AppUser user = appUserRepository.findByIdAndDeletedFalse(dto.getUserid())
                .orElseThrow(() -> new BusinessException("userid geçersiz (aktif kullanıcı bulunamadı)"));

        daire.setDaireno(dto.getDaireno());
        daire.setUser(user);
        daire.setUpdatedate(LocalDateTime.now());

        Daire updated = daireRepository.save(daire);
        return mapToResponse(updated);
    }

    // DELETE (soft)
    public void delete(UUID id) {
        Daire daire = getEntityById(id);

        daire.setDeleted(true);
        daire.setEnddate(LocalDateTime.now());

        daireRepository.save(daire);
    }

    // ============
    // helpers
    // ============
    private Daire getEntityById(UUID id) {
        return daireRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Daire not found"));
    }

    private DaireResponseDto mapToResponse(Daire daire) {
        DaireResponseDto dto = new DaireResponseDto();
        dto.setId(daire.getId());
        dto.setDaireno(daire.getDaireno());
        dto.setUserid(daire.getUser() != null ? daire.getUser().getId() : null);
        return dto;
    }
}
