/*jshint
    forin: false
*/
/*global Handlebars*/

// Module oasis/headers
// Generate the headers material based on the provided configuration.
// CONFIGURATION
//  - specStatus: the short code for the specification's maturity level or type (required)
//  - shortName: the small name that is used after /TR/ in published reports (required)
//  - revision: the revision number of the document at its given stage (required)
//  - oslcVersion: the OSLC version number of the spec (1.0, 2.0, etc.), if any
//  - citationLabel: the citation label for the spec. If missing, no citation section is generated.
//  - editors: an array of people editing the document (at least one is required). People
//      are defined using:
//          - name: the person's name (required)
//          - url: URI for the person's home page
//          - company: the person's company
//          - companyURL: the URI for the person's company
//          - mailto: the person's email
//          - note: a note on the person (e.g. former editor)
//  - authors: an array of people who are contributing authors of the document.
//  - chairs: an array of people who are chairing the TC producing this document.
//  - subtitle: a subtitle for the specification
//  - publishDate: the date to use for the publication, default to document.lastModified, and
//      failing that to now. The format is YYYY-MM-DD or a Date object.
//  - previousPublishDate: the date on which the previous version was published.
//  - previousMaturity: the specStatus of the previous version
//  - errata: the URI of the errata document, if any
//  - alternateFormats: a list of alternate formats for the document, each of which being
//      defined by:
//          - uri: the URI to the alternate
//          - label: a label for the alternate
//          - lang: optional language
//          - type: optional MIME type
//  - testSuiteURI: the URI to the test suite, if any
//  - implementationReportURI: the URI to the implementation report, if any
//  - noStdTrack: set to true if this document is not intended to be on the Recommendation track
//  - edDraftURI: the URI of the Editor's Draft for this document, if any. Required if
//      specStatus is set to "ED".
//  - additionalCopyrightHolders: a copyright owner in addition to W3C (or the only one if specStatus
//      is unofficial)
//  - overrideCopyright: provides markup to completely override the copyright
//  - copyrightStart: the year from which the copyright starts running
//  - prevED: the URI of the previous Editor's Draft if it has moved
//  - prevRecShortname: the short name of the previous Recommendation, if the name has changed
//  - prevRecURI: the URI of the previous Recommendation if not directly generated from
//    prevRecShortname.
//  - wg: the name of the WG in charge of the document. This may be an array in which case wgURI
//      and wgPatentURI need to be arrays as well, of the same length and in the same order
//  - wgURI: the URI to the group's page, or an array of such
//  - wgPatentURI: the URI to the group's patent information page, or an array of such. NOTE: this
//      is VERY IMPORTANT information to provide and get right, do not just paste this without checking
//      that you're doing it right
//  - wgPublicList: the name of the mailing list where discussion takes place. Note that this cannot
//      be an array as it is assumed that there is a single list to discuss the document, even if it
//      is handled by multiple groups
//  - wgShortName: the name of the TC that is seen in the URL for publications
//  - charterDisclosureURI: used for IGs (when publishing IG-NOTEs) to provide a link to the IPR commitment
//      defined in their charter.
//  - addPatentNote: used to add patent-related information to the SotD, for instance if there's an open
//      PAG on the document.
//  - thisVersion: the URI to the dated current version of the specification. ONLY ever use this for CG/BG
//      documents, for all others it is autogenerated.
//  - latestVersion: the URI to the latest (undated) version of the specification. ONLY ever use this for CG/BG
//      documents, for all others it is autogenerated.
//  - prevVersion: the URI to the previous (dated) version of the specification. ONLY ever use this for CG/BG
//      documents, for all others it is autogenerated.
//  - subjectPrefix: the string that is expected to be used as a subject prefix when posting to the mailing
//      list of the group.
//  - otherLinks: an array of other links that you might want in the header (e.g., link github, twitter, etc).
//         Example of usage: [{key: "foo", href:"http://b"}, {key: "bar", href:"http://"}].
//         Allowed values are:
//          - key: the key for the <dt> (e.g., "Bug Tracker"). Required.
//          - value: The value that will appear in the <dd> (e.g., "GitHub"). Optional.
//          - href: a URL for the value (e.g., "http://foo.com/issues"). Optional.
//          - class: a string representing CSS classes. Optional.
//  - license: can either be "w3c" (for the currently default, restrictive license) or "cc-by" for
//      the friendly persmissive dual license that nice people use (if they are participating in the
//      HTML WG licensing experiment)

