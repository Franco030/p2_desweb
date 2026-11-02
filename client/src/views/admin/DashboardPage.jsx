import { useEffect, useState } from 'react';
import { Card, Field, MessageBar, MessageBarBody, Select, Spinner, Subtitle2, Text } from '@fluentui/react-components';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageHeader from '../components/PageHeader';
import solicitudService from '../../services/SolicitudService';
import CatalogoService from '../../services/CatalogoService';

export const COLORES_ESTATUS = { Resuelto: '#13A10E', Pendiente: '#F7630C' };

function Kpi({ titulo, valor, color }) {
  return (
    <Card className="kpi">
      <Text size={300} className="texto-secundario">{titulo}</Text>
      <Text size={800} weight="bold" style={color ? { color } : undefined}>{valor}</Text>
    </Card>
  );
}

const estiloTooltip = {
  contentStyle: {
    background: 'var(--colorNeutralBackground1)',
    border: '1px solid var(--colorNeutralStroke1)',
    borderRadius: 8,
  },
};

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
            <Kpi titulo="Total de solicitudes" valor={resumen.total} />
            <Kpi titulo="Resueltas" valor={resumen.resueltas} color={COLORES_ESTATUS.Resuelto} />
            <Kpi titulo="Pendientes" valor={resumen.pendientes} color={COLORES_ESTATUS.Pendiente} />
          </div>

          {resumen.total === 0 ? (
            <MessageBar intent="info"><MessageBarBody>No hay solicitudes para este filtro.</MessageBarBody></MessageBar>
          ) : (
            <div className="graficas">
              <Card className="grafica">
                <Subtitle2 as="h2">Resueltas vs. pendientes</Subtitle2>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={datosPastel}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="50%"
                      outerRadius="80%"
                      paddingAngle={2}
                      label={({ value, percent }) => `${value} (${Math.round(percent * 100)}%)`}
                    >
                      {datosPastel.map((d) => (
                        <Cell key={d.name} fill={COLORES_ESTATUS[d.name]} stroke="var(--colorNeutralBackground1)" />
                      ))}
                    </Pie>
                    <Tooltip {...estiloTooltip} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="grafica grafica-ancha">
                <Subtitle2 as="h2">Solicitudes por municipio</Subtitle2>
                <ResponsiveContainer width="100%" height={Math.max(280, resumen.porMunicipio.length * 36)}>
                  <BarChart data={resumen.porMunicipio} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--colorNeutralStroke2)" />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: 'currentColor', fontSize: 12 }} />
                    <YAxis type="category" dataKey="municipio" width={110} tick={{ fill: 'currentColor', fontSize: 12 }} />
                    <Tooltip {...estiloTooltip} cursor={{ fill: 'var(--colorNeutralBackground3)' }} />
                    <Legend />
                    <Bar dataKey="Resuelto" stackId="a" fill={COLORES_ESTATUS.Resuelto} />
                    <Bar dataKey="Pendiente" stackId="a" fill={COLORES_ESTATUS.Pendiente} radius={[0, 4, 4, 0]} />
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
