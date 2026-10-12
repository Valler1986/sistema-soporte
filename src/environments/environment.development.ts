export const environment = {
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
