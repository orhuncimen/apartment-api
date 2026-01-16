package com.example.apartment_api.controller;

import com.example.apartment_api.dto.DuyuruRequestDto;
import com.example.apartment_api.dto.DuyuruResponseDto;
import com.example.apartment_api.service.DuyuruService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/duyurular")
public class DuyuruController {

    private final DuyuruService service;

    public DuyuruController(DuyuruService service) {
        this.service = service;
    }

    @GetMapping
    public List<DuyuruResponseDto> getAll() {
        return service.getAllActive();
    }

    @GetMapping("/{id}")
    public DuyuruResponseDto getById(@PathVariable UUID id) {
        return service.getById(id);
    }

    @GetMapping("/active")
    public List<DuyuruResponseDto> getActive() {
        return service.getActiveAnnouncements();
    }

    @PostMapping
    public DuyuruResponseDto create(@Valid @RequestBody DuyuruRequestDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public DuyuruResponseDto update(
            @PathVariable UUID id,
            @Valid @RequestBody DuyuruRequestDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
