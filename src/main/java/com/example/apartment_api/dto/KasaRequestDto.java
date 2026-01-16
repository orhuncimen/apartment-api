package com.example.apartment_api.dto;

import jakarta.validation.constraints.NotNull;

public class KasaRequestDto {

    @NotNull(message = "years cannot be null")
    private Integer years;

    public Integer getYears() { return years; }
    public void setYears(Integer years) { this.years = years; }
}
