# Especificación de Diseño Técnico y Arquitectura de Software
## MVP de Gestión Administrativa para Complejo de Pádel

**Basado en:** Principios de Ingeniería de Software de Ian Sommerville (9ª Edición)  
**Stack Tecnológico:** Next.js (App Router), Supabase (PostgreSQL), Tailwind CSS, TypeScript  
**Basado en Requerimientos:** `analisis.md` (Análisis Funcional v1.0)  
**Documentación de Referencia Tecnológica:** `docs-completo-nextjs.md`

---

## 1. Diseño Arquitectónico (Arquitectura del Sistema)

### 1.1 Enfoque Arquitectónico General
El sistema se diseña como una **aplicación web monolítica simplificada** orientada a un **único administrador** y **un único negocio** (complejo de pádel con 2 canchas no diferenciadas, según RN-01, RN-02 y RN-03).

Considerando las especificaciones de Ian Sommerville sobre patrones arquitectónicos y la arquitectura nativa de Next.js App Router:
* **Patrón Arquitectónico Base:** Arquitectura orientada a componentes web con React Server Components (RSC) y Server Actions, sobre un esquema Cliente-Servidor de 3 capas lógicas (Presentación, Lógica de Negocio/Servidor, Persistencia/BaaS).
* **Prevalencia de Next.js App Router:** Se adopta el modelo de Server Components por defecto para el renderizado e interacción con la base de datos, combinando Client Components (`'use client'`) únicamente donde se requiere interactividad local de UI (formularios, modales, estado de interfaz).
* **Persistencia BaaS:** Supabase actúa como el motor de persistencia relacional PostgreSQL con autenticación integrada y cliente nativo para TypeScript.

```
+-----------------------------------------------------------------------+
|                         CAPA DE PRESENTACIÓN                          |
|  Next.js App Router (Client Components + Tailwind CSS UI Layouts)     |
+-----------------------------------------------------------------------+
                                   |
                       Server Actions / RSC Payload
                                   v
+-----------------------------------------------------------------------+
|                       CAPA DE LÓGICA DE NEGOCIO                       |
|   Next.js App Router (Server Components + 'use server' Actions)       |
|   - Control de Stock y Movimientos                                    |
|   - Registro de Ventas y Alquileres de Cancha (RN-05)                 |
|   - Gestión de Cuentas Corrientes y Saldos (RN-13, RN-14)             |
|   - Motor de Reportes y Rankings (RN-33 a RN-37)                      |
+-----------------------------------------------------------------------+
                                   |
                      `@supabase/supabase-js` / SQL
                                   v
+-----------------------------------------------------------------------+
|                       CAPA DE PERSISTENCIA Y DATOS                    |
|   Supabase (Base de Datos PostgreSQL)                                 |
+-----------------------------------------------------------------------+
```

### 1.2 Estructura de Directorios (Next.js App Router)
Siguiendo las convenciones de Next.js (colocación y private folders `_components`, `_lib`):

```txt
src/
├── app/
│   ├── layout.tsx                 # Root Layout (Tailwind CSS, Fuentes, Providers)
│   ├── page.tsx                   # Landing / Redirect a Dashboard
│   ├── (auth)/
│   │   └── login/page.tsx         # Inicio de sesión del Administrador
│   ├── (dashboard)/
│   │   ├── layout.tsx             # Layout con Sidebar y Header administrativo
│   │   ├── page.tsx               # Panel Principal / Métricas clave
│   │   ├── productos/
│   │   │   └── page.tsx           # Gestión de productos e inventario
│   │   ├── compras/
│   │   │   └── page.tsx           # Registro e historial de compras
│   │   ├── ventas/
│   │   │   └── page.tsx           # TPV / Registro de ventas y alquileres de cancha
│   │   ├── jugadores/
│   │   │   ├── page.tsx           # Listado de jugadores y saldos
│   │   │   └── [id]/page.tsx      # Detalle y cuenta corriente de jugador
│   │   ├── cobros/
│   │   │   └── page.tsx           # Registro de cobros y ajustes de CC
│   │   ├── reportes/
│   │   │   └── page.tsx           # Reportes de Ingresos, Gastos, Turnos y Rankings
│   │   └── _components/           # Componentes UI exclusivos del Dashboard
│   └── api/                       # Route Handlers si se requieren endpoints REST externos
├── lib/
│   ├── supabase/                  # Clientes de Supabase (Server, Client, Middleware)
│   └── utils.ts                   # Utilidades generales (formatos de moneda ARS, fechas)
├── actions/                       # Server Actions ('use server') para mutaciones
│   ├── products.ts
│   ├── purchases.ts
│   ├── sales.ts
│   ├── players.ts
│   └── reports.ts
└── types/                         # Definiciones de TypeScript e interfaces del dominio
```

