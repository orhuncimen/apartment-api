package com.example.apartment_api.controller;

import com.example.apartment_api.dto.YapilacakRequestDto;
import com.example.apartment_api.dto.YapilacakResponseDto;
import com.example.apartment_api.enums.YapilacakStatus;
import com.example.apartment_api.service.YapilacakService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import java.util.Map;

@RestController
@RequestMapping("/api/yapilacaklar")
public class YapilacakController {

    private final YapilacakService service;

    public YapilacakController(YapilacakService service) {
        this.service = service;
    }

    @GetMapping
    public List<YapilacakResponseDto> getAll() {
        return service.getAllActive();
    }

    @GetMapping("/{id}")
    public YapilacakResponseDto getById(@PathVariable UUID id) {
        return service.getById(id);
    }

    @GetMapping("/not-expired")
    public List<YapilacakResponseDto> getNotExpired() {
        return service.getNotExpired();
    }

    @GetMapping("/status/{status}")
    public List<YapilacakResponseDto> getByStatus(@PathVariable YapilacakStatus status) {
        return service.getByStatus(status);
    }

    @PostMapping
    public YapilacakResponseDto create(@Valid @RequestBody YapilacakRequestDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public YapilacakResponseDto update(@PathVariable UUID id,
                                       @Valid @RequestBody YapilacakRequestDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }

    @GetMapping("/status-count")
    public Map<YapilacakStatus, Long> getStatusCount() {
        return service.getStatusCount();
    }

    @GetMapping("/status-count/active")
    public Map<YapilacakStatus, Long> getActiveStatusCount() {
        return service.getActiveStatusCount();
    }
}
