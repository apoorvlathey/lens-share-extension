import React from "react";
// @ts-ignore
import { createRoot } from "react-dom/client";
import App from "./App";

const body = document.querySelector("body");
const app = document.createElement("div");
app.id = "lens-share-react-app";

if (body) {
  body.prepend(app);
}

const root = createRoot(app);

root.render(<App />); // Render react component
