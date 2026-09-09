# Backlog de Implementación — MVP Gestión Administrativa para Complejo de Pádel

## 1. Estrategia de implementación

La implementación se realizará mediante **vertical slices**.

Cada slice debe atravesar las capas necesarias para entregar una funcionalidad completa:

```text
Base de datos
      ↓
Lógica de dominio
      ↓
Server Action
      ↓
Queries / acceso a datos
      ↓
Componentes UI
      ↓
Página
      ↓
Pruebas
```

El objetivo no es construir capas completas de manera aislada, sino entregar incrementos funcionales utilizables.

### Orden general

```text
Integración 1
Fundaciones + acceso
        ↓
Integración 2
Productos + stock
        ↓
Integración 3
Compras
        ↓
Integración 4
Jugadores + cuenta corriente
        ↓
Integración 5
Ventas + historial + reportes
```

---

# INTEGRACIÓN 1 — Fundaciones, autenticación y App Shell

## Objetivo

Construir la base ejecutable del sistema sobre la cual puedan implementarse las funcionalidades del negocio.

Al finalizar esta integración debe existir una aplicación funcional en la que el administrador pueda iniciar sesión y acceder a un dashboard protegido con la estructura visual definitiva.

---

## Slice 1.1 — Inicialización técnica del proyecto

### Objetivo

Dejar configurado el proyecto Next.js y las herramientas base necesarias para comenzar el desarrollo.

### Requerimientos técnicos

- Next.js con App Router.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Lucide React.
- Supabase.
- Configuración de variables de entorno.
- Configuración de alias `@/`.
- Configuración de `cn()` y utilidades generales.
- Estructura de carpetas basada en features.
- Configuración inicial de Git.
- Configuración de linting/formateo.
- Preparación de Vitest y Playwright.

La estructura propuesta separa `app`, `features`, `actions`, `lib` y `types`, manteniendo las responsabilidades aisladas.

### Requerimientos funcionales

- La aplicación debe poder iniciarse localmente.
- Debe existir una página inicial.
- Debe existir una estructura visual base.
- Los componentes shadcn/ui requeridos deben estar disponibles.

### Definition of Done

- `npm/yarn` puede ejecutar el proyecto sin errores.
- Next.js inicia correctamente.
- Tailwind funciona.
- shadcn/ui funciona.
- Supabase está correctamente configurado.
- Las variables de entorno están documentadas.
- Vitest y Playwright pueden ejecutarse.
- La estructura inicial de carpetas está creada.
- No existen errores de TypeScript.

---

## Slice 1.2 — Supabase + modelo inicial + autenticación

### Objetivo

Permitir que el único administrador pueda autenticarse y que las operaciones posteriores puedan ejecutarse dentro de una sesión válida.

### Requerimientos técnicos

- Configurar cliente Supabase para Server Components.
- Configurar cliente Supabase para Client Components cuando sea necesario.
- Configurar middleware/proxy de autenticación.
- Crear migraciones iniciales.
- Configurar Supabase Auth.
- Definir tipos de base de datos.
- Proteger las rutas administrativas.
- Preparar RLS para garantizar que únicamente el usuario autorizado pueda operar sobre los datos.

El diseño contempla explícitamente Supabase como persistencia PostgreSQL y autenticación integrada.

### Requerimientos funcionales

- El administrador debe poder iniciar sesión.
- Un usuario no autenticado no puede acceder al dashboard.
- Un usuario autenticado puede acceder al dashboard.
- Debe existir cierre de sesión.
- No se deben implementar múltiples roles.

### Definition of Done

- Login funcional.
- Logout funcional.
- Rutas privadas protegidas.
- Sesión persistente.
- Usuario autenticado correctamente identificado desde Server Actions.
- Políticas de seguridad básicas funcionando.
- Tests de autenticación/protección de rutas.

---

## Slice 1.3 — App Shell administrativo

### Objetivo

Construir la navegación principal que utilizarán todas las funcionalidades futuras.

### Requerimientos técnicos

