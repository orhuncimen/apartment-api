package com.example.apartment_api.controller;

import com.example.apartment_api.dto.KasaAylikOzetResponseDto;
import com.example.apartment_api.dto.KasaHareketRequestDto;
import com.example.apartment_api.dto.KasaHareketResponseDto;
import com.example.apartment_api.dto.KasaOzetResponseDto;
import com.example.apartment_api.service.KasaHareketService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/kasa-hareket")
public class KasaHareketController {

    private final KasaHareketService service;

    public KasaHareketController(KasaHareketService service) {
        this.service = service;
    }

    @GetMapping("/kasa/{kasaid}")
    public List<KasaHareketResponseDto> getByKasa(@PathVariable UUID kasaid) {
        return service.getByKasa(kasaid);
    }

    @PostMapping
    public KasaHareketResponseDto create(@Valid @RequestBody KasaHareketRequestDto dto) {
        return service.create(dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }

    @GetMapping("/kasa/{kasaid}/summary")
    public KasaOzetResponseDto getSummary(@PathVariable UUID kasaid) {
        return service.getSummary(kasaid);
    }

    @GetMapping("/kasa/{kasaid}/monthly-summary")
    public KasaAylikOzetResponseDto getMonthlySummary(
            @PathVariable UUID kasaid,
            @RequestParam int year,
            @RequestParam int month
    ) {
        return service.getMonthlySummary(kasaid, year, month);
    }
}
