package com.example.apartment_api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class KasaGunlukOzetDto {

    private LocalDate date;
    private BigDecimal totalIn;
    private BigDecimal totalOut;

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public BigDecimal getTotalIn() { return totalIn; }
    public void setTotalIn(BigDecimal totalIn) { this.totalIn = totalIn; }

    public BigDecimal getTotalOut() { return totalOut; }
    public void setTotalOut(BigDecimal totalOut) { this.totalOut = totalOut; }
}
