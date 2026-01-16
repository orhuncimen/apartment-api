package com.example.apartment_api.dto;

import java.util.UUID;

public class KasaResponseDto {

    private UUID id;
    private Integer years;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Integer getYears() { return years; }
    public void setYears(Integer years) { this.years = years; }
}