---

## 2. Diseño de la Base de Datos (Especificación de Datos)

El diseño del modelo físico de datos en PostgreSQL (Supabase) garantiza las reglas de negocio clave como **conservación de precios históricos** (RN-24, RN-25), **eliminación lógica de entidades** (RN-26 a RN-29), y **permisividad de stock negativo** (RN-18).

### 2.1 Esquema Entidad-Relación y Tablas

#### Tabla `products` (Productos y Servicios)
El alquiler de cancha se modela funcionalmente como un producto (RN-05).
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  sale_price NUMERIC(12, 2) NOT NULL CHECK (sale_price >= 0),
  unit_of_measure VARCHAR(50) NOT NULL DEFAULT 'unidad', -- ej: 'unidad', 'alquiler', 'kg'
  is_court_rental BOOLEAN NOT NULL DEFAULT FALSE,        -- Diferencia alquiler de productos físicos
  current_stock NUMERIC(12, 2) NOT NULL DEFAULT 0,       -- Permite valores negativos (RN-18)
  is_active BOOLEAN NOT NULL DEFAULT TRUE,               -- Eliminación lógica (RN-26, RN-27)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### Tabla `players` (Jugadores)
```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  gender VARCHAR(20),
  skill_level INT CHECK (skill_level BETWEEN 1 AND 10),  -- 1 mayor habilidad, 10 menor (RN-30, RN-31)
  current_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,     -- Positivo = a favor, Negativo = deuda (RN-13, RN-14)
  is_active BOOLEAN NOT NULL DEFAULT TRUE,               -- Eliminación lógica (RN-28, RN-29)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### Tabla `player_phones` (Teléfonos de Jugadores)
Soporta el atributo multivaluado de teléfonos (RN-32).
```sql
CREATE TABLE player_phones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  phone_number VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### Tabla `purchases` (Compras de Stock / Gastos)
Las compras se consideran siempre pagadas (RN-19).
```sql
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),               -- Permite modificación de fecha por Admin (RN-40)
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### Tabla `purchase_items` (Detalle de Compra)
Preserva el historial de precios de compra (RN-25).
```sql
CREATE TABLE purchase_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  unit_purchase_price NUMERIC(12, 2) NOT NULL CHECK (unit_purchase_price >= 0),
  subtotal NUMERIC(12, 2) NOT NULL
);
```

#### Tabla `sales` (Ventas y Alquileres de Cancha)
Representa todo ingreso monetario (RN-06). Permite jugador responsable opcional (RN-07, RN-08) y medios de pago contemplados (RN-09).
```sql
CREATE TYPE payment_method_enum AS ENUM ('CASH', 'TRANSFER', 'CURRENT_ACCOUNT');
CREATE TYPE sale_status_enum AS ENUM ('COMPLETED', 'CANCELLED');

CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),               -- Fecha/hora configurable (RN-39, RN-40)
  responsible_player_id UUID REFERENCES players(id),     -- Opcional (RN-07)
  payment_method payment_method_enum NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
  status sale_status_enum NOT NULL DEFAULT 'COMPLETED',  -- RN-22, RN-23
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### Tabla `sale_items` (Detalle de Venta)
Preserva el precio de venta utilizado en el momento de la transacción (RN-24).
```sql
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  subtotal NUMERIC(12, 2) NOT NULL
);
```

#### Tabla `stock_movements` (Historial de Movimientos de Stock)
Garantiza la trazabilidad e inmutabilidad de movimientos (RN-11, RN-16, RN-20, RN-21).
```sql
CREATE TYPE stock_movement_type_enum AS ENUM (
  'PURCHASE', 'SALE', 'MANUAL_ADJUSTMENT', 'SALE_CANCELLATION'
);

CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  movement_type stock_movement_type_enum NOT NULL,
  quantity_change NUMERIC(12, 2) NOT NULL,              -- Positivo para aumentos, negativo para disminuciones
  stock_after NUMERIC(12, 2) NOT NULL,
  reason TEXT,                                          -- Opcional para ajustes manuales (RN-17)
  reference_id UUID,                                    -- ID de compra o venta asociada
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### Tabla `account_movements` (Cuenta Corriente)
Soporta ventas a cuenta corriente (RN-11), cobros directos (RN-12) y ajustes manuales (RN-15).
```sql
CREATE TYPE account_movement_type_enum AS ENUM (
  'SALE_CHARGE', 'PAYMENT', 'MANUAL_ADJUSTMENT', 'SALE_CANCELLATION'
);

