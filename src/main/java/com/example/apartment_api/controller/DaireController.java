package com.example.apartment_api.controller;

import com.example.apartment_api.dto.DaireRequestDto;
import com.example.apartment_api.dto.DaireResponseDto;
import com.example.apartment_api.service.DaireService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/daireler")
public class DaireController {

    private final DaireService daireService;

    public DaireController(DaireService daireService) {
        this.daireService = daireService;
    }

    @GetMapping
    public List<DaireResponseDto> getAll() {
        return daireService.getAllActive();
    }

    @GetMapping("/{id}")
    public DaireResponseDto getById(@PathVariable UUID id) {
        return daireService.getById(id);
    }

    @GetMapping("/user/{userid}")
    public List<DaireResponseDto> getByUserId(@PathVariable UUID userid) {
        return daireService.getByUserId(userid);
    }

    @PostMapping
    public DaireResponseDto create(@Valid @RequestBody DaireRequestDto dto) {
        return daireService.create(dto);
    }

    @PutMapping("/{id}")
    public DaireResponseDto update(@PathVariable UUID id,
                                   @Valid @RequestBody DaireRequestDto dto) {
        return daireService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        daireService.delete(id);
    }
}
