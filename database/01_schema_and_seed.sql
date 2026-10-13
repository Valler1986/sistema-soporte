-- Esquema inicial de dbo para Microsoft SQL Server 2016 o superior.
-- Ejecutar conectado a la base de datos destino. Los objetos y datos demo
-- pueden volver a ejecutarse sin duplicarse.

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

CREATE TABLE dbo.roles (
    id              SMALLINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_roles PRIMARY KEY,
    codigo            VARCHAR(40) NOT NULL CONSTRAINT UQ_roles_codigo UNIQUE,
    nombre            NVARCHAR(80) NOT NULL CONSTRAINT UQ_roles_nombre UNIQUE,
    descripcion     NVARCHAR(MAX) NULL,
    activo       BIT NOT NULL CONSTRAINT DF_roles_activo DEFAULT (1)
);
GO

CREATE TABLE dbo.usuarios (
    id              BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_usuarios PRIMARY KEY,
    rol_id         SMALLINT NOT NULL,
    nombre_usuario        VARCHAR(80) NOT NULL CONSTRAINT UQ_usuarios_nombre_usuario UNIQUE,
    hash_contrasena   NVARCHAR(MAX) NOT NULL,
    nombre_completo       NVARCHAR(160) NOT NULL,
    correo           VARCHAR(254) NULL,
    activo       BIT NOT NULL CONSTRAINT DF_usuarios_activo DEFAULT (1),
    fecha_creacion      DATETIME2(0) NOT NULL CONSTRAINT DF_usuarios_fecha_creacion DEFAULT (SYSUTCDATETIME()),
    fecha_actualizacion      DATETIME2(0) NOT NULL CONSTRAINT DF_usuarios_fecha_actualizacion DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_usuarios_roles FOREIGN KEY (rol_id) REFERENCES dbo.roles(id),
    CONSTRAINT CK_usuarios_hash_contrasena_no_vacio CHECK (LEN(hash_contrasena) > 0)
);
GO

CREATE TABLE dbo.clientes (
    id              BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_clientes PRIMARY KEY,
    nombres      NVARCHAR(100) NOT NULL,
    apellidos       NVARCHAR(120) NOT NULL,
    numero_documento VARCHAR(20) NULL,
    telefono           VARCHAR(30) NULL,
    correo           VARCHAR(254) NULL,
    direccion         NVARCHAR(MAX) NULL,
    fecha_creacion      DATETIME2(0) NOT NULL CONSTRAINT DF_clientes_fecha_creacion DEFAULT (SYSUTCDATETIME()),
    fecha_actualizacion      DATETIME2(0) NOT NULL CONSTRAINT DF_clientes_fecha_actualizacion DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT CK_clientes_numero_documento_formato CHECK (
        numero_documento IS NULL OR
        (LEN(numero_documento) = 8 AND numero_documento NOT LIKE '%[^0-9]%')
    )
);
GO

CREATE UNIQUE INDEX UX_clientes_numero_documento
    ON dbo.clientes(numero_documento)
    WHERE numero_documento IS NOT NULL;
GO


CREATE TABLE dbo.tipos_artefacto (
    id              SMALLINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_tipos_artefacto PRIMARY KEY,
    nombre            NVARCHAR(80) NOT NULL CONSTRAINT UQ_tipos_artefacto_nombre UNIQUE,
    activo       BIT NOT NULL CONSTRAINT DF_tipos_artefacto_activo DEFAULT (1),
    orden_visualizacion   SMALLINT NOT NULL CONSTRAINT DF_tipos_artefacto_orden_visualizacion DEFAULT (0)
);
GO

CREATE TABLE dbo.marcas (
    id              SMALLINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_marcas PRIMARY KEY,
    nombre            NVARCHAR(80) NOT NULL CONSTRAINT UQ_marcas_nombre UNIQUE,
    activo       BIT NOT NULL CONSTRAINT DF_marcas_activo DEFAULT (1)
);
GO


