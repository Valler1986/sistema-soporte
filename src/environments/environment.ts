export const environment = {
  enableRemoteOrderStatusUpdates: true,
  enableRemoteOrderRegistration: true,
  enableRemoteBrands: true,
  localBrands: [
    { id: 1, nombre: 'LG' },
    { id: 2, nombre: 'Samsung' },
    { id: 3, nombre: 'Sony' },
    { id: 4, nombre: 'Lenovo' }
  ],
  enableRemoteLatestOrders: true,
  enableRemoteArtifactTypes: true,
  localArtifactTypes: [
    { id: 1, nombre: 'Refrigeradora' },
    { id: 2, nombre: 'Lavadora' },
    { id: 3, nombre: 'Televisor' },
    { id: 4, nombre: 'Microondas' },
    { id: 5, nombre: 'Cocina' },
    { id: 6, nombre: 'Computadora' },
    { id: 7, nombre: 'Otro' }
  ],
  enableRemoteLogin: true,
  localLogin: {
    username: '',
    password: '',
    user: {
      id: 'local-user',
      name: 'Usuario local',
      role: 'admin'
    }
  }
};
