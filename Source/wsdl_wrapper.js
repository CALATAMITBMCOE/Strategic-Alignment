		function SOAPClient() {}

		SOAPClient.invoke = function(debugMode, url, xog_url, method, headparameters, parameters, filter, async, callback)
		{
			if(debugMode==2) 
				console.log("SOAPClient.invoke");
			if(debugMode==2)
					console.log("SOAPClient.invoke sync will loadWsdl");
			return SOAPClient._loadWsdl(debugMode, url, xog_url, method, headparameters, parameters, filter, async, callback);
		}

		SOAPClient_cacheWsdl = new Array();

		SOAPClient._loadWsdl = function(debugMode, url, xog_url, method, headparameters, parameters, filter, async, callback)
		{
			if(debugMode==2)
				console.log("SOAPClient._loadWsdl");

			var wsdl = SOAPClient_cacheWsdl[url];
			if(wsdl + "" != "" && wsdl + "" != "undefined") {
				if(debugMode==2)
					console.log("SOAPClient._loadWsdl wsdl from cache will sendSoapRequest");
				/*return SOAPClient._sendSoapRequest(debugMode, url, xog_url, method, headparameters, parameters, filter, async, callback, wsdl);*/
				return 0;
			}
			/* get wsdl */
			if(debugMode==2)
				console.log("SOAPClient._loadWsdl will getXmlHttp");
				
			var xmlHttp = SOAPClient._getXmlHttp();
			xmlHttp.open("GET", url + "?wsdl", async);
			xmlHttp.send(null);

			if(debugMode==2) {
				console.log("SOAPClient._loadWsdl sync xmlHttp Status=" + xmlHttp.status);
				console.log("SOAPClient._loadWsdl sync xmlHttp Response=" + xmlHttp.responseText);
			}
			return SOAPClient._onLoadWsdl(debugMode, url, xog_url, method, headparameters, parameters, filter, async, callback, xmlHttp);
		}

		SOAPClient._onLoadWsdl = function(debugMode, url, xog_url, method, headparameters, parameters, filter, async, callback, req)
		{
			if(debugMode==2)
				console.log("SOAPClient._onLoadWsdl");
			var wsdl = req.responseXML;
			if(debugMode==2)
				console.log("SOAPClient._onloadWsdl will sendSoapRequest");

			SOAPClient_cacheWsdl[url] = wsdl;	/* save a copy in cache */
			return SOAPClient._sendSoapRequest(debugMode, url, xog_url, method, headparameters, parameters, filter, async, callback, wsdl);
		}

		SOAPClient._sendSoapRequest = function(debugMode, url, xog_url, method, headparameters, parameters, filter, async, callback, wsdl)
		{
			if(debugMode==2)
				console.log("SOAPClient._sendSoapRequest");
			var ns = (wsdl.documentElement.attributes["targetNamespace"] + "" == "undefined") ? wsdl.documentElement.attributes.getNamedItem("targetNamespace").nodeValue : wsdl.documentElement.attributes["targetNamespace"].value;
			var req_init=String.fromCharCode(60)+'?xml version="1.0" encoding="utf-8"?'+String.fromCharCode(62);
			var req_envelope='<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
			if(method!="Login")	{
				var req_header='<soap:Header><Auth>' + headparameters.toXml() + '</Auth></soap:Header>';
			}
			else {
				var req_header ="";
				var req_header_close="";
			}
			if(method!="Logout") {
				if((method!="Login") && (filter.toXml().length>0))
					var req_body='<soap:Body><' + method + ' xmlns="' + ns + '">' + parameters.toXml() +'<Filter>' + filter.toXml()+'</Filter>'+ '</' + method + '></soap:Body>';
				else
					var req_body='<soap:Body><' + method + ' xmlns="' + ns + '">' + parameters.toXml() + '</' + method + '></soap:Body>';
			}
			else {
				var req_body='<soap:Body><Logout/></soap:Body>';
			}
			var req_envelope_close='</soap:Envelope>';
			var sr = req_init+req_envelope+req_header+req_body+req_envelope_close;
			if(debugMode==2)
				console.log("SOAPClient._sendSoapRequest sr="+sr);
			var xmlHttp = SOAPClient._getXmlHttp();
			xmlHttp.open("POST", xog_url, async);
			var soapaction = ((ns.lastIndexOf("/") != ns.length - 1) ? ns + "/" : ns) + method;
			xmlHttp.setRequestHeader("SOAPAction", soapaction);
			xmlHttp.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
			xmlHttp.send(sr);
			if(debugMode==2) {
				console.log("SOAPClient._sendSoapRequest sync xmlHttp Status=" + xmlHttp.status);
				console.log("SOAPClient._sendSoapRequest sync xmlHttp Response=" + xmlHttp.responseText);
			}
				
			return SOAPClient._onSendSoapRequest(debugMode, method, async, callback, wsdl, xmlHttp);
			
		}

		SOAPClient._onSendSoapRequest = function(debugMode, method, async, callback, wsdl, req) {
			if(debugMode==2)
				console.log("SOAPClient._onSendSoapRequest");
			var o = null;
			if(method=='Login')
				var nd = SOAPClient._getElementsByTagName(req.responseXML, "SessionID");
			else
				if(method=='Query')
					var nd = SOAPClient._getElementsByTagName(req.responseXML, method + "Result");
				else
					var nd = "";

			if(nd.length == 0) {
				if(debugMode==2)
					console.log("SOAPClient._onSendSoapRequest  ND legth Zero");
				if(req.responseXML.getElementsByTagName("faultcode").length > 0)
					throw new Error(500, req.responseXML.getElementsByTagName("faultstring")[0].childNodes[0].nodeValue);
			}
			else {
				if(debugMode==2)
					console.log("SOAPClient._onSendSoapRequest  Method/ND[0]="+method+" "+nd[0]);
				o=SOAPClient._soapresult2objectv2(debugMode, method, req, nd[0],wsdl);
			}

			if(callback) {
				callback(o, req.responseXML);
			}

			if(debugMode==2)
				console.log("SOAPClient._onSendSoapRequest Going Back o="+o);
			
			return o;		
		}

		SOAPClient._getElementsByTagName = function(document, tagName) {
			try	{
				/* trying to get node omitting any namespaces (latest versions of MSXML.XMLDocument) */
				return document.selectNodes('.//*[local-name()="'+ tagName +'"]');
			}
			catch (ex) {}
			/* old XML parser support */
			return document.getElementsByTagName(tagName);
		}

		SOAPClient._soapresult2objectv2 = function(debugMode, method, XMLResponse, node, wsdl) {

			if(method=='Query') {
				return XMLResponse;
			}
			else {
				return SOAPClient._soapresult2object(debugMode, node, wsdl);
			}
		}

		SOAPClient._soapresult2object = function(debugMode, node, wsdl) {
			return SOAPClient._node2object(debugMode, node, wsdl);
		}

		SOAPClient._node2object = function(debugMode, node, wsdl) {
			if(debugMode==2)
				console.log("SOAPClient._node2object  Node="+node+" Type="+node.nodeType+" ChildNodesLeng="+node.childNodes.length);
			if(node == null)
				return null;
			if(node.nodeType == 3 || node.nodeType == 4) {	
				return SOAPClient._extractValue(debugMode, node, wsdl);
			}
			if (node.childNodes.length == 1 && (node.childNodes[0].nodeType == 3 || node.childNodes[0].nodeType == 4)) {
				if(debugMode==2)
					console.log("SOAPClient._node2object Leaf="+ node.childNodes[0]);
				return SOAPClient._node2object(debugMode, node.childNodes[0], wsdl);
			}
			var isarray = SOAPClient._getTypeFromWsdl(debugMode, node.nodeName, wsdl).toLowerCase().indexOf("arrayof") != -1;
			if(!isarray) {
				var obj = null;
				if(node.hasChildNodes())
					obj = new Object();
				for(var i = 0; i < node.childNodes.length; i++)	{
					var p = SOAPClient._node2object(node.childNodes[i], wsdl);
					obj[node.childNodes[i].nodeName] = p;
				}
				return obj;
			}
			else {
				var l = new Array();
				for(var i = 0; i < node.childNodes.length; i++)
					l[l.length] = SOAPClient._node2object(debugMode, node.childNodes[i], wsdl);
				return l;
			}
			return null;
		}

		SOAPClient._extractValue = function(debugMode, node, wsdl) {
			if(debugMode==2) {
				console.log("SOAPClient._extractValue NodeValue="+node.nodeValue);
				console.log("SOAPClient._extractValue NodeParent="+node.parentNode.nodeName);
				console.log("SOAPClient._extractValue getType="+SOAPClient._getTypeFromWsdl(debugMode, node.parentNode.nodeName, wsdl).toLowerCase());
			}
			
			var value = node.nodeValue;
			switch(SOAPClient._getTypeFromWsdl(debugMode, node.parentNode.nodeName, wsdl).toLowerCase()) {
				default:
				case "s:string":			
					return (value != null) ? value + "" : "";
				case "s:boolean":
					return value+"" == "true";
				case "s:int":
				case "s:long":
					return (value != null) ? parseInt(value + "", 10) : 0;
				case "s:double":
					return (value != null) ? parseFloat(value + "") : 0;
				case "s:datetime":
					if(value == null)
						return null;
					else {
						value = value + "";
						value = value.substring(0, value.lastIndexOf("."));
						value = value.replace(/T/gi," ");
						value = value.replace(/-/gi,"/");
						var d = new Date();
						d.setTime(Date.parse(value));										
						return d;				
					}
			}
		}

		SOAPClient._getTypeFromWsdl = function(debugMode, elementname, wsdl) {
			if(debugMode==2)
				console.log("SOAPClient._getTypeFromWsdl ElementName="+elementname);
			var ell = wsdl.getElementsByTagName("s:element");	/* IE */
			
			if(debugMode==2)
				console.log("SOAPClient._getTypeFromWsdl  Ell len="+ell.length);
			if(ell.length == 0)	{
				ell = wsdl.getElementsByTagName("element");	/* MOZ */
				if(debugMode==2)
					console.log("SOAPClient._getTypeFromWsdl ELL="+ell+" ell len="+ell.length);
			}
			for(var i = 0; i < ell.length; i++)	{
				if(ell[i].attributes["name"] + "" == "undefined") {
					if(debugMode==2)
						console.log("SOAPClient._getTypeFromWsdl name="+ell[i].attributes.getNamedItem("name")+" nodevalue="+ell[i].attributes.getNamedItem("name").nodeValue + " type="+ell[i].attributes.getNamedItem("type"));
					if(ell[i].attributes.getNamedItem("name") != null && ell[i].attributes.getNamedItem("name").nodeValue == elementname && ell[i].attributes.getNamedItem("type") != null) 
						return ell[i].attributes.getNamedItem("type").nodeValue;
				}	
				else {
					if(ell[i].attributes["name"] != null && ell[i].attributes["name"].value == elementname && ell[i].attributes["type"] != null)
						return ell[i].attributes["type"].value;
				}
			}
			return "";
		}


		SOAPClient._getXmlHttp = function() {
			try	{
				if(window.XMLHttpRequest) {
					var req = new XMLHttpRequest();
					/* some versions of Moz do not support the readyState property and the onreadystate event so we patch it! */
					if(req.readyState == null) {
						req.readyState = 1;
						req.addEventListener("load", 
											function() {
												req.readyState = 4;
												if(typeof req.onreadystatechange == "function")
													req.onreadystatechange();
											},
											false);
					}
					return req;
				}
				if(window.ActiveXObject) {
					return new ActiveXObject(SOAPClient._getXmlHttpProgID());
				}
			}
			catch (ex) {}
			throw new Error("Your browser does not support XmlHttp objects");
		}

		SOAPClient._getXmlHttpProgID = function() {
			if(SOAPClient._getXmlHttpProgID.progid) {
				return SOAPClient._getXmlHttpProgID.progid;
			}
			var progids = ["Msxml2.XMLHTTP.5.0", "Msxml2.XMLHTTP.4.0", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP", "Microsoft.XMLHTTP"];
			var o;
			for(var i = 0; i < progids.length; i++)	{
				try {
					o = new ActiveXObject(progids[i]);
					return SOAPClient._getXmlHttpProgID.progid = progids[i];
				}
				catch (ex) {};
			}
			throw new Error("Could not find an installed XML parser");
		}

		function ExecuteClarityQueryAsUser(debugMode, ServerName, QueryCode, QueryFilterField, QueryFilterValue, QueryCallback)	{
			if(debugMode>1) console.log("IN: ExecuteClarityQueryAsUser");
			var url = "http://" + ServerName + "/niku/wsdl/Query/" + QueryCode;
			var xog_url = "http://" + ServerName + "/niku/xog";

			/* Get User's SessionID from Cookie */
			UserSessionID=getCookie('sessionId');
			
			if(debugMode==1) {
				console.log("ExecuteClarityQueryAsUser: URL="+url+" XOG_URL="+xog_url);
				console.log("ExecuteClarityQueryAsUser: UserSessionID="+UserSessionID);
			}

			/* Add SessionID and QueryCode to SOAPClientParameters */
			if(debugMode==2) console.log("ExecuteClarityQueryAsUser: SOAPClientParameters");
			var pheader = new SOAPClientParameters();
			var pbody = new SOAPClientParameters();
			var pbodyfilter = new SOAPClientParameters();
			pheader.add("SessionID", UserSessionID);
			pbody.add("Code", QueryCode);
			if (QueryFilterField!="")
				pbodyfilter.add(QueryFilterField, QueryFilterValue);
			
			/* Invokes SOAPClient to Run Query with current User's Session */
			if(debugMode==2) console.log("ExecuteClarityQueryAsUser: SOAPClient.invoke");
			Result=SOAPClient.invoke(debugMode, url, xog_url, "Query", pheader, pbody, pbodyfilter, false, QueryCallback);

			if(debugMode==2) console.log("ExecuteClarityQueryAsUser Response="+Result.responseText);
			if(debugMode>1) console.log("OUT: ExecuteClarityQueryAsUser");
			return Result;
		}

		function SOAPClientParameters() {
			var _pl = new Array();
			this.add = function(name, value) {
				_pl[name] = value; 
				return this; 
			}
			this.toXml = function() {
				var xml = "";
				for(var p in _pl) {
					if(typeof(_pl[p]) != "function")
						xml += "<" + p + ">" + _pl[p].toString().replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">") + "</" + p + ">";
				}
				return xml;	
			}
		}

		function crossBrowserXMLLoad(text) {
			var xmlDoc;
			try {
				xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
				xmlDoc.async="false";
				xmlDoc.loadXML(text);
			}    
			catch(e) {
				try {
					parser=new DOMParser();
					xmlDoc=parser.parseFromString(text,"text/xml");
				}
				catch(e) {
					alert(e.message);
				}
			}
			return xmlDoc;
		}
