import { useEffect, useState } from 'react';
import { Card, Field, MessageBar, MessageBarBody, Select, Spinner, Subtitle2, Text } from '@fluentui/react-components';
import { CheckmarkCircle24Regular, Clock24Regular, TextBulletListSquare24Regular } from '@fluentui/react-icons';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageHeader from '../components/PageHeader';
import solicitudService from '../../services/SolicitudService';
import CatalogoService from '../../services/CatalogoService';

/** Colores del estatus: [tono claro, tono base] para los degradados de las gráficas. */
export const COLORES_ESTATUS = {
  Resuelto: ['#54B054', '#0E7A0D'],
  Pendiente: ['#FF9A4D', '#DA5B0B'],
};

function Kpi({ titulo, valor, color, icono }) {
  return (
    <Card className="kpi" style={{ '--kpi-color': color }}>
      <span className="kpi-icono">{icono}</span>
      <div className="kpi-texto">
        <Text size={300} className="texto-secundario">{titulo}</Text>
        <Text size={800} weight="bold">{valor}</Text>
      </div>
    </Card>
  );
}

/** Tooltip con el mismo material de vidrio que las tarjetas. */
const estiloTooltip = {
  contentStyle: {
    background: 'var(--glass-bg-fuerte)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    border: '1px solid var(--glass-borde)',
    borderRadius: 8,
    boxShadow: 'var(--glass-sombra)',
    color: 'var(--colorNeutralForeground1)',
  },
  labelStyle: { fontWeight: 600, marginBottom: 4 },
};

function Degradados({ horizontal = false }) {
  return (
    <defs>
      {Object.entries(COLORES_ESTATUS).map(([estatus, [claro, base]]) => (
        <linearGradient key={estatus} id={`grad-${estatus}${horizontal ? '-h' : ''}`} x1="0" y1="0" x2={horizontal ? '1' : '0'} y2={horizontal ? '0' : '1'}>
          <stop offset="0%" stopColor={claro} />
          <stop offset="100%" stopColor={base} />
        </linearGradient>
      ))}
    </defs>
  );
}

export default function DashboardPage() {
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

  const datosPastel = resumen
    ? [
        { name: 'Resuelto', value: resumen.resueltas },
        { name: 'Pendiente', value: resumen.pendientes },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <>
      <PageHeader titulo="Tablero" descripcion="Estatus de las solicitudes por municipio o en total.">
        <Field label="Filtrar por municipio" className="filtro">
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
        <Spinner label="Cargando..." />
      ) : (
        <>
          <div className="kpis">
            <Kpi titulo="Total de solicitudes" valor={resumen.total} color="var(--colorBrandForeground1)" icono={<TextBulletListSquare24Regular />} />
            <Kpi titulo="Resueltas" valor={resumen.resueltas} color={COLORES_ESTATUS.Resuelto[0]} icono={<CheckmarkCircle24Regular />} />
            <Kpi titulo="Pendientes" valor={resumen.pendientes} color={COLORES_ESTATUS.Pendiente[0]} icono={<Clock24Regular />} />
          </div>

          {resumen.total === 0 ? (
            <MessageBar intent="info"><MessageBarBody>No hay solicitudes para este filtro.</MessageBarBody></MessageBar>
          ) : (
            <div className="graficas">
              <Card className="grafica">
                <Subtitle2 as="h2">Resueltas vs. pendientes</Subtitle2>
                <div className="grafica-dona">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart margin={{ top: 20, bottom: 4 }}>
                      <Degradados />
                      <Pie
                        data={datosPastel}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="58%"
                        outerRadius="78%"
                        paddingAngle={3}
                        cornerRadius={6}
                        stroke="none"
                        label={({ value, percent }) => `${value} (${Math.round(percent * 100)}%)`}
                      >
                        {datosPastel.map((d) => (
                          <Cell key={d.name} fill={`url(#grad-${d.name})`} />
                        ))}
                      </Pie>
                      <Tooltip {...estiloTooltip} />
                      <Legend iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="dona-centro">
                    <Text size={700} weight="bold">{resumen.total}</Text>
                    <Text size={200} className="texto-secundario">solicitudes</Text>
                  </div>
                </div>
              </Card>

              <Card className="grafica grafica-ancha">
                <Subtitle2 as="h2">Solicitudes por municipio</Subtitle2>
                <ResponsiveContainer width="100%" height={Math.max(280, resumen.porMunicipio.length * 40)}>
                  <BarChart data={resumen.porMunicipio} layout="vertical" margin={{ left: 8, right: 16 }} barCategoryGap="28%">
                    <Degradados horizontal />
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--colorNeutralStroke2)" />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: 'currentColor', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="municipio" width={110} tick={{ fill: 'currentColor', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip {...estiloTooltip} cursor={{ fill: 'var(--glass-bg)' }} />
                    <Legend iconType="circle" />
                    <Bar dataKey="Resuelto" stackId="a" fill="url(#grad-Resuelto-h)" radius={[6, 0, 0, 6]} />
                    <Bar dataKey="Pendiente" stackId="a" fill="url(#grad-Pendiente-h)" radius={[0, 6, 6, 0]} />
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
