package com.jose.streammetrics.dto;

import java.math.BigDecimal;

public record ResumenDashboardDto(
        Long totalVisualizaciones,
        BigDecimal totalHorasVistas,
        Long totalPerfilesAnalizados,
        String generoMasVisto,
        String paisMayorConsumo,
        String planMayorConsumo,
        String franjaHorariaMayorActividad
) {
}