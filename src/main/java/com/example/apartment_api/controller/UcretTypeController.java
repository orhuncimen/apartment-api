package com.example.apartment_api.controller;

import com.example.apartment_api.dto.UcretTypeRequestDto;
import com.example.apartment_api.dto.UcretTypeResponseDto;
import com.example.apartment_api.service.UcretTypeService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ucrettypes")
public class UcretTypeController {

    private final UcretTypeService ucretTypeService;

    public UcretTypeController(UcretTypeService ucretTypeService) {
        this.ucretTypeService = ucretTypeService;
    }

    @GetMapping
    public List<UcretTypeResponseDto> getAll() {
        return ucretTypeService.getAllActive();
    }

    @GetMapping("/{id}")
    public UcretTypeResponseDto getById(@PathVariable UUID id) {
        return ucretTypeService.getById(id);
    }

    @PostMapping
    public UcretTypeResponseDto create(@Valid @RequestBody UcretTypeRequestDto dto) {
        return ucretTypeService.create(dto);
    }

    @PutMapping("/{id}")
    public UcretTypeResponseDto update(@PathVariable UUID id,
                                       @Valid @RequestBody UcretTypeRequestDto dto) {
        return ucretTypeService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        ucretTypeService.delete(id);
    }
}
