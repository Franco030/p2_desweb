import { Field, Input, Select, Subtitle2 } from '@fluentui/react-components';
import SolicitudModel from '../../models/SolicitudModel';

/**
 * Formulario reutilizable (público y administración).
 * `solicitud` es un SolicitudModel; `onChange` recibe el nuevo modelo.
 */
export default function SolicitudForm({ solicitud, onChange, errores = {}, catalogos, mostrarEstatus = false }) {
  const texto = (campo, etiqueta, props = {}) => (
    <Field label={etiqueta} required={props.required} validationMessage={errores[campo]}>
      <Input
        value={solicitud[campo]}
        onChange={(_, d) => onChange(solicitud.con(campo, d.value))}
        {...props}
      />
    </Field>
  );

  const lista = (campo, etiqueta, opciones) => (
    <Field label={etiqueta} required validationMessage={errores[campo]}>
      <Select value={solicitud[campo]} onChange={(_, d) => onChange(solicitud.con(campo, d.value))}>
        <option value="">Selecciona...</option>
        {opciones.map((o) => (
          <option key={o.id} value={o.id}>{o.nombre}</option>
        ))}
      </Select>
    </Field>
  );

  return (
    <div className="form-solicitud">
      <Subtitle2 as="h2" className="form-seccion">Quien realiza el trámite</Subtitle2>
      <div className="form-grid">
        <div className="col-completa">
          {texto('nombreTramitante', 'Nombre completo de quien realiza el trámite', { required: true, maxLength: 150 })}
        </div>
      </div>

      <Subtitle2 as="h2" className="form-seccion">Datos del alumno</Subtitle2>
      <div className="form-grid">
        <div className="col-completa">
          {texto('curp', 'CURP', { required: true, maxLength: 18, placeholder: 'AAAA000000HAAAAA00' })}
        </div>
        {texto('nombre', 'Nombre(s)', { required: true, maxLength: 80 })}
        {texto('paterno', 'Apellido paterno', { required: true, maxLength: 80 })}
        {texto('materno', 'Apellido materno', { maxLength: 80 })}
        {texto('telefono', 'Teléfono', { type: 'tel', inputMode: 'numeric', maxLength: 10 })}
        {texto('celular', 'Celular', { required: true, type: 'tel', inputMode: 'numeric', maxLength: 10 })}
        {texto('correo', 'Correo electrónico', { required: true, type: 'email', maxLength: 120 })}
      </div>

      <Subtitle2 as="h2" className="form-seccion">Datos del trámite</Subtitle2>
      <div className="form-grid">
        {lista('nivelId', 'Nivel al que desea ingresar o cursa', catalogos.niveles)}
        {lista('municipioId', 'Municipio donde desea que estudie el alumno', catalogos.municipios)}
        {lista('asuntoId', 'Asunto a tratar', catalogos.asuntos)}
        {mostrarEstatus && (
          <Field label="Estatus">
            <Select value={solicitud.estatus} onChange={(_, d) => onChange(solicitud.con('estatus', d.value))}>
              {SolicitudModel.ESTATUS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </Select>
          </Field>
        )}
      </div>
    </div>
  );
}
