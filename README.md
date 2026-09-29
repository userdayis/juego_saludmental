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

1. Elige **dificultad** (6, 9 o 16 pares) y **modo**:
   - **Clásico**: sin límite de tiempo ni de intentos.
   - **Contra reloj**: gana antes de que se acabe el tiempo.
   - **Vidas**: tienes pocos fallos permitidos.
2. Voltea dos cartas: si coinciden, se quedan destapadas; si no, se vuelven a tapar tras 800 ms (en modo Vidas, la vida se descuenta en ese momento).
3. Usa las **pistas** 💡: revelan un par que falta (3 / 2 / 1 según dificultad) y cuestan 150 puntos cada una.
4. Cada pareja encontrada suma puntos; fallar resta. El tiempo y las vidas también afectan la puntuación.
5. Al terminar ganas consejos de bienestar, el récord se guarda en tu navegador y puedes **compartir** tu puntaje.
6. Primera visita: un tutorial corto explica las reglas. El botón ❓ lo vuelve a mostrar.

## Estadísticas y logros

- Partidas, victorias, racha, pares y mejor tiempo (clave `salud-mental:stats`).
- 8 logros: primera victoria, partida perfecta, relámpago, sin rasguños, racha de 5, 50 pares, veterano y mente brillante.
- Al desbloquear uno aparece un aviso emergente y queda en el panel 📊.

## Estructura

```
src/
  data/cards.ts              # cartas, dificultades, modos y pistas
  data/achievements.ts       # logros con su condición
  data/resources.ts          # líneas de ayuda verificadas
  hooks/useGame.ts           # lógica del juego (volteo, pistas, puntaje, derrota)
  hooks/useHighScore.ts      # récords por dificultad y modo (localStorage)
  hooks/useStats.ts          # estadísticas y logros (localStorage)
  components/                # Card, Board, HUD, ResultModal, StatsModal, TutorialModal, AchievementToast
  utils/sound.ts             # efectos de sonido con Web Audio API
  utils/share.ts             # compartir/copiar puntaje
  utils/format.ts            # formato de tiempo
  test/                      # pruebas con Vitest
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

> Si tu dominio final es distinto de `https://saludmental-five.vercel.app`, actualiza las URLs `og:url`, `og:image` y `twitter:image` en `index.html`.

---

Este juego no sustituye atención profesional. Si lo necesitas, habla con alguien o busca apoyo especializado.