define(
    ["handlebars"
    ,"core/utils"
    ,"tmpl!oasis/templates/headers.html"
    ,"tmpl!oasis/templates/sotd.html"
    ,"tmpl!oasis/templates/notices.html"
    ],
    function (hb, utils, headersTmpl, sotdTmpl, noticesTmpl) {
        Handlebars.registerHelper("showPeople", function (name, items) {
            // stuff to handle RDFa
            var re = "", rp = "", rm = "", rn = "", rwu = "", rpu = "";
            if (this.doRDFa !== false) {
                if (name === "Editor") {
                    re = " rel='bibo:editor'";
                    if (this.doRDFa !== "1.0") re += " inlist=''";
                }
                else if (name === "Author") {
                    re = " rel='dcterms:contributor'";
                }
                rn = " property='foaf:name'";
                rm = " rel='foaf:mbox'";
                rp = " typeof='foaf:Person'";
                rwu = " rel='foaf:workplaceHomepage'";
                rpu = " rel='foaf:homepage'";
            }
            var ret = "";
            for (var i = 0, n = items.length; i < n; i++) {
                var p = items[i];
                if (this.doRDFa !== false ) ret += "<dd class='p-author h-card vcard' " + re +"><span" + rp + ">";
                else             ret += "<dd class='p-author h-card vcard'>";
                if (p.url) {
                    if (this.doRDFa !== false ) {
                        ret += "<a class='u-url url p-name fn' " + rpu + rn + " content='" + p.name +  "' href='" + p.url + "'>" + p.name + "</a>";
                    }
                    else {
                        ret += "<a class='u-url url p-name fn' href='" + p.url + "'>"+ p.name + "</a>";
                    }
                }
                else {
                    ret += "<span" + rn + " class='p-name fn'>" + p.name + "</span>";
                }
                if (p.company) {
                    ret += ", ";
                    if (p.companyURL) ret += "<a" + rwu + " class='p-org org h-org h-card' href='" + p.companyURL + "'>" + p.company + "</a>";
                    else ret += p.company;
                }
                if (p.mailto) {
                    ret += ", <span class='ed_mailto'><a class='u-email email' " + rm + " href='mailto:" + p.mailto + "'>" + p.mailto + "</a></span>";
                }
                if (p.note) ret += " (" + p.note + ")";
                if (this.doRDFa !== false ) ret += "</span>\n";
                ret += "</dd>\n";
            }
            return new Handlebars.SafeString(ret);
        });


        return {
            status2maturity:    {
                ED:             "ED"
            ,   WD:             "WD"
            ,   CSD:            "CSD"
            ,   CSPRD:          "CSPRD"
            ,   CS:             "CS"
            ,   COS:            "COS"
            ,   OS:             "OS"
            ,   Errata:         "Errata"
            ,   CND:            "CND"
            ,   CNPRD:          "CNPRD"
            ,   CN:             "CN"
            }
        ,   status2rdf: {
                ED:             "oasis:ED",
                WD:             "oasis:WD",
                CSD:            "oasis:CSD",
                CSPRD:          "oasis:CSPRD",
                CS:             "oasis:CS",
                COS:            "oasis:COS",
                OS:             "oasis:OS",
                Errata:         "oasis:Errata",
                CND:            "oasis:CND",
                CNPRD:          "oasis:CNPRD",
                CN:             "oasis:CN"
            }
        ,   status2text: {
            		ED:             "Editor's Draft"
            	,	WD:             "Working Draft"
                ,   CSD:            "Committee Specification Draft"
                ,   CSPRD:          "Committee Specification Public Review Draft"
                ,   CS:             "Committee Specification"
                ,   COS:            "Candidate OASIS Standard"
                ,   OS:             "OASIS Standard"
                ,   Errata:         "Approved Errata"
                ,   CND:            "Committee Note Draft"
                ,   CNPRD:          "Committee Note Public Review Draft"
                ,   CN:             "Committee Note"
                ,   unofficial:     "Unofficial Draft"
                ,   base:           "Document"
            }
        ,   status2long:    { }
        ,   stdTrackStatus: ["WD", "CSD", "CSPRD", "CS", "COS", "OS", "Errata"]
        ,   noTrackStatus:  ["CND", "CNPRD", "CN", "unofficial", "base"]
        ,   precededByAn:   ["ED"]

        ,   run:    function (conf, doc, cb, msg) {
                msg.pub("start", "oasis/headers");

                if (conf.doRDFa !== false) {
                    if (conf.doRDFa === undefined) {
                        conf.doRDFa = '1.1';
                    }
                }
                // validate configuration and derive new configuration values
                if (!conf.license) conf.license = "oasis";
                // NOTE: this is currently only available to the HTML WG
                // this check will be relaxed later
                conf.isCCBY = conf.license === "cc-by";
                if (!conf.specStatus) msg.pub("error", "Missing required configuration: specStatus");
                if (!conf.shortName) msg.pub("error", "Missing required configuration: shortName");
                if (!conf.revision) msg.pub("error", "Missing required configuration: revision");
                conf.title = doc.title || "No Title";
                if (conf.oslcVersion) conf.title = conf.title + " " + conf.oslcVersion;
                if (!conf.subtitle) conf.subtitle = "";
                if (!conf.publishDate) {
                    conf.publishDate = utils.parseLastModified(doc.lastModified);
                }
                else {
                    if (!(conf.publishDate instanceof Date)) conf.publishDate = utils.parseSimpleDate(conf.publishDate);
                }
                conf.publishYear = conf.publishDate.getFullYear();
                conf.publishHumanDate = utils.humanDate(conf.publishDate);
                conf.isNoTrack = $.inArray(conf.specStatus, this.noTrackStatus) >= 0;
                conf.isStdTrack = conf.noRecTrack ? false : $.inArray(conf.specStatus, this.stdTrackStatus) >= 0;
                conf.anOrA = $.inArray(conf.specStatus, this.precededByAn) >= 0 ? "an" : "a";
                if (!conf.edDraftURI) {
                    conf.edDraftURI = "";
                    if (conf.specStatus === "WD") msg.pub("warn", "Working Drafts should set edDraftURI.");
                }
                conf.maturity = (this.status2maturity[conf.specStatus]) ? this.status2maturity[conf.specStatus] : conf.specStatus;
                if (conf.specStatus === "ED") conf.thisVersion = conf.edDraftURI;
                // TODO: Determine right URI production
                // conf.latestVersion = "http://docs.oasis-open.org/" + conf.wgShortName + "/";
                if (!conf.tcBaseURI) conf.tcBaseURI = "https://www.oasis-open.org/committees";
                if (conf.previousPublishDate) {
                    if (!conf.previousMaturity)
                        msg.pub("error", "previousPublishDate is set, but not previousMaturity");
                    if (!(conf.previousPublishDate instanceof Date))
                        conf.previousPublishDate = utils.parseSimpleDate(conf.previousPublishDate);
                    var pmat = (this.status2maturity[conf.previousMaturity]) ? this.status2maturity[conf.previousMaturity] :
                                                                               conf.previousMaturity;
                    conf.prevVersion = "http://docs.oasis-open.org/" + conf.wgShortName + "/" + conf.previousPublishDate.getFullYear() + "/" + pmat + "-" +
                              conf.shortName + "-" + utils.concatDate(conf.previousPublishDate) + "/";
                }
                else {
                    if (conf.specStatus !== "WD" && conf.specStatus !== "ED" && !conf.noStdTrack && !conf.isNoTrack)
                        msg.pub("error", "Document on track but no previous version.");
                    if (!conf.prevVersion) conf.prevVersion = "";
                }
                if (conf.prevRecShortname && !conf.prevRecURI) conf.prevRecURI = "http://docs.oasis-open.org/" + conf.prevRecShortname;
                if (!conf.editors || conf.editors.length === 0) msg.pub("error", "At least one editor is required");
                var peopCheck = function (i, it) {
                    if (!it.name) msg.pub("error", "All authors and editors must have a name.");
                };
                $.each(conf.editors, peopCheck);
                $.each(conf.authors || [], peopCheck);
                $.each(conf.chairs || [], peopCheck);
                conf.multipleEditors = conf.editors.length > 1;
                conf.multipleAuthors = conf.authors && conf.authors.length > 1;
                conf.multipleChairs = conf.chairs && conf.chairs.length > 1;
                conf.editorsHTML = utils.joinAnd($.isArray(conf.editors) ? conf.editors : [conf.editors], function(ed) {return ed.name;});
                $.each(conf.alternateFormats || [], function (i, it) {
                    if (!it.uri || !it.label) msg.pub("error", "All alternate formats must have a uri and a label.");
                });
                conf.multipleAlternates = conf.alternateFormats && conf.alternateFormats.length > 1;
                conf.alternatesHTML = utils.joinAnd(conf.alternateFormats, function (alt) {
                    var optional = (alt.hasOwnProperty('lang') && alt.lang) ? " hreflang='" + alt.lang + "'" : "";
                    optional += (alt.hasOwnProperty('type') && alt.type) ? " type='" + alt.type + "'" : "";
                    return "<a rel='alternate' href='" + alt.uri + "'" + optional + ">" + alt.label + "</a>";
                });
                if (conf.copyrightStart && conf.copyrightStart == conf.publishYear) conf.copyrightStart = "";
                for (var k in this.status2text) {
                    if (this.status2long[k]) continue;
                    this.status2long[k] = this.status2text[k];
                }
                conf.longStatus = this.status2long[conf.specStatus];
                conf.textStatus = this.status2text[conf.specStatus];
                if (this.status2rdf[conf.specStatus]) {
                    conf.rdfStatus = this.status2rdf[conf.specStatus];
                }
                conf.showThisVersion =  !conf.isNoTrack;
                conf.showPreviousVersion = (conf.specStatus !== "WD"  &&
                                           !conf.isNoTrack);
                conf.notYetStd = (conf.isStdTrack && conf.specStatus !== "OS");
                conf.isStd = (conf.isStdTrack && conf.specStatus === "OS");
                conf.notStd = (conf.specStatus !== "OS");
                conf.isUnofficial = conf.specStatus === "unofficial";
                conf.prependOASIS = !conf.isUnofficial;
                conf.isWD = (conf.specStatus === "WD");
                conf.isCS = (conf.specStatus === "CS");
                conf.isCSPR = (conf.specStatus === "CSPRD");
                conf.isCOS = (conf.specStatus === "COS");
                conf.isOS = (conf.specStatus === "OS");
                conf.isAE = (conf.specStatus === "Errata");
                conf.dashDate = utils.concatDate(conf.publishDate, "-");
                conf.publishISODate = utils.isoDate(conf.publishDate) ;
                // configuration done - yay!

                // annotate html element with RFDa
                if (conf.doRDFa) {
                    if (conf.rdfStatus) {
                        $("html").attr("typeof", "bibo:Document "+conf.rdfStatus ) ;
                    } else {
                        $("html").attr("typeof", "bibo:Document ") ;
                    }
                    $("html").attr("about", "") ;
                    $("html").attr("property", "dcterms:language") ;
                    $("html").attr("content", "en") ;
                    var prefixes = "bibo: http://purl.org/ontology/bibo/ oasis: http://docs.oasis-open.org/ns/spec";
                    if (conf.doRDFa != '1.1') {
                        $("html").attr("version", "XHTML+RDFa 1.0") ;
                        prefixes += " dcterms: http://purl.org/dc/terms/ foaf: http://xmlns.com/foaf/0.1/ xsd: http://www.w3.org/2001/XMLSchema#";
                    }
                    $("html").attr("prefix", prefixes);
                }

                // handle abstract
                var $shortAbstract = $("#abstract");
                if (!$shortAbstract.length)
                    msg.pub("error", "A short abstract is required.");
                conf.shortAbstract = $shortAbstract.html();
                $shortAbstract.remove();

                if ($.isArray(conf.wg)) {
                    conf.multipleWGs = conf.wg.length > 1;
                    conf.wgHTML = utils.joinAnd($.isArray(conf.wg) ? conf.wg : [conf.wg], function (wg, idx) {
                        return "<a href='" + conf.wgURI[idx] + "'>" + wg + "</a>";
                    });
                    var pats = [];
                    for (var i = 0, n = conf.wg.length; i < n; i++) {
                        pats.push("<a href='" + conf.wgPatentURI[i] + "' rel='disclosure'>" + conf.wg[i] + "</a>");
                    }
                    conf.wgPatentHTML = pats.join(", ");
                }
                else {
                    conf.multipleWGs = false;
                    conf.wgHTML = "<a href='" + conf.wgURI + "'>" + conf.wg + "</a>";
                }
                if (conf.isCSPR && !conf.lcEnd) msg.pub("error", "Status is CSPR but no lcEnd is specified");

                conf.stdNotExpected = (!conf.isStdTrack && conf.maturity == "WD");

                // handle SotD
                var $sotd = $("#sotd");
                if ((!conf.isNoTrack) && !$sotd.length)
                    msg.pub("error", "A custom SotD paragraph is required for your type of document.");
                conf.sotdCustomParagraph = $sotd.html();
                $sotd.remove();
                conf.status = sotdTmpl(conf);

                // insert into document and mark with microformat
                $("body", doc).prepend($(headersTmpl(conf)))
                              .addClass("h-entry");

                var $notices = $("#notices");

                $(noticesTmpl(conf)).insertBefore($("#toc"));

                msg.pub("end", "oasis/headers");
                cb();
            }
        };
    }
);
