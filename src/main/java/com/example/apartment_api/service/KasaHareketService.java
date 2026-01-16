package com.example.apartment_api.service;

import com.example.apartment_api.dto.*;
import com.example.apartment_api.entity.KasaHareket;
import com.example.apartment_api.enums.KasaDirection;
import com.example.apartment_api.exception.BusinessException;
import com.example.apartment_api.exception.ResourceNotFoundException;
import com.example.apartment_api.repository.DailySumView;
import com.example.apartment_api.repository.KasaHareketRepository;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;
import com.example.apartment_api.dto.KasaAylikOzetResponseDto;
import com.example.apartment_api.dto.KasaGunlukOzetDto;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import org.springframework.beans.factory.annotation.Value;

@Service
public class KasaHareketService {

    private final KasaHareketRepository repository;

    public KasaHareketService(KasaHareketRepository repository) {
        this.repository = repository;
    }
    @Value("${kasa.max-negative:-5000}")
    private BigDecimal maxNegative;

    public KasaHareketResponseDto create(@Valid KasaHareketRequestDto dto) {

        // 1) OUT ise bakiye kontrol
        if (dto.getDirection() == KasaDirection.OUT) {

            BigDecimal totalIn = repository.sumIn(dto.getKasaid());
            BigDecimal totalOut = repository.sumOut(dto.getKasaid());
            BigDecimal currentBalance = totalIn.subtract(totalOut);

            BigDecimal newBalance = currentBalance.subtract(dto.getAmount());

            // yeni bakiye max negatif limitin altına düşüyor mu?
            // örn maxNegative = -5000
            if (newBalance.compareTo(maxNegative) < 0) {
                throw new BusinessException(
                        "Negatif limit aşıldı. Mevcut bakiye: " + currentBalance +
                                ", çıkış tutarı: " + dto.getAmount() +
                                ", yeni bakiye: " + newBalance +
                                ", izin verilen min bakiye: " + maxNegative
                );
            }
        }


        // 2) kayıt
        KasaHareket hareket = new KasaHareket();
        hareket.setKasaid(dto.getKasaid());
        hareket.setDaireid(dto.getDaireid());
        hareket.setUcrettypeid(dto.getUcrettypeid());
        hareket.setAmount(dto.getAmount());
        hareket.setDirection(dto.getDirection());
        hareket.setDescription(dto.getDescription());
        hareket.setCreatedate(LocalDateTime.now());
        hareket.setDeleted(false);

        return mapToResponse(repository.save(hareket));
    }

    private KasaHareketResponseDto mapToResponse(KasaHareket e) {
        KasaHareketResponseDto dto = new KasaHareketResponseDto();
        dto.setId(e.getId());
        dto.setKasaid(e.getKasaid());
        dto.setDaireid(e.getDaireid());
        dto.setUcrettypeid(e.getUcrettypeid());
        dto.setAmount(e.getAmount());
        dto.setDirection(e.getDirection());
        dto.setDescription(e.getDescription());
        return dto;
    }


    public void delete(UUID id) {
        KasaHareket hareket = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kasa hareket not found"));

        hareket.setDeleted(true);
        hareket.setEnddate(LocalDateTime.now());
        repository.save(hareket);
    }

    public List<KasaHareketResponseDto> getByKasa(UUID kasaid) {

        return repository.findByKasaidAndDeletedFalse(kasaid)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public KasaOzetResponseDto getSummary(UUID kasaid) {

        BigDecimal totalIn = repository.sumIn(kasaid);
        BigDecimal totalOut = repository.sumOut(kasaid);
        BigDecimal balance = totalIn.subtract(totalOut);

        long hareketCount = repository.countActiveByKasa(kasaid);

        long inCount = repository.countByKasaidAndDeletedFalseAndDirection(kasaid, KasaDirection.IN);
        long outCount = repository.countByKasaidAndDeletedFalseAndDirection(kasaid, KasaDirection.OUT);

        LocalDateTime lastTransactionDate =
                repository.findLastTransactionDate(kasaid);

        KasaOzetResponseDto dto = new KasaOzetResponseDto();
        dto.setKasaid(kasaid);
        dto.setTotalIn(totalIn);
        dto.setTotalOut(totalOut);
        dto.setBalance(balance);
        dto.setHareketCount(hareketCount);
        dto.setInCount(inCount);
        dto.setOutCount(outCount);
        dto.setLastTransactionDate(lastTransactionDate);

        return dto;
    }

    public KasaAylikOzetResponseDto getMonthlySummary(UUID kasaid, int year, int month) {

        LocalDateTime start = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime end = start.plusMonths(1);

        BigDecimal totalIn = repository.sumInBetween(kasaid, start, end);
        BigDecimal totalOut = repository.sumOutBetween(kasaid, start, end);
        BigDecimal balance = totalIn.subtract(totalOut);

        long hareketCount = repository.countBetween(kasaid, start, end);
        long inCount = repository.countInBetween(kasaid, start, end);
        long outCount = repository.countOutBetween(kasaid, start, end);

        // ---- daily breakdown (eksik günleri 0 yapacağız)
        List<DailySumView> inRows = repository.dailyIn(kasaid, start, end);
        List<DailySumView> outRows = repository.dailyOut(kasaid, start, end);

        Map<LocalDate, BigDecimal> inMap = new HashMap<>();
        for (DailySumView r : inRows) inMap.put(r.getDay(), r.getTotal());

        Map<LocalDate, BigDecimal> outMap = new HashMap<>();
        for (DailySumView r : outRows) outMap.put(r.getDay(), r.getTotal());

        LocalDate startDay = LocalDate.of(year, month, 1);
        int daysInMonth = startDay.lengthOfMonth();

        List<KasaGunlukOzetDto> daily = new ArrayList<>();
        for (int d = 1; d <= daysInMonth; d++) {
            LocalDate day = LocalDate.of(year, month, d);

            KasaGunlukOzetDto item = new KasaGunlukOzetDto();
            item.setDate(day);
            item.setTotalIn(inMap.getOrDefault(day, BigDecimal.ZERO));
            item.setTotalOut(outMap.getOrDefault(day, BigDecimal.ZERO));
            daily.add(item);
        }

        KasaAylikOzetResponseDto dto = new KasaAylikOzetResponseDto();
        dto.setKasaid(kasaid);
        dto.setYear(year);
        dto.setMonth(month);
        dto.setTotalIn(totalIn);
        dto.setTotalOut(totalOut);
        dto.setBalance(balance);
        dto.setHareketCount(hareketCount);
        dto.setInCount(inCount);
        dto.setOutCount(outCount);
        dto.setDaily(daily);

        return dto;
    }
}
