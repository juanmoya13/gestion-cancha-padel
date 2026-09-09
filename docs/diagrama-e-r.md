erDiagram

    PRODUCTS {
        UUID id PK
        VARCHAR name
        NUMERIC sale_price
        VARCHAR unit_of_measure
        BOOLEAN is_court_rental
        NUMERIC current_stock
        BOOLEAN is_active
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    PLAYERS {
        UUID id PK
        VARCHAR first_name
        VARCHAR last_name
        VARCHAR gender
        INT skill_level
        NUMERIC current_balance
        BOOLEAN is_active
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    PLAYER_PHONES {
        UUID id PK
        UUID player_id FK
        VARCHAR phone_number
        TIMESTAMPTZ created_at
    }

    PURCHASES {
        UUID id PK
        TIMESTAMPTZ date
        NUMERIC total_amount
        TEXT notes
        TIMESTAMPTZ created_at
    }

    PURCHASE_ITEMS {
        UUID id PK
        UUID purchase_id FK
        UUID product_id FK
        NUMERIC quantity
        NUMERIC unit_purchase_price
        NUMERIC subtotal
    }

    SALES {
        UUID id PK
        TIMESTAMPTZ date
        UUID responsible_player_id FK
        ENUM payment_method
        NUMERIC total_amount
        ENUM status
        TEXT notes
        TIMESTAMPTZ created_at
    }

    SALE_ITEMS {
        UUID id PK
        UUID sale_id FK
        UUID product_id FK
        NUMERIC quantity
        NUMERIC unit_price
        NUMERIC subtotal
    }

    STOCK_MOVEMENTS {
        UUID id PK
        UUID product_id FK
        ENUM movement_type
        NUMERIC quantity_change
        NUMERIC stock_after
        TEXT reason
        UUID reference_id
        TIMESTAMPTZ created_at
    }

    ACCOUNT_MOVEMENTS {
        UUID id PK
        UUID player_id FK
        ENUM movement_type
        NUMERIC amount_change
        NUMERIC balance_after
        TEXT reason
        UUID sale_id FK
        TIMESTAMPTZ created_at
    }


    %% =========================
    %% JUGADORES
    %% =========================

    PLAYERS ||--|{ PLAYER_PHONES : "tiene"


    %% =========================
    %% COMPRAS
    %% =========================

    PURCHASES ||--|{ PURCHASE_ITEMS : "contiene"
    PRODUCTS ||--o{ PURCHASE_ITEMS : "es comprado"


    %% =========================
    %% VENTAS
    %% =========================

    PLAYERS o|--o{ SALES : "es responsable de"
    SALES ||--|{ SALE_ITEMS : "contiene"
    PRODUCTS ||--o{ SALE_ITEMS : "es vendido"


    %% =========================
    %% STOCK
    %% =========================

    PRODUCTS ||--o{ STOCK_MOVEMENTS : "genera"


    %% =========================
    %% CUENTA CORRIENTE
    %% =========================

    PLAYERS ||--o{ ACCOUNT_MOVEMENTS : "genera"
    SALES o|--o{ ACCOUNT_MOVEMENTS : "origina"
