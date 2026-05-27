package com.jose.streammetrics.dto;

import java.util.List;

public record OpcionesFiltroResponse(
        List<Integer> anios,
        List<String> paises,
        List<String> continentes,
        List<String> planes,
        List<String> tiposContenido,
        List<String> generos,
        List<String> prioridadesMercado,
        List<String> nivelesActividad
) {
}