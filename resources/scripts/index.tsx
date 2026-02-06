import ReactDOM from "react-dom";
import { setConfig } from "react-hot-loader";
import App from "@/components/App";

// Enable language support.
import "./i18n";

// Prevents page reloads while making component changes which
// also avoids triggering constant loading indicators all over
// the place in development.
//
// @see https://github.com/gaearon/react-hot-loader#hook-support
setConfig({ reloadHooks: false });

ReactDOM.render(<App />, document.getElementById("app"));
