const TlfResizableTile = require("./resizableTile");
window.TlfResizableTile = TlfResizableTile;

const TlfBackgroundTile = require("./backgroundTile");
window.TlfBackgroundTile = TlfBackgroundTile;
const TlfButtonTile = require("./buttonTile");
window.TlfButtonTile = TlfButtonTile;
const TlfCombobox = require("./comboBox");
window.TlfCombobox = TlfCombobox;

// Register custom elements
customElements.define("tlf-background-tile", TlfBackgroundTile);
customElements.define("tlf-button-tile", TlfButtonTile, { extends: 'a' });
customElements.define("tlf-combobox", TlfCombobox);
customElements.define("tlf-resizable-tile", TlfResizableTile, { extends: 'a' });
