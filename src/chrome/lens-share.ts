// NOTE: The window object the content script sees is not the same window object that the page sees.
// that's why putting all our logic here so we can access the actual window object
type Window = Record<string, any>;

const createButton = () => {
  const btnGroup = document.querySelector('[role="group"]');
  const div = document.createElement("div");
  div.style.setProperty("padding-bottom", "1rem");
  const btn = document.createElement("button");
  btn.id = "lens-share";
  btn.style.setProperty("background-color", "green");
  btn.style.setProperty("color", "white");
  btn.style.setProperty("border-radius", "0.7rem");
  btn.style.setProperty("font-weight", "bold");
  btn.addEventListener(
    "mouseover",
    () => {
      btn.style.setProperty("cursor", "pointer");
    },
    false
  );
  btn.addEventListener(
    "mouseout",
    () => {
      btn.style.setProperty("cursor", "default");
    },
    false
  );
  btn.innerHTML = "Share on Lens 🌿";
  btn.onclick = () => {
    const url = `https://lens-share.apoorv.xyz/?url=${window.location.href}`;
    // window.open(url);
    // TODO: toggle modal open/close
    createModal();
  };
  div.appendChild(btn);
  btnGroup?.appendChild(div);
};

const createModal = () => {
  const fullscreen = document.createElement("div");
  fullscreen.style.setProperty("position", "fixed");
  fullscreen.style.setProperty("z-index", "99999");
  fullscreen.style.setProperty("width", "100%");
  fullscreen.style.setProperty("height", "100%");
  fullscreen.style.setProperty("top", "0");
  fullscreen.style.setProperty("left", "0");
  fullscreen.style.setProperty("display", "flex");
  fullscreen.style.setProperty("justify-content", "center");
  fullscreen.style.setProperty("align-items", "center");

  const modal = document.createElement("div");
  modal.style.setProperty("width", "50rem");
  modal.style.setProperty("height", "30rem");
  modal.style.setProperty("background-color", "white");
  modal.style.setProperty("display", "flex");
  modal.style.setProperty("justify-content", "center");
  modal.style.setProperty("align-items", "center");

  const connectWalletBtn = document.createElement("button");
  connectWalletBtn.style.setProperty("padding", "0.5rem");
  connectWalletBtn.style.setProperty("background-color", "green");
  connectWalletBtn.style.setProperty("color", "white");
  connectWalletBtn.style.setProperty("border-radius", "0.7rem");
  connectWalletBtn.style.setProperty("font-weight", "bold");
  connectWalletBtn.innerHTML = "Connect Wallet";
  connectWalletBtn.onclick = async () => {
    const { ethereum } = window as Window;
    if (ethereum) {
      connectWalletBtn.innerHTML = "Connecting...";
      try {
        const acccounts: string[] = await ethereum.request({
          method: "eth_requestAccounts",
        });
        connectWalletBtn.innerHTML = `Connected to ${acccounts[0]}`;
      } catch (error) {
        console.error(error);
        connectWalletBtn.innerHTML = "Error Connecting";
      }
    } else {
      connectWalletBtn.innerHTML = "No Wallet Found";
    }
  };

  modal.appendChild(connectWalletBtn);
  fullscreen.appendChild(modal);
  document.body.appendChild(fullscreen);
};

const init = async () => {
  const checkIfTwitterLoaded = () => {
    if (document.querySelector('[role="group"]')) {
      clearInterval(btnGroupCheckTimer);

      // create button in our target element
      createButton();
    }
  };

  // wait for our target element to load
  var btnGroupCheckTimer = setInterval(checkIfTwitterLoaded, 200);
};

// wait for `load` event, then call `init`
window.addEventListener("load", init, false);

// to remove isolated modules error
export {};