CREATE TABLE dbo.estados_orden (
    id              SMALLINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_estados_orden PRIMARY KEY,
    codigo            VARCHAR(40) NOT NULL CONSTRAINT UQ_estados_orden_codigo UNIQUE,
    nombre            NVARCHAR(60) NOT NULL CONSTRAINT UQ_estados_orden_nombre UNIQUE,
    orden_visualizacion   SMALLINT NOT NULL CONSTRAINT UQ_estados_orden_orden_visualizacion UNIQUE,
    es_final     BIT NOT NULL CONSTRAINT DF_estados_orden_es_final DEFAULT (0),
    activo       BIT NOT NULL CONSTRAINT DF_estados_orden_activo DEFAULT (1)
);
GO

CREATE TABLE dbo.artefactos (
    id                  BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_artefactos PRIMARY KEY,
    tipo_artefacto_id   SMALLINT NOT NULL,
    marca_id            SMALLINT NULL,
    nombre_equipo      NVARCHAR(160) NOT NULL,
    modelo               NVARCHAR(120) NULL,
    numero_serie       NVARCHAR(120) NULL,
    anio_fabricacion    SMALLINT NULL,
    fecha_creacion          DATETIME2(0) NOT NULL CONSTRAINT DF_artefactos_fecha_creacion DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_artefactos_tipos_artefacto FOREIGN KEY (tipo_artefacto_id)
        REFERENCES dbo.tipos_artefacto(id),
    CONSTRAINT FK_artefactos_marcas FOREIGN KEY (marca_id) REFERENCES dbo.marcas(id),
    CONSTRAINT CK_artefactos_anio_fabricacion_rango CHECK (
        anio_fabricacion IS NULL OR anio_fabricacion BETWEEN 1800 AND 2200
    )
);
GO

CREATE INDEX IX_artefactos_numero_serie ON dbo.artefactos(numero_serie)
    WHERE numero_serie IS NOT NULL;
GO

CREATE TABLE dbo.ordenes_servicio (
    id                      BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ordenes_servicio PRIMARY KEY,
    cliente_id             BIGINT NOT NULL,
    artefacto_id            BIGINT NOT NULL,
    estado_id               SMALLINT NOT NULL,
    fecha_recepcion             DATE NOT NULL,
    fecha_entrega_prometida    DATE NULL,
    descripcion_problema     NVARCHAR(MAX) NULL,
    diagnostico               NVARCHAR(MAX) NULL,
    monto_total            DECIMAL(12,2) NOT NULL,
    codigo_moneda           CHAR(3) NOT NULL CONSTRAINT DF_ordenes_servicio_codigo_moneda DEFAULT ('PEN'),
    creado_por              BIGINT NULL,
    fecha_creacion              DATETIME2(0) NOT NULL CONSTRAINT DF_ordenes_servicio_fecha_creacion DEFAULT (SYSUTCDATETIME()),
    fecha_actualizacion              DATETIME2(0) NOT NULL CONSTRAINT DF_ordenes_servicio_fecha_actualizacion DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_ordenes_servicio_clientes FOREIGN KEY (cliente_id) REFERENCES dbo.clientes(id),
    CONSTRAINT FK_ordenes_servicio_artefactos FOREIGN KEY (artefacto_id) REFERENCES dbo.artefactos(id),
    CONSTRAINT FK_ordenes_servicio_estados_orden FOREIGN KEY (estado_id) REFERENCES dbo.estados_orden(id),
    CONSTRAINT FK_ordenes_servicio_usuarios FOREIGN KEY (creado_por) REFERENCES dbo.usuarios(id),
    CONSTRAINT CK_ordenes_servicio_monto_positivo CHECK (monto_total > 0),
    CONSTRAINT CK_ordenes_servicio_orden_fechas CHECK (
        fecha_entrega_prometida IS NULL OR fecha_entrega_prometida >= fecha_recepcion
    ),
    CONSTRAINT CK_ordenes_servicio_codigo_moneda CHECK (
        LEN(codigo_moneda) = 3 AND codigo_moneda NOT LIKE '%[^A-Z]%'
    )
);
GO