CREATE TABLE account_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id),
  movement_type account_movement_type_enum NOT NULL,
  amount_change NUMERIC(12, 2) NOT NULL,                -- Positivo aumenta saldo a favor, negativo suma deuda
  balance_after NUMERIC(12, 2) NOT NULL,
  reason TEXT,                                          -- Opcional (RN-17)
  sale_id UUID REFERENCES sales(id),                    -- Opcional
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 3. Diseño de Interfaces (API & Endpoints / Server Actions)

Siguiendo las especificaciones de Next.js App Router, la capa de comunicación cliente-servidor se estructura a través de **Server Actions** en TypeScript. Se especifican los contratos y firmas de las funciones principales.

### 3.1 Módulo de Productos e Inventario

#### `createProductAction`
* **Descripción:** Registra un nuevo producto o concepto de alquiler de cancha.
* **Firma:** `createProductAction(input: CreateProductInput): Promise<ActionResult<Product>>`
* **Parámetros:** `{ name: string, salePrice: number, unitOfMeasure: string, isCourtRental: boolean, initialStock?: number }`
* **Efectos secundarios:** Si `initialStock` > 0 y no es alquiler, genera un movimiento inicial en `stock_movements`.

#### `adjustStockAction`
* **Descripción:** Realiza un ajuste manual de stock (aumento o disminución) (RN-09, RN-16, RN-17).
* **Firma:** `adjustStockAction(input: AdjustStockInput): Promise<ActionResult<void>>`
* **Parámetros:** `{ productId: string, quantityChange: number, reason?: string }`
* **Efectos secundarios:** Actualiza `current_stock` en `products` (permitiendo valor negativo, RN-18) e inserta registro en `stock_movements`.

---

### 3.2 Módulo de Compras

#### `recordPurchaseAction`
* **Descripción:** Registra una compra de productos, incrementando stock y registrando el gasto (RN-19, RN-20).
* **Firma:** `recordPurchaseAction(input: RecordPurchaseInput): Promise<ActionResult<Purchase>>`
* **Parámetros:**
  ```ts
  interface RecordPurchaseInput {
    date?: string; // Permitir fecha personalizada (RN-40)
    notes?: string;
    items: Array<{
      productId: string;
      quantity: number;
      unitPurchasePrice: number;
    }>;
  }
  ```
* **Efectos secundarios:** Inserta en `purchases` y `purchase_items`, incrementa `current_stock` de los productos afectados y genera registros de tipo `'PURCHASE'` en `stock_movements`.

---

### 3.3 Módulo de Ventas y Alquileres de Cancha

#### `recordSaleAction`
* **Descripción:** Registra una venta de productos físicos o alquileres de cancha (RN-04, RN-05, RN-06).
* **Firma:** `recordSaleAction(input: RecordSaleInput): Promise<ActionResult<Sale>>`
* **Parámetros:**
  ```ts
  interface RecordSaleInput {
    date?: string; // Fecha opcional/modificable (RN-39, RN-40)
    responsiblePlayerId?: string; // Opcional (RN-07, RN-08)
    paymentMethod: 'CASH' | 'TRANSFER' | 'CURRENT_ACCOUNT'; // RN-09
    notes?: string;
    items: Array<{
      productId: string;
      quantity: number;
    }>;
  }
  ```
* **Validaciones & Reglas:**
  1. Si `paymentMethod === 'CURRENT_ACCOUNT'` y no hay `responsiblePlayerId`, la acción rechaza con error (RN-11 requiere jugador asociado).
  2. Obtiene el `sale_price` actual de cada producto para congelarlo en `sale_items` (RN-24).
* **Efectos secundarios:**
  1. Registra la venta y sus ítems.
  2. Disminuye stock de productos físicos y registra en `stock_movements` (tipo `'SALE'`).
  3. Si `paymentMethod === 'CURRENT_ACCOUNT'`, resta el monto del saldo del jugador en `players` y registra en `account_movements` (tipo `'SALE_CHARGE'`).

#### `cancelSaleAction`
* **Descripción:** Anula una venta registrada y revierte sus efectos (RN-22, RN-23).
* **Firma:** `cancelSaleAction(saleId: string, reason?: string): Promise<ActionResult<void>>`
* **Efectos secundarios:**
  1. Marca estado de venta como `'CANCELLED'`.
  2. Revierte stock de productos físicos (re-incrementa) e inserta movimiento `'SALE_CANCELLATION'`.
  3. Si la venta fue a cuenta corriente, reintegra el monto al saldo del jugador y registra movimiento `'SALE_CANCELLATION'`.

---

### 3.4 Módulo de Jugadores y Cuentas Corrientes

