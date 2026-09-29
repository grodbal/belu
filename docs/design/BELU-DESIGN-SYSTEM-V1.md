# BELU Design System v1

## 1. Alcance y fuente de verdad

Este documento define el sistema visual oficial v1 de BELU para superficies de producto dirigidas a clientas. Es una especificación técnica y accionable para diseño e implementación.

La fuente visual principal es la Golden Screen ubicada en:

- `app/prototipo/cliente-home-v2/page.tsx`
- `app/prototipo/cliente-home-v2/components.tsx`
- `app/prototipo/cliente-home-v2/cliente-home-v2.module.css`

Orden de precedencia:

1. Reglas explícitas de este documento.
2. Composición y comportamiento de la Golden Screen aprobada.
3. Patrones existentes del producto, solo cuando no contradigan los puntos anteriores.

Este sistema no autoriza funcionalidades. Los componentes visuales deben representar únicamente capacidades y estados reales del producto.

## 2. Identidad de producto

BELU es una plataforma beauty-tech premium accesible, especializada en servicios de lashes y nails a domicilio.

Dirección visual oficial: **Editorial Beauty + Product UI**.

BELU debe sentirse:

- premium accesible;
- moderna y sofisticada;
- fotográfica;
- funcional;
- mobile-first;
- propia de un producto digital de consumo.

BELU no debe sentirse como:

- dashboard SaaS genérico o CRM;
- plantilla de startup;
- concepto decorativo de Dribbble sin funcionalidad real;
- beauty infantil, cute o excesivamente femenina;
- interfaz recargada o dependiente de cards.

El símbolo `✦` es un acento visual de marca. Debe usarse de forma escasa, nunca como sustituto indiscriminado de iconografía funcional.

Tagline oficial:

> luce increíble, cuando quieras

No presentar otros copys editoriales como si fueran un tagline oficial. Nunca exponer nombres internos de recursos gráficos de BELU en la interfaz, contenido accesible, documentación pública o mensajes de error.

## 3. Principios de diseño

1. La fotografía forma parte de la interfaz, no es decoración secundaria.
2. Cada contexto tiene una acción dominante claramente identificable.
3. El espacio en blanco define jerarquía y ritmo.
4. Las superficies, el espaciado y los bordes preceden a las sombras.
5. La información debe poder recorrerse con rapidez en mobile.
6. Las cards se reservan para entidades o acciones con límites reales; no se usan para envolver cada bloque.
7. La interfaz debe sentirse editorial sin perder claridad operativa.

## 4. Tokens de color

```css
:root {
  --belu-red: #E60023;
  --belu-red-dark: #BF001D;
  --belu-pink: #FFD6E2;
  --belu-canvas: #F7F3F0;
  --belu-surface: #FFFFFF;
  --belu-text-primary: #1A1A1A;
  --belu-text-secondary: #716966;
  --belu-border-subtle: #E8DFDA;
  --belu-success: #36A269;
  --belu-rating: #D99A26;
}
```

| Token | Uso permitido | No usar para |
| --- | --- | --- |
| `--belu-red` | CTA primario, navegación activa, detalles de marca, foco visual puntual | fondos extensos, grandes áreas de contenido o múltiples acciones competidoras |
| `--belu-red-dark` | estado hover/pressed del CTA rojo | texto secundario o superficies decorativas |
| `--belu-pink` | avatar, superficie/acento suave y estados sutiles relacionados con marca | color dominante de la pantalla |
| `--belu-canvas` | fondo principal cálido de la aplicación | cards que necesiten separación clara del canvas |
| `--belu-surface` | superficies elevadas por contraste, sidebar, bottom navigation y cards necesarias | crear capas anidadas sin necesidad funcional |
| `--belu-text-primary` | títulos, nombres, precios importantes y contenido principal | metadata de baja prioridad |
| `--belu-text-secondary` | body secundario, descripciones y metadata | texto esencial con contraste insuficiente |
| `--belu-border-subtle` | divisores y bordes base de 1px | contornos decorativos repetidos |
| `--belu-success` | disponibilidad o éxito confirmado por datos reales | disponibilidad inferida o decorativa |
| `--belu-rating` | estrella de rating cuando existen reseñas reales | estrellas vacías, rating `0.0` o adornos |

