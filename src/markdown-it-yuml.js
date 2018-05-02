const crypto = require("crypto");
const yuml2svg = require("yuml2svg");
const vscode = require("vscode");

const cssBlock =
  "<style>.vscode-high-contrast .yuml-light,.vscode-dark .yuml-light,.vscode-light .yuml-dark{display:none;}</style>";

class SVGCache {
  constructor() {
    this.garbageCollecting = false;
    this.garbageCollectShouldStart = false;
    this.garbageCollectorId = 0;
    this.garbageHashMemory = [];
    this.svgMemory = {};
  }

  garbageCollectOldDiagrams() {
    if (this.garbageCollectorId) {
      clearTimeout(this.garbageCollectorId);
      this.garbageCollectorId = 0;
    }
    this.garbageHashMemory = Object.keys(this.svgMemory);
    this.garbageCollectShouldStart = true;
  }

  garbageCollect() {
    for (const garbageHash of this.garbageHashMemory) {
      delete this.svgMemory[garbageHash];
    }
    this.garbageCollectorId = 0;
    this.garbageCollecting = false;
  }

  unsubscribeToGarbageCollection(hash) {
    if (this.garbageCollectShouldStart) {
      this.garbageCollectorId = setTimeout(() => this.garbageCollect(), 100);
      this.garbageCollecting = true;
      this.garbageCollectShouldStart = false;
    }
    if (this.garbageCollecting) {
      this.garbageHashMemory = this.garbageHashMemory.filter(
        garbageHash => hash !== garbageHash
      );
    }
  }

  getSVGFromDiagram(yuml) {
    const hasher = crypto.createHash("sha1");

    hasher.update(yuml);
    const hash = hasher.digest("base64");

    this.unsubscribeToGarbageCollection(hash);

    if (hash in this.svgMemory) {
      return cssBlock + this.svgMemory[hash];
    } else {
      this.garbageCollectOldDiagrams();
      // Generate the new one
      Promise.all([
        yuml2svg(yuml, { isDark: false }),
        yuml2svg(yuml, { isDark: true }),
      ])
        .then(SVGs => {
          this.svgMemory[hash] =
            "<span class='yuml-light'>" +
            SVGs.join("</span><span class='yuml-dark'>") +
            "</span>";
          vscode.commands.executeCommand("markdown.preview.refresh");
        })
        .catch(err => {
          this.svgMemory[hash] = `<pre>Error in the yUML code: ${err}</pre>`;
          vscode.commands.executeCommand("markdown.preview.refresh");
        });

      return "<pre>Rendering yUML...</pre>";
    }
  }
}

const svgCache = new SVGCache();

module.exports = function(md, options) {
  const originalFence = md.renderer.rules.fence;

  md.renderer.rules.fence = function(tokens, idx, _options, env, self) {
    const token = tokens[idx];

    if (token.type === "fence" && token.info === "yuml") {
      return svgCache.getSVGFromDiagram(token.content);
    }

    return originalFence(tokens, idx, _options, env, self);
  };

  return md;
};
