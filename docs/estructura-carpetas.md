src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   │
│   │   ├── productos/
│   │   │   └── page.tsx
│   │   │
│   │   ├── ventas/
│   │   │   ├── page.tsx
│   │   │   └── nueva/
│   │   │       └── page.tsx
│   │   │
│   │   ├── compras/
│   │   │   └── page.tsx
│   │   │
│   │   ├── jugadores/
│   │   │   └── page.tsx
│   │   │
│   │   ├── stock/
│   │   │   └── page.tsx
│   │   │
│   │   ├── cuenta-corriente/
│   │   │   └── page.tsx
│   │   │
│   │   └── reportes/
│   │       └── page.tsx
│   │
│   ├── actions/
│   │   ├── products.ts
│   │   ├── sales.ts
│   │   ├── purchases.ts
│   │   ├── players.ts
│   │   ├── stock.ts
│   │   └── account.ts
│   │
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── modal.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   └── ...
│   │
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── page-container.tsx
│   │
│   └── shared/
│       ├── empty-state.tsx
│       ├── loading.tsx
│       ├── error-message.tsx
│       └── confirm-dialog.tsx
│
├── features/
│   ├── products/
│   │   ├── components/
│   │   │   ├── product-form.tsx
│   │   │   ├── product-table.tsx
│   │   │   └── product-stock.tsx
│   │   ├── queries.ts
│   │   ├── schemas.ts
│   │   └── types.ts
│   │
│   ├── sales/
│   │   ├── components/
│   │   │   ├── sale-form.tsx
│   │   │   ├── sale-items.tsx
│   │   │   ├── sale-summary.tsx
│   │   │   └── sale-table.tsx
│   │   ├── queries.ts
│   │   ├── schemas.ts
│   │   └── types.ts
│   │
│   ├── purchases/
│   │   ├── components/
│   │   │   ├── purchase-form.tsx
│   │   │   └── purchase-table.tsx
│   │   ├── queries.ts
│   │   ├── schemas.ts
│   │   └── types.ts
│   │
│   ├── players/
│   │   ├── components/
│   │   │   ├── player-form.tsx
│   │   │   ├── player-table.tsx
│   │   │   └── player-balance.tsx
│   │   ├── queries.ts
│   │   ├── schemas.ts
│   │   └── types.ts
│   │
│   ├── stock/
│   │   ├── components/
│   │   │   ├── stock-table.tsx
│   │   │   └── stock-movement-table.tsx
│   │   ├── queries.ts
│   │   └── types.ts
│   │
│   ├── account/
│   │   ├── components/
│   │   │   ├── account-summary.tsx
│   │   │   └── account-movement-table.tsx
│   │   ├── queries.ts
│   │   └── types.ts
│   │
│   └── reports/
│       ├── components/
│       │   ├── kpi-card.tsx
│       │   ├── ranking-table.tsx
│       │   └── report-filters.tsx
│       ├── queries.ts
│       └── types.ts
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── proxy.ts
│   │
│   ├── utils/
│   │   ├── currency.ts
│   │   ├── dates.ts
│   │   └── numbers.ts
│   │
│   └── constants/
│       ├── payment-methods.ts
│       └── movement-types.ts
│
├── types/
│   ├── database.ts
│   └── common.ts
│
└── proxy.ts
