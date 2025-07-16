import { Game } from './classes/Game';
import './reset.css';
import './style.css';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/src/sw.js')
    .then(() => console.log('sw registrado com sucesso!'))
    .catch(err => console.error('deu ruim no sw', err));
}

initialize();

async function initialize() {
  await new Game().start();
};