#### `recordPaymentAction`
* **Descripción:** Registra un cobro a un jugador sin necesidad de vincularlo a una venta (RN-12).
* **Firma:** `recordPaymentAction(input: RecordPaymentInput): Promise<ActionResult<void>>`
* **Parámetros:** `{ playerId: string, amount: number, notes?: string }`
* **Efectos secundarios:** Incrementa el saldo del jugador (`current_balance += amount`) e inserta registro `'PAYMENT'` en `account_movements`.

#### `adjustAccountBalanceAction`
* **Descripción:** Realiza un ajuste manual sobre la cuenta corriente del jugador (RN-15).
* **Firma:** `adjustAccountBalanceAction(input: AdjustAccountInput): Promise<ActionResult<void>>`
* **Parámetros:** `{ playerId: string, amountChange: number, reason?: string }`
* **Efectos secundarios:** Suma `amountChange` a `current_balance` e inserta movimiento `'MANUAL_ADJUSTMENT'`.

---

## 4. Diseño de Componentes Clave

De acuerdo a Sommerville, la descomposición de componentes define cómo interactúan los subsistemas internamente.

```
+-----------------------------------------------------------------------------------+
|                            MÓDULOS Y COMPONENTES CLAVE                            |
+---------------------------------------------------+-------------------------------+
| 1. Componente TPV / Registro de Ventas            | 2. Componente de Inventario   |
|    - Carrito de compras / alquileres              |    - Calculador de stock      |
|    - Selector de jugador responsable              |    - Permisividad stock < 0   |
|    - Procesador de medio de pago                  |    - Trazabilidad de ajustes  |
+---------------------------------------------------+-------------------------------+
| 3. Componente de Cuenta Corriente                 | 4. Motor de Reportes y Ranking|
|    - Gestor de saldo (Favor/Deuda)                |    - Agregador de Ingresos    |
|    - Procesador de cobros independientes          |    - Contador de turnos       |
|    - Historial e inmutabilidad                    |    - Calculador de Rankings   |
+---------------------------------------------------+-------------------------------+
```

### 4.1 Componente TPV y Procesador de Ventas (`SaleProcessor`)
* **Responsabilidad:** Gestionar la interfaz interactiva del punto de venta y la transacción unificada.
* **Lógica interna:**
  - Permite agregar productos estándar y el servicio "Alquiler de Cancha" al mismo carrito.
  - Verifica dinámicamente si la venta requiere selección obligatoria de jugador (si el medio de pago es "Cuenta Corriente").
  - Invoca la Server Action `recordSaleAction` ejecutando una transacción en Supabase para garantizar la consistencia atómica de stock y saldo.

### 4.2 Componente Calculador de Stock e Inventario (`StockManager`)
* **Responsabilidad:** Asegurar la consistencia del inventario físico y permitir ajustes.
* **Lógica interna:**
  - Aplica la distinción entre productos físicos (requieren control de stock) y el producto "Alquiler de cancha" (no descuenta stock físico, RN-07).
  - Permite que `current_stock` sea menor a 0 sin arrojar excepciones de base de datos (RN-18).
  - Garantiza que cualquier alteración de stock genere su correspondiente fila inmutable en `stock_movements`.

### 4.3 Componente Gestor de Cuentas Corrientes (`AccountLedger`)
* **Responsabilidad:** Mantener el estado de deudas y saldos a favor de los jugadores.
* **Lógica interna:**
  - Representa saldos positivos como dinero a favor y saldos negativos como deuda (RN-13, RN-14).
  - Registra pagos directos de jugadores sumando al saldo (RN-12).
  - Mantiene el historial inmutable de movimientos sin destruir registros históricos en caso de eliminación lógica del jugador (RN-29).

### 4.4 Componente Motor de Reportes y Rankings (`AnalyticsEngine`)
* **Responsabilidad:** Calcular métricas operativas y rankings periódicos.
* **Lógica interna:**
  - **Ingresos y Gastos:** Sumatoria de `sales.total_amount` (excluyendo ventas anuladas `status = 'CANCELLED'`) y `purchases.total_amount` agrupados por día y por mes en ARS (RN-36, RN-37, RN-38).
  - **Cantidad de Turnos:** Conteo de ítems vendidos correspondientes a productos con `is_court_rental = TRUE` en un rango semanal (RN-36).
  - **Rankings de Jugadores (Semanal / Mensual):** Conteo de alquileres de cancha agrupados por `responsible_player_id`. Aplica el filtro donde solo se incluyen jugadores con más de 2 alquileres para el ranking semanal (RN-34) y más de 8 alquileres para el ranking mensual (RN-35). Omite automáticamente ventas canceladas/anuladas (RN-33).

---

## 5. Diseño de Interfaz de Usuario (UI Layouts & Wireframes con Tailwind CSS)

