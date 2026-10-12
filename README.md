# sistema-soporte
Sistema express de recepción, diagnóstico, reparación y control de órdenes de servicio técnico para talleres.

## Consulta y actualización del estado de órdenes

En la pantalla de estados, **Consultar** carga las órdenes desde el origen
seleccionado por `enableRemoteLatestOrders`: `true` consulta
`GET /v1/ordenes`; `false` usa las órdenes de demostración locales.

Cada fila tiene su botón **Actualizar**. El estado solo se guarda al pulsarlo:
`enableRemoteOrderStatusUpdates: true` envía `PUT
https://qonxsqyht4.execute-api.us-east-1.amazonaws.com/v1/orden`; `false`
actualiza el `OrderService` local. El flag de escritura es independiente del
flag que controla la consulta.

El body enviado es:

```json
{
  "ordenId": 128,
  "estadoId": 3,
  "notas": "Se cambió a Listo desde el panel de control"
}
```

Los IDs usados para `estadoId` son `1` Registrado, `2` En taller, `3` Listo y
`4` Entregado, de acuerdo con los datos semilla de
`database/01_schema_and_seed.sql`. La API debe aceptar `PUT /v1/orden` con ese
body y responder con un estado HTTP 2xx; se detecta también un estado de error
incluido en el body de una respuesta Lambda proxy. En API Gateway habilita el
método `PUT` y CORS para `PUT`, `OPTIONS`, `Content-Type` y `Authorization`.