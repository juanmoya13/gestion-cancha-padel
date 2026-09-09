# Guía de Estilos Tailwind CSS y Configuración Inicial de shadcn/ui
**Proyecto:** Sistema de Gestión Administrativa - Cancha de Pádel  
**Stack Visual:** Next.js (App Router), Tailwind CSS v3/v4, shadcn/ui, Lucide React

---

## 1. Configuración Inicial de shadcn/ui y Tailwind CSS

### 1.1 `components.json` (Configuración del CLI)
Archivo de configuración para inicializar y agregar componentes de **shadcn/ui** adaptado a Next.js App Router (`app/` directory) con TypeScript y CSS Variables:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

---

### 1.2 `tailwind.config.ts` (Variables y Extensión de Tema)

Configuración completa de Tailwind CSS con los tokens semánticos de shadcn/ui y extensiones personalizadas para el dominio del complejo de pádel:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Colores de Dominio Específicos (Pádel Admin)
        court: {
          DEFAULT: "#10b981", // Verde Cancha / Emerald 500
          dark: "#047857",    // Emerald 700
          light: "#d1fae5",   // Emerald 100
        },
        account: {
          surplus: "#10b981",   // Saldo a Favor (Verde)
          debt: "#ef4444",      // Deuda (Rojo)
          balanced: "#64748b",  // Saldado $0 (Slate)
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

### 1.3 `app/globals.css` (Variables de Color HSL y Temas)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 210 40% 98%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    /* Emerald Deportivo como primario */
    --primary: 158 64% 42%;
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 158 64% 42%;

    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;

    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;

    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;

    --primary: 158 64% 42%;
    --primary-foreground: 210 40% 98%;

    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 158 64% 42%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground antialiased;
  }
}
```

---

## 2. Guía de Estilos y Tokens del Dominio

### 2.1 Paleta Semántica por Estados de Dominio

| Dominio | Estado | Clases Tailwind Recomendadas | Ejemplo Visual |
| :--- | :--- | :--- | :--- |
| **Cuenta Corriente** | Deuda (Saldo < 0) | `bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400` | Badge / Texto Rojo |
| **Cuenta Corriente** | A Favor (Saldo > 0) | `bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400` | Badge / Texto Verde |
| **Cuenta Corriente** | Saldado (Saldo = 0) | `bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300` | Badge / Texto Gris |
| **Inventario** | Stock Normal (> 5) | `text-slate-900 font-medium dark:text-slate-100` | Texto Estándar |
| **Inventario** | Bajo Stock (1 a 5) | `bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400` | Alerta Amarilla |
| **Inventario** | Stock Negativo (< 0) | `bg-red-100 text-red-800 font-bold border-red-300 animate-pulse` | Alerta Crítica (RN-18) |
| **Ventas / Cobro** | Anulada | `line-through text-muted-foreground bg-muted/50` | Fila Tachada |
| **Producto / Alquiler**| Alquiler de Cancha | `bg-emerald-50 text-emerald-800 border-emerald-300` | Distintivo Cancha |

---

### 2.2 Tipografía y Espaciado
- **Fuentes Primarias:** `font-sans` (Inter / Geist Sans).
- **Titulares Dashboard:** `text-2xl font-bold tracking-tight text-slate-900`
- **Subtítulos / Secciones:** `text-lg font-semibold text-slate-800`
- **Etiquetas de Tabla / KPI:** `text-xs font-medium uppercase text-muted-foreground`
- **Montos / Importes:** `font-mono text-sm font-semibold tabular-nums` (para mantener alineados los ceros y decimales en tablas de precios y balances).

---

## 3. Catálogo de Componentes shadcn/ui e Instalación

### 3.1 Comando de Instalación de Componentes Recomendados

Ejecutar en la terminal del proyecto para instalar los componentes base indispensables:

```bash
npx shadcn@latest add button card dialog table badge input select dropdown-menu tabs toast avatar separator
```

---

### 3.2 Snippets de Componentes Clave en el Contexto del Proyecto

#### A. Badge de Estado de Cuenta Corriente del Jugador (`/components/players/account-badge.tsx`)

```tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AccountBadgeProps {
  balance: number;
  className?: string;
}

export function AccountBadge({ balance, className }: AccountBadgeProps) {
  if (balance < 0) {
    return (
      <Badge 
        variant="outline" 
        className={cn("bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400", className)}
      >
        Deuda: ${Math.abs(balance).toLocaleString("es-AR")}
      </Badge>
    );
  }

  if (balance > 0) {
    return (
      <Badge 
        variant="outline" 
        className={cn("bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400", className)}
      >
        A Favor: ${balance.toLocaleString("es-AR")}
      </Badge>
    );
  }

  return (
    <Badge 
      variant="secondary" 
      className={cn("text-slate-600 bg-slate-100 dark:bg-slate-800", className)}
    >
      Al Día ($0)
    </Badge>
  );
}
```

---

#### B. Tarjeta Metrica KPI del Dashboard (`/components/dashboard/kpi-card.tsx`)

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
}

export function KpiCard({ title, value, description, icon: Icon }: KpiCardProps) {
  return (
    <Card className="shadow-sm border-slate-200 dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight tabular-nums">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
```

---

#### C. Fila de Tabla de Ventas con Estado Anulado (`/components/sales/sales-table-row.tsx`)

```tsx
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SaleRowProps {
  id: string;
  date: string;
  player: string;
  total: number;
  isCanceled: boolean;
  onCancel: (id: string) => void;
}

export function SalesTableRow({ id, date, player, total, isCanceled, onCancel }: SaleRowProps) {
  return (
    <TableRow className={cn(isCanceled && "bg-muted/40 opacity-75")}>
      <TableCell className={cn("font-mono text-xs", isCanceled && "line-through")}>
        {id.slice(0, 8)}
      </TableCell>
      <TableCell className={cn(isCanceled && "line-through")}>{date}</TableCell>
      <TableCell className={cn(isCanceled && "line-through")}>{player}</TableCell>
      <TableCell className={cn("text-right font-mono font-semibold tabular-nums", isCanceled && "line-through")}>
        ${total.toLocaleString("es-AR")}
      </TableCell>
      <TableCell className="text-center">
        {isCanceled ? (
          <Badge variant="destructive" className="text-[10px] uppercase">Anulada</Badge>
        ) : (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] uppercase">Activa</Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        {!isCanceled && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-destructive hover:bg-destructive/10"
            onClick={() => onCancel(id)}
          >
            Anular
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
```

---

### 3.3 Función Utility Requerida (`/lib/utils.ts`)

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
```

---

## 4. Buenas Prácticas de Estilado para el Proyecto

1. **Sin CSS Puro:** Utilizar exclusivamente utilidades de Tailwind CSS y variantes de componentes shadcn/ui.
2. **Números Tabulares (`tabular-nums`):** Aplicar siempre `tabular-nums` en importes de dinero, cantidades de stock y fechas para evitar saltos horizontales al actualizar valores en tiempo real.
3. **Consistencia de Sombras y Bordes:** Mantener `border-slate-200` y `shadow-sm` en tarjetas (`Card`) y tablas para una estética limpia y administrativa.
4. **Respeto a las Reglas de Negocio:**
   - Destacar los importes de saldo utilizando **rojo** para deuda y **verde** para saldo a favor.
   - Resaltar el stock negativo con `animate-pulse` o fondos de alerta para visibilizar la regla **RN-18**.