- `DashboardLayout`.
- Sidebar responsive.
- Header.
- Contenedor de página reutilizable.
- Componentes shared.
- shadcn/ui.
- Tailwind únicamente, sin CSS puro.
- Estados de loading, error y empty state reutilizables.

El diseño establece un layout persistente con Sidebar y navegación hacia ventas, productos, jugadores, compras, historial y reportes.

### Requerimientos funcionales

El administrador debe poder navegar entre:

- Dashboard.
- Productos.
- Stock.
- Compras.
- Ventas.
- Jugadores.
- Cuenta corriente.
- Reportes.
- Historial.

### Definition of Done

- Navegación funcional.
- Responsive.
- Todas las rutas principales creadas.
- Layout reutilizable.
- Estados de loading/error/empty reutilizables.
- UI consistente con la guía visual.
- La navegación no contiene funcionalidades falsas: las páginas todavía no implementadas deben mostrar un estado apropiado.

---

# INTEGRACIÓN 2 — Productos e inventario

## Objetivo

Permitir administrar el catálogo de productos y controlar el stock de manera trazable.

Esta integración debe dejar operativo el primer módulo de negocio completo.

---

## Slice 2.1 — Gestión de productos

### Objetivo

Permitir crear, consultar, modificar y eliminar lógicamente productos.

### Requerimientos técnicos

- Tabla `products`.
- Migración Supabase.
- Tipos TypeScript.
- Schema de validación.
- `createProductAction`.
- Action para actualizar producto.
- Action para eliminación lógica.
- Queries de productos activos.
- Feature `/features/products`.
- Formulario reutilizable.
- Tabla de productos.
- Dialog de confirmación.

El modelo contempla nombre, precio, unidad, stock, indicador de alquiler y eliminación lógica.

### Requerimientos funcionales

Un producto debe permitir:

- Nombre.
- Precio de venta.
- Unidad de medida.
- Stock inicial.
- Identificación como alquiler de cancha.

Debe poder:

- Crear.
- Editar.
- Eliminar.
- Consultar.

Los productos eliminados:

- no aparecen en nuevas operaciones;
- conservan su historial.

### Definition of Done

- CRUD funcional.
- Validaciones de formulario.
- Eliminación lógica.
- Productos inactivos excluidos de nuevas operaciones.
- Productos históricos siguen siendo consultables.
- Tests de las Server Actions.
- UI responsive.
- Precios mostrados en ARS.

---

## Slice 2.2 — Stock y movimientos

### Objetivo

Incorporar el control de inventario y su historial.

### Requerimientos técnicos

- Tabla `stock_movements`.
- `adjustStockAction`.
- Actualización consistente de `products.current_stock`.
- Registro inmutable de movimientos.
- Tipos de movimiento.
- Queries de historial.
- Componente de tabla de movimientos.
- Manejo explícito de stock negativo.

El modelo define movimientos de compra, venta, ajuste manual y anulación, conservando cantidad, stock resultante, referencia y motivo.

### Requerimientos funcionales

El administrador debe poder:

- Ver stock actual.
- Aumentar stock manualmente.
- Disminuir stock manualmente.
- Registrar opcionalmente un motivo.
- Consultar historial.

Debe permitirse:

```text
Stock = 0
Ajuste = -3
Resultado = -3
```

El sistema no debe bloquear operaciones por stock negativo.

### Definition of Done

- Ajustes positivos funcionan.
- Ajustes negativos funcionan.
- Stock negativo permitido.
- Cada ajuste genera movimiento.
- `stock_after` queda registrado.
- El historial es consultable.
- El producto de alquiler no genera stock físico.
- Tests cubren RN-16, RN-17 y RN-18.

---

## Slice 2.3 — Primer flujo vertical completo

### Objetivo

Consolidar productos + stock en un flujo operativo completo.

### Requerimientos técnicos

- Integrar UI de productos con acciones.
- Actualización/revalidación de datos.
- Estados pending/error/success.
- Feedback mediante Toast.
- Componentes reutilizables.

### Requerimientos funcionales