CREATE INDEX IX_ordenes_servicio_cliente ON dbo.ordenes_servicio(cliente_id);
GO

CREATE INDEX IX_ordenes_servicio_estado_fecha_recepcion
        ON dbo.ordenes_servicio(estado_id, fecha_recepcion DESC);
GO

CREATE INDEX IX_ordenes_servicio_fecha_recepcion ON dbo.ordenes_servicio(fecha_recepcion DESC);
GO


CREATE TABLE dbo.historial_estados_orden (
    id                  BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_historial_estados_orden PRIMARY KEY,
    orden_servicio_id   BIGINT NOT NULL,
    estado_id           SMALLINT NOT NULL,
    cambiado_por          BIGINT NULL,
    fecha_cambio          DATETIME2(0) NOT NULL CONSTRAINT DF_historial_estados_orden_fecha_cambio DEFAULT (SYSUTCDATETIME()),
    notas               NVARCHAR(MAX) NULL,
    CONSTRAINT FK_historial_ordenes_servicio FOREIGN KEY (orden_servicio_id)
        REFERENCES dbo.ordenes_servicio(id) ON DELETE CASCADE,
    CONSTRAINT FK_historial_estados_orden FOREIGN KEY (estado_id)
        REFERENCES dbo.estados_orden(id),
    CONSTRAINT FK_historial_usuarios FOREIGN KEY (cambiado_por)
        REFERENCES dbo.usuarios(id)
);
GO

CREATE INDEX IX_historial_orden_servicio
        ON dbo.historial_estados_orden(orden_servicio_id, fecha_cambio DESC);
GO

-- Catálogos del formulario y estados utilizados por la interfaz actual.
SET IDENTITY_INSERT dbo.roles ON;
IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE id = 1 OR codigo = 'ADMIN')
    INSERT INTO dbo.roles (id, codigo, nombre, descripcion)
    VALUES (1, 'ADMIN', N'Administrador', N'Administración del sistema y sus catálogos');
IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE id = 2 OR codigo = 'TECHNICIAN')
    INSERT INTO dbo.roles (id, codigo, nombre, descripcion)
    VALUES (2, 'TECHNICIAN', N'Técnico', N'Atención y actualización de órdenes de servicio');
IF OBJECTPROPERTY(OBJECT_ID(N'dbo.roles'), 'TableHasIdentity') = 1
    SET IDENTITY_INSERT dbo.roles OFF;
GO

SET IDENTITY_INSERT dbo.tipos_artefacto ON;
IF NOT EXISTS (SELECT 1 FROM dbo.tipos_artefacto WHERE id = 1 OR nombre = N'Refrigeradora')
    INSERT INTO dbo.tipos_artefacto (id, nombre, orden_visualizacion) VALUES (1, N'Refrigeradora', 1);
IF NOT EXISTS (SELECT 1 FROM dbo.tipos_artefacto WHERE id = 2 OR nombre = N'Lavadora')
    INSERT INTO dbo.tipos_artefacto (id, nombre, orden_visualizacion) VALUES (2, N'Lavadora', 2);
IF NOT EXISTS (SELECT 1 FROM dbo.tipos_artefacto WHERE id = 3 OR nombre = N'Televisor')
    INSERT INTO dbo.tipos_artefacto (id, nombre, orden_visualizacion) VALUES (3, N'Televisor', 3);
IF NOT EXISTS (SELECT 1 FROM dbo.tipos_artefacto WHERE id = 4 OR nombre = N'Microondas')
    INSERT INTO dbo.tipos_artefacto (id, nombre, orden_visualizacion) VALUES (4, N'Microondas', 4);
IF NOT EXISTS (SELECT 1 FROM dbo.tipos_artefacto WHERE id = 5 OR nombre = N'Cocina')
    INSERT INTO dbo.tipos_artefacto (id, nombre, orden_visualizacion) VALUES (5, N'Cocina', 5);