El rojo debe actuar como señal, no como relleno general. El rosa es una superficie de apoyo, no el color dominante del producto.

## 5. Tipografía

### 5.1 Familias

**Poppins**

- headings;
- botones;
- énfasis de navegación;
- precios importantes;
- labels de producto.

**Nunito**

- body;
- descripciones;
- metadata;
- formularios;
- información secundaria.

Usar peso, tamaño, espacio y contraste como sistema conjunto. No resolver toda la jerarquía aumentando el `font-weight`.

### 5.2 Escala de la Golden Screen

| Rol | Familia | Tamaño | Peso | Line-height / detalle |
| --- | --- | --- | --- | --- |
| Hero H1 desktop | Poppins | `clamp(2.15rem, 3.55vw, 3.25rem)` | 500 | `1.06`, tracking `-0.05em` |
| Hero H1 mobile | Poppins | `clamp(1.85rem, 8.7vw, 2.35rem)` | 500 | `1.08` |
| Section heading desktop | Poppins | `clamp(1.45rem, 2.1vw, 1.9rem)` | 500 | tracking `-0.035em` |
| Section heading mobile | Poppins | `1.34rem` | 500 | tracking `-0.035em` |
| Trust statement | Poppins | `clamp(1.15rem, 1.7vw, 1.45rem)` | 500 | `1.4` |
| Service / Beluer name | Poppins | `1rem` / `1.05rem` | 600 | tracking leve negativo en servicio |
| Button desktop | Poppins | `0.82rem` | 600 | line-height `1` |
| Button mobile | Poppins | `0.75rem` | 600 | line-height `1` |
| Sidebar navigation | Nunito | `0.92rem` | 700 | altura de fila `48px` |
| Hero body desktop | Nunito | `0.98rem` | normal | `1.55` |
| Hero body mobile | Nunito | `0.88rem` | normal | mantener lectura corta |
| Service category | Nunito | `0.66rem` | 900 | uppercase, tracking `0.13em` |
| Service price | Nunito | `0.83rem` | 600 | color secundario |
| Beluer metadata | Nunito | `0.72–0.80rem` | 600–800 según rol | no competir con el nombre |
| Verification label | Nunito | `0.62rem` | 800 | uppercase, tracking `0.05em` |
| Bottom navigation | Poppins | `0.58rem` | 500; 700 en Reserva | label breve |

Reglas:

- Mantener títulos cortos y con saltos controlados.
- Evitar pesos 700–900 en body o títulos grandes.
- Reservar uppercase para labels breves, no para frases.
- El nombre de una Beluer tiene mayor jerarquía que su nivel, metadata o rating.

## 6. Espaciado

Escala base oficial:

```text
4, 8, 12, 16, 24, 32, 40, 48, 64 px
```

Excepciones semánticas aprobadas:

| Token semántico | Valor | Uso |
| --- | ---: | --- |
| `mobile-gutter` | `18px` | contenido y rails mobile |
| `mobile-hero-gutter` | `14px` | separación lateral exclusiva del hero mobile |
| `desktop-card-gap` | `18px` | grids de servicios y Beluers |
| `mobile-rail-gap` | `14px` | separación entre cards en rails horizontales |

No crear un token nuevo por cada valor aislado. Primero usar la escala base; aceptar una excepción únicamente cuando represente una regla de layout repetible.

## 7. Layout y responsive

### 7.1 Contenedor

