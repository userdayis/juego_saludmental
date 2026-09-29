# Memoria · Salud Mental 🌿

Juego web de memoria (encontrar parejas) sobre hábitos, emociones y técnicas de bienestar. Proyecto de formación del **SENA**.

## Stack

- [Vite](https://vite.dev) + [React 19](https://react.dev) + TypeScript
- Sin backend: todo el estado vive en el navegador (`localStorage`)
- Tests con Vitest + Testing Library
- Deploy en [Vercel](https://vercel.com)

## Comandos

```bash
npm install      # instalar dependencias
npm run dev      # desarrollo en http://localhost:5173
npm run build    # build de producción en dist/
npm run preview  # sirve el build de producción
npm run lint     # reglas de ESLint
npm test         # pruebas (Vitest)
npm run og       # regenera public/og.png (imagen para compartir)
```

## Cómo se juega

1. Elige **dificultad** (6, 9 o 14 pares) y **modo**:
   - **Clásico**: sin límite de tiempo ni de intentos.
   - **Contra reloj**: gana antes de que se acabe el tiempo.
   - **Vidas**: tienes pocos fallos permitidos.
2. Voltea dos cartas: si coinciden, se quedan destapadas; si no, se vuelven a tapar tras 800 ms.
3. Cada pareja encontrada suma puntos; fallar resta. El tiempo y las vidas también afectan la puntuación.
4. Al terminar ganas consejos de bienestar y el récord se guarda en tu navegador.

## Estructura

```
src/
  data/cards.ts          # cartas, dificultades y modos
  data/resources.ts      # líneas de ayuda verificadas
  hooks/useGame.ts       # lógica del juego (volteo, puntaje, derrota)
  hooks/useHighScore.ts  # récords por dificultad y modo (localStorage)
  components/            # Card, Board, HUD, ResultModal
  utils/sound.ts         # efectos de sonido con Web Audio API
  utils/format.ts        # formato de tiempo
  test/                  # pruebas con Vitest
```

## Accesibilidad

- Región `aria-live` que anuncia cada carta volteada y cada par encontrado.
- Cartas gestionadas con `aria-disabled`: el foco no se pierde al emparejar.
- Navegación completa con teclado, contraste AA y soporte de `prefers-reduced-motion`.
- Tema claro/oscuro persistido en `localStorage`.

## Líneas de ayuda (Colombia)

| Línea | Servicio |
| --- | --- |
| **106** | Orientación en salud mental, 24/7 y gratuita (MinSalud) |
| **300 754 8933** | Chat de WhatsApp de la Línea 106 |
| **123** | Emergencias |
| **141** | ICBF: niñas, niños y adolescentes, 24/7 |

## Deploy en Vercel

1. Sube el repositorio a GitHub.
2. En Vercel: *Add New → Project* → importa el repo (detecta Vite automáticamente).
3. Deploy. Cada `push` a `main` redespliega automáticamente.

> Si tu dominio final es distinto de `https://juego-saludmental.vercel.app`, actualiza las URLs `og:url`, `og:image` y `twitter:image` en `index.html`.

---

Este juego no sustituye atención profesional. Si lo necesitas, habla con alguien o busca apoyo especializado.