El diseño de la interfaz de usuario se fundamenta en los principios de usabilidad para sistemas administrativos de un único operador: minimizar la cantidad de clics por transacción, proveer retroalimentación visual inmediata y prevenir errores operativos. 

Utilizaremos **Tailwind CSS** para un diseño responsivo y Utility-First, eliminando hojas de estilo CSS puras. La navegación principal se estructura mediante un Layout Persistente (`app/(dashboard)/layout.tsx`) con una barra lateral (Sidebar) en escritorios y menú colapsable en dispositivos móviles.

---

### 5.1 Navegación Principal y Shell de la Aplicación

#### Layout Estructural (`app/(dashboard)/layout.tsx`)
```tsx
// Reutilización de App Shell con Tailwind CSS
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-100 font-sans antialiased text-slate-800">
      {/* Sidebar de Navegación */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <span className="text-2xl font-black tracking-wider text-emerald-400">PÁDEL</span>
            <span className="text-xs uppercase px-2 py-0.5 bg-slate-800 text-slate-400 rounded">Admin</span>
          </div>
          <nav className="p-4 space-y-1">
            <a href="/dashboard" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg bg-emerald-600 text-white">
              Dashboard
            </a>
            <a href="/ventas/nueva" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white">
              Nueva Venta / Alquiler
            </a>
            <a href="/productos" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white">
              Productos e Inventario
            </a>
            <a href="/jugadores" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white">
              Jugadores y Cuentas Ctes.
            </a>
            <a href="/compras" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white">
              Compras y Gastos
            </a>
            <a href="/historial" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white">
              Historial de Operaciones
            </a>
            <a href="/reportes" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white">
              Reportes y Rankings
            </a>
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
          Complejo Pádel v1.0 MVP
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  )
}
```

---

### 5.2 Pantallas Clave y Wireframes

#### Pantalla 1: Dashboard Principal / Resumen Operativo (`/dashboard`)
Visualización de KPIs económicos inmediatos y accesos directos a las operaciones diarias.

```
+-----------------------------------------------------------------------------------+
| DASHBOARD GENERAL                                             [ + Nueva Venta ]   |
+-----------------------------------------------------------------------------------+
|  +--------------------+  +--------------------+  +--------------------+           |
|  | INGRESOS HOY       |  | INGRESOS MES       |  | GASTOS MES         |           |
|  | $45.000 ARS        |  | $820.000 ARS       |  | $210.000 ARS       |           |
|  | +12% vs ayer       |  | 42 ventas registr. |  | Compras e Impuestos|           |
|  +--------------------+  +--------------------+  +--------------------+           |
|  +--------------------+  +--------------------+                                   |
|  | TURNOS SEMANA      |  | DEUDAS PENDIENTES  |                                   |
|  | 28 Alquileres      |  | 5 Jugadores (-$35k)|                                   |
|  +--------------------+  +--------------------+                                   |
+-----------------------------------------------------------------------------------+
| ÚLTIMAS OPERACIONES                                                               |
| [ 14:30 ] Alquiler Cancha - Juan Pérez - $20.000 ARS [Efectivo]                   |
| [ 13:15 ] Venta 2x Bebida - $5.000 ARS [Cuenta Corriente - Carlos G.]             |
| [ 11:00 ] Compra Stock Pelotas - $45.000 ARS [Proveedor]                          |
+-----------------------------------------------------------------------------------+
```

##### Maquetación Tailwind CSS (Tarjetas de KPI):
```tsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ingresos Hoy</span>
    <div className="text-2xl font-bold text-slate-900 mt-1">$45.000 ARS</div>
    <span className="text-xs text-emerald-600 font-medium">↑ 12% respecto a ayer</span>
  </div>
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ingresos Mes</span>
    <div className="text-2xl font-bold text-slate-900 mt-1">$820.000 ARS</div>
    <span className="text-xs text-slate-500">42 operaciones válidas</span>
  </div>
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gastos Mes</span>
    <div className="text-2xl font-bold text-slate-900 mt-1">$210.000 ARS</div>
    <span className="text-xs text-rose-500 font-medium">Compras de stock</span>
  </div>
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alquileres Semana</span>
    <div className="text-2xl font-bold text-emerald-600 mt-1">28 Turnos</div>
    <span className="text-xs text-slate-500">Sin contar anulados</span>
  </div>
</div>
```

---

#### Pantalla 2: Punto de Venta / Registro de Ventas y Alquileres (`/ventas/nueva`)
Interfaz optimizada para agilidad táctil o de teclado donde el administrador carga el carrito de productos/alquileres y especifica el medio de pago y el jugador responsable.

