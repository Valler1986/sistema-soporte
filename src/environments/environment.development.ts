
export const environment = {
  //CAMBIAR AQUI PARA PROBAR LISTAS REMOTAS O LOCALES
  //TRUE: HABILITA REMOTO, FALSE: HABILITA DATA LOCAL
  enableRemoteArtifactTypes: false,
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
