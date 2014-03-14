
// Module oasis/conformance
// Handle the conformance section properly.

define(
    ["tmpl!oasis/templates/conformance.html"],
    function (confoTmpl) {
        return {
            run:    function (conf, doc, cb, msg) {
                msg.pub("start", "oasis/conformance");
                var $confo = $("#conformance");
                if ($confo.length) $confo.prepend(confoTmpl(conf));
                msg.pub("end", "oasis/conformance");
                cb();
            }
        };
    }
);
