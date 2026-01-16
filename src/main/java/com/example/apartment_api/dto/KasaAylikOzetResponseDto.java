package com.example.apartment_api.dto;

import java.math.BigDecimal;
import java.util.UUID;

import java.util.List;

public class KasaAylikOzetResponseDto {

    private UUID kasaid;
    private int year;
    private int month;

    private BigDecimal totalIn;
    private BigDecimal totalOut;
    private BigDecimal balance;

    private long hareketCount;
    private long inCount;
    private long outCount;

    public UUID getKasaid() { return kasaid; }
    public void setKasaid(UUID kasaid) { this.kasaid = kasaid; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public int getMonth() { return month; }
    public void setMonth(int month) { this.month = month; }

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

    private List<KasaGunlukOzetDto> daily;

    public List<KasaGunlukOzetDto> getDaily() { return daily; }
    public void setDaily(List<KasaGunlukOzetDto> daily) { this.daily = daily; }
}
