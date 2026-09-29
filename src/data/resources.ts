export type Resource = {
  id: string
  name: string
  detail: string
  href: string
}

export const RESOURCES: Resource[] = [
  {
    id: 'linea106',
    name: 'Línea 106',
    detail: 'Orientación en salud mental, 24/7 y gratuita',
    href: 'tel:106',
  },
  {
    id: 'whatsapp106',
    name: 'WhatsApp 300 754 8933',
    detail: 'Chat de la Línea 106',
    href: 'https://wa.me/573007548933',
  },
  {
    id: 'linea123',
    name: 'Línea 123',
    detail: 'Emergencias, activa servicios prehospitalarios',
    href: 'tel:123',
  },
  {
    id: 'linea141',
    name: 'Línea 141',
    detail: 'ICBF: niñas, niños y adolescentes, 24/7',
    href: 'tel:141',
  },
]
