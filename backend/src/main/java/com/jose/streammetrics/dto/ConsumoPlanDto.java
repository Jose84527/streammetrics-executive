package com.jose.streammetrics.dto;

import java.math.BigDecimal;

public record ConsumoPlanDto(
        String nombre,
        Long visualizaciones,
        BigDecimal horasVistas
) {
}