```
+-----------------------------------------------------------------------------------+
| REGISTRAR VENTA O ALQUILER DE CANCHA                                              |
+------------------------------------------+----------------------------------------+
| CATÁLOGO DE PRODUCTOS                    | CARRITO DE OPERACIÓN                   |
| [ Buscar producto...          ]          |                                        |
|                                          | - 1x Alquiler de Cancha     $20.000 ARS|
| +--------------------------------------+ | - 2x Bebida Energética X    $ 5.000 ARS|
| | [🎾] Alquiler de Cancha             | |                                        |
| | Precio: $20.000 | Stock: N/A         | | TOTAL: $25.000 ARS                    |
| +--------------------------------------+ |                                        |
| +--------------------------------------+ | JUGADOR RESPONSABLE (Opcional):        |
| | [🥤] Bebida Energética X             | | [ Seleccionar Jugador: Juan Pérez  ▼ ]|
| | Precio: $2.500 | Stock: -2 (Negativo) | |                                        |
| +--------------------------------------+ | MEDIO DE PAGO:                         |
| +--------------------------------------+ | ( ) Efectivo  ( ) Transferencia        |
| | [👕] Remera Oficial Pádel            | | (X) Cuenta Corriente                   |
| | Precio: $15.000 | Stock: 8           | |                                        |
| +--------------------------------------+ | [ CONFIRMAR REGISTRO DE VENTA ]        |
+------------------------------------------+----------------------------------------+
```

##### Maquetación Tailwind CSS (Carrito y Selector de Pago):
```tsx
<div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
  <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Detalle de la Venta</h2>
  
  {/* Items Seleccionados */}
  <div className="space-y-3">
    <div className="flex justify-between items-center text-sm py-2 border-b border-slate-50">
      <div>
        <p className="font-semibold text-slate-800">Alquiler de Cancha</p>
        <p className="text-xs text-slate-400">1 x $20.000 ARS</p>
      </div>
      <span className="font-bold text-slate-900">$20.000 ARS</span>
    </div>
    <div className="flex justify-between items-center text-sm py-2 border-b border-slate-50">
      <div>
        <p className="font-semibold text-slate-800">Bebida Energética X</p>
        <p className="text-xs text-slate-400">2 x $2.500 ARS</p>
      </div>
      <span className="font-bold text-slate-900">$5.000 ARS</span>
    </div>
  </div>

  {/* Total */}
  <div className="flex justify-between items-center pt-2 text-slate-900">
    <span className="text-base font-bold">Total a Cobrar</span>
    <span className="text-2xl font-black text-emerald-600">$25.000 ARS</span>
  </div>

  {/* Selección de Pago */}
  <div className="space-y-3 pt-4 border-t border-slate-100">
    <label className="block text-xs font-bold uppercase text-slate-500">Medio de Pago</label>
    <div className="grid grid-cols-3 gap-2">
      <button type="button" className="py-2.5 px-3 border-2 border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold text-xs rounded-lg text-center">
        Efectivo
      </button>
      <button type="button" className="py-2.5 px-3 border border-slate-200 text-slate-600 font-semibold text-xs rounded-lg text-center hover:bg-slate-50">
        Transferencia
      </button>
      <button type="button" className="py-2.5 px-3 border border-slate-200 text-slate-600 font-semibold text-xs rounded-lg text-center hover:bg-slate-50">
        Cta. Corriente
      </button>
    </div>
  </div>

  <button type="button" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md transition-colors text-sm">
    Registrar Venta ($25.000 ARS)
  </button>
</div>
```

---

#### Pantalla 3: Gestión de Jugadores y Cuentas Corrientes (`/jugadores`)
Listado con estado de cuenta corriente codificado por colores (saldo a favor / deuda) y modales para cobros rápidos.

```
+-----------------------------------------------------------------------------------+
| GESTIÓN DE JUGADORES Y CUENTAS CORRIENTES                         [ + Nuevo Jugador]|
+-----------------------------------------------------------------------------------+
| [ Buscar por nombre o teléfono...                                               ] |
+-----------------------------------------------------------------------------------+
| JUGADOR         | TELÉFONOS        | NIVEL | SALDO CTA. CTE.   | ACCIONES        |
+-----------------+------------------+-------+-------------------+-----------------+
| Juan Pérez      | +54 9 11 4444... | 3     | -$15.000 ARS (Deuda) | [Cobrar] [Ajuste]|
| Carlos Gómez    | +54 9 11 5555... | 5     |  +$4.000 ARS (Favor) | [Cobrar] [Ajuste]|
| María Rodríguez | +54 9 11 6666... | 2     |   $0 ARS (Saldado)   | [Cobrar] [Ajuste]|
+-----------------------------------------------------------------------------------+
```