El administrador debe poder:

```text
Crear producto
    ↓
Ver producto
    ↓
Ver stock
    ↓
Modificar stock
    ↓
Consultar movimiento
```

### Definition of Done

Un administrador puede utilizar el módulo de productos e inventario sin intervención técnica.

---

# INTEGRACIÓN 3 — Compras y entrada de stock

## Objetivo

Permitir registrar compras reales del negocio y conectarlas automáticamente con inventario y gastos.

Una compra debe producir una única operación coherente:

```text
Compra
 ├── Detalle de productos
 ├── Precio histórico
 ├── Gasto
 └── Incremento de stock
```

Las compras se consideran siempre pagadas y no existe cuenta corriente de proveedores.

---

## Slice 3.1 — Registro de compras

### Objetivo

Permitir registrar una compra con múltiples productos.

### Requerimientos técnicos

- Tablas `purchases` y `purchase_items`.
- `recordPurchaseAction`.
- Validación de items.
- Cálculo de subtotales.
- Cálculo de total.
- Persistencia transaccional.
- Fecha configurable.
- Notas opcionales.

El diseño técnico ya define `recordPurchaseAction` y sus efectos sobre stock y movimientos.

### Requerimientos funcionales

El administrador debe poder:

- Seleccionar productos.
- Indicar cantidades.
- Indicar precio de compra.
- Agregar varios productos.
- Modificar la fecha.
- Agregar notas.
- Confirmar compra.

La compra debe:

- aumentar stock;
- conservar el precio histórico;
- registrar el gasto;
- quedar como pagada.

### Definition of Done

- Se puede registrar una compra completa.
- Stock aumenta correctamente.
- Total se calcula correctamente.
- Cada item conserva su precio de compra.
- La compra queda almacenada.
- Se generan movimientos de stock.
- No existe deuda con proveedores.
- La operación es atómica.

---

## Slice 3.2 — Historial de compras

### Objetivo

Permitir consultar las compras realizadas.

### Requerimientos técnicos

- Query paginada/ordenada de compras.
- Consulta de `purchase_items`.
- Tabla reutilizable.
- Vista de detalle.

### Requerimientos funcionales

El administrador debe poder:

- Ver compras.
- Ver fecha.
- Ver total.
- Ver productos.
- Ver cantidades.
- Ver precios históricos.
- Ver notas.

### Definition of Done

- Historial funcional.
- Detalle de compra funcional.
- Las modificaciones posteriores al producto no alteran precios históricos.
- Datos correctamente formateados en ARS.

---

## Slice 3.3 — Flujo vertical de reposición

### Objetivo

Cerrar el ciclo operativo:

```text
Producto
   ↓
Stock bajo
   ↓
Registrar compra
   ↓
Stock incrementa
   ↓
Movimiento registrado
```

### Definition of Done

- El administrador puede detectar stock.
- Registrar compra.
- Ver inmediatamente el nuevo stock.
- Consultar el movimiento generado.
- Tests de integración cubren el flujo completo.

---

# INTEGRACIÓN 4 — Jugadores y cuenta corriente

## Objetivo

Permitir administrar jugadores y sus saldos, construyendo el ledger necesario para que posteriormente las ventas a cuenta corriente funcionen correctamente.

La cuenta corriente utiliza la convención:

```text
Saldo > 0 → dinero a favor
Saldo < 0 → deuda
Saldo = 0 → saldado
```

Esta convención y sus movimientos están definidas explícitamente en el análisis funcional.

---

## Slice 4.1 — Gestión de jugadores

### Objetivo

Permitir administrar la información básica de los jugadores.

### Requerimientos técnicos

- Tablas `players` y `player_phones`.
- CRUD mediante Server Actions.
- Validación de nivel 1–10.
- Soporte de múltiples teléfonos.
- Eliminación lógica.
- Queries de jugadores activos.
- Feature `/features/players`.

El modelo E-R separa correctamente `PLAYER_PHONES` para soportar múltiples teléfonos.

### Requerimientos funcionales

