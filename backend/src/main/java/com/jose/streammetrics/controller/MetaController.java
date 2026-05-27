package com.jose.streammetrics.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jose.streammetrics.dto.FiltroKpiRequest;
import com.jose.streammetrics.dto.ResumenCumplimientoMetasDto;
import com.jose.streammetrics.service.MetaService;

@RestController
@RequestMapping("/api/metas")
public class MetaController {

    private final MetaService metaService;

    public MetaController(MetaService metaService) {
        this.metaService = metaService;
    }

    @GetMapping("/cumplimiento")
    public ResumenCumplimientoMetasDto obtenerCumplimientoMetas(
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) String pais,
            @RequestParam(required = false) String continente,
            @RequestParam(required = false) String plan,
            @RequestParam(required = false) String tipoContenido,
            @RequestParam(required = false) String prioridadMercado
    ) {
        String continenteFinal = pais != null && !pais.isBlank()
                ? null
                : continente;

        FiltroKpiRequest filtros = new FiltroKpiRequest(
                anio,
                pais,
                continenteFinal,
                plan,
                tipoContenido,
                null,
                prioridadMercado,
                null
        );

        return metaService.obtenerCumplimientoMetas(filtros);
    }
}