# Memoria · Salud Mental 🌿

Juego web de memoria (encontrar parejas) sobre hábitos, emociones y técnicas de bienestar. Proyecto de formación del **SENA**. Disponible en español e inglés.

## Stack

- [Vite](https://vite.dev) + [React 19](https://react.dev) + TypeScript
- Sin backend: todo el estado vive en el navegador (`localStorage`)
- Tests con Vitest + Testing Library
- PWA (manifest + service worker) y deploy en [Vercel](https://vercel.com)

## Comandos

```bash
npm install      # instalar dependencias
npm run dev      # desarrollo en http://localhost:5173
npm run build    # build de producción en dist/
npm run preview  # sirve el build de producción
npm run lint     # reglas de ESLint
npm test         # pruebas (Vitest)
npm run og       # regenera public/og.png (imagen para compartir)
npm run icons    # regenera los iconos PWA (icon-192/512, favicon)
node scripts/check-keys.cjs  # verifica que es.ts y en.ts tengan las mismas claves
```

## Cómo se juega

1. Elige **dificultad** (6, 9, 16 o 24 pares) y **modo**:
   - **Clásico**: sin límite de tiempo ni de intentos.
   - **Contra reloj**: gana antes de que se acabe el tiempo.
   - **Vidas**: tienes pocos fallos permitidos.
   - **Zen**: sin derrotas ni penalizaciones; solo tú y las cartas.
   - **Duelo**: 2 jugadores por turnos en el mismo dispositivo.
2. Voltea dos cartas: si coinciden, se quedan destapadas; si no, se vuelven a tapar tras 800 ms (en modo Vidas, la vida se descuenta en ese momento).
3. Usa las **pistas** 💡 (3 / 2 / 1 / 1 según dificultad, cuestan 150 puntos) y el **comodín** 🎁 (empareja un par al azar, 1 por partida, 200 puntos).
4. Aciertos seguidos suben la **racha** (×2 a las 2, ×3 a las 5) y con ella los puntos; fallar rompe la racha.
5. Al terminar ganas consejos de bienestar, el récord se guarda en tu navegador y puedes **compartir** tu puntaje, generar una **imagen** 🖼️ o **retar a un amigo** 🏆.
6. Primera visita: un tutorial corto explica las reglas. El botón ❓ lo vuelve a mostrar.

### Retos y parámetros de URL

- `?seed=42`: baraja fija (misma partida para todos).
- `?reto=1500`: reto puntaje; se muestra en el inicio y el badge «¡Reto superado!» al lograrlo.
- `?kiosk=1`: modo aula (oculta configuración y controles auxiliares).
- `?lang=en`: abre en inglés.

### Campaña y bienestar

- **Campaña** 🏆: 10 etapas con cartas fijas y semillas deterministas; cada victoria desbloquea la siguiente y al completarlas todas se obtiene el **certificado** 📜 (imprimible).
- **Check-in diario** 🌤: registra tu ánimo de 7 días.
- **Respiración guiada** 🫁 (4-7-8) y **primeros auxilios emocionales** 🆘 con la Línea 106, disponibles desde la partida y desde el resultado.
- **Mini quiz** 🧠 de 3 preguntas al ganar.
- **Reto del día** 📅 con baraja del día (semilla por fecha).

## Estadísticas, nivel y logros

- Partidas, victorias, racha, pares, mejor tiempo, historial de las últimas 10 partidas, heatmap de 30 semanas y metas semanales (clave `salud-mental:stats`).
- **Nivel por XP**: Aprendiz → Practicante → Mentor → Experto en bienestar (chip ⭐ en el encabezado).
- **16 logros** con nombre y descripción en ambos idiomas; aviso emergente al desbloquearlos.
- Exportar/importar JSON, exportar CSV y borrado total con confirmación.

## i18n

- Interfaz en **español** e **inglés** (`src/i18n/es.ts`, `src/i18n/en.ts`, 166 claves) con cambio en vivo desde el botón 🌐.
- El contenido de las cartas, logros, quiz, campaña y recursos vive en `src/data` como pares `{ es, en }`.
- `node scripts/check-keys.cjs` verifica la paridad de claves entre idiomas.

## Estructura

```
src/
  data/cards.ts              # 40 cartas bilingües, dificultades, modos y pistas
  data/achievements.ts       # 16 logros con su condición
  data/quiz.ts               # banco de preguntas del mini quiz
  data/campaign.ts           # 10 etapas de campaña y su semilla
  data/resources.ts          # líneas de ayuda verificadas (bilingües)
  hooks/useGame.ts           # lógica del juego (volteo, pistas, comodín, racha, duelo, sesión)
  hooks/useHighScore.ts      # récords por dificultad y modo (localStorage)
  hooks/useStats.ts          # estadísticas, XP/nivel, metas, historial y logros
  hooks/useCheckin.ts        # check-in diario de ánimo
  i18n/                      # es.ts, en.ts, translate/pick e I18nProvider
  components/                # Card, CardArt (SVG), Board, HUD, modales de resultado,
                             # estadísticas, tutorial, campaña, quiz, respiración,
                             # primeros auxilios, certificado, check-in, ErrorBoundary
  utils/seed.ts              # PRNG determinista (mulberry32) y semillas por fecha
  utils/backup.ts            # exportar/importar JSON y CSV
  utils/image.ts             # imagen PNG para compartir
  utils/share.ts             # compartir/copiar/reto
  utils/sound.ts             # efectos y música ambiental con Web Audio API
  test/                      # 50 pruebas con Vitest
```

## Accesibilidad

- Región `aria-live` que anuncia cada carta volteada, cada par, pistas, comodines y cambios de turno.
- Cartas gestionadas con `aria-disabled`: el foco no se pierde al emparejar.
- Navegación completa con teclado, contraste AA y soporte de `prefers-reduced-motion`.
- Tema claro/oscuro (respeta `prefers-color-scheme`) persistido en `localStorage`.
- Límite de errores global (`ErrorBoundary`) con pantalla de recarga.

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
