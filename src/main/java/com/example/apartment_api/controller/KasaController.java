package com.example.apartment_api.controller;

import com.example.apartment_api.dto.KasaRequestDto;
import com.example.apartment_api.dto.KasaResponseDto;
import com.example.apartment_api.service.KasaService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/kasa")
public class KasaController {

    private final KasaService kasaService;

    public KasaController(KasaService kasaService) {
        this.kasaService = kasaService;
    }

    @GetMapping
    public List<KasaResponseDto> getAll() {
        return kasaService.getAllActive();
    }

    @GetMapping("/{id}")
    public KasaResponseDto getById(@PathVariable UUID id) {
        return kasaService.getById(id);
    }

    @PostMapping
    public KasaResponseDto create(@Valid @RequestBody KasaRequestDto dto) {
        return kasaService.create(dto);
    }

    @PutMapping("/{id}")
    public KasaResponseDto update(@PathVariable UUID id,
                                  @Valid @RequestBody KasaRequestDto dto) {
        return kasaService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        kasaService.delete(id);
    }

}
