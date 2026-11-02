import { Field, Input, Select, Subtitle2 } from '@fluentui/react-components';
import SolicitudModel from '../../models/SolicitudModel';

/**
 * Formulario reutilizable (público y administración).
 * `solicitud` es un SolicitudModel; `onChange` recibe el nuevo modelo.
 * Fluent 2: etiquetas cortas en tipo oración, el formato esperado va en `hint`
 * y el placeholder solo como ejemplo.
 */
export default function SolicitudForm({ solicitud, onChange, errores = {}, catalogos, mostrarEstatus = false }) {
  const texto = (campo, etiqueta, { required, hint, ...props } = {}) => (
    <Field label={etiqueta} required={required} hint={hint} validationMessage={errores[campo]}>
      <Input value={solicitud[campo]} onChange={(_, d) => onChange(solicitud.con(campo, d.value))} {...props} />
    </Field>
  );

  const lista = (campo, etiqueta, opciones, hint) => (
    <Field label={etiqueta} required hint={hint} validationMessage={errores[campo]}>
      <Select value={solicitud[campo]} onChange={(_, d) => onChange(solicitud.con(campo, d.value))}>
        <option value="">Selecciona una opción</option>
        {opciones.map((o) => (
          <option key={o.id} value={o.id}>{o.nombre}</option>
        ))}
      </Select>
    </Field>
  );

  return (
    <div className="form-solicitud">
      <section className="form-seccion">
        <Subtitle2 as="h2">Quien realiza el trámite</Subtitle2>
        <div className="form-grid">
          <div className="col-completa">
            {texto('nombreTramitante', 'Nombre completo', { required: true, maxLength: 150 })}
          </div>
        </div>
      </section>

      <section className="form-seccion">
        <Subtitle2 as="h2">Datos del alumno</Subtitle2>
        <div className="form-grid">
          <div className="col-completa">
            {texto('curp', 'CURP', { required: true, maxLength: 18, hint: '18 caracteres', placeholder: 'GOML150310MCLMZR05' })}
          </div>
          {texto('nombre', 'Nombre', { required: true, maxLength: 80 })}
          {texto('paterno', 'Apellido paterno', { required: true, maxLength: 80 })}
          {texto('materno', 'Apellido materno', { maxLength: 80 })}
          {texto('telefono', 'Teléfono', { type: 'tel', inputMode: 'numeric', maxLength: 10 })}
          {texto('celular', 'Celular', { required: true, type: 'tel', inputMode: 'numeric', maxLength: 10, hint: '10 dígitos' })}
          {texto('correo', 'Correo electrónico', { required: true, type: 'email', maxLength: 120, placeholder: 'nombre@correo.com' })}
        </div>
      </section>

      <section className="form-seccion">
        <Subtitle2 as="h2">Datos del trámite</Subtitle2>
        <div className="form-grid">
          {lista('nivelId', 'Nivel educativo', catalogos.niveles, 'Nivel al que desea ingresar o que cursa')}
          {lista('municipioId', 'Municipio', catalogos.municipios, 'Donde desea que estudie el alumno')}
          {lista('asuntoId', 'Asunto', catalogos.asuntos)}
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
      </section>
    </div>
  );
}
