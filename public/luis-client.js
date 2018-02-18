(function(FuseBox){FuseBox.$fuse$=FuseBox;
FuseBox.pkg("default", {}, function(___scope___){
___scope___.file("luis/client.js", function(exports, require, module, __filename, __dirname){

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var components_1 = require("luis/dist/client/components");
var tests = FuseBox.import('**/*.story');
// console.log(tests)
// startTests(Object.values(tests))
components_1.renderLuis();
//# sourceMappingURL=client.js.map
});
___scope___.file("manifest.json", function(exports, require, module, __filename, __dirname){

module.exports = {
  "background": {
    "scripts": [
      "browser-polyfill.js",
      "background.js"
    ]
  },
  "content_scripts": [{
    "js": [
      "browser-polyfill.js",
      "content.js"
    ]
  }]
}
;
});
return ___scope___.entry = "luis/client.ts";
});
FuseBox.pkg("crypto", {}, function(___scope___){
___scope___.file("index.js", function(exports, require, module, __filename, __dirname){

module.exports = { randomBytes: () => crypto.getRandomValues(new global.Uint16Array(1))[0] }
});
return ___scope___.entry = "index.js";
});
FuseBox.pkg("stream", {}, function(___scope___){
___scope___.file("index.js", function(exports, require, module, __filename, __dirname){

module.exports = { Writable: function() {}, Readable: function() {}, Transform: function() {} }
});
return ___scope___.entry = "index.js";
});
FuseBox.target = "browser"

FuseBox.import("default/luis/client.js");
FuseBox.main("default/luis/client.js");
})
(FuseBox)
//# sourceMappingURL=luis-client.js.map