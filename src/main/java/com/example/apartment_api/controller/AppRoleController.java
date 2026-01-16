package com.example.apartment_api.controller;

import com.example.apartment_api.dto.AppRoleRequestDto;
import com.example.apartment_api.dto.AppRoleResponseDto;
import com.example.apartment_api.service.AppRoleService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/roles")
public class AppRoleController {

    private final AppRoleService appRoleService;

    public AppRoleController(AppRoleService appRoleService) {
        this.appRoleService = appRoleService;
    }

    @GetMapping
    public List<AppRoleResponseDto> getAll() {
        return appRoleService.getAllActive();
    }

    @GetMapping("/{id}")
    public AppRoleResponseDto getById(@PathVariable UUID id) {
        return appRoleService.getById(id);
    }

    @PostMapping
    public AppRoleResponseDto create(@Valid @RequestBody AppRoleRequestDto dto) {
        return appRoleService.create(dto);
    }

    @PutMapping("/{id}")
    public AppRoleResponseDto update(@PathVariable UUID id,
                                     @Valid @RequestBody AppRoleRequestDto dto) {
        return appRoleService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        appRoleService.delete(id);
    }
}
