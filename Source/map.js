<html>
<body>
<script type="text/javascript"> 
function crossBrowserXMLLoad(text) 
{
      var xmlDoc;
      try //Internet Explorer
      {
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

function getCookie(c_name)
{
if (document.cookie.length>0)
  {
  c_start=document.cookie.indexOf(c_name + "=");
  if (c_start!=-1)
    { 
    c_start=c_start + c_name.length+1; 
    c_end=document.cookie.indexOf(";",c_start);
    if (c_end==-1) c_end=document.cookie.length;
    return unescape(document.cookie.substring(c_start,c_end));
    } 
  }
return "";
}

function ExecuteClarityQueryAsAdmin(debugMode, ServerName, QueryCode, QueryFilterField, QueryFilterValue, Username, Password, QueryCallback)
{
	var LoginCallback="";
	var LogoutCallback="";
	var url = "http://" + ServerName + "/niku/wsdl/Query/" + QueryCode;
	var xog_url = "http://" + ServerName + "/niku/xog";

	if(debugMode==4)
		window.alert("ExecuteClarityQueryAsAdmin");

	if(debugMode==4)
	{
		window.alert("ExecuteClarityQueryAsAdmin// URL="+url+" XOG_URL="+xog_url);
		window.alert("ExecuteClarityQueryAsAdmin// Username="+Username+" Password="+Password);
	}
	
	// Add admin's Username and Password to SOAPClientParameters
	var pheader = new SOAPClientParameters();
	var pbody = new SOAPClientParameters();
	var pbodyfilter = new SOAPClientParameters();
	pbody.add("Username", Username);
	pbody.add("Password", Password);
	
	// Invoke SOAPClient to Login as the admin 
	if(debugMode==4)
		window.alert("ExecuteClarityQueryAsAdmin before invoke");
	var SessionID=SOAPClient.invoke(debugMode, url, xog_url, "Login", pheader, pbody, pbodyfilter, false, LoginCallback);
	
	if(debugMode==4)
		window.alert("SessionID="+Session.SessionID);

	// Add SessionID and QueryCode to SOAPClientParameters
	var pheader2 = new SOAPClientParameters();
	var pbody2 = new SOAPClientParameters();
	var pbodyfilter2 = new SOAPClientParameters();
	pheader2.add("SessionID", SessionID);
	pbody2.add("Code", QueryCode);
	if (QueryFilterField!="")
		pbodyfilter2.add(QueryFilterField, QueryFilterValue);

	// Invokes SOAPClient to Run Query with admin's Session
	var Result=SOAPClient.invoke(debugMode, url, xog_url, "Query", pheader2, pbody2, pbodyfilter2, false, QueryCallback);

	// Add SessionID to SOAPClientParameters
	var pheader3 = new SOAPClientParameters();
	var pbody3 = new SOAPClientParameters();
	var pbodyfilter3 = new SOAPClientParameters();
	pheader3.add("SessionID", SessionID);
	// Invokes SOAPClient to Logout from admin's Session
	SOAPClient.invoke(debugMode, url, xog_url, "Logout", pheader3, pbody3, pbodyfilter3, false, LogoutCallback);

	return Result;
}

function ExecuteClarityQueryAsUser(debugMode, ServerName, QueryCode, QueryFilterField, QueryFilterValue, QueryCallback)
{
	if(debugMode==4)
		window.alert("ExecuteClarityQueryAsUser");
	var url = "http://" + ServerName + "/niku/wsdl/Query/" + QueryCode;
	var xog_url = "http://" + ServerName + "/niku/xog";

	// Get User's SessionID from Cookie
	UserSessionID=getCookie('sessionId');
	//New after v12.1 Clarity adds "" to session id...
	UserSessionID=UserSessionID.substring(1, UserSessionID.length-1)
	
	if(debugMode==4) {
		window.alert("ExecuteClarityQueryAsUser// URL="+url+" XOG_URL="+xog_url);
		window.alert("ExecuteClarityQueryAsUser// UserSessionID="+UserSessionID);
	}

	// Add SessionID and QueryCode to SOAPClientParameters
	var pheader = new SOAPClientParameters();
	var pbody = new SOAPClientParameters();
	var pbodyfilter = new SOAPClientParameters();
	pheader.add("SessionID", UserSessionID);
	pbody.add("Code", QueryCode);
	if (QueryFilterField!="")
		pbodyfilter.add(QueryFilterField, QueryFilterValue);
	
	// Invokes SOAPClient to Run Query with current User's Session
	if(debugMode==4)
		window.alert("ExecuteClarityQueryAsUser Going to Invoke");
	var Result=SOAPClient.invoke(debugMode, url, xog_url, "Query", pheader, pbody, pbodyfilter, false, QueryCallback);

	if(debugMode==4)
		window.alert("ExecuteClarityQueryAsUser Response="+Result.responseText);
	return Result;
}

function SOAPClientParameters()
{
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

function SOAPClient() {}

SOAPClient.invoke = function(debugMode, url, xog_url, method, headparameters, parameters, filter, async, callback)
{
	if(debugMode==4) 
		window.alert("SOAPClient.invoke");
	if(async) {
		if(debugMode==4)
			window.alert("SOAPClient.invoke async will loadWsdl");
		SOAPClient._loadWsdl(debugMode, url, xog_url, method, headparameters, parameters, filter, async, callback);
	}
	else {
		if(debugMode==4)
			window.alert("SOAPClient.invoke sync will loadWsdl");
			return SOAPClient._loadWsdl(debugMode, url, xog_url, method, headparameters, parameters, filter, async, callback);
	}
}

// private: wsdl cache
SOAPClient_cacheWsdl = new Array();

// private: invoke async
SOAPClient._loadWsdl = function(debugMode, url, xog_url, method, headparameters, parameters, filter, async, callback)
{
	if(debugMode==4)
		window.alert("SOAPClient._loadWsdl");
	// load from cache?
	var wsdl = SOAPClient_cacheWsdl[url];
	if(wsdl + "" != "" && wsdl + "" != "undefined") {
		if(debugMode==4)
			window.alert("SOAPClient._loadWsdl wsdl from cache will sendSoapRequest");
		return SOAPClient._sendSoapRequest(debugMode, url, xog_url, method, headparameters, parameters, filter, async, callback, wsdl);
	}
	// get wsdl
	if(debugMode==4)
		window.alert("SOAPClient._loadWsdl will getXmlHttp");
		
	var xmlHttp = SOAPClient._getXmlHttp();
	xmlHttp.open("GET", url + "?wsdl", async);
	//xmlHttp.open("GET", url, async);
	if(debugMode==4)
		window.alert("SOAPClient._loadWsdl will check async="+async);

	if(async) {
		if(debugMode==4)
			window.alert("SOAPClient._loadWsdl is async");
		xmlHttp.onreadystatechange = function() {
			if(xmlHttp.readyState == 4) {
					if(debugMode==4) {
						window.alert("SOAPClient._loadWsdl async xmlHttp Status=" + xmlHttp.status);
						window.alert("SOAPClient._loadWsdl async xmlHttp Response=" + xmlHttp.responseText);
					}
				SOAPClient._onLoadWsdl(debugMode, url, xog_url, method, headparameters, parameters, filter, async, callback, xmlHttp);
			}
		}
	}
	xmlHttp.send(null);
	if(debugMode==4)
		window.alert("SOAPClient._loadWsdl will check again async="+async);
	if (!async)	{
		if(debugMode==4) {
			window.alert("SOAPClient._loadWsdl sync xmlHttp Status=" + xmlHttp.status);
			window.alert("SOAPClient._loadWsdl sync xmlHttp Response=" + xmlHttp.responseText);
		}
		return SOAPClient._onLoadWsdl(debugMode, url, xog_url, method, headparameters, parameters, filter, async, callback, xmlHttp);
	}
}

SOAPClient._onLoadWsdl = function(debugMode, url, xog_url, method, headparameters, parameters, filter, async, callback, req)
{
	if(debugMode==4)
		window.alert("SOAPClient._onLoadWsdl");
	var wsdl = req.responseXML;
	if(debugMode==4)
		window.alert("SOAPClient._onloadWsdl will sendSoapRequest");

	SOAPClient_cacheWsdl[url] = wsdl;	// save a copy in cache
	return SOAPClient._sendSoapRequest(debugMode, url, xog_url, method, headparameters, parameters, filter, async, callback, wsdl);
}

SOAPClient._sendSoapRequest = function(debugMode, url, xog_url, method, headparameters, parameters, filter, async, callback, wsdl)
{
	if(debugMode==4)
		window.alert("SOAPClient._sendSoapRequest");

	// get namespace
	
	var ns = (wsdl.documentElement.attributes["targetNamespace"] + "" == "undefined") ? wsdl.documentElement.attributes.getNamedItem("targetNamespace").nodeValue : wsdl.documentElement.attributes["targetNamespace"].value;
	
	// build SOAP request
	//var sr = 
	var req_init=String.fromCharCode(60)+"?xml version="1.0" encoding="utf-8"?"+String.fromCharCode(62);
						
	var req_envelope="<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">";
	if(method!="Login")	{
		var req_header="<soap:Header><Auth>" + headparameters.toXml() + "</Auth></soap:Header>";
	}
	else {
		var req_header ="";
		var req_header_close="";
	}
	if(method!="Logout") {
		//window.alert("method="+method+"filter.toXml()="+filter.toXml());
		if((method!="Login") && (filter.toXml().length>0))
			var req_body="<soap:Body><" + method + " xmlns="" + ns + "">" + parameters.toXml() +"<Filter>" + filter.toXml()+"</Filter>"+ "</" + method + "></soap:Body>";
		else
			var req_body="<soap:Body><" + method + " xmlns="" + ns + "">" + parameters.toXml() + "</" + method + "></soap:Body>";
	}
	else {
		var req_body="<soap:Body><Logout/></soap:Body>";
	}
	var req_envelope_close="</soap:Envelope>";
	var sr = req_init+req_envelope+req_header+req_body+req_envelope_close;
	if(debugMode==4)
		window.alert("SOAPClient._sendSoapRequest sr="+sr);
	var xmlHttp = SOAPClient._getXmlHttp();
	xmlHttp.open("POST", xog_url, async);
	var soapaction = ((ns.lastIndexOf("/") != ns.length - 1) ? ns + "/" : ns) + method;
	xmlHttp.setRequestHeader("SOAPAction", soapaction);
	xmlHttp.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
	if(async) {
		xmlHttp.onreadystatechange = function() {
			if(xmlHttp.readyState == 4)	{
				if(debugMode==4) {
					window.alert("OAPClient._sendSoapRequest async xmlHttp Status=" + xmlHttp.status);
					window.alert("OAPClient._sendSoapRequest async xmlHttp Response=" + xmlHttp.responseText);
				}
				SOAPClient._onSendSoapRequest(debugMode, method, async, callback, wsdl, xmlHttp);
			}
		}
	}
	xmlHttp.send(sr);
	if (!async)	{
		if(debugMode==4) {
			window.alert("OAPClient._sendSoapRequest sync xmlHttp Status=" + xmlHttp.status);
			window.alert("OAPClient._sendSoapRequest sync xmlHttp Response=" + xmlHttp.responseText);
		}
		return SOAPClient._onSendSoapRequest(debugMode, method, async, callback, wsdl, xmlHttp);
	}
}
SOAPClient._onSendSoapRequest = function(debugMode, method, async, callback, wsdl, req) {
	if(debugMode==4)
		window.alert("SOAPClient._onSendSoapRequest");
	var o = null;
	if(method=='Login')
		var nd = SOAPClient._getElementsByTagName(req.responseXML, "SessionID");
	else
		if(method=='Query')
			var nd = SOAPClient._getElementsByTagName(req.responseXML, method + "Result");
		else
			var nd = "";

	if(nd.length == 0) {
		if(debugMode==4)
			window.alert("SOAPClient._onSendSoapRequest  ND legth Zero");
		if(req.responseXML.getElementsByTagName("faultcode").length > 0)
			throw new Error(500, req.responseXML.getElementsByTagName("faultstring")[0].childNodes[0].nodeValue);
	}
	else {
		if(debugMode==4)
			window.alert("SOAPClient._onSendSoapRequest  Method/ND[0]="+method+" "+nd[0]);
		o=SOAPClient._soapresult2objectv2(debugMode, method, req, nd[0],wsdl);
	}

	if(callback) {
		callback(o, req.responseXML);
	}

	if(debugMode==4)
		window.alert("SOAPClient._onSendSoapRequest Going Back o="+o);
	
	if(!async)
		return o;		
		//req.responseXML;
}

// private: utils
SOAPClient._getElementsByTagName = function(document, tagName) {
	try	{
		// trying to get node omitting any namespaces (latest versions of MSXML.XMLDocument)
		return document.selectNodes(".//*[local-name()=""+ tagName +""]");
	}
	catch (ex) {}
	// old XML parser support
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
	if(debugMode==4)
		window.alert("SOAPClient._node2object  Node="+node+" Type="+node.nodeType+" ChildNodesLeng="+node.childNodes.length);
	// null node
	if(node == null)
		return null;
	// text node
	if(node.nodeType == 3 || node.nodeType == 4) {	
		return SOAPClient._extractValue(debugMode, node, wsdl);
	}
	// leaf node
	if (node.childNodes.length == 1 && (node.childNodes[0].nodeType == 3 || node.childNodes[0].nodeType == 4)) {
		if(debugMode==4)
			window.alert("SOAPClient._node2object Leaf="+ node.childNodes[0]);
		return SOAPClient._node2object(debugMode, node.childNodes[0], wsdl);
	}
	var isarray = SOAPClient._getTypeFromWsdl(debugMode, node.nodeName, wsdl).toLowerCase().indexOf("arrayof") != -1;
	// object node
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
	// list node
	else {
		// create node ref
		var l = new Array();
		for(var i = 0; i < node.childNodes.length; i++)
			l[l.length] = SOAPClient._node2object(debugMode, node.childNodes[i], wsdl);
		return l;
	}
	return null;
}

SOAPClient._extractValue = function(debugMode, node, wsdl) {
	if(debugMode==4) {
		window.alert("SOAPClient._extractValue NodeValue="+node.nodeValue);
		window.alert("SOAPClient._extractValue NodeParent="+node.parentNode.nodeName);
		window.alert("SOAPClient._extractValue getType="+SOAPClient._getTypeFromWsdl(debugMode, node.parentNode.nodeName, wsdl).toLowerCase());
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
	if(debugMode==4)
		window.alert("SOAPClient._getTypeFromWsdl ElementName="+elementname);
	var ell = wsdl.getElementsByTagName("s:element");	// IE
	//var ell = SOAPClient._getElementsByTagName(wsdl, "element");	// IE
	
	if(debugMode==4)
		window.alert("SOAPClient._getTypeFromWsdl  Ell len="+ell.length);
	if(ell.length == 0)	{
		ell = wsdl.getElementsByTagName("element");	// MOZ
		if(debugMode==4)
			window.alert("SOAPClient._getTypeFromWsdl ELL="+ell+" ell len="+ell.length);
	}
	for(var i = 0; i < ell.length; i++)	{
		if(ell[i].attributes["name"] + "" == "undefined") {
			if(debugMode==4)
				window.alert("SOAPClient._getTypeFromWsdl name="+ell[i].attributes.getNamedItem("name")+" nodevalue="+ell[i].attributes.getNamedItem("name").nodeValue + " type="+ell[i].attributes.getNamedItem("type"));
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

// private: xmlhttp factory
SOAPClient._getXmlHttp = function() {
	try	{
		if(window.XMLHttpRequest) {
			var req = new XMLHttpRequest();
			// some versions of Moz do not support the readyState property and the onreadystate event so we patch it!
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

</script>

<script type="text/javascript">

function canvasInit()
{
	/* 
	   debugMode=1 -> map_init outside of loop
	   debugMode=2 -> map_init inside of loop, limited info
	   debugMode=3 -> map_init inside of loop, all info
	   debugMode=4 -> debug Query function
	   debugMode=5 -> Marker
	*/
	
	var debugMode=0;
	var info="Starting a new String";
	var geostep=0;
	var locationbreak="";
			
	// Define Data source from Clarity, defined by a Studio Query ID 
	var QueryCode="strat_map_wsdl";
	
	//Obtain Server name from URL
	var url = window.document.URL;
	var ServerName = url.substring(7,url.indexOf("niku/")-1);
	
	//Create Query Filter from URL
	var QueryFilterField = "";
	var QueryFilterValue = "";

	//Query Callback is not being used
	var QueryCallback="";
	
	//Execute the query using the logged user's sessionId
	if(debugMode==1)
		window.alert("canvasInit Query Parameters --Server Name: "+ServerName+"--Query Code: "+QueryCode+"--Filter Field: "+QueryFilterField+"--Filter Value: "+QueryFilterValue+"--Call Back: "+QueryCallback);
	
	var Result=ExecuteClarityQueryAsUser(debugMode, ServerName, QueryCode, QueryFilterField, QueryFilterValue, QueryCallback);
	//var Result=ExecuteClarityQueryAsAdmin(debugMode, ServerName, QueryCode, QueryFilterField, QueryFilterValue, "admin", "iluvca", QueryCallback);
	
	if(debugMode==1)
		window.alert("canvasInit Back from Query:"+Result.responseText);

	// Creates the XML object with the TextResponse from the Query
	var xmlobject = crossBrowserXMLLoad(Result.responseText);
	
	// Searching for the instances of "Record" element
	var items = xmlobject.getElementsByTagName("Record");
	
	totalitems = items.length;

	if(debugMode==1)
		window.alert("canvasInit Total Items="+totalitems);
	
	var c=document.getElementById("myCanvas");
	var ctx=c.getContext("2d");
	var img = document.getElementById("strategicmap");
	ctx.drawImage(img, 10, 10);
	ctx.beginPath();

	//For every record, read data and add a point to the map
	for (var i = 0 ; i < totalitems ; i++) 
	{
		var item = items[i];
		var intlid 		 	  	= item.getElementsByTagName("intlid")[0].firstChild.nodeValue;
		var itemcode  	 	  	= item.getElementsByTagName("itemcode")[0].firstChild.nodeValue;
		var itemname	 	  	= item.getElementsByTagName("itemname")[0].firstChild.nodeValue;
		var itemstatus	 	  	= item.getElementsByTagName("itemstatus")[0].firstChild.nodeValue;
		var itempercent  	  	= item.getElementsByTagName("itempercent")[0].firstChild.nodeValue;
		var itemxmap 		  	= item.getElementsByTagName("itemxmap")[0].firstChild.nodeValue;
		var itemymap	 	  	= item.getElementsByTagName("itemymap")[0].firstChild.nodeValue;

		// Formats a "HTML Info" to be shown when the marker is clicked on
		if((debugMode==2) or ()debugMode==3))
			window.alert("canvasInit Before GenerateInfo itemcode="+itemcode+" intlid="+intlid+" itemname="+itemname+" itemstatus="+itemstatus+" itempercent="+itempercent+" itemxmap="+itemxmap+" itemymap="+itemymap);
		
		// Define the fill and font colors based on the "itemstatus" var
		switch(itemstatus) {
			case 1:
				fillcolor="black";
				fontcolor="white";
				break;
			case 2:
				fillcolor="red";
				fontcolor="white";
				break;
			case 3:
				fillcolor="yellow";
				fontcolor="black";
				break;
			case 4:
				fillcolor="green";
				fontcolor="white";
				break;
			case 5:
				fillcolor="green";
				fontcolor="white";
				break;
			case 6:
				fillcolor="blue";
				fontcolor="white";
				break;
			default:
				fillcolor="white";
				fontcolor="black";
		}

		if((debugMode==2) or ()debugMode==3))
			window.alert("canvasInit will draw circle");
		
		ctx.fillStyle=fillcolor
		ctx.arc(itemxmap,itemymap,15,0,2*Math.PI);
		ctx.stroke();
		ctx.fill()

		if((debugMode==2) or ()debugMode==3))
			window.alert("canvasInit has drawn circle");

	}

		
}
</script>
  <img id="strategicmap" width="0" height="0" src="strategicmap.jpg" alt="Strategic Map">
  <canvas id="myCanvas" width="1000" height="600" style="border:0px solid #d3d3d3;">
Your browser does not support the HTML5 canvas tag.
  </canvas>
  <script language="javascript">
      window.alert("teste_outside");
      window.onload=canvasInit()
  </script>
  </body>
</html>