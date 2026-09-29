import type { Bi } from '../i18n'

export type Resource = {
  id: string
  name: Bi
  detail: Bi
  href: string
}

const B = (es: string, en: string): Bi => ({ es, en })

export const RESOURCES: Resource[] = [
  {
    id: 'linea106',
    name: B('Línea 106', 'Line 106'),
    detail: B('Orientación en salud mental, 24/7 y gratuita', 'Free mental health guidance, 24/7'),
    href: 'tel:106',
  },
  {
    id: 'whatsapp106',
    name: B('WhatsApp 300 754 8933', 'WhatsApp 300 754 8933'),
    detail: B('Chat de la Línea 106', 'Line 106 chat'),
    href: 'https://wa.me/573007548933',
  },
  {
    id: 'linea123',
    name: B('Línea 123', 'Line 123'),
    detail: B('Emergencias, activa servicios prehospitalarios', 'Emergencies, dispatches pre-hospital services'),
    href: 'tel:123',
  },
  {
    id: 'linea141',
    name: B('Línea 141', 'Line 141'),
    detail: B('ICBF: niñas, niños y adolescentes, 24/7', 'ICBF: children and teens, 24/7'),
    href: 'tel:141',
  },
]
