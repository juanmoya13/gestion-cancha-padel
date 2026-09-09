flowchart TD

    INICIO([Inicio])

    INICIO --> LOGIN[Iniciar sesión]
    LOGIN --> DASHBOARD[Dashboard]

    DASHBOARD --> DECISION{¿Qué operación realizar?}

    %% PRODUCTOS
    DECISION -->|Gestionar productos| PRODUCTOS[Consultar productos]
    PRODUCTOS --> PROD_DECISION{¿Acción?}

    PROD_DECISION -->|Crear| PROD_CREAR[Ingresar datos del producto]
    PROD_CREAR --> PROD_GUARDAR[Guardar producto]
    PROD_GUARDAR --> PRODUCTOS

    PROD_DECISION -->|Modificar| PROD_MOD[Modificar datos]
    PROD_MOD --> PROD_GUARDAR_MOD[Guardar cambios]
    PROD_GUARDAR_MOD --> PRODUCTOS

    PROD_DECISION -->|Eliminar| PROD_ELIM[Eliminar lógicamente]
    PROD_ELIM --> PRODUCTOS

    PROD_DECISION -->|Consultar stock| STOCK[Consultar stock e historial]
    STOCK --> DECISION

    %% COMPRAS
    DECISION -->|Registrar compra| COMPRA[Ingresar datos de compra]
    COMPRA --> COMPRA_VALIDAR{¿Datos válidos?}

    COMPRA_VALIDAR -->|No| COMPRA_ERROR[Mostrar error]
    COMPRA_ERROR --> COMPRA

    COMPRA_VALIDAR -->|Sí| COMPRA_GUARDAR[Registrar compra]
    COMPRA_GUARDAR --> STOCK_AUMENTA[Aumentar stock]
    STOCK_AUMENTA --> MOV_COMPRA[Registrar movimiento de stock]
    MOV_COMPRA --> GASTO[Registrar gasto]
    GASTO --> FIN_COMPRA([Compra registrada])
    FIN_COMPRA --> DASHBOARD

    %% AJUSTE STOCK
    DECISION -->|Ajustar stock| AJUSTE_STOCK[Seleccionar producto y cantidad]
    AJUSTE_STOCK --> AJUSTE_MOTIVO[Ingresar motivo opcional]
    AJUSTE_MOTIVO --> ACTUALIZAR_STOCK[Actualizar stock]
    ACTUALIZAR_STOCK --> MOV_AJUSTE[Registrar movimiento]
    MOV_AJUSTE --> DASHBOARD

    %% VENTAS
    DECISION -->|Registrar venta / alquiler| VENTA[Crear venta]
    VENTA --> ITEMS[Seleccionar productos y/o alquiler de cancha]
    ITEMS --> JUGADOR[Seleccionar jugador responsable opcional]
    JUGADOR --> PAGO[Seleccionar medio de pago]

    PAGO --> TIPO_PAGO{¿Cuenta corriente?}

    TIPO_PAGO -->|No| VENTA_VALIDAR[Validar venta]
    TIPO_PAGO -->|Sí| TIENE_JUGADOR{¿Hay jugador responsable?}

    TIENE_JUGADOR -->|No| ERROR_JUGADOR[Mostrar error]
    ERROR_JUGADOR --> JUGADOR

    TIENE_JUGADOR -->|Sí| VENTA_VALIDAR

    VENTA_VALIDAR --> VENTA_OK{¿Datos válidos?}

    VENTA_OK -->|No| ERROR_VENTA[Mostrar error]
    ERROR_VENTA --> VENTA

    VENTA_OK -->|Sí| GUARDAR_VENTA[Registrar venta]
    GUARDAR_VENTA --> PRECIO[Conservar precio histórico]

    PRECIO --> ES_FISICO{¿Hay productos físicos?}

    ES_FISICO -->|Sí| DESCONTAR_STOCK[Disminuir stock]
    DESCONTAR_STOCK --> MOV_VENTA[Registrar movimiento de stock]
    ES_FISICO -->|No| PAGO_DECISION

    MOV_VENTA --> PAGO_DECISION{¿Cuenta corriente?}

    PAGO_DECISION -->|No| INGRESO[Venta registrada como ingreso]
    PAGO_DECISION -->|Sí| ACTUALIZAR_CC[Disminuir saldo del jugador]
    ACTUALIZAR_CC --> MOV_CC[Registrar movimiento de cuenta corriente]
    MOV_CC --> INGRESO

    INGRESO --> FIN_VENTA([Venta registrada])
    FIN_VENTA --> DASHBOARD

    %% COBROS
    DECISION -->|Registrar cobro| COBRO[Seleccionar jugador]
    COBRO --> COBRO_DATOS[Ingresar monto]
    COBRO_DATOS --> COBRO_VALIDAR{¿Monto válido?}

    COBRO_VALIDAR -->|No| COBRO_ERROR[Mostrar error]
    COBRO_ERROR --> COBRO_DATOS

    COBRO_VALIDAR -->|Sí| ACTUALIZAR_SALDO[Incrementar saldo del jugador]
    ACTUALIZAR_SALDO --> MOV_PAGO[Registrar movimiento de cobro]
    MOV_PAGO --> FIN_COBRO([Cobro registrado])
    FIN_COBRO --> DASHBOARD

    %% AJUSTE CUENTA
    DECISION -->|Ajustar cuenta corriente| AJUSTE_CC[Seleccionar jugador]
    AJUSTE_CC --> MONTO_AJUSTE[Ingresar ajuste]
    MONTO_AJUSTE --> MOTIVO_CC[Ingresar motivo opcional]
    MOTIVO_CC --> ACTUALIZAR_BALANCE[Actualizar saldo]
    ACTUALIZAR_BALANCE --> MOV_MANUAL[Registrar movimiento manual]
    MOV_MANUAL --> DASHBOARD

    %% ANULAR VENTA
    DECISION -->|Anular venta| BUSCAR_VENTA[Buscar venta]
    BUSCAR_VENTA --> CONFIRMAR{¿Confirmar anulación?}

    CONFIRMAR -->|No| DASHBOARD
    CONFIRMAR -->|Sí| CANCELAR[Marcar venta como anulada]

    CANCELAR --> REV_STOCK{¿Contiene productos físicos?}

    REV_STOCK -->|Sí| DEVOLVER_STOCK[Devolver stock]
    DEVOLVER_STOCK --> MOV_CANCEL_STOCK[Registrar reversión de stock]

    REV_STOCK -->|No| REV_CC
    MOV_CANCEL_STOCK --> REV_CC{¿Fue a cuenta corriente?}

    REV_CC -->|Sí| DEVOLVER_CC[Revertir saldo del jugador]
    DEVOLVER_CC --> MOV_CANCEL_CC[Registrar reversión de cuenta]

    REV_CC -->|No| HISTORIAL
    MOV_CANCEL_CC --> HISTORIAL[Conservar venta anulada en historial]

    HISTORIAL --> DASHBOARD

    %% REPORTES
    DECISION -->|Consultar reportes| REPORTES[Seleccionar reporte]
    REPORTES --> REP_DECISION{¿Qué consultar?}

    REP_DECISION -->|Ingresos| INGRESOS[Calcular ingresos por ventas válidas]
    REP_DECISION -->|Gastos| GASTOS[Calcular gastos por compras]
    REP_DECISION -->|Saldos| SALDOS[Consultar saldos de jugadores]
    REP_DECISION -->|Alquileres| ALQUILERES[Contar alquileres de cancha válidos]
    REP_DECISION -->|Ranking semanal| RANK_SEM[Contar alquileres por jugador]
    REP_DECISION -->|Ranking mensual| RANK_MES[Contar alquileres por jugador]

    RANK_SEM --> FILTRO_SEM[Filtrar jugadores con más de 2 alquileres]
    RANK_MES --> FILTRO_MES[Filtrar jugadores con más de 8 alquileres]

    INGRESOS --> DASHBOARD
    GASTOS --> DASHBOARD
    SALDOS --> DASHBOARD
    ALQUILERES --> DASHBOARD
    FILTRO_SEM --> DASHBOARD
    FILTRO_MES --> DASHBOARD