Cada jugador debe permitir:

- Nombre.
- Apellido.
- Uno o más teléfonos.
- Género.
- Nivel de habilidad.

El nivel debe estar entre 1 y 10.

Debe poder:

- Crear.
- Editar.
- Eliminar lógicamente.
- Buscar.
- Consultar.

### Definition of Done

- CRUD funcional.
- Múltiples teléfonos funcionales.
- Validación 1–10.
- Eliminación lógica.
- Jugadores eliminados no aparecen en nuevas operaciones.
- Historial del jugador permanece disponible.

---

## Slice 4.2 — Cuenta corriente y movimientos

### Objetivo

Construir el ledger financiero del jugador.

### Requerimientos técnicos

- Tabla `account_movements`.
- `recordPaymentAction`.
- `adjustAccountBalanceAction`.
- Actualización consistente de `current_balance`.
- Historial inmutable.
- Tipos de movimiento.
- Funciones puras para cálculo de saldo cuando sea necesario.

El diseño establece que cobros y ajustes generan movimientos y actualizan `current_balance`.

### Requerimientos funcionales

El administrador debe poder:

- Ver saldo.
- Registrar cobro.
- Registrar cobro sin asociarlo a una venta.
- Realizar ajuste manual.
- Indicar motivo opcional.
- Consultar historial.

Ejemplo:

```text
Saldo: -$10.000
Cobro: +$4.000
Saldo: -$6.000
```

### Definition of Done

- Cobro funcional.
- Ajuste funcional.
- Saldo actualizado correctamente.
- Cada operación genera movimiento.
- Historial conserva todos los movimientos.
- Deuda/a favor/saldado se visualizan correctamente.
- Tests de saldo y movimientos.

---

## Slice 4.3 — Vista operativa de jugadores

### Objetivo

Crear una pantalla que permita administrar jugadores y sus cuentas desde un único lugar.

### Requerimientos técnicos

- Tabla de jugadores.
- Búsqueda por nombre/teléfono.
- `AccountBadge`.
- Dialog de cobro.
- Dialog de ajuste.
- Vista de detalle.

La guía UI define explícitamente los estados visuales para deuda, saldo a favor y saldo cero.

### Requerimientos funcionales

Desde la lista el administrador debe poder:

```text
Buscar jugador
      ↓
Ver saldo
      ↓
Cobrar
      ↓
Ajustar
      ↓
Consultar movimientos
```

### Definition of Done

- Flujo completo usable desde UI.
- Saldo actualizado después de cada operación.
- Historial visible.
- Estados de cuenta correctamente diferenciados.
- Tests E2E del flujo de cobro.

---

# INTEGRACIÓN 5 — Ventas, alquileres, historial y reportes

## Objetivo

Construir el núcleo económico del sistema y conectar todos los módulos anteriores.

Esta integración representa el mayor valor funcional del MVP.

Debe permitir:

```text
Productos ──────┐
                │
Jugadores ──────┼──→ Venta
                │       │
Stock ──────────┘       ├──→ Ingreso
                        ├──→ Stock
                        └──→ Cuenta corriente
                                ↓
                           Reportes
```

El diseño técnico define la venta como una operación transaccional que puede afectar simultáneamente stock y cuenta corriente.

---

## Slice 5.1 — Registro de ventas

### Objetivo

Permitir registrar ventas de productos físicos.

### Requerimientos técnicos

- Tablas `sales` y `sale_items`.
- `recordSaleAction`.
- Carrito.
- Selector de productos.
- Selector de jugador.
- Selector de medio de pago.
- Cálculo de total.
- Persistencia de precio histórico.
- Transacción atómica.

### Requerimientos funcionales

Una venta puede contener múltiples productos.

Puede tener:

- jugador responsable opcional;
- efectivo;
- transferencia;
- cuenta corriente;
- fecha configurable;
- notas.

Una venta a cuenta corriente requiere jugador responsable.

Una venta física debe disminuir stock, incluso si el stock resulta negativo.

### Definition of Done

