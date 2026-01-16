package com.example.apartment_api.controller;

import com.example.apartment_api.dto.AppUserRequestDto;
import com.example.apartment_api.dto.AppUserResponseDto;
import com.example.apartment_api.service.AppUserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class AppUserController {

    private final AppUserService appUserService;

    public AppUserController(AppUserService appUserService) {
        this.appUserService = appUserService;
    }

    @GetMapping
    public List<AppUserResponseDto> getAll() {
        return appUserService.getAllActive();
    }

    @GetMapping("/{id}")
    public AppUserResponseDto getById(@PathVariable UUID id) {
        return appUserService.getById(id);
    }

    @PostMapping
    public AppUserResponseDto create(@Valid @RequestBody AppUserRequestDto dto) {
        return appUserService.create(dto);
    }

    @PutMapping("/{id}")
    public AppUserResponseDto update(@PathVariable UUID id,
                                     @Valid @RequestBody AppUserRequestDto dto) {
        return appUserService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        appUserService.delete(id);
    }
}
