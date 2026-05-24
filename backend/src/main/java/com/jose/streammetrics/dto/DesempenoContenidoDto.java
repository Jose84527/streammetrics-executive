package com.jose.streammetrics.dto;

import java.math.BigDecimal;

public record DesempenoContenidoDto(
        String titulo,
        String tipoContenido,
        Long visualizaciones,
        BigDecimal horasVistas,
        BigDecimal calificacionPromedio,
        Integer totalValoraciones,
        BigDecimal tasaFinalizacion
) {
}