- Venta en efectivo funcional.
- Venta por transferencia funcional.
- Venta a cuenta corriente funcional.
- Stock actualizado.
- Precio histórico conservado.
- Cuenta corriente actualizada cuando corresponde.
- Validación de jugador para cuenta corriente.
- Test de RN-18.
- Test de RN-09/RN-11.

---

## Slice 5.2 — Alquiler de cancha como venta

### Objetivo

Permitir registrar el alquiler de cancha sin introducir ningún concepto de agenda o reserva.

### Requerimientos técnicos

- Utilizar producto con `is_court_rental = true`.
- El alquiler no debe afectar stock físico.
- Integración con el mismo `recordSaleAction`.
- UI diferenciada visualmente.

### Requerimientos funcionales

El administrador debe poder:

```text
Seleccionar "Alquiler de cancha"
       ↓
Cantidad = 1
       ↓
Jugador responsable opcional
       ↓
Medio de pago
       ↓
Registrar venta
```

No se debe solicitar:

- horario;
- cancha;
- duración;
- reserva;
- disponibilidad.

El análisis establece expresamente que estos conceptos están fuera del sistema.

### Definition of Done

- Alquiler registrado como venta.
- No modifica stock físico.
- Puede asociarse a jugador responsable.
- Puede utilizar cualquiera de los medios de pago permitidos.
- Aparece en historial.
- Cuenta como alquiler para reportes cuando corresponde.

---

## Slice 5.3 — Historial y anulación de ventas

### Objetivo

Permitir consultar ventas y anularlas sin destruir información histórica.

### Requerimientos técnicos

- Query de ventas.
- Detalle de venta.
- `cancelSaleAction`.
- Estado `COMPLETED/CANCELLED`.
- Reversión transaccional.
- Registro de movimientos inversos.
- Confirmación antes de anular.

El diseño exige que la anulación revierta stock y cuenta corriente, manteniendo la venta en la base de datos.

### Requerimientos funcionales

Al anular una venta:

**Productos:**

```text
Venta -2 stock
      ↓
Anulación
      ↓
Stock +2
```

**Cuenta corriente:**

```text
Venta -$10.000
      ↓
Anulación
      ↓
+$10.000
```

La venta debe continuar visible como anulada.

### Definition of Done

- Anulación funcional.
- Stock revertido.
- Cuenta corriente revertida.
- Venta permanece en historial.
- Venta anulada visualmente diferenciada.
- No puede anularse nuevamente.
- Ranking excluye la venta anulada.
- Tests de integración cubren la reversión completa.

La guía UI establece el tratamiento visual de las ventas anuladas mediante tachado, estado y acción de anulación.

---

## Slice 5.4 — Historial general de operaciones

### Objetivo

Centralizar la consulta de las operaciones registradas por el sistema.

### Requerimientos técnicos

Crear vistas/queries para:

- Ventas.
- Compras.
- Movimientos de stock.
- Movimientos de cuenta corriente.
- Cobros.
- Ajustes.

### Requerimientos funcionales

El administrador debe poder consultar las operaciones históricas sin eliminar información.

Debe poder identificar:

- fecha;
- tipo de operación;
- importe/cantidad;
- jugador cuando corresponda;
- producto cuando corresponda;
- estado cuando corresponda.

### Definition of Done

- Historial accesible desde navegación.
- Todas las operaciones importantes son consultables.
- Las operaciones anuladas permanecen visibles.
- Los datos históricos no dependen del estado actual de productos o jugadores.

---

## Slice 5.5 — Reportes económicos y operativos

### Objetivo

Convertir las operaciones registradas en información útil para el administrador.

### Requerimientos técnicos

Implementar `AnalyticsEngine` mediante funciones/queries especializadas para:

- ingresos diarios;
- ingresos mensuales;
- gastos diarios;
- gastos mensuales;
- alquileres semanales;
- saldos de jugadores;
- ranking semanal;
- ranking mensual.

Los reportes deben excluir ventas anuladas de los cálculos correspondientes. El diseño ya define estas reglas para ingresos, gastos, alquileres y rankings.

