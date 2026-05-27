package com.jose.streammetrics.repository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import com.jose.streammetrics.dto.ConsumoMercadoDto;
import com.jose.streammetrics.dto.FiltroKpiRequest;

@Repository
public class MercadoRepository {

    private final JdbcTemplate jdbcTemplate;

    public MercadoRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ConsumoMercadoDto> obtenerTopPaisesPorConsumo(FiltroKpiRequest filtros) {
        ConsultaFiltrada consulta = construirConsultaBaseParaPaises(filtros);

        String sql = """
                SELECT
                    pais_usuario AS nombre,
                    COALESCE(SUM(visualizacion_real), 0) AS visualizaciones,
                    COALESCE(SUM(horas_vistas), 0) AS horas_vistas
                FROM analisis_streaming_kpis
                %s
                GROUP BY pais_usuario
                ORDER BY visualizaciones DESC
                """.formatted(consulta.where());

        return jdbcTemplate.query(
                sql,
                consulta.parametros().toArray(),
                (resultado, numeroFila) -> new ConsumoMercadoDto(
                        resultado.getString("nombre"),
                        resultado.getLong("visualizaciones"),
                        resultado.getBigDecimal("horas_vistas")
                )
        );
    }

    public List<ConsumoMercadoDto> obtenerTopContinentesPorConsumo(FiltroKpiRequest filtros) {
        ConsultaFiltrada consulta = construirConsultaBaseParaContinentes(filtros);

        String sql = """
                SELECT
                    continente_usuario AS nombre,
                    COALESCE(SUM(visualizacion_real), 0) AS visualizaciones,
                    COALESCE(SUM(horas_vistas), 0) AS horas_vistas
                FROM analisis_streaming_kpis
                %s
                GROUP BY continente_usuario
                ORDER BY visualizaciones DESC
                """.formatted(consulta.where());

        return jdbcTemplate.query(
                sql,
                consulta.parametros().toArray(),
                (resultado, numeroFila) -> new ConsumoMercadoDto(
                        resultado.getString("nombre"),
                        resultado.getLong("visualizaciones"),
                        resultado.getBigDecimal("horas_vistas")
                )
        );
    }

    private ConsultaFiltrada construirConsultaBaseParaPaises(FiltroKpiRequest filtros) {
        StringBuilder where = new StringBuilder("""
                WHERE pais_usuario IS NOT NULL
                  AND pais_usuario <> ''
                """);

        List<Object> parametros = new ArrayList<>();

        aplicarFiltrosComunes(where, parametros, filtros);

        if (filtros != null && StringUtils.hasText(filtros.continente())) {
            where.append("""
                    
                      AND continente_usuario = ?
                    """);
            parametros.add(filtros.continente().trim());
        }

        return new ConsultaFiltrada(where.toString(), parametros);
    }

    private ConsultaFiltrada construirConsultaBaseParaContinentes(FiltroKpiRequest filtros) {
        StringBuilder where = new StringBuilder("""
                WHERE continente_usuario IS NOT NULL
                  AND continente_usuario <> ''
                """);

        List<Object> parametros = new ArrayList<>();

        aplicarFiltrosComunes(where, parametros, filtros);

        return new ConsultaFiltrada(where.toString(), parametros);
    }

    private void aplicarFiltrosComunes(
            StringBuilder where,
            List<Object> parametros,
            FiltroKpiRequest filtros
    ) {
        if (filtros == null) {
            return;
        }

        if (filtros.anio() != null) {
            where.append("""
                    
                      AND anio = ?
                    """);
            parametros.add(filtros.anio());
        }

        if (StringUtils.hasText(filtros.plan())) {
            where.append("""
                    
                      AND nombre_plan = ?
                    """);
            parametros.add(filtros.plan().trim());
        }

        if (StringUtils.hasText(filtros.tipoContenido())) {
            where.append("""
                    
                      AND tipo_contenido = ?
                    """);
            parametros.add(filtros.tipoContenido().trim());
        }

        if (StringUtils.hasText(filtros.genero())) {
            where.append("""
                    
                      AND genero_contenido = ?
                    """);
            parametros.add(filtros.genero().trim());
        }
    }

    private record ConsultaFiltrada(
            String where,
            List<Object> parametros
    ) {
    }
}