# sistema-soporte
Sistema express de recepción, diagnóstico, reparación y control de órdenes de servicio técnico para talleres.

## Catálogo de artefactos

El mantenedor de órdenes obtiene los tipos desde
`GET https://qonxsqyht4.execute-api.us-east-1.amazonaws.com/v1/artefacto`.
La respuesta esperada tiene la forma `{ "statusCode": 200, "data": [{ "id": 1, "nombre": "Laptop" }] }`.
Si no se puede cargar o validar el catálogo, el formulario muestra un error y
deja el selector deshabilitado en lugar de usar una lista local desactualizada.

La bandera `enableRemoteArtifactTypes` permite alternar el origen del catálogo.
En `src/environments/environment.development.ts`, `false` usa la lista local
configurada en `localArtifactTypes`; `true` consulta la API. El entorno de
producción (`src/environments/environment.ts`) habilita por defecto la lista
remota. Esta bandera es independiente de `enableRemoteLogin`.

## Catálogo de marcas

El mantenedor de órdenes carga las marcas desde
`GET https://qonxsqyht4.execute-api.us-east-1.amazonaws.com/v1/marca`, con
respuesta `{ "statusCode": 200, "data": [{ "id": 1, "nombre": "LG" }] }`.
La bandera `enableRemoteBrands` es independiente: `false` usa `localBrands`
en `src/environments/environment.development.ts` y `true` consulta la API.
Producción usa el catálogo remoto por defecto. Ante error remoto no se usa
fallback local; el selector muestra un mensaje y queda deshabilitado.