### Requerimientos funcionales

Debe mostrar:

#### Saldos

- Deudores.
- Jugadores con saldo a favor.
- Jugadores saldados.

#### Ingresos

- Diario.
- Mensual.

#### Gastos

- Diario.
- Mensual.

#### Alquileres

- Cantidad semanal.

#### Ranking semanal

Solo jugadores con:

```text
> 2 alquileres válidos
```

Es decir:

```text
0–2 → no aparece
3+  → aparece
```

#### Ranking mensual

Solo jugadores con:

```text
> 8 alquileres válidos
```

Es decir:

```text
0–8 → no aparece
9+  → aparece
```

Las ventas anuladas no cuentan.

### Definition of Done

- Todos los reportes requeridos funcionan.
- Fechas modificadas de operaciones son consideradas correctamente.
- Ventas anuladas son excluidas.
- Ranking semanal respeta `>2`.
- Ranking mensual respeta `>8`.
- Alquileres se identifican mediante `is_court_rental`.
- Los cálculos utilizan ARS.
- Tests unitarios para las funciones de agregación.
- Tests de casos límite.

Las reglas de ranking y exclusión de anulaciones están también contempladas en la matriz de pruebas.

---

## Slice 5.6 — Dashboard operativo

### Objetivo

Cerrar el MVP ofreciendo una vista resumida del estado actual del negocio.

### Requerimientos técnicos

- Componentes `KpiCard`.
- Queries agregadas.
- Server Components para datos.
- Componentes interactivos únicamente cuando sean necesarios.
- Revalidación después de operaciones relevantes.

### Requerimientos funcionales

El dashboard debe permitir visualizar rápidamente:

- ingresos del día;
- ingresos del mes;
- gastos del mes;
- alquileres de la semana;
- situación de cuentas corrientes;
- últimas operaciones.

### Definition of Done

- Dashboard conectado a datos reales.
- KPIs calculados desde la base.
- No existen datos hardcodeados.
- Los datos reflejan anulaciones.
- Los importes están formateados en ARS.
- El dashboard se actualiza después de operaciones relevantes.

La guía visual define `KpiCard` como componente reutilizable y utiliza `tabular-nums` para importes.

---

# 2. Backlog resumido y orden de ejecución

| Orden | Integración | Slice | Resultado utilizable |
|---:|---|---|---|
| 1 | Fundaciones | 1.1 | Proyecto ejecutable |
| 2 | Fundaciones | 1.2 | Login + rutas protegidas |
| 3 | Fundaciones | 1.3 | App Shell administrativo |
| 4 | Productos/Stock | 2.1 | CRUD de productos |
| 5 | Productos/Stock | 2.2 | Stock + movimientos |
| 6 | Productos/Stock | 2.3 | Módulo productos/inventario completo |
| 7 | Compras | 3.1 | Registrar compras |
| 8 | Compras | 3.2 | Historial de compras |
| 9 | Compras | 3.3 | Flujo completo de reposición |
| 10 | Jugadores/CC | 4.1 | CRUD jugadores |
| 11 | Jugadores/CC | 4.2 | Cuenta corriente |
| 12 | Jugadores/CC | 4.3 | Gestión operativa de jugadores |
| 13 | Ventas | 5.1 | Ventas de productos |
| 14 | Ventas | 5.2 | Alquiler de cancha |
| 15 | Ventas | 5.3 | Anulación + reversión |
| 16 | Ventas | 5.4 | Historial general |
| 17 | Reportes | 5.5 | Reportes + rankings |
| 18 | Reportes | 5.6 | Dashboard final |

---

# 3. Reglas transversales de implementación

Estas reglas aplican a todas las integraciones.

## Arquitectura

- Next.js App Router.
- Server Components por defecto.
- Client Components únicamente cuando exista necesidad real de interactividad.
- Server Actions para mutaciones.
- Supabase como persistencia.
- Separación por features.
- Evitar lógica de negocio dentro de componentes UI.

