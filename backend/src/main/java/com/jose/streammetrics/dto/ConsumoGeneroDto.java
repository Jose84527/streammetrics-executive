package com.jose.streammetrics.dto;

import java.math.BigDecimal;

public record ConsumoGeneroDto(
        String nombre,
        Long visualizaciones,
        BigDecimal horasVistas
) {
}