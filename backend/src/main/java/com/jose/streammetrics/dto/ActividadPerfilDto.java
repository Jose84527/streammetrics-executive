package com.jose.streammetrics.dto;

import java.math.BigDecimal;

public record ActividadPerfilDto(
        String nivelActividad,
        Long totalPerfiles,
        BigDecimal promedioDiasSinActividad,
        String accionSugerida
) {
}