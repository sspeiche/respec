/*global respecVersion */

// this is only set in a build, not at all in the dev environment
var requireConfig = {
    shim:   {
        "shortcut": {
            exports:    "shortcut"
        },
        "n3-browser.min": {
        	exports: "N3"
        }
    }
};
if ("respecVersion" in window && respecVersion) {
    requireConfig.paths = {
        "ui": "https://raw.github.com/darobin/respec/gh-pages/js/ui",
    };
}

require.config(requireConfig);

define([
            "domReady"
        ,   "core/base-runner"
        ,   "core/ui"
        ,   "core/override-configuration"
        ,   "core/default-root-attr"
        ,   "core/markdown"
        ,   "core/style"
        ,   "oasis/style"
        ,   "oasis/headers"
/*        ,   "oasis/abstract" */
        ,   "oasis/conventions"
        ,   "core/data-transform"
        ,   "core/data-include"
        ,   "core/inlines"
        ,   "core/examples"
        ,   "core/issues-notes"
        ,   "core/requirements"
        ,   "core/highlight"
        ,   "core/best-practices"
        ,   "core/figures"
        ,   "oasis/biblio"
        ,   "core/rdfa"
        ,   "core/webidl-oldschool"
        ,   "core/dfn"
        ,   "core/fix-headers"
        ,   "oasis/structure"
        ,   "oasis/informative"
        ,   "core/id-headers"
        ,   "oasis/aria"
        ,   "oasis/vocab"
        ,   "oasis/shape"
        ,   "core/shiv"
        ,   "core/remove-respec"
        ,   "core/location-hash"
        ],
        function (domReady, runner, ui) {
            var args = Array.prototype.slice.call(arguments);
            domReady(function () {
                ui.addCommand("Save Snapshot", "ui/save-html", "Ctrl+Shift+Alt+S");
                ui.addCommand("About ReSpec", "ui/about-respec", "Ctrl+Shift+Alt+A");
                runner.runAll(args);
            });
        }
);

function vocabToSpec(util, content, uri) {
	var vocab = require("oasis/vocab");
	return vocab.vocabToSpec(util, content, uri);
}

function shapeToSpec(util, content, uri) {
	var shape = require("oasis/shape");
	return shape.shapeToSpec(util, content, uri);
}