- Ancho máximo del contenido principal: `1320px`.
- Centrar el contenido dentro del espacio disponible después del sidebar.
- El desktop grande no debe dejar una superficie residual excesiva a la derecha.
- El canvas principal es `--belu-canvas`.

### 7.2 Sidebar

| Viewport | Comportamiento |
| --- | --- |
| Base desktop | `248px` |
| `<=1180px` | `220px` |
| `<=900px` | `88px`; modo compacto solo con iconos |
| `<=767px` | oculto; usar bottom navigation |
| `>=1600px` | puede ampliarse a `268px`, como en la Golden Screen, si el contenido conserva `max-width: 1320px` |

El desplazamiento del contenido debe coincidir exactamente con el ancho vigente del sidebar.

### 7.3 Breakpoints oficiales

| Breakpoint | Objetivo |
| ---: | --- |
| `370px` | compactar acciones del hero; apilar botones si es necesario |
| `767px` | transición a experiencia mobile y bottom navigation |
| `900px` | sidebar compacto y ajustes intermedios de layout |
| `1180px` | sidebar desktop reducido y composición condensada |
| `1600px` | ajuste para desktop grande sin expandir el contenido más allá de `1320px` |

Diseñar y revisar como mínimo en `390`, `768`, `1024`, `1440` y `1920px`.

## 8. Radius

| Elemento | Radius oficial |
| --- | ---: |
| Hero desktop | `20px` |
| Hero mobile | `18px` |
| Cards | `16px` |
| Botones | `12px` |
| Navegación activa | `12px` |
| Pills / chips | `999px` |
| Avatares y botones circulares | `50%` |

La `BeluerCard` de la Golden Screen utiliza actualmente `17px`; las implementaciones posteriores deben normalizarla a `16px`. No introducir radios grandes de plantilla SaaS.

## 9. Bordes y elevación

Borde base:

```css
border: 1px solid var(--belu-border-subtle); /* #E8DFDA */
```

Orden de recursos para separar jerarquías:

```text
surface → whitespace → border → shadow
```

Reglas:

- Usar sombras solo cuando una capa fija necesita separarse del contenido en movimiento.
- No aplicar sombra por defecto a todas las cards.
- Preferir cambios de borde, color de superficie o escala fotográfica para hover.
- La sombra de la bottom navigation es una excepción aprobada: `0 -8px 28px rgba(48, 34, 29, 0.06)`.
- El blur de una superficie flotante no reemplaza el contraste ni el borde.

## 10. Motion

| Tipo | Duración | Curva | Uso |
| --- | ---: | --- | --- |
| Micro UI | `180ms` | `ease` | color, borde, desplazamiento corto, hover de iconos |
| Photography cards | `450ms` | `cubic-bezier(.2,.7,.2,1)` | zoom sutil de imágenes |
| Hero | `700ms` | `cubic-bezier(.2,.7,.2,1)` | zoom fotográfico de baja amplitud |

Límites:

- La animación debe explicar estado o reforzar tactilidad; no decorar.
- El zoom de fotografía debe ser sutil: aproximadamente `1.018` en hero y hasta `1.045` en cards.
- No usar rebotes, loops, parallax fuerte ni transiciones largas de layout.
- Implementar `prefers-reduced-motion` y reducir transiciones/animaciones a una duración prácticamente nula.

## 11. Accesibilidad

- Touch target mínimo: `44 × 44px`.
- Focus visible: `3px` de outline y `3px` de offset.
- El foco debe conservar contraste sobre canvas, superficie y fotografía.
- Toda imagen significativa requiere `alt` descriptivo según su función y contenido.
- Imágenes puramente decorativas deben usar `alt=""`.
- Usar heading levels en orden lógico.
- Usar `Link` o anchor solo para navegación.
- Usar `button` para acciones que no cambian de destino.
- No usar un anchor como sustituto de una acción.
- Marcar la ruta activa con `aria-current="page"`.
- Ocultar iconos redundantes a lectores de pantalla mediante `aria-hidden="true"`.
- Los botones solo-icono requieren un nombre accesible específico.
- Mantener contrastes WCAG razonables y no comunicar estados únicamente mediante color.