IF NOT EXISTS (SELECT 1 FROM dbo.tipos_artefacto WHERE id = 6 OR nombre = N'Computadora')
    INSERT INTO dbo.tipos_artefacto (id, nombre, orden_visualizacion) VALUES (6, N'Computadora', 6);
IF NOT EXISTS (SELECT 1 FROM dbo.tipos_artefacto WHERE id = 7 OR nombre = N'Otro')
    INSERT INTO dbo.tipos_artefacto (id, nombre, orden_visualizacion) VALUES (7, N'Otro', 7);
IF NOT EXISTS (SELECT 1 FROM dbo.tipos_artefacto WHERE id = 8 OR nombre = N'Laptop')
    INSERT INTO dbo.tipos_artefacto (id, nombre, orden_visualizacion) VALUES (8, N'Laptop', 8);
IF OBJECTPROPERTY(OBJECT_ID(N'dbo.tipos_artefacto'), 'TableHasIdentity') = 1
    SET IDENTITY_INSERT dbo.tipos_artefacto OFF;
GO

SET IDENTITY_INSERT dbo.marcas ON;
IF NOT EXISTS (SELECT 1 FROM dbo.marcas WHERE id = 1 OR nombre = N'LG')
    INSERT INTO dbo.marcas (id, nombre) VALUES (1, N'LG');
IF NOT EXISTS (SELECT 1 FROM dbo.marcas WHERE id = 2 OR nombre = N'Samsung')
    INSERT INTO dbo.marcas (id, nombre) VALUES (2, N'Samsung');
IF NOT EXISTS (SELECT 1 FROM dbo.marcas WHERE id = 3 OR nombre = N'Sony')
    INSERT INTO dbo.marcas (id, nombre) VALUES (3, N'Sony');
IF NOT EXISTS (SELECT 1 FROM dbo.marcas WHERE id = 4 OR nombre = N'Lenovo')
    INSERT INTO dbo.marcas (id, nombre) VALUES (4, N'Lenovo');
IF OBJECTPROPERTY(OBJECT_ID(N'dbo.marcas'), 'TableHasIdentity') = 1
    SET IDENTITY_INSERT dbo.marcas OFF;
GO

SET IDENTITY_INSERT dbo.estados_orden ON;
IF NOT EXISTS (SELECT 1 FROM dbo.estados_orden WHERE id = 1 OR codigo = 'REGISTRADO')
    INSERT INTO dbo.estados_orden (id, codigo, nombre, orden_visualizacion, es_final)
    VALUES (1, 'REGISTRADO', N'Registrado', 1, 0);
IF NOT EXISTS (SELECT 1 FROM dbo.estados_orden WHERE id = 2 OR codigo = 'EN_TALLER')
    INSERT INTO dbo.estados_orden (id, codigo, nombre, orden_visualizacion, es_final)
    VALUES (2, 'EN_TALLER', N'En taller', 2, 0);
IF NOT EXISTS (SELECT 1 FROM dbo.estados_orden WHERE id = 3 OR codigo = 'LISTO')
    INSERT INTO dbo.estados_orden (id, codigo, nombre, orden_visualizacion, es_final)
    VALUES (3, 'LISTO', N'Listo', 3, 0);
IF NOT EXISTS (SELECT 1 FROM dbo.estados_orden WHERE id = 4 OR codigo = 'ENTREGADO')
    INSERT INTO dbo.estados_orden (id, codigo, nombre, orden_visualizacion, es_final)
    VALUES (4, 'ENTREGADO', N'Entregado', 4, 1);
IF OBJECTPROPERTY(OBJECT_ID(N'dbo.estados_orden'), 'TableHasIdentity') = 1
    SET IDENTITY_INSERT dbo.estados_orden OFF;
GO

