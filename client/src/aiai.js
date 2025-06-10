import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { Client } from 'colyseus.js';
import h from "hyperscript";
import { Game } from './classes/Game';
import './style.css';
import './reset.css';

const ui = document.getElementById("ui");

let user;

initialize();

async function initialize() {
  setupClient();
};


async function setupClient() {
  const token = localStorage.getItem("auth_token");
  const client = new Client("https://2567-idx-world-wide-brawl-1741788168687.cluster-4xpux6pqdzhrktbhjf2cumyqtg.cloudworkstations.dev/");
  const lobby = await client.joinOrCreate('lobby');

  lobby.onMessage("registrationNeeded", () => register(lobby));
  lobby.onMessage("loggedIn", (message) => {
    user = message.user;
    goToLobby(lobby);
  });
  
  lobby.send("login", { token });
  
  lobby.onStateChange(() => {
    console.log(lobby.state);
  })
}

async function register(lobby) {
  console.log("precisa se registrar fio");
  const usernameInput = h("input#username", { name: "username", placeholder: "..." });
  const registrationScreen = h("div",
    h("label", { for: "username" }, "Nome"),
    usernameInput,
    h("button", { type: "submit", onclick: () => {
      const username = usernameInput.value;
      if (!username) {
        alert("Preencha o nome de usuário");
        return;
      }

      registrationScreen.remove();

      lobby.onMessage("registrationError", () => console.error("a autenticação deu ruim hein"));
      lobby.onMessage("authenticated", (message) => {
        localStorage.setItem("auth_token", message.token);
        lobby.send("login", { token: message.token });
      });

      lobby.send("register", { username });
    } }, "Registrar")
  );

  ui.append(registrationScreen);
}

function goToLobby(lobby) {
  const lobbyScreen = h("div",
    h("span", "Bem-vindo, ", user.username),
    h("button", { onclick: () => {
      lobbyScreen.remove();
    }}, "Jogar")
  )

  ui.append(lobbyScreen);
}