## 12. Iconografía

- Usar SVG lineal consistente.
- Stroke recomendado: `1.5–2px`; referencia actual: `1.7px`.
- Tamaño común: `20–24px`; adaptar a la densidad del componente.
- No usar emoji como iconografía de navegación o acciones.
- `✦` es un símbolo de marca permitido, no un icono funcional universal.

## 13. Fotografía

### Hero

- Lifestyle o servicio real a domicilio.
- Debe aportar contexto de comodidad, confianza y experiencia.
- La composición debe reservar espacio legible para contenido y gradiente.

### Servicios

- Macro, detalle técnico, procedimiento o resultado.
- Cada servicio debe usar una imagen claramente distinta y relacionada.
- Lashes: close-up de pestañas o procedimiento.
- Nails: manicure, manos, herramientas y resultado realista.

### Beluers

- Especialistas reales trabajando, no headshots corporativos.
- Preferir encuadre vertical.
- Mostrar el rostro cuando sea adecuado sin forzar mirada a cámara.
- Cada perfil debe corresponder a una persona distinta.

Evitar:

- stock genérico;
- renders 3D e ilustraciones;
- piel excesivamente retocada;
- poses genéricas mirando a cámara;
- estética de salón infantil;
- reutilizar el mismo modelo para representar varias especialistas;
- texto, marcas de agua o logos incrustados en la foto.

## 14. Formato monetario

Formato único:

```text
S/ 95
S/ 120
S/ 65
```

Reglas:

- Usar `S/`, un espacio y el importe.
- No usar `S/.`, `S/95` ni variantes mezcladas.
- En cards de discovery, anteponer `Desde ` cuando el precio sea inicial: `Desde S/ 95`.
- No mostrar precios inventados o no respaldados por el producto.

## 15. Navegación oficial

### Desktop

Orden y labels:

1. Inicio
2. Servicios
3. Reservar
4. Historial
5. Mi perfil

### Mobile

Orden y labels:

1. Inicio
2. Servicios
3. Reserva
4. Historial
5. Perfil

`Reserva` es la acción visualmente enfatizada en mobile, pero no debe convertirse en un botón flotante sobredimensionado.

Bottom navigation:

- altura mínima: `68px + env(safe-area-inset-bottom)`;
- posición fija inferior;
- cinco columnas equivalentes;
- fondo surface con borde superior sutil;
- padding inferior que incluya `env(safe-area-inset-bottom)`;
- el contenido de la página debe reservar al menos `82px + env(safe-area-inset-bottom)` para no quedar oculto.

## 16. Especificación de componentes

### 16.1 PrimaryButton

**Propósito:** representar la acción dominante del contexto.

**Estructura:** label breve y, opcionalmente, icono direccional. Usar anchor/Link si navega; usar `button` si ejecuta una acción.

**Desktop:** altura mínima `48px`, radius `12px`, padding horizontal `20px`, fondo `--belu-red`, texto blanco.

**Mobile:** altura mínima `46px`, padding horizontal `16px`; a `<=370px` puede ocupar todo el ancho.

**Estados:** default rojo, hover/pressed `--belu-red-dark`, focus visible oficial y disabled con contraste perceptible y sin interacción.

**Usar:** para reservar, confirmar o completar la única acción principal del contexto.

**No usar:** dos PrimaryButton en el mismo bloque; acciones terciarias; navegación menor.

### 16.2 SecondaryButton

**Propósito:** ofrecer una alternativa subordinada al CTA principal.

**Estructura:** label breve; icono solo si aporta dirección clara.

**Desktop / mobile:** comparte altura y radius con PrimaryButton. Sobre fotografía usa superficie translúcida y borde con contraste suficiente.