El diseño técnico establece precisamente esta separación entre presentación, lógica mediante Server Actions y persistencia en Supabase.

## Base de datos

- Migraciones versionadas.
- Foreign keys.
- Constraints apropiadas.
- Eliminación lógica donde corresponda.
- Historial inmutable.
- Operaciones financieras críticas atómicas.
- Precios históricos almacenados en los detalles de operaciones.

El modelo E-R conserva explícitamente precios históricos mediante `purchase_items.unit_purchase_price` y `sale_items.unit_price`.

## UI

- Tailwind CSS.
- shadcn/ui.
- Lucide React.
- Sin CSS puro.
- Componentes reutilizables.
- Estados loading/error/empty.
- Confirmación para acciones destructivas.
- ARS como única moneda.
- `tabular-nums` para importes y datos numéricos.

La guía visual establece explícitamente Tailwind como única estrategia de estilado y los estados semánticos para deuda, saldo a favor, stock negativo y ventas anuladas.

## Validación

Cada Server Action debe validar:

1. autenticación;
2. autorización;
3. estructura de entrada;
4. reglas de negocio;
5. existencia/estado de entidades;
6. operación transaccional cuando corresponda.

## Testing

Cada slice debe incorporar sus pruebas junto con la funcionalidad, no al final del proyecto.

### Unitarias

Vitest para:

- reglas de negocio;
- cálculos;
- validaciones;
- Server Actions.

### Integración

Para operaciones que atraviesan múltiples entidades:

- venta + stock;
- venta + cuenta corriente;
- anulación + stock;
- anulación + cuenta corriente;
- compra + stock.

### E2E

Playwright para los flujos críticos.

Los documentos de diseño establecen Vitest para Server Actions y lógica de cálculo, y Playwright para los flujos completos del sistema.

---

# 4. Definition of Done global del MVP

El MVP se considera implementado cuando:

- El administrador puede autenticarse.
- Las rutas administrativas están protegidas.
- Puede gestionar productos.
- Puede gestionar stock.
- Puede consultar movimientos de stock.
- Puede registrar compras.
- Las compras incrementan stock.
- Los precios de compra históricos se conservan.
- Puede gestionar jugadores.
- Puede gestionar múltiples teléfonos.
- Puede registrar cobros.
- Puede realizar ajustes de cuenta corriente.
- Puede registrar ventas.
- Puede vender productos aunque el stock quede negativo.
- Puede registrar alquileres de cancha como ventas.
- El alquiler no afecta stock físico.
- Puede utilizar efectivo, transferencia y cuenta corriente.
- Las ventas a cuenta corriente requieren jugador responsable.
- Los precios de venta históricos se conservan.
- Puede anular ventas.
- Las anulaciones revierten sus efectos.
- Las ventas anuladas permanecen en el historial.
- Las ventas anuladas no cuentan para rankings.
- Puede consultar el historial de operaciones.
- Puede consultar saldos.
- Puede consultar ingresos diarios y mensuales.
- Puede consultar gastos diarios y mensuales.
- Puede consultar alquileres semanales.
- Puede consultar ranking semanal.
- Puede consultar ranking mensual.
- Los rankings respetan sus umbrales.
- Todas las operaciones manejan ARS.
- Las fechas modificables son utilizadas correctamente en los reportes.
- Las pruebas unitarias, de integración y E2E críticas pasan.
- No existen funcionalidades de agenda/reserva dentro del MVP.
- La UI respeta la guía visual y es responsive.

---

# 5. Resultado esperado de la estrategia

Al finalizar cada integración el sistema debe encontrarse en un estado funcional:

```text
I1 → Aplicación administrativa autenticada
          ↓
I2 → Administración real de productos y stock
          ↓
I3 → Compras que impactan stock
          ↓
I4 → Jugadores y cuentas corrientes operativas
          ↓
I5 → Sistema económico completo + reportes
```

De esta forma se evita llegar al final del proyecto con muchas capas técnicas terminadas pero sin una funcionalidad completa utilizable.