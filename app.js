const express = require('express');
const fs = require('fs');
const path = require('path');
const FtpSrv = require('ftp-srv');
const { url } = require('inspector');

const app = express();

// Rota para listar arquivos
app.get('/list', (req, res) => {
  const directoryPath = path.join(__dirname, 'disk'); // Substitua 'nome_da_pasta' pelo nome da sua pasta

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).send('Erro ao listar arquivos');
    }

    const detalhesArquivos = files.map(file => {
      const filePath = path.join(directoryPath, file);
      return new Promise((resolve, reject) => {
        fs.stat(filePath, (err, stats) => {
          if (stats.isDirectory()) {
            var link = `localhost:3000/list/${file}`
          }

          if (err) {
            reject(err);
          } else {
            resolve({
              nome: file,
              isFile: stats.isFile(),
              isDirectory: stats.isDirectory(),
              urlDonwload: link
              
            });
          }
        });
      });
    });


    Promise.all(detalhesArquivos)
      .then(resultados => res.json(resultados))
      .catch(error => res.status(500).send('Erro ao obter detalhes dos arquivos'));
  });


});

app.get('/list/:folder', (req, res) => {
  const folder = 'disk/' + (req.params.folder).replace(/!/g, '/');
  console.log(folder, typeof folder)
  const directoryPath = path.join(__dirname, folder); // Substitua 'nome_da_pasta' pelo nome da sua pasta

  if (req.query.nameFile) {
    console.log('tem arquivo', req.query.nameFile)
    const fileName = req.query.nameFile;
    const filePath = path.join(directoryPath, fileName);
    try {
      res.download(filePath, (err) => {
        if (err) {
          res.status(500).send('Erro ao fazer download do arquivo');
        } else {
          // res.status(200).send('Download concluido')
        }
      });

    } catch (err) {
      console.error('Ocorreu um erro:', err.message);
    }

  } else {
    console.log('Não tem arquivo')


    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        return res.status(500).send('Erro ao listar arquivos');
      }

      const detalhesArquivos = files.map(file => {
        const filePath = path.join(directoryPath, file);
        return new Promise((resolve, reject) => {
          fs.stat(filePath, (err, stats) => {
            if (stats.isDirectory()) {
              var link = `localhost:3000/list/${file}`
            } else {
              var link = `localhost:3000/list/${(req.params.folder).replace(/!/g, '/')}?nameFile=${file}`
            }
            if (err) {
              reject(err);
            } else {
              resolve({
                nome: file,
                isFile: stats.isFile(),
                isDirectory: stats.isDirectory(),
                urlDonwload: link
              });
            }
          });
        });
      });


      Promise.all(detalhesArquivos)
        .then(resultados => res.json(resultados))
        .catch(error => res.status(500).send('Erro ao obter detalhes dos arquivos'));
    });




  }


});

// Configuração do servidor FTP
const ftpServer = new FtpSrv({
  url: 'ftp://0.0.0.0:21', // Porta padrão do FTP
  // anonymous: true // Permitir acesso anônimo
});

// Evento de login
ftpServer.on('login', ({ connection, username, password }, resolve, reject) => {
  if (username === 'ACS_SUPORTE' && password === 'Acs@2410') {
    return resolve({ root: './disk' }); // Diretório raiz para usuários anônimos
  }
  return reject(new Error('Usuário ou senha inválidos'));
});

// Iniciar o servidor FTP
ftpServer.listen()
  .then(() => {
    console.log('Servidor FTP iniciado na porta 21');
  })
  .catch(err => {
    console.error('Erro ao iniciar o servidor FTP:', err);
  });

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
