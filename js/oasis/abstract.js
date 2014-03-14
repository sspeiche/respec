
// Module oasis/abstract
// Handle the abstract section properly.

define(
    [],
    function () {
        return {
            run:    function (conf, doc, cb, msg) {
                msg.pub("start", "oasis/abstract");
                var $abs = $("#abstract");
                if (!$abs) return msg.pub("error", "Document must have one element with ID 'abstract'");
                if ($abs.find("p").length === 0) $abs.contents().wrapAll($("<p></p>"));
                $abs.prepend("<h2>Abstract</h2>");
                $abs.addClass("introductory");
                if (this.doRDFa !== false) {
                    var rel = "dcterms:abstract"
                    ,   ref = $abs.attr("property");
                    if (ref) rel = ref + " " + rel;
                    $abs.attr({
                        "property": rel
                    ,   "datatype": ""
                    });
                }
                msg.pub("end", "oasis/abstract");
                cb();
            }
        };
    }
);
