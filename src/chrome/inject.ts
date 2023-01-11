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
    window.open(`https://lens-share.apoorv.xyz/?url=${window.location.href}`);
  };
  div.appendChild(btn);
  btnGroup?.appendChild(div);
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
