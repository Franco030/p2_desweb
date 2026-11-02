import { useEffect, useState } from 'react';
import { Body1, Card, CardHeader, Field, MessageBar, MessageBarBody, Select, Spinner, Subtitle2, Title2 } from '@fluentui/react-components';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageHeader from '../components/PageHeader';
import solicitudService from '../../services/SolicitudService';
import CatalogoService from '../../services/CatalogoService';
import { useTema } from '../../context/TemaContext';
import useMediaQuery, { MENOS_MOVIMIENTO } from '../../hooks/useMediaQuery';

function Kpi({ titulo, valor, color }) {
  return (
    <Card className="kpi">
      <Body1 className="texto-secundario">{titulo}</Body1>
      <Title2 as="p" style={color ? { color } : undefined}>{valor}</Title2>
    </Card>
  );
}

/** Estilos de Recharts tomados de los tokens del tema (los atributos SVG no aceptan variables CSS). */
function estilosGrafica(t) {
  return {
    colores: { Resuelto: t.colorStatusSuccessBackground3, Pendiente: t.colorStatusWarningBackground3 },
    eje: { fill: t.colorNeutralForeground2, fontSize: 12 },
    rejilla: t.colorNeutralStroke2,
    // Tooltip como callout de Fluent: fondo neutro, radio medio y sombra 16.
    tooltip: {
      contentStyle: {
        background: t.colorNeutralBackground1,
        border: `1px solid ${t.colorTransparentStroke}`,
        borderRadius: t.borderRadiusMedium,
        boxShadow: t.shadow16,
        color: t.colorNeutralForeground1,
        fontSize: t.fontSizeBase300,
        lineHeight: t.lineHeightBase300,
      },
      labelStyle: { fontWeight: t.fontWeightSemibold },
    },
    leyenda: (valor) => <span style={{ color: t.colorNeutralForeground1, fontSize: 12 }}>{valor}</span>,
  };
}

export default function DashboardPage() {
  const { tema } = useTema();
  const sinMovimiento = useMediaQuery(MENOS_MOVIMIENTO);
  const [municipios, setMunicipios] = useState([]);
  const [municipioId, setMunicipioId] = useState('');
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    CatalogoService.de('municipios').listar().then(setMunicipios).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    setResumen(null);
    solicitudService.resumen(municipioId).then(setResumen).catch((e) => setError(e.message));
  }, [municipioId]);

  const g = estilosGrafica(tema);
  // Movimiento de Fluent 2: corto, con desaceleración, y las gráficas escalonadas.
  const animacion = (inicio) => ({
    isAnimationActive: !sinMovimiento,
    animationBegin: inicio,
    animationDuration: 500,
    animationEasing: 'ease-out',
  });

  const datosPastel = resumen
    ? [
        { name: 'Resuelto', value: resumen.resueltas },
        { name: 'Pendiente', value: resumen.pendientes },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <>
      <PageHeader titulo="Tablero" descripcion="Estatus de las solicitudes por municipio o en total.">
        <Field label="Municipio" className="filtro">
          <Select value={municipioId} onChange={(_, d) => setMunicipioId(d.value)}>
            <option value="">Todos los municipios</option>
            {municipios.map((m) => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </Select>
        </Field>
      </PageHeader>

      {error && <MessageBar intent="error" className="mb"><MessageBarBody>{error}</MessageBarBody></MessageBar>}
      {!resumen ? (
        <Spinner label="Cargando tablero" />
      ) : (
        <>
          <div className="kpis escalonado">
            <Kpi titulo="Total de solicitudes" valor={resumen.total} />
            <Kpi titulo="Resueltas" valor={resumen.resueltas} color={tema.colorStatusSuccessForeground1} />
            <Kpi titulo="Pendientes" valor={resumen.pendientes} color={tema.colorStatusWarningForeground1} />
          </div>

          {resumen.total === 0 ? (
            <MessageBar intent="info"><MessageBarBody>No hay solicitudes para este filtro</MessageBarBody></MessageBar>
          ) : (
            <div className="graficas">
              <Card className="grafica">
                <CardHeader header={<Subtitle2 as="h2">Resueltas y pendientes</Subtitle2>} />
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart margin={{ top: 16, bottom: 4 }}>
                    <Pie
                      data={datosPastel}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="50%"
                      outerRadius="78%"
                      paddingAngle={2}
                      stroke={tema.colorNeutralBackground1}
                      label={({ x, y, value, percent, textAnchor }) => (
                        <text x={x} y={y} textAnchor={textAnchor} dominantBaseline="central" fill={tema.colorNeutralForeground2} fontSize={12}>
                          {`${value} (${Math.round(percent * 100)}%)`}
                        </text>
                      )}
                      {...animacion(0)}
                    >
                      {datosPastel.map((d) => (
                        <Cell key={d.name} fill={g.colores[d.name]} />
                      ))}
                    </Pie>
                    <Tooltip {...g.tooltip} />
                    <Legend formatter={g.leyenda} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="grafica">
                <CardHeader header={<Subtitle2 as="h2">Solicitudes por municipio</Subtitle2>} />
                <ResponsiveContainer width="100%" height={Math.max(280, resumen.porMunicipio.length * 36)}>
                  <BarChart data={resumen.porMunicipio} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={g.rejilla} />
                    <XAxis type="number" allowDecimals={false} tick={g.eje} stroke={g.rejilla} />
                    <YAxis type="category" dataKey="municipio" width={112} tick={g.eje} stroke={g.rejilla} />
                    <Tooltip {...g.tooltip} cursor={{ fill: tema.colorSubtleBackgroundHover }} />
                    <Legend formatter={g.leyenda} />
                    <Bar dataKey="Resuelto" stackId="a" fill={g.colores.Resuelto} {...animacion(100)} />
                    <Bar dataKey="Pendiente" stackId="a" fill={g.colores.Pendiente} radius={[0, 4, 4, 0]} {...animacion(100)} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          )}
        </>
      )}
    </>
  );
}
