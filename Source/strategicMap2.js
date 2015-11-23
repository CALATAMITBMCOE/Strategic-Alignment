<html>
	<head>
		<script language="javascript">
		function SOAPClient() {}

		SOAPClient.invoke = function(debugMode, url, xog_url, method, headparameters, parameters, filter, async, callback)
		{
			if(debugMode==2) 
				window.alert("SOAPClient.invoke");
			if(debugMode==2)
					window.alert("SOAPClient.invoke sync will loadWsdl");
			return SOAPClient._loadWsdl(debugMode, url, xog_url, method, headparameters, parameters, filter, async, callback);
		}

		SOAPClient_cacheWsdl = new Array();

		SOAPClient._loadWsdl = function(debugMode, url, xog_url, method, headparameters, parameters, filter, async, callback)
		{
			if(debugMode==2)
				window.alert("SOAPClient._loadWsdl");

			var wsdl = SOAPClient_cacheWsdl[url];
			if(wsdl + "" != "" && wsdl + "" != "undefined") {
				if(debugMode==2)
					window.alert("SOAPClient._loadWsdl wsdl from cache will sendSoapRequest");
				/*return SOAPClient._sendSoapRequest(debugMode, url, xog_url, method, headparameters, parameters, filter, async, callback, wsdl);*/
				return 0;
			}
			/* get wsdl */
			if(debugMode==2)
				window.alert("SOAPClient._loadWsdl will getXmlHttp");
				
			var xmlHttp = SOAPClient._getXmlHttp();
			xmlHttp.open("GET", url + "?wsdl", async);
			xmlHttp.send(null);

			if(debugMode==2) {
				window.alert("SOAPClient._loadWsdl sync xmlHttp Status=" + xmlHttp.status);
				window.alert("SOAPClient._loadWsdl sync xmlHttp Response=" + xmlHttp.responseText);
			}
			return SOAPClient._onLoadWsdl(debugMode, url, xog_url, method, headparameters, parameters, filter, async, callback, xmlHttp);
		}

		SOAPClient._onLoadWsdl = function(debugMode, url, xog_url, method, headparameters, parameters, filter, async, callback, req)
		{
			if(debugMode==2)
				window.alert("SOAPClient._onLoadWsdl");
			var wsdl = req.responseXML;
			if(debugMode==2)
				window.alert("SOAPClient._onloadWsdl will sendSoapRequest");

			SOAPClient_cacheWsdl[url] = wsdl;	/* save a copy in cache */
			return SOAPClient._sendSoapRequest(debugMode, url, xog_url, method, headparameters, parameters, filter, async, callback, wsdl);
		}

		SOAPClient._sendSoapRequest = function(debugMode, url, xog_url, method, headparameters, parameters, filter, async, callback, wsdl)
		{
			if(debugMode==2)
				window.alert("SOAPClient._sendSoapRequest");
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
				window.alert("SOAPClient._sendSoapRequest sr="+sr);
			var xmlHttp = SOAPClient._getXmlHttp();
			xmlHttp.open("POST", xog_url, async);
			var soapaction = ((ns.lastIndexOf("/") != ns.length - 1) ? ns + "/" : ns) + method;
			xmlHttp.setRequestHeader("SOAPAction", soapaction);
			xmlHttp.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
			xmlHttp.send(sr);
			if(debugMode==2) {
				window.alert("SOAPClient._sendSoapRequest sync xmlHttp Status=" + xmlHttp.status);
				window.alert("SOAPClient._sendSoapRequest sync xmlHttp Response=" + xmlHttp.responseText);
			}
				
			return SOAPClient._onSendSoapRequest(debugMode, method, async, callback, wsdl, xmlHttp);
			
		}

		SOAPClient._onSendSoapRequest = function(debugMode, method, async, callback, wsdl, req) {
			if(debugMode==2)
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
				if(debugMode==2)
					window.alert("SOAPClient._onSendSoapRequest  ND legth Zero");
				if(req.responseXML.getElementsByTagName("faultcode").length > 0)
					throw new Error(500, req.responseXML.getElementsByTagName("faultstring")[0].childNodes[0].nodeValue);
			}
			else {
				if(debugMode==2)
					window.alert("SOAPClient._onSendSoapRequest  Method/ND[0]="+method+" "+nd[0]);
				o=SOAPClient._soapresult2objectv2(debugMode, method, req, nd[0],wsdl);
			}

			if(callback) {
				callback(o, req.responseXML);
			}

			if(debugMode==2)
				window.alert("SOAPClient._onSendSoapRequest Going Back o="+o);
			
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
				window.alert("SOAPClient._node2object  Node="+node+" Type="+node.nodeType+" ChildNodesLeng="+node.childNodes.length);
			if(node == null)
				return null;
			if(node.nodeType == 3 || node.nodeType == 4) {	
				return SOAPClient._extractValue(debugMode, node, wsdl);
			}
			if (node.childNodes.length == 1 && (node.childNodes[0].nodeType == 3 || node.childNodes[0].nodeType == 4)) {
				if(debugMode==2)
					window.alert("SOAPClient._node2object Leaf="+ node.childNodes[0]);
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
			if(debugMode==2)
				window.alert("SOAPClient._getTypeFromWsdl ElementName="+elementname);
			var ell = wsdl.getElementsByTagName("s:element");	/* IE */
			
			if(debugMode==2)
				window.alert("SOAPClient._getTypeFromWsdl  Ell len="+ell.length);
			if(ell.length == 0)	{
				ell = wsdl.getElementsByTagName("element");	/* MOZ */
				if(debugMode==2)
					window.alert("SOAPClient._getTypeFromWsdl ELL="+ell+" ell len="+ell.length);
			}
			for(var i = 0; i < ell.length; i++)	{
				if(ell[i].attributes["name"] + "" == "undefined") {
					if(debugMode==2)
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
			if(debugMode==1)
				window.alert("ExecuteClarityQueryAsUser");
			var url = "http://" + ServerName + "/niku/wsdl/Query/" + QueryCode;
			var xog_url = "http://" + ServerName + "/niku/xog";

			/* Get User's SessionID from Cookie */
			UserSessionID=getCookie('sessionId');
			
			if(debugMode==1) {
				window.alert("ExecuteClarityQueryAsUser// URL="+url+" XOG_URL="+xog_url);
				window.alert("ExecuteClarityQueryAsUser// UserSessionID="+UserSessionID);
			}

			/* Add SessionID and QueryCode to SOAPClientParameters */
			var pheader = new SOAPClientParameters();
			var pbody = new SOAPClientParameters();
			var pbodyfilter = new SOAPClientParameters();
			pheader.add("SessionID", UserSessionID);
			pbody.add("Code", QueryCode);
			if (QueryFilterField!="")
				pbodyfilter.add(QueryFilterField, QueryFilterValue);
			
			/* Invokes SOAPClient to Run Query with current User's Session */
			if(debugMode==2)
				window.alert("ExecuteClarityQueryAsUser Going to Invoke");
			Result=SOAPClient.invoke(debugMode, url, xog_url, "Query", pheader, pbody, pbodyfilter, false, QueryCallback);

			if(debugMode==2)
				window.alert("ExecuteClarityQueryAsUser Response="+Result.responseText);
			return Result;
		}

		function ExecuteClarityDDQueryAsUser(debugMode, ServerName, QueryCode, QueryFilterField, QueryFilterValue, ddQueryFilterField1, ddQueryFilterValue1, ddQueryFilterField2, ddQueryFilterValue2, ddQueryFilterField3, ddQueryFilterValue3, ddQueryFilterField4, ddQueryFilterValue4, QueryCallback)	{
			if(debugMode==1)
				window.alert("ExecuteClarityQueryAsUser");
			var url = "http://" + ServerName + "/niku/wsdl/Query/" + QueryCode;
			var xog_url = "http://" + ServerName + "/niku/xog";

			/* Get User's SessionID from Cookie */
			UserSessionID=getCookie('sessionId');
			
			if(debugMode==1) {
				window.alert("ExecuteClarityQueryAsUser// URL="+url+" XOG_URL="+xog_url);
				window.alert("ExecuteClarityQueryAsUser// UserSessionID="+UserSessionID);
			}

			/* Add SessionID and QueryCode to SOAPClientParameters */
			var pheader = new SOAPClientParameters();
			var pbody = new SOAPClientParameters();
			var pbodyfilter = new SOAPClientParameters();
			pheader.add("SessionID", UserSessionID);
			pbody.add("Code", QueryCode);
			if (QueryFilterField!="")
				pbodyfilter.add(QueryFilterField, QueryFilterValue);
			if (ddQueryFilterField1!="")
				pbodyfilter.add(ddQueryFilterField1, ddQueryFilterValue1);
			if (ddQueryFilterField2!="")
				pbodyfilter.add(ddQueryFilterField2, ddQueryFilterValue2);
			if (ddQueryFilterField3!="")
				pbodyfilter.add(ddQueryFilterField3, ddQueryFilterValue3);
			if (ddQueryFilterField4!="")
				pbodyfilter.add(ddQueryFilterField4, ddQueryFilterValue4);
			
			/* Invokes SOAPClient to Run Query with current User's Session */
			if(debugMode==2)
				window.alert("ExecuteClarityQueryAsUser Going to Invoke");
			var Result=SOAPClient.invoke(debugMode, url, xog_url, "Query", pheader, pbody, pbodyfilter, false, QueryCallback);

			if(debugMode==2)
				window.alert("ExecuteClarityQueryAsUser Response="+Result.responseText);
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
		
		function eventFire(el, etype){
			if (el.fireEvent) {
				el.fireEvent('on' + etype);
			} else {
				var evObj = document.createEvent('Events');
				evObj.initEvent(etype, true, false);
				el.dispatchEvent(evObj);
			}
		}
		function setCursorByID(id,cursorStyle) {
			var elem;
			if (document.getElementById &&
				(elem=document.getElementById(id)) ) {
				if (elem.style) elem.style.cursor=cursorStyle;
			}
		}		
		function defineColors( debugMode, status, statusColor) {
			switch(status) {
				case '1':
					fillcolor="black";
					fontcolor="white";
					break;
				case '2':
					fillcolor="red";
					fontcolor="white";
					break;
				case '3':
					fillcolor="yellow";
					fontcolor="black";
					break;
				case '4':
					fillcolor="green";
					fontcolor="white";
					break;
				case '5':
					fillcolor="green";
					fontcolor="white";
					break;
				case '6':
					fillcolor="blue";
					fontcolor="white";
					break;
				default:
					fillcolor="white";
					fontcolor="black";
			}
			statusColor.fill = fillcolor;
			statusColor.font = fontcolor;
			return false;
		}
		
		</script>
	</head>
	<body>
		<table border="0" cellspacing="1" cellpadding="0" class="tableGridList" width="100%">
			<tr width="100%" height="36px">
				<th>
					<a href="JavaScript:print()">
						<img id="print" src="data:image/png;base64,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" alt="Print" width="20" height="20" align="right">
					</a>
				</th>
			</tr>
			<tr height="660px">
				<td align="left">
					<div style="width:100%; height:100%">				
						<canvas id="myCanvas" width="1000" height="660" style="border:0px solid #d3d3d3;">
							Your browser does not support the HTML5 canvas tag.
						</canvas>
					<div>			
				  </td>
			</tr>
		</table>	

		
		<script language="javascript">

			/* 	debugMode=1 -> Init
				debugMode=2 -> SoapClient
				debugMode=3 -> L1 Query Result 
				debugMode=4 -> L2 Query Result
				debugMode=5 -> L3 Query Result 
				debugMode=6 -> DD Query Result */
			
			var debugMode=0;
			
			/* Fetching ServerName and Item ID */
			var vModal=0;
			var url = window.document.URL;
			
			var vDialogs = document.getElementsByClassName("ppm_dialog");
			if (vDialogs.length > 0) vModal=1;
			
			if (vModal==1) {
				/* Popup */
				var innerUrl = document.getElementById('ppm_mnp').innerHTML; /* This is the Div that contains the Modal page */
				idLocation = innerUrl.indexOf('instance_id')+12;
				var end = idLocation + 7;
				var internalID = innerUrl.substring(idLocation,end);
			}
			else
			{
				/* Not a Popup */
				var idLocation = url.indexOf('id=')+3;
				var end = idLocation + 7;
				var internalID = url.substring(idLocation, end);
			}
			var ServerName = url.substring(7,url.indexOf("niku/")-1);
			if(debugMode==1) window.alert("URL: "+url);
			
			/* Query Setup */
			var Item = internalID;
			if(debugMode==1) window.alert("CurrentItem: "+Item)

			var QueryFilterField = "currentid";
			var QueryFilterValue = Item;
			var QueryCallback="";
				
			/* Execute Query for Level 1
				use this statement to test running the query as admin (remember to set the password accordingly)
				var Result=ExecuteClarityQueryAsAdmin(debugMode, ServerName, QueryCode, QueryFilterField, QueryFilterValue, "admin", "iluvca", QueryCallback);
			*/
				
			var QueryCode="strat_map_wsdl";
			if(debugMode==3) window.alert("Query L1 Parameters --Server Name: "+ServerName+"--Query Code: "+QueryCode+"--Filter Field: "+QueryFilterField+"--Filter Value: "+QueryFilterValue+"--Call Back: "+QueryCallback);

			var Result=ExecuteClarityQueryAsUser(debugMode, ServerName, QueryCode, QueryFilterField, QueryFilterValue, QueryCallback);
			
			if(debugMode==3) window.alert("Back from Query L1:"+Result.responseText);

			/* Parse Query Results */
			var xmlobject = crossBrowserXMLLoad(Result.responseText);
			var items = xmlobject.getElementsByTagName("Record");
			var item = items[0];
			var intlid 		 	  	= item.getElementsByTagName("intlid")[0].firstChild.nodeValue;
			var itemcode  	 	  	= item.getElementsByTagName("itemcode")[0].firstChild.nodeValue;
			var itemname	 	  	= item.getElementsByTagName("itemname")[0].firstChild.nodeValue;
			var itemstatus	 	  	= item.getElementsByTagName("itemstatus")[0].firstChild.nodeValue;
			var itempercent  	  	= item.getElementsByTagName("itempercent")[0].firstChild.nodeValue;
			var itemurlmap 		  	= item.getElementsByTagName("mapurl")[0].firstChild.nodeValue;
			var itemxmap 		  	= item.getElementsByTagName("itemxmap")[0].firstChild.nodeValue;
			var itemymap	 	  	= item.getElementsByTagName("itemymap")[0].firstChild.nodeValue;

			if(debugMode==3) window.alert("Query L1 itemcode="+itemcode+" intlid="+intlid+" itemname="+itemname+" itemstatus="+itemstatus+" itempercent="+itempercent+" itemurlmap="+itemurlmap+" itemxmap="+itemxmap+" itemymap="+itemymap);
			var statusColor = {fill: "default", font:"default" };
			if(debugMode==3) window.alert("Will Define Color for itemstatus="+itemstatus+" fill="+statusColor.fill+" font="+statusColor.font);
			var dummyVar = defineColors(debugMode, itemstatus, statusColor);
			if(debugMode==3) window.alert("Colors Defined for itemstatus="+itemstatus+" fill="+statusColor.fill+" font="+statusColor.font);
			
			/* Draw Image */
			var c=document.getElementById("myCanvas");
			c.addEventListener("click", function(event) {
				QueryCode="strat_map_wsdl_dd";
					
				/* Get Canvas Position relative to Page */
				var rect = c.getBoundingClientRect();
				var offsetX = Math.trunc(rect.left);
				var offsetY = Math.trunc(rect.top);

				/* Calculates min(x,y) and max(x,y) area for drilldown */
				var ddQueryFilterField1 = "itemxmap_from";
				var ddQueryFilterField2 = "itemxmap_to";
				var ddQueryFilterField3 = "itemymap_from";
				var ddQueryFilterField4 = "itemymap_to";
				var ddQueryFilterValue1=event.pageX- offsetX - 16;
				var ddQueryFilterValue2=event.pageX- offsetX + 16;
				var ddQueryFilterValue3=event.pageY- offsetY - 16;
				var ddQueryFilterValue4=event.pageY- offsetY + 16;
				
				/* Run DrillDown Query */
				if(debugMode==6) window.alert("Query DD Parameters --Server Name: "+ServerName+"--Query Code: "+QueryCode+"--Filter Field: "+QueryFilterField+"--Filter Value: "+QueryFilterValue+"--Call Back: "+QueryCallback);
				if(debugMode==6) window.alert("Additional DD Filter MinX: "+ddQueryFilterValue1+" MaxX: "+ddQueryFilterValue2+" MinY: "+ddQueryFilterValue3+" MaxY: "+ddQueryFilterValue4);
				Result=ExecuteClarityDDQueryAsUser(debugMode, ServerName, QueryCode, QueryFilterField, QueryFilterValue, ddQueryFilterField1, ddQueryFilterValue1, ddQueryFilterField2, ddQueryFilterValue2, ddQueryFilterField3, ddQueryFilterValue3, ddQueryFilterField4, ddQueryFilterValue4, QueryCallback);

				if(debugMode==6) window.alert("Back from Query DD:"+Result.responseText);

				/* Parse Query Results */
				var xmlobject = crossBrowserXMLLoad(Result.responseText);
				
				/* Determine Quantity of Itens Returned */
				var queryStatus = xmlobject.getElementsByTagName("Slice");
				var queryState 	= queryStatus[0];
				var queryQty	= queryState.getElementsByTagName("Total")[0].firstChild.nodeValue;
				if(debugMode==6) window.alert("Query DD Returned "+queryQty+" records.");
				if(queryQty>0){
					/* Valid Items */
					var items = xmlobject.getElementsByTagName("Record");
					var item = items[0];
					var intlid 		 	  	= item.getElementsByTagName("intlid")[0].firstChild.nodeValue;
					var itemcode  	 	  	= item.getElementsByTagName("itemcode")[0].firstChild.nodeValue;
					var itemname	 	  	= item.getElementsByTagName("itemname")[0].firstChild.nodeValue;
					if(debugMode==6) window.alert("Query DD itemcode="+itemcode+" intlid="+intlid+" itemname="+itemname);
					
					/* DrillDown URL */
					var jumpLink = '/niku/nu#action:strategic_item_dashboard&id='+intlid;
					if (vModal==1){
						/* Modal Panel = Jump to Link and Close Modal Panel */
						window.open(jumpLink,"_self","",false);
						eventFire(document.getElementsByClassName('ppm_dialog_close')[0], 'click');
					}
					else {
						/* NOT Modal Panel = Jump to Link */
						window.location.assign(jumpLink);	
					}
				}
				else {
					/* No Valid Records for Drill Down (clicked elsewhere) = do a PPM Rrefresh */
					if (vModal==1){
						/* Close Modal */
						eventFire(document.getElementsByClassName('ppm_dialog_close')[0], 'click');
					}
					else {
						/* Not Modal, do PPM Refresh */
						eventFire(document.getElementById('ppm_refresh'), 'click');
					}
				}
			},false);
			var ctx=c.getContext("2d");
			var img = new Image(); 
			img.src = itemurlmap;
			if(debugMode==1) window.alert("Image SRC:"+img.src);
			img.onload = function() {
				/* Parse Query Results AGAIN */
				xmlobject = crossBrowserXMLLoad(Result.responseText);
				items = xmlobject.getElementsByTagName("Record");
				item = items[0];
				intlid 		 	  	= item.getElementsByTagName("intlid")[0].firstChild.nodeValue;
				itemcode  	 	  	= item.getElementsByTagName("itemcode")[0].firstChild.nodeValue;
				itemname	 	  	= item.getElementsByTagName("itemname")[0].firstChild.nodeValue;
				itemstatus	 	  	= item.getElementsByTagName("itemstatus")[0].firstChild.nodeValue;
				itempercent  	  	= item.getElementsByTagName("itempercent")[0].firstChild.nodeValue;
				itemurlmap 		  	= item.getElementsByTagName("mapurl")[0].firstChild.nodeValue;
				itemxmap 		  	= item.getElementsByTagName("itemxmap")[0].firstChild.nodeValue;
				itemymap	 	  	= item.getElementsByTagName("itemymap")[0].firstChild.nodeValue;

				ctx.drawImage(img, 10, 10);
				
				if(debugMode==3) window.alert("L1 Will draw circle");
				if(debugMode==3) window.alert("Circle L1 is itemcode="+itemcode+" intlid="+intlid+" itemname="+itemname+" itemstatus="+itemstatus+" itempercent="+itempercent+" itemurlmap="+itemurlmap+" itemxmap="+itemxmap+" itemymap="+itemymap);
				
				ctx.beginPath();	
				ctx.fillStyle=statusColor.fill;
				ctx.arc(itemxmap,itemymap,15,0,2*Math.PI);
				ctx.stroke();
				ctx.fill();
				ctx.closePath();	
				ctx.font="13px Calibri";
				ctx.fillStyle=statusColor.font;
				ctx.textAlign = "center";
				ctx.textBaseline="middle";
				ctx.fillText(itempercent+'%',itemxmap,itemymap);

				if(debugMode==3) window.alert("L1 has drawn circle");

				/* Execute Query for Level 2
					use this statement to test running the query as admin (remember to set the password accordingly)
					var Result=ExecuteClarityQueryAsAdmin(debugMode, ServerName, QueryCode, QueryFilterField, QueryFilterValue, "admin", "iluvca", QueryCallback);
				*/
				QueryCode="strat_map_wsdl2";
				if(debugMode==4) window.alert("Query L2 Parameters --Server Name: "+ServerName+"--Query Code: "+QueryCode+"--Filter Field: "+QueryFilterField+"--Filter Value: "+QueryFilterValue+"--Call Back: "+QueryCallback);

				Result=ExecuteClarityQueryAsUser(debugMode, ServerName, QueryCode, QueryFilterField, QueryFilterValue, QueryCallback);
				
				if(debugMode==4) window.alert("Back from QueryL2:"+Result.responseText);

				/* Parse Query Results */
				xmlobject = crossBrowserXMLLoad(Result.responseText);
				items = xmlobject.getElementsByTagName("Record");
				var totalitems = items.length;
				if(debugMode==4) window.alert("Total Items L2="+totalitems);
				
				/* Draw L2 Status */
				for (var i = 0 ; i < totalitems ; i++) {
					var item = items[i];
					var intlid 		 	  	= item.getElementsByTagName("intlid")[0].firstChild.nodeValue;
					var itemcode  	 	  	= item.getElementsByTagName("itemcode")[0].firstChild.nodeValue;
					var itemname	 	  	= item.getElementsByTagName("itemname")[0].firstChild.nodeValue;
					var itemstatus	 	  	= item.getElementsByTagName("itemstatus")[0].firstChild.nodeValue;
					var itempercent  	  	= item.getElementsByTagName("itempercent")[0].firstChild.nodeValue;
					var itemxmap 		  	= item.getElementsByTagName("itemxmap")[0].firstChild.nodeValue;
					var itemymap	 	  	= item.getElementsByTagName("itemymap")[0].firstChild.nodeValue;

					if(debugMode==4) window.alert("Query L2 itemcode="+itemcode+" intlid="+intlid+" itemname="+itemname+" itemstatus="+itemstatus+" itempercent="+itempercent+" itemxmap="+itemxmap+" itemymap="+itemymap);
					statusColor.fill="default";
					statusColor.font="default";
					if(debugMode==4) window.alert("Will Define Color for itemstatus="+itemstatus+" fill="+statusColor.fill+" font="+statusColor.font);
					dummyVar = defineColors(debugMode, itemstatus, statusColor);
					if(debugMode==4) window.alert("Colors Defined for itemstatus="+itemstatus+" fill="+statusColor.fill+" font="+statusColor.font);

					if(debugMode==4) window.alert("L2 Will draw circle");
					
					ctx.beginPath();	
					ctx.fillStyle=statusColor.fill;
					ctx.arc(itemxmap,itemymap,15,0,2*Math.PI);
					ctx.stroke();
					ctx.fill();
					ctx.closePath();	
					ctx.font="13px Calibri";
					ctx.fillStyle=statusColor.font;
					ctx.textAlign = "center";
					ctx.textBaseline="middle";
					ctx.fillText(itempercent+'%',itemxmap,itemymap);

					if(debugMode==4) window.alert("L2 has drawn circle");
				}
				
				
				/* Execute Query for Level 3
					use this statement to test running the query as admin (remember to set the password accordingly)
					var Result=ExecuteClarityQueryAsAdmin(debugMode, ServerName, QueryCode, QueryFilterField, QueryFilterValue, "admin", "iluvca", QueryCallback);
				*/
				QueryCode="strat_map_wsdl3";
				if(debugMode==5) window.alert("Query L3 Parameters --Server Name: "+ServerName+"--Query Code: "+QueryCode+"--Filter Field: "+QueryFilterField+"--Filter Value: "+QueryFilterValue+"--Call Back: "+QueryCallback);

				Result=ExecuteClarityQueryAsUser(debugMode, ServerName, QueryCode, QueryFilterField, QueryFilterValue, QueryCallback);
				
				if(debugMode==5) window.alert("Back from QueryL3:"+Result.responseText);

				/* Parse Query Results */
				xmlobject = crossBrowserXMLLoad(Result.responseText);
				items = xmlobject.getElementsByTagName("Record");
				var totalitems = items.length;
				if(debugMode==5) window.alert("Total Items L3="+totalitems);
				
				/* Draw L3 Status */
				for (var i = 0 ; i < totalitems ; i++) {
					var item = items[i];
					var intlid 		 	  	= item.getElementsByTagName("intlid")[0].firstChild.nodeValue;
					var itemcode  	 	  	= item.getElementsByTagName("itemcode")[0].firstChild.nodeValue;
					var itemname	 	  	= item.getElementsByTagName("itemname")[0].firstChild.nodeValue;
					var itemstatus	 	  	= item.getElementsByTagName("itemstatus")[0].firstChild.nodeValue;
					var itempercent  	  	= item.getElementsByTagName("itempercent")[0].firstChild.nodeValue;
					var itemxmap 		  	= item.getElementsByTagName("itemxmap")[0].firstChild.nodeValue;
					var itemymap	 	  	= item.getElementsByTagName("itemymap")[0].firstChild.nodeValue;

					if(debugMode==5) window.alert("Query L3 itemcode="+itemcode+" intlid="+intlid+" itemname="+itemname+" itemstatus="+itemstatus+" itempercent="+itempercent+" itemxmap="+itemxmap+" itemymap="+itemymap);
					statusColor.fill="default";
					statusColor.font="default";
					if(debugMode==5) window.alert("Will Define Color for itemstatus="+itemstatus+" fill="+statusColor.fill+" font="+statusColor.font);
					dummyVar = defineColors(debugMode, itemstatus, statusColor);
					if(debugMode==5) window.alert("Colors Defined for itemstatus="+itemstatus+" fill="+statusColor.fill+" font="+statusColor.font);

					if(debugMode==5) window.alert("L3 Will draw circle");
					
					ctx.beginPath();	
					ctx.fillStyle=statusColor.fill;
					ctx.arc(itemxmap,itemymap,15,0,2*Math.PI);
					ctx.stroke();
					ctx.fill();
					ctx.closePath();	
					ctx.font="13px Calibri";
					ctx.fillStyle=statusColor.font;
					ctx.textAlign = "center";
					ctx.textBaseline="middle";
					ctx.fillText(itempercent+'%',itemxmap,itemymap);

					if(debugMode==5) window.alert("L3 has drawn circle");
				}
			}
		</script>
	</body>
</html>