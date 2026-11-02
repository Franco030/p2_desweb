import { Body1, Title2 } from '@fluentui/react-components';

export default function PageHeader({ titulo, descripcion, children }) {
  return (
    <div className="page-header">
      <div>
        <Title2 as="h1">{titulo}</Title2>
        {descripcion && <Body1 as="p" className="texto-secundario">{descripcion}</Body1>}
      </div>
      {children && <div className="page-header-acciones">{children}</div>}
    </div>
  );
}