##### Maquetación Tailwind CSS para Badge de Cuentas Corrientes:
- **Deuda (Saldo Negativo):** `<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">-$15.000 ARS (Deuda)</span>`
- **Saldo a Favor (Saldo Positivo):** `<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">+$4.000 ARS (A favor)</span>`
- **Sin Saldo Pendiente (Cero):** `<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">$0 ARS</span>`

---

## 6. Estrategia de Verificación y Validación (V&V / Plan de Pruebas)

Siguiendo la especificación de Ian Sommerville, la estrategia de Verificación y Validación (V&V) combina **técnicas estáticas** (inspecciones de código y revisiones de reglas de negocio) con **técnicas dinámicas** (pruebas automatizadas y de aceptación).

El objetivo es garantizar la consistencia financiera, la inmutabilidad de precios históricos y la correcta reversión de estados ante anulaciones.

---

### 6.1 Niveles de Prueba Aplicados al MVP

```
                        +---------------------------------+
                        |  PRUEBAS DE ACEPTACIÓN (UAT)    |
                        |  Administrador Único en Staging  |
                        +---------------------------------+
                                        ▲
                                        |
                        +---------------------------------+
                        |   PRUEBAS DE SISTEMA (E2E)      |
                        |   Playwright / Flujos de Venta   |
                        +---------------------------------+
                                        ▲
                                        |
                        +---------------------------------+
                        |  PRUEBAS DE COMPONENTES / UNIT   |
                        |  Vitest / Server Actions & RLS  |
                        +---------------------------------+
```

---

### 6.2 Matriz de Pruebas de Reglas de Negocio (Caja Negra y Caja Blanca)

| ID Regla | Dominio / Caso de Prueba | Tipo de Prueba | Datos de Entrada | Resultado Esperado |
| :--- | :--- | :--- | :--- | :--- |
| **RN-18** | Stock Negativo | Unitaria / Server Action | Producto con Stock = 0. Venta de 3 unidades. | La venta se completa con éxito. El nuevo stock del producto queda registrado en **-3**. |
| **RN-22 / RN-23** | Anulación de Venta de Productos | Integración | Anular Venta #102 que contenía 2 Bebidas (Stock previo: 5) pagada en Cta. Cte. (-$5.000 ARS). | 1. El stock de la bebida se incrementa en +2 (nuevo stock: 7).<br>2. El saldo del jugador disminuye la deuda en +$5.000 ARS.<br>3. La venta permanece en la BD con `is_cancelled = true`. |
| **RN-24** | Inmutabilidad de Precio de Venta | Integración / BD | 1. Venta #50 a $2.000 ARS.<br>2. Se actualiza el precio actual del producto a $2.500 ARS. | La consulta de la Venta #50 en el historial sigue mostrando `$2.000 ARS` como `unit_price`. |
| **RN-09 / RN-11** | Venta a Cuenta Corriente sin Jugador | Validación de Dominio | Seleccionar medio de pago = "Cuenta Corriente" sin asociar jugador responsable. | El Server Action retorna un error de validación: `"Se requiere un jugador para cuenta corriente"`. |
| **RN-33 / RN-34** | Ranking Semanal de Jugadores | Algorítmica / Unit | Jugador A con 3 alquileres (1 anulado), Jugador B con 3 alquileres válidos. | El ranking semanal incluye únicamente a **Jugador B** (3 alquileres válidos). Jugador A tiene solo 2 alquileres válidos y no supera el umbral (>2). |
| **RN-35** | Ranking Mensual de Jugadores | Algorítmica / Unit | Jugador con 8 alquileres válidos en el mes. | **No aparece** en el ranking mensual por no superar el umbral mínimo (requiere más de 8, es decir, 9 o más). |

---

### 6.3 Automatización de Pruebas

#### 1. Pruebas Unitarias e Integración (`Vitest`)
Se prueban las Server Actions y las funciones puras de cálculo de reportes y saldos.

```typescript
// __tests__/actions/sale.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { recordSaleAction } from '@/app/actions/sale-actions'

describe('Reglas de Negocio - Registro y Anulación de Ventas', () => {
  it('RN-18: Debe permitir realizar una venta aunque el stock resultante sea negativo', async () => {
    const result = await recordSaleAction({
      payment_method: 'CASH',
      items: [{ product_id: 'prod-bebida-1', quantity: 5, unit_price: 1000 }]
    })

    expect(result.success).toBe(true)
    // Verificación de stock en base de datos = -5
  })

  it('RN-09/11: Debe rechazar venta a cuenta corriente sin jugador responsable', async () => {
    const result = await recordSaleAction({
      payment_method: 'CURRENT_ACCOUNT',
      player_id: undefined, // Sin jugador
      items: [{ product_id: 'prod-cancha-1', quantity: 1, unit_price: 20000 }]
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('jugador responsable')
  })
})
```

