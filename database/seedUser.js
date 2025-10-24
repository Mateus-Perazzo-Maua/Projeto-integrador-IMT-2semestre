const { getUserByUsername, addUser } = require('./userModel');

async function seedAdminUser() {
  console.log('Iniciando script de criação do admin...');

  const existingUser = await getUserByUsername('admin');
  console.log('Verificando se admin existe...', existingUser);

  if (existingUser) {
    console.log('Usuário admin já existe');
    return;
  }
  
  const adminUser = {
    username: 'admin',
    password: '1234',
  };

  const id = await addUser(adminUser);
  console.log('Usuário admin criado com ID:', id);
}

seedAdminUser()
  .then(() => {
    console.log('Script finalizado.');
    process.exit();
  })
  .catch((err) => {
    console.error('Erro:', err);
    process.exit(1);
  });