-- Registros demo de la SPA. Los campos no disponibles se dejan NULL.
SET IDENTITY_INSERT dbo.clientes ON;
IF NOT EXISTS (SELECT 1 FROM dbo.clientes WHERE id = 1)
    INSERT INTO dbo.clientes (id, nombres, apellidos)
    VALUES (1, N'Juan', N'Pérez');
IF NOT EXISTS (SELECT 1 FROM dbo.clientes WHERE id = 2)
    INSERT INTO dbo.clientes (id, nombres, apellidos)
    VALUES (2, N'María', N'López');
IF NOT EXISTS (SELECT 1 FROM dbo.clientes WHERE id = 3)
    INSERT INTO dbo.clientes (id, nombres, apellidos)
    VALUES (3, N'Pedro', N'Rojas');
IF NOT EXISTS (SELECT 1 FROM dbo.clientes WHERE id = 4)
    INSERT INTO dbo.clientes (id, nombres, apellidos)
    VALUES (4, N'Ana', N'Torres');
IF OBJECTPROPERTY(OBJECT_ID(N'dbo.clientes'), 'TableHasIdentity') = 1
    SET IDENTITY_INSERT dbo.clientes OFF;
GO

SET IDENTITY_INSERT dbo.artefactos ON;
IF NOT EXISTS (SELECT 1 FROM dbo.artefactos WHERE id = 1)
    INSERT INTO dbo.artefactos (id, tipo_artefacto_id, marca_id, nombre_equipo)
    VALUES (1, 2, 1, N'Lavadora LG');
IF NOT EXISTS (SELECT 1 FROM dbo.artefactos WHERE id = 2)
    INSERT INTO dbo.artefactos (id, tipo_artefacto_id, marca_id, nombre_equipo)
    VALUES (2, 1, 2, N'Refrigeradora Samsung');
IF NOT EXISTS (SELECT 1 FROM dbo.artefactos WHERE id = 3)
    INSERT INTO dbo.artefactos (id, tipo_artefacto_id, marca_id, nombre_equipo)
    VALUES (3, 3, 3, N'Televisor Sony');
IF NOT EXISTS (SELECT 1 FROM dbo.artefactos WHERE id = 4)
    INSERT INTO dbo.artefactos (id, tipo_artefacto_id, marca_id, nombre_equipo)
    VALUES (4, 8, 4, N'Laptop Lenovo');
IF OBJECTPROPERTY(OBJECT_ID(N'dbo.artefactos'), 'TableHasIdentity') = 1
    SET IDENTITY_INSERT dbo.artefactos OFF;
GO

SET IDENTITY_INSERT dbo.ordenes_servicio ON;
IF NOT EXISTS (SELECT 1 FROM dbo.ordenes_servicio WHERE id = 125)
    INSERT INTO dbo.ordenes_servicio
        (id, cliente_id, artefacto_id, estado_id, fecha_recepcion, monto_total)
    VALUES (125, 4, 4, 4, '2026-09-21', 540.00);
IF NOT EXISTS (SELECT 1 FROM dbo.ordenes_servicio WHERE id = 126)
    INSERT INTO dbo.ordenes_servicio
        (id, cliente_id, artefacto_id, estado_id, fecha_recepcion, monto_total)
    VALUES (126, 3, 3, 1, '2026-09-22', 330.00);
IF NOT EXISTS (SELECT 1 FROM dbo.ordenes_servicio WHERE id = 127)
    INSERT INTO dbo.ordenes_servicio
        (id, cliente_id, artefacto_id, estado_id, fecha_recepcion, monto_total)
    VALUES (127, 2, 2, 3, '2026-09-23', 410.00);
IF NOT EXISTS (SELECT 1 FROM dbo.ordenes_servicio WHERE id = 128)
    INSERT INTO dbo.ordenes_servicio
        (id, cliente_id, artefacto_id, estado_id, fecha_recepcion, monto_total)
    VALUES (128, 1, 1, 2, '2026-09-23', 280.00);
IF OBJECTPROPERTY(OBJECT_ID(N'dbo.ordenes_servicio'), 'TableHasIdentity') = 1
    SET IDENTITY_INSERT dbo.ordenes_servicio OFF;
