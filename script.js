const urlAtual = window.location.href;
console.log(urlAtual);

fetch('http://localhost:3000/list')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
