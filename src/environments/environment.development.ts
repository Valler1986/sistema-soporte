
export const environment = {
  // Cambiar a true para actualizar estados de órdenes mediante API Gateway.
  enableRemoteOrderStatusUpdates: false,
  // Cambiar a true para registrar las órdenes en API Gateway.
  enableRemoteOrderRegistration: false,
  // Cambiar a true para consultar las marcas desde API Gateway.
  enableRemoteBrands: false,
  localBrands: [
    { id: 1, nombre: 'LG' },
    { id: 2, nombre: 'Samsung' },
    { id: 3, nombre: 'Sony' },
    { id: 4, nombre: 'Lenovo' },
    { id: 5, nombre: 'Chispita' }
  ],
  // Cambiar a true para consultar las últimas órdenes desde API Gateway.
  enableRemoteLatestOrders: false,
  //CAMBIAR AQUI PARA PROBAR LISTAS REMOTAS O LOCALES
  //TRUE: HABILITA REMOTO, FALSE: HABILITA DATA LOCAL
  enableRemoteArtifactTypes: true,
  localArtifactTypes: [
    { id: 1, nombre: 'Refrigeradora2' },
    { id: 2, nombre: 'Lavadora' },
    { id: 3, nombre: 'Televisor' },
    { id: 4, nombre: 'Microondas' },
    { id: 5, nombre: 'Cocina' },
    { id: 6, nombre: 'Computadora' },
    { id: 7, nombre: 'Otro' }
  ],
  //CAMBIAR AQUI PARA PROBAR VALIDACION LOGIN REMOTA
  //TRUE: HABILITA LOGIN REMOTO, FALSE: HABILITA LOGIN LOCAL
  enableRemoteLogin: false,
  localLogin: {
    username: 'admin',
    password: 'admin',
    user: {
      id: 'local-dev-user',
      name: 'Usuario de desarrollo',
      role: 'admin'
    }
  }
};