GO

SET IDENTITY_INSERT dbo.historial_estados_orden ON;
IF NOT EXISTS (SELECT 1 FROM dbo.historial_estados_orden WHERE id = 1)
    INSERT INTO dbo.historial_estados_orden
        (id, orden_servicio_id, estado_id, fecha_cambio, notas)
    VALUES (1, 125, 4, '2026-09-21T05:00:00', N'Estado inicial de los datos demo');
IF NOT EXISTS (SELECT 1 FROM dbo.historial_estados_orden WHERE id = 2)
    INSERT INTO dbo.historial_estados_orden
        (id, orden_servicio_id, estado_id, fecha_cambio, notas)
    VALUES (2, 126, 1, '2026-09-22T05:00:00', N'Estado inicial de los datos demo');
IF NOT EXISTS (SELECT 1 FROM dbo.historial_estados_orden WHERE id = 3)
    INSERT INTO dbo.historial_estados_orden
        (id, orden_servicio_id, estado_id, fecha_cambio, notas)
    VALUES (3, 127, 3, '2026-09-23T05:00:00', N'Estado inicial de los datos demo');
IF NOT EXISTS (SELECT 1 FROM dbo.historial_estados_orden WHERE id = 4)
    INSERT INTO dbo.historial_estados_orden
        (id, orden_servicio_id, estado_id, fecha_cambio, notas)
    VALUES (4, 128, 2, '2026-09-23T05:00:00', N'Estado inicial de los datos demo');
SET IDENTITY_INSERT dbo.historial_estados_orden OFF;
GO

-- Ajusta identidades para que los siguientes registros continúen después de los demo.
DECLARE @nombre_tabla SYSNAME;
DECLARE @id_maximo BIGINT;
DECLARE @sql NVARCHAR(400);
DECLARE cursor_identidades CURSOR LOCAL FAST_FORWARD FOR
    SELECT nombre_tabla
    FROM (VALUES
        (N'dbo.roles'),
        (N'dbo.usuarios'),
        (N'dbo.clientes'),
        (N'dbo.tipos_artefacto'),
        (N'dbo.marcas'),
        (N'dbo.estados_orden'),
        (N'dbo.artefactos'),
        (N'dbo.ordenes_servicio'),
        (N'dbo.historial_estados_orden')
    ) AS tablas_para_resembrar(nombre_tabla)
    WHERE OBJECTPROPERTY(OBJECT_ID(nombre_tabla), 'TableHasIdentity') = 1;

OPEN cursor_identidades;
FETCH NEXT FROM cursor_identidades INTO @nombre_tabla;
WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql = N'SELECT @id_maximo = COALESCE(MAX(id), 0) FROM ' + QUOTENAME(PARSENAME(@nombre_tabla, 2))
        + N'.' + QUOTENAME(PARSENAME(@nombre_tabla, 1)) + N';';
    EXEC sys.sp_executesql @sql, N'@id_maximo BIGINT OUTPUT', @id_maximo OUTPUT;

    IF @id_maximo > 0
    BEGIN
        SET @sql = N'DBCC CHECKIDENT (''' + @nombre_tabla + N''', RESEED, '
            + CONVERT(NVARCHAR(30), @id_maximo) + N') WITH NO_INFOMSGS;';
        EXEC sys.sp_executesql @sql;
    END;

    FETCH NEXT FROM cursor_identidades INTO @nombre_tabla;
END;
CLOSE cursor_identidades;
DEALLOCATE cursor_identidades;
GO

-- Insertar el usuario admin con contraseña hasheada (Hash SHA-256 de "admin")
-- El hash de "admin" es: 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
INSERT INTO dbo.usuarios (rol_id, nombre_usuario, hash_contrasena, nombre_completo, correo, activo)
VALUES (
    1, 
    'admin', 
    '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 
    N'Administrador General', 
    'admin@tecfix.com', 
    1
);
GO