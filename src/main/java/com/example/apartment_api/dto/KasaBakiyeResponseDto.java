package com.example.apartment_api.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class KasaBakiyeResponseDto {

    private UUID kasaid;
    private BigDecimal totalIn;
    private BigDecimal totalOut;
    private BigDecimal balance;

    public UUID getKasaid() { return kasaid; }
    public void setKasaid(UUID kasaid) { this.kasaid = kasaid; }

    public BigDecimal getTotalIn() { return totalIn; }
    public void setTotalIn(BigDecimal totalIn) { this.totalIn = totalIn; }

    public BigDecimal getTotalOut() { return totalOut; }
    public void setTotalOut(BigDecimal totalOut) { this.totalOut = totalOut; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
}