**Estados:** cambio leve de borde/surface, focus visible y disabled explícito.

**Usar:** por ejemplo, “Explorar servicios” junto a “Reservar ahora”.

**No usar:** como segundo CTA dominante ni para llenar espacio.

### 16.3 IconButton

**Propósito:** acción compacta y reconocible mediante un icono.

**Estructura:** `button`, SVG y nombre accesible. Forma circular o radius `12px` según contexto.

**Desktop / mobile:** target mínimo `44px`; no reducir el área interactiva aunque el icono mida `18–20px`.

**Estados:** default, hover, active, focus-visible, disabled y selected cuando corresponda.

**Usar:** controles reales como abrir perfil, cerrar un modal o avanzar una galería.

**No usar:** sin label accesible, con emoji o para funciones sin soporte real.

### 16.4 ClientSidebar

**Propósito:** navegación primaria desktop.

**Estructura:** marca, navegación, mensaje breve opcional y Cerrar sesión al final.

**Desktop:** `248px`; `220px` a `<=1180px`; `88px` con iconos a `<=900px`.

**Mobile:** oculto a `<=767px`; ClientBottomNav toma su función.

**Estados:** ruta activa con superficie rosa suave y texto/icono rojo; hover sutil; focus visible; Cerrar sesión mantiene semántica de botón.

**Usar:** una sola vez por shell autenticado desktop.

**No usar:** simultáneamente con bottom navigation visible ni incluir Favoritas sin funcionalidad real.

### 16.5 ClientHeader

**Propósito:** dar contexto de sesión y acceso al perfil sin competir con el contenido.

**Estructura:** saludo/contexto a la izquierda y control de perfil a la derecha; mobile puede mostrar marca compacta y avatar.

**Desktop:** altura mínima de referencia `86px`, borde inferior sutil y padding horizontal responsivo.

**Mobile:** sticky, altura mínima `62px`, padding `8px 18px`; ocultar metadata redundante.

**Estados:** avatar con target accesible, hover/focus y estado de menú solo si el menú existe.

**Usar:** una vez por pantalla de producto.

**No usar:** para repetir un segundo saludo grande inmediatamente debajo.

### 16.6 ClientBottomNav

**Propósito:** navegación primaria mobile persistente.

**Estructura:** cinco destinos oficiales en una cuadrícula de cinco columnas.

**Desktop:** oculto por encima de `767px`.

**Mobile:** fijo, `68px + safe-area`; `Reserva` es la acción destacada con contenedor rojo compacto.

**Estados:** active, hover/pressed, focus-visible; `aria-current` en la ruta activa.

**Usar:** en shells autenticados mobile.

**No usar:** más de cinco destinos, labels largos o CTA flotante gigante.

### 16.7 BookingHero

**Propósito:** establecer contexto y conducir a la siguiente acción de reserva.

**Estructura:** fotografía, gradiente, kicker opcional, H1, texto breve, PrimaryButton y SecondaryButton.

**Desktop:** `min-height: 410px`, radius `20px`, contenido de aproximadamente `520px` y máximo `56%`, padding aproximado `46px 50px`; gradiente horizontal.

**Mobile:** `min-height: 420px`, radius `18px`, contenido al `100%`, padding `24px`; gradiente vertical hacia la parte inferior.

**Estados:** hover fotográfico sutil solo en dispositivos compatibles; acciones con estados completos; respetar reduced motion.

**Usar:** para una acción contextual dominante, incluida la transformación futura a “Tu próxima cita” cuando existan datos reales.

**No usar:** múltiples CTAs dominantes, textos extensos, mensajes negativos como gran titular o fotografía sin contraste de lectura.

### 16.8 SectionHeader

**Propósito:** introducir una sección y ofrecer una navegación secundaria opcional.

**Estructura:** H2 a la izquierda y Link breve con flecha a la derecha.

