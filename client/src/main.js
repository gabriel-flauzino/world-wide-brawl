import { Game } from './classes/Game';
import { Client } from "./classes/Client";
import './reset.css';
import './style.css';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/src/sw.js')
    .then(() => console.log('sw registrado com sucesso!'))
    .catch(err => console.error('deu ruim no sw', err));
}

initialize();

async function initialize() {
  const client = new Client();
  const app = new Game(client);

  await app.start(client);
};
