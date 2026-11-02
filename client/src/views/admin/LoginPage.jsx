import { useCallback, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, Field, Input, MessageBar, MessageBarBody, Spinner, Title3, Tooltip } from '@fluentui/react-components';
import { ArrowClockwise20Regular, LockClosed24Regular } from '@fluentui/react-icons';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/AuthService';

export default function LoginPage() {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ usuario: '', password: '', captchaTexto: '' });
  const [captcha, setCaptcha] = useState(null);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const cargarCaptcha = useCallback(async () => {
    setCaptcha(null);
    try {
      setCaptcha(await authService.obtenerCaptcha());
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    cargarCaptcha();
  }, [cargarCaptcha]);

  if (usuario) return <Navigate to={location.state?.desde || '/admin'} replace />;

  const cambiar = (campo) => (_, d) => setForm({ ...form, [campo]: d.value });

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      await login(form.usuario, form.password, captcha?.id, form.captchaTexto);
      navigate(location.state?.desde || '/admin', { replace: true });
    } catch (err) {
      setError(err.message);
      setForm((f) => ({ ...f, captchaTexto: '' }));
      cargarCaptcha();
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="login-contenedor">
      <Card className="login-card">
        <div className="login-encabezado">
          <span className="icono-circulo"><LockClosed24Regular /></span>
          <Title3 as="h1">Acceso de administradores</Title3>
        </div>
        {/* Formulario de inicio de sesión: todos los campos son obligatorios, sin asterisco (Fluent 2). */}
        <form onSubmit={enviar} className="form-apilado">
          {error && <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar>}
          <Field label="Usuario">
            <Input value={form.usuario} onChange={cambiar('usuario')} autoComplete="username" />
          </Field>
          <Field label="Contraseña">
            <Input type="password" value={form.password} onChange={cambiar('password')} autoComplete="current-password" />
          </Field>
          <Field label="Código de verificación" hint="Escribe los caracteres que ves en la imagen">
            <div className="captcha">
              <div className="captcha-imagen" role="img" aria-label="Imagen con el código de verificación">
                {captcha ? <span dangerouslySetInnerHTML={{ __html: captcha.svg }} /> : <Spinner size="tiny" />}
              </div>
              <Tooltip content="Mostrar otra imagen" relationship="label">
                <Button appearance="subtle" icon={<ArrowClockwise20Regular />} onClick={cargarCaptcha} />
              </Tooltip>
            </div>
            <Input value={form.captchaTexto} onChange={cambiar('captchaTexto')} maxLength={5} autoComplete="off" />
          </Field>
          <Button
            type="submit"
            appearance="primary"
            disabled={enviando || !captcha || !form.usuario || !form.password || !form.captchaTexto}
          >
            {enviando ? 'Iniciando sesión' : 'Iniciar sesión'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