**Desktop:** separación inferior aproximada `21px`; heading fluido.

**Mobile:** gutters `18px`, heading `1.34rem` y target del link de al menos `44px`.

**Estados:** link con cambio a rojo y desplazamiento de flecha de hasta `3px`.

**Usar:** al inicio de rails o colecciones.

**No usar:** si no existe un destino real para el link secundario.

### 16.9 ServiceCard

**Propósito:** descubrimiento visual de un servicio.

**Estructura:** fotografía dominante, indicador direccional, categoría, nombre y `Desde S/ X`.

**Desktop:** grid de tres columnas, gap `18px`, imagen con aspect ratio `1.38` y radius `16px`.

**Mobile:** pertenece a ServiceRail; ancho `min(76vw, 292px)` e imagen con aspect ratio `1.28`.

**Estados:** hover con zoom máximo aproximado `1.045`, indicador direccional rojo y focus visible del enlace.

**Usar:** para navegar al detalle o selección de un servicio real.

**No usar:** descripciones largas, datos no esenciales, fotografía repetida o más de una acción dentro de la card.

### 16.10 ServiceRail

**Propósito:** organizar ServiceCard de forma responsive.

**Estructura:** colección semántica de cards hermanas.

**Desktop:** grid de tres columnas y gap `18px`.

**Mobile:** flex horizontal, gap `14px`, padding lateral `18px`, `scroll-snap-type: x mandatory`, cada card con `scroll-snap-align: start`; mostrar aproximadamente `1.15–1.25` cards para sugerir deslizamiento.

**Estados:** scrolling táctil nativo; scrollbar puede ocultarse visualmente sin impedir la interacción.

**Usar:** para conjuntos cortos de servicios destacados.

**No usar:** como carrusel automático ni ocultar información crítica fuera del primer ítem.

### 16.11 BeluerCard

**Propósito:** presentar una especialista y facilitar acceso a su perfil o selección.

**Estructura y jerarquía:** fotografía; AvailabilityBadge solo si es real; `Verificada ✦`; nombre; `Desde S/ X`; especialidad; Rating con cantidad de reseñas o `Nueva en belu`.

**Desktop:** grid de tres columnas, gap `18px`, borde base de `1px`, surface blanca, radius oficial `16px`.

**Mobile:** pertenece a BeluerRail; ancho `min(75vw, 286px)`, gap `14px`, aspect ratio fotográfico de referencia `.95`.

**Estados:** hover con borde ligeramente más visible, elevación geométrica máxima de `2px`, zoom fotográfico sutil y focus visible.

**Usar:** para especialistas reales con fotografía, especialidad y precio válido.

**No usar:** iniciales como sustituto permanente de fotografía, disponibilidad inferida, rating sin reseñas o rating `0.0`.

La Golden Screen contiene un corazón visual de Favoritas. `FavoriteButton` **no es un componente habilitado ni predeterminado del MVP** hasta que exista soporte real de backend, persistencia, estados y feedback de error/éxito. No implementar ni mostrar una acción falsa.

### 16.12 BeluerRail

**Propósito:** organizar BeluerCard de forma responsive.

**Estructura:** colección semántica de perfiles reales.

**Desktop:** grid de tres columnas, gap `18px`.

**Mobile:** flex horizontal, gap `14px`, gutters `18px`, scroll snap obligatorio y cards alineadas al inicio.

**Estados:** scrolling táctil nativo, navegación por teclado y foco visible en elementos interactivos internos.

**Usar:** para un conjunto curado de especialistas relevantes.

**No usar:** auto-rotación, perfiles duplicados o perfiles sin servicio activo.

### 16.13 TrustStrip

**Propósito:** resumir señales de confianza sin interrumpir la navegación.

**Estructura:** mensaje editorial y tres atributos con iconos lineales:

- Especialistas verificadas
- Pago protegido
- Atención a domicilio

Mensaje aprobado:

