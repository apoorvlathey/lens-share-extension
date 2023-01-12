const init = async () => {
  // inject lens-share.js into webpage
  try {
    let script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.src = chrome.runtime.getURL("/static/js/lens-share.js");
    script.onload = async function () {
      // @ts-ignore
      this.remove();
    };
    document.head
      ? document.head.prepend(script)
      : document.documentElement.prepend(script);
  } catch (e) {
    console.log(e);
  }
};

init();

// to remove isolated modules error
export {};
