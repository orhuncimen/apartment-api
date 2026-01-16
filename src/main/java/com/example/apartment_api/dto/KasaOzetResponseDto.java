package com.example.apartment_api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class KasaOzetResponseDto {

    private UUID kasaid;
    private BigDecimal totalIn;
    private BigDecimal totalOut;
    private BigDecimal balance;
    private long hareketCount;
    private long inCount;
    private long outCount;

    // ✅ EKSİK OLAN ALAN
    private LocalDateTime lastTransactionDate;

    public UUID getKasaid() { return kasaid; }
    public void setKasaid(UUID kasaid) { this.kasaid = kasaid; }

    public BigDecimal getTotalIn() { return totalIn; }
    public void setTotalIn(BigDecimal totalIn) { this.totalIn = totalIn; }

    public BigDecimal getTotalOut() { return totalOut; }
    public void setTotalOut(BigDecimal totalOut) { this.totalOut = totalOut; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }

    public long getHareketCount() { return hareketCount; }
    public void setHareketCount(long hareketCount) { this.hareketCount = hareketCount; }

    public long getInCount() { return inCount; }
    public void setInCount(long inCount) { this.inCount = inCount; }

    public long getOutCount() { return outCount; }
    public void setOutCount(long outCount) { this.outCount = outCount; }

    public LocalDateTime getLastTransactionDate() {
        return lastTransactionDate;
    }

    public void setLastTransactionDate(LocalDateTime lastTransactionDate) {
        this.lastTransactionDate = lastTransactionDate;
    }
}
