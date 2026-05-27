package com.jose.streammetrics.dto;

public record FiltroKpiRequest(
        Integer anio,
        String pais,
        String continente,
        String plan,
        String tipoContenido,
        String genero,
        String prioridadMercado,
        String nivelActividad
) {
}