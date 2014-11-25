
// Module oasis/shape
// Handle the OSLC Resource Shape to HTML table transform

define(
    ["handlebars",
     "core/utils",
     "tmpl!oasis/templates/shape.html"],
    function (hb, utils, shapeTmpl) {
        return {
            run: function (conf, doc, cb, msg) {
                msg.pub("start", "oasis/shape");
                msg.pub("end", "oasis/shape");
                cb();
            },
            shapeToSpec: function(util, content) {
            	var prefixMap;
            	
            	var quote = function(str) {
            		return (str+'').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
            	};
            	
            	var addNSPrefix = function(name, URI) {
            		var prefixedName = null;
            		$.each(prefixMap || [], function(i, it) {
            			var pattern = new RegExp("^"+it);
            			if (pattern.test(URI)) {
            				prefixedName = i + ":" + name;
            				return prefixedName
            			}
            		});
            		return prefixedName;
            	};
            	
            	var setDefaults = function(prop) {   			    
    			    var propDefaults = {
    			    	occurs:   {long: "http://open-services.net/ns/core#Zero-or-many", short: "Zero-or-many"},
    			    	readOnly: {long: "unspecified", short: "unspecified" },
    			    	valType:  {long: "http://www.w3.org/2001/XMLSchema#string", short: "string"},
    			    	rep:      {long: "http://open-services.net/ns/core#Either", short: "Either"},
    			    	range:    {long: "http://open-services.net/ns/core#Resource", short: "Resource"},
    			    	description: {long: "", short: ""}
    			    }
    			    
    			    $.each(propDefaults, function(attr, value) {
    			    	prop[attr] = value.short;
    			    });
            	};
            	// For each triple, find the predicate mapping to JSON
            	// attribute to make handlebars template easier
                var fillHBJson = function(store, triples, map) {
    			    $.each(triples || [], function(i, it) {
    			    	setDefaults(it);
    			    	$.each(map || [], function(n, nt) {
    				    	var results = store.find(it.object, nt.predicate, null);
    				    	if (results.length > 0) {
    				    		if (nt.multiValue) {
    				    			it[nt.name] = results;    				    			
    				    		} else {
    				    			var o = results[0].object;
    				    			if (N3.Util.isLiteral(o)) {
    				    				o = N3.Util.getLiteralValue(o);
    				    			}
    				    			if (!nt.dontCompact) {
    				    				var r = /#.*$/.exec(o);
    				    				if (r && r.length > 0) o = r[0].substring(1);
    				    			}
    				    			it[nt.name] = o;
    				    		}
    				    	}
    			    	});
    			    });           	
                };
                
            	var parser = N3.Parser();
            	var store = N3.Store();
            	parser.parse(function (error, triple, prefixes) {
					if (error) {
						console.log("Error: "+error);
					} else {
						if (triple) store.addTriple(triple);
						else prefixMap = prefixes;
					}
            	});
            	parser.addChunk(content);
            	parser.end();
			    
			    var owlOnto = "http://www.w3.org/2002/07/owl#Ontology";
			    var rdfsClass = "http://www.w3.org/2000/01/rdf-schema#Class";
			    var rdfProp = "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property";
			    var rdfDesc = "http://www.w3.org/1999/02/22-rdf-syntax-ns#Description";
			    var rdfType = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
			    var rdfsLabel = "http://www.w3.org/2000/01/rdf-schema#label";
			    var rdfsComment = "http://www.w3.org/2000/01/rdf-schema#comment";
			    var rdfsSeeAlso = "http://www.w3.org/2000/01/rdf-schema#seeAlso";
			    var rdfsIsDefinedBy = "http://www.w3.org/2000/01/rdf-schema#isDefinedBy";
			    
			    var dcDescription = "http://purl.org/dc/terms/description";
			    var dcTitle = "http://purl.org/dc/terms/title";
			    var oslcNS = "http://open-services.net/ns/core#";
			    var oslcShape = oslcNS + "ResourceShape";
			    var oslcDescribes = oslcNS + "describes";
			    var oslcOccurs = oslcNS + "occurs";
			    var oslcProp = oslcNS + "property";
			    var oslcPropClass = oslcNS + "Property";
			    var oslcPropDefn = oslcNS + "propertyDefinition";
			    var oslcValType = oslcNS + "valueType";
			    var oslcReadonly = oslcNS + "readOnly";
			    var oslcRep = oslcNS + "representation";
			    var oslcRange = oslcNS + "range";
			    var oslcName = oslcNS + "name";
			    
			    var shape = store.find(null, rdfType, oslcShape);
			    if (shape.length != 1) { console.log("Can't locate oslc:ResourceShape"); return null;}
			    var vocabSub = shape[0].subject;
			    var conf = {};
			    conf.subject = vocabSub;
			    
			    var typeURI = store.find(vocabSub, oslcDescribes, null);
			    conf.typeURI = typeURI[0].object;
			    conf.name = /#.*$/.exec(conf.typeURI)[0].substring(1);
			    
			    var title = store.find(vocabSub, dcTitle, null);
			    conf.title = N3.Util.getLiteralValue(title[0].object);
			    
			    var desc = store.find(vocabSub, dcDescription, null);
			    if (desc.length > 0 ) conf.description = N3.Util.getLiteralValue(desc[0].object);

			    var props = store.find(vocabSub, oslcProp, null);
			    conf.props = props;
			    
			    var validValues = {
			    	oslcValType: [
			    	        "http://www.w3.org/2001/XMLSchema#boolean", 
			    		    "http://www.w3.org/2001/XMLSchema#dateTime", 
			    		    "http://www.w3.org/2001/XMLSchema#decimal",
			    		    "http://www.w3.org/2001/XMLSchema#double",
			    		    "http://www.w3.org/2001/XMLSchema#float",
			    		    "http://www.w3.org/2001/XMLSchema#integer",
						 	"http://www.w3.org/2001/XMLSchema#string", 
						 	"http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral",
						 	"http://open-services.net/ns/core#Resource",
						 	"http://open-services.net/ns/core#LocalResource", 
						 	"http://open-services.net/ns/core#AnyResource"],
					oslcOccurs: ["http://open-services.net/ns/core#Exactly-one",
					             "http://open-services.net/ns/core#Zero-or-one",
					             "http://open-services.net/ns/core#Zero-or-many",
					             "http://open-services.net/ns/core#One-or-many"],
			    };
			    
			    var inputMap = [{predicate: oslcOccurs, name: "occurs"}, 
			                    {predicate: oslcReadonly, name: "readOnly"},
			                    {predicate: oslcValType, name: "valType"},
			                    {predicate: oslcRep, name: "rep"},
			                    {predicate: oslcRange, name: "range"},
			                    {predicate: oslcPropDefn, name: "propURI", dontCompact: true},
			                    {predicate: dcDescription, name: "description"},
			                    {predicate: oslcName, name: "name"}];
			    
			    // Map from object values to text/label entries for the spec tables
			    fillHBJson(store, props, inputMap);
			    
			    // Need to set the name and prefixedName
			    $.each(props, function(i, it) {
			    	if (!it.name && it.propURI) 
			    		it.name = /#.*$/.exec(it.propURI)[0].substring(1);
			    	if (it.name && !it.prefixedName) 
			    		it.prefixedName = addNSPrefix(it.name, it.propURI);
			    });
			    
			    
			    var html = shapeTmpl(conf);
		
				return html;
            }
        };
    }
);

