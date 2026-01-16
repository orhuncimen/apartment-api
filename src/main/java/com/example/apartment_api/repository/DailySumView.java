package com.example.apartment_api.repository;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface DailySumView {
    LocalDate getDay();
    BigDecimal getTotal();
}