#### 2. Pruebas End-to-End (`Playwright`)
Simulación de flujos de usuario reales en el navegador para verificar la interacción entre los componentes React del cliente y la persistencia en Supabase.

* **Flujo Crítico 1:** Registro de cobro de deuda de jugador -> Verificación de actualización del saldo en pantalla -> Verificación de nuevo movimiento registrado en la tabla de cuenta corriente.
* **Flujo Crítico 2:** Registro de venta por alquiler de cancha -> Anulación desde el historial -> Verificación de actualización de reportes e ingresos diarios.

---

## 7. Configuración de Entornos y Despliegue (CI/CD)

Para garantizar un entorno de ejecución predecible y aislar los datos de prueba de la operación real del complejo de pádel, se define una estrategia de tres entornos complementarios.

---

### 7.1 Esquema de Entornos

```
+---------------------+      +---------------------+      +---------------------+
|    DESARROLLO       |      |     STAGING         |      |    PRODUCCIÓN       |
|  (Local / Dev)      | ---> |   (Preview PRs)     | ---> |  (Vercel + Supabase)|
| Next.js Dev Server  |      | Vercel Preview Env  |      | Vercel Production   |
| Supabase Local CLI  |      | Supabase Staging DB |      | Supabase Prod DB    |
+---------------------+      +---------------------+      +---------------------+
```

1. **Desarrollo Local (`Development`):**
   * Servidor local de Next.js (`npm run dev`).
   * Instancia local de Supabase ejecutada mediante Docker (`supabase start`), permitiendo ejecutar migraciones de base de datos sin afectar proyectos en la nube.

2. **Entorno de Integración / Previsualización (`Staging / Preview`):**
   * Despliegue automático en **Vercel Preview** por cada Pull Request en GitHub.
   * Proyecto en Supabase Cloud dedicado a pruebas de integración.

3. **Producción (`Production`):**
   * Despliegue en **Vercel Production** en la rama `main`.
   * Proyecto principal en Supabase Cloud con copias de seguridad automáticas de PostgreSQL.

---

### 7.2 Gestión de Variables de Entorno

Las credenciales de Supabase se configuran de acuerdo con el principio de mínimo privilegio:

```bash
# .env.local (Desarrollo) / Vercel Environment Variables (Producción)

# URL del proyecto Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xyzproject.supabase.co

# Clave pública anónima (segura para exponer en el cliente / RLS activo)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Clave privada de servicio (SOLO uso exclusivo en servidor / Bypassea RLS)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 7.3 Pipeline de CI/CD (GitHub Actions + Vercel)

Se configura un flujo de integración continua mediante **GitHub Actions** (`.github/workflows/ci.yml`) que valida la calidad técnica y la integridad de la aplicación antes de cada despliegue.

```yaml
name: CI/CD Pipeline - Pádel Management MVP

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  verify-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout del código
        uses: actions/checkout@v4

      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Instalar dependencias
        run: npm ci

      - name: Verificación de Tipos (TypeScript)
        run: npx tsc --noEmit

      - name: Análisis Estático (ESLint)
        run: npm run lint

      - name: Pruebas Unitarias e Integración (Vitest)
        run: npx vitest run

      - name: Build de Verificación
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL_STAGING }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING }}
```

---

### 7.4 Control de Versiones de Base de Datos (Supabase Migrations)

Las modificaciones al esquema de la base de datos no se realizan de forma manual en el panel de Supabase. Se gestionan mediante archivos de migración SQL dentro del repositorio de código (`supabase/migrations/`).

#### Flujo de trabajo de migraciones:
1. **Creación de migración local:**
   `npx supabase migration new add_player_notes`
2. **Aplicación en desarrollo local:**
   `npx supabase db reset` (Aplica todas las migraciones acumuladas desde cero).
3. **Despliegue a Producción:**
   En el pipeline de despliegue, la CLI de Supabase ejecuta las nuevas migraciones acumuladas:
   `npx supabase db push --linked`

---

## Conclusión del Documento de Diseño Técnico

Con la redacción de estos 3 últimos puntos (Diseño de UI con Tailwind CSS, Estrategia de V&V / Plan de Pruebas y Configuración de CI/CD), junto con los 4 puntos del primer archivo (Arquitectura, Base de Datos, API/Server Actions y Componentes Clave), queda formalmente completada la especificación técnica de arquitectura recomendada por Ian Sommerville para el MVP de gestión del complejo de pádel.

