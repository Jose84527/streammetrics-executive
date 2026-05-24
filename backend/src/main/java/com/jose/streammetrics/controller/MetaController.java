package com.jose.streammetrics.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public ResumenCumplimientoMetasDto obtenerCumplimientoMetas() {
        return metaService.obtenerCumplimientoMetas();
    }
}