> Belleza con la tranquilidad de estar en buenas manos.

**Desktop:** composición horizontal con bordes superior e inferior, sin contenedor-card exterior.

**Mobile:** composición vertical, gutters `18px` y separación clara entre atributos.

**Estados:** no requiere hover salvo que un atributo sea un enlace real.

**Usar:** una vez, después del contenido principal de descubrimiento.

**No usar:** tres cards SaaS grandes, sombras o párrafos extensos.

### 16.14 AvailabilityBadge

**Propósito:** comunicar disponibilidad operativa confirmada.

**Estructura:** indicador visual, label breve y pill `999px`.

**Desktop / mobile:** overlay compacto sobre fotografía; contraste suficiente y sin cubrir el sujeto principal.

**Estados:** disponible, no disponible u oculto según datos. El verde `--belu-success` solo se usa para disponibilidad positiva confirmada.

**Usar:** únicamente si horario, zona y capacidad hacen verdadera la afirmación.

**No usar:** como adorno, con disponibilidad estática o si el dato puede estar desactualizado.

### 16.15 Rating

**Propósito:** resumir reputación respaldada por reseñas.

**Estructura:** estrella SVG, promedio y cantidad de reseñas; ejemplo: `★ 4.9 (48)`.

**Desktop / mobile:** compacto, subordinado al nombre y especialidad.

**Estados:** mostrar Rating si `reviewCount > 0`; mostrar `Nueva en belu` o no mostrar rating si no existen reseñas.

**Usar:** con promedio calculado y recuento real.

**No usar:** `0.0`, estrellas vacías, promedios sin cantidad de reseñas o valores inventados.

### 16.16 Status / Badge

**Propósito:** comunicar un estado de dominio real y breve.

**Estructura:** label conciso dentro de una pill; icono solo si mejora comprensión.

**Desktop / mobile:** tamaño compacto, target interactivo de `44px` solo si el badge realiza una acción; los badges informativos no deben parecer botones.

**Estados:** cada variante debe tener texto, color con contraste y significado documentado. Nunca depender solo del color.

**Usar:** estados reales como disponibilidad, confirmación o progreso, cuando sean relevantes para la decisión de la clienta.

**No usar:** metadata ordinaria, decoración, categorías que funcionan mejor como texto o estados inexistentes en backend.

## 17. Golden Rules

1. Photography is part of the interface.
2. One dominant action per context.
3. Avoid nested cards.
4. Avoid decorative shadows.
5. Whitespace is intentional.
6. BELU client surfaces are consumer-product UI, not SaaS dashboards.
7. Never show functionality that is not real.
8. Never show rating `0.0`.
9. Use one consistent money format: `S/ 95`.
10. Mobile-first.
11. The `✦` may be used as a brand accent but sparingly.
12. Never expose internal naming for brand graphic resources.
13. Preserve the official tagline: “luce increíble, cuando quieras”.

## 18. Checklist de implementación

Antes de aprobar una nueva superficie BELU:

- [ ] La composición sigue Editorial Beauty + Product UI.
- [ ] Existe una única acción dominante por contexto.
- [ ] La fotografía es relevante, distinta y tiene alt text correcto.
- [ ] No hay funcionalidades simuladas ni controles sin soporte real.
- [ ] No hay ratings `0.0` ni ratings sin reseñas.
- [ ] Los precios usan `S/ X` de forma consistente.
- [ ] Los touch targets alcanzan al menos `44px`.
- [ ] Los estados de focus son visibles.
- [ ] Links y botones usan semántica correcta.
- [ ] Mobile respeta gutters, rails, safe area y contenido no obstruido.
- [ ] No se añadieron cards, sombras o pills sin necesidad.
- [ ] `prefers-reduced-motion` está implementado.
- [ ] El tagline oficial no fue reemplazado ni reinterpretado.
- [ ] No se expone nomenclatura interna de recursos de marca.

