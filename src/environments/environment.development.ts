
export const environment = {
  // Cambiar a true para registrar las órdenes en API Gateway.
  enableRemoteOrderRegistration: true,
  // Cambiar a true para consultar las marcas desde API Gateway.
  enableRemoteBrands: true,
  localBrands: [
    { id: 1, nombre: 'LG' },
    { id: 2, nombre: 'Samsung' },
    { id: 3, nombre: 'Sony' },
    { id: 4, nombre: 'Lenovo' },
    { id: 5, nombre: 'Chispita' }
  ],
  // Cambiar a true para consultar las últimas órdenes desde API Gateway.
  enableRemoteLatestOrders: true,
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
  enableRemoteLogin: true,
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
