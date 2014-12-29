<!DOCTYPE html> 
<%@ page import="com.niku.union.persistence.connection.ConnectionContext" %>
<%@ page import="com.niku.union.interfaces.ICommonConstants" %>
<%@ page import="java.sql.Connection" %>
<%@ page import="java.sql.PreparedStatement" %>
<%@ page import="java.sql.ResultSet" %>
<%@ page import="java.util.ArrayList" %>
<%@ page import="java.util.*" %>
<%

String param_id = request.getParameter("id");
String param_hv = request.getParameter("hv");

String vNAME="";
String vMAX_DEPTH="";
String vFONT_FAMILY="";
String vFONT_SIZE="";
String vTITLE_FONT_SIZE="";
String vMIN_COLOR="";
String vMID_COLOR="";
String vMAX_COLOR="";
String vNO_COLOR="";
String vHEADER_HEIGHT="";
String vFONT_COLOR="";
String vTITLE_FONT_COLOR="";
String vMAX_POST_DEPTH="";
String vSHOW_SCALE="";
String vWEIGHTED_AVERAGE="";
String vHEADER_COLOR="";
String vHINT_OPACITY="";
String vMAX_HIGH_COLOR="";
String vMIN_HIGH_COLOR="";
String vMID_HIGH_COLOR="";
String vNO_HIGH_COLOR="";
String vHEADER_HIGH_COLOR="";
String vMIN_COLOR_VALUE="";
String vMAX_COLOR_VALUE="";
String vDRILL="";
String vHIER_TYPE="";
String vLINK_URL="";
String vSQL_TEXT="";
String vSQL_SELECT="";
String vSQL_PART1="";
String vSQL_PART2="";
String vSQL_PART3="";
String vSQL_PART4="";
String vSQL_ORDER="";

ArrayList<String> itemList = new ArrayList<String>();
ArrayList<String> intlList = new ArrayList<String>();
ArrayList<String> parentList = new ArrayList<String>();
ArrayList<String> addlList = new ArrayList<String>();
ArrayList<String> colorNameList = new ArrayList<String>();
ArrayList<String> linkList = new ArrayList<String>();
ArrayList<Double> sizeList = new ArrayList<Double>();  
ArrayList<Double> colorList = new ArrayList<Double>(); 
  
try
{
	ConnectionContext context = ConnectionContext.getContext( ICommonConstants.NIKU_DATABASE_ID );
	if( context == null )
	{
		throw new ServletException( "Database is not available or not installed correctly." );
	}

	Connection connection = context.getConnection( ConnectionContext.AUTOCOMMIT_MODE );
    try
    {
		PreparedStatement ps1;
		
		StringBuffer buf1 = new StringBuffer("  select NAME, MAX_DEPTH, FONT_FAMILY, FONT_SIZE, TITLE_FONT_SIZE, MIN_COLOR, MID_COLOR, MAX_COLOR, NO_COLOR, HEADER_HEIGHT,   ");
			buf1.append("  FONT_COLOR, TITLE_FONT_COLOR, MAX_POST_DEPTH, SHOW_SCALE, WEIGHTED_AVERAGE, HEADER_COLOR, TO_CHAR(10000*HINT_OPACITY) HINT_OPACITY,   ");
			buf1.append("  MIN_HIGH_COLOR, MID_HIGH_COLOR, MAX_HIGH_COLOR, NO_HIGH_COLOR, HEADER_HIGH_COLOR, MIN_COLOR_VALUE, MAX_COLOR_VALUE,   ");
			buf1.append("  DRILL_NEW_PAGE, HIERARCHY_TYPE, SQL_SELECT, SQL_PART1, SQL_PART2, SQL_PART3, SQL_PART4, SQL_ORDER from odf_ca_hiev_views ");
			buf1.append("  where code = '");
			buf1.append(param_hv);
			buf1.append("'");
		
		ps1 = connection.prepareStatement( buf1.toString() );
        try
        {
			ResultSet rs1 = ps1.executeQuery();
			try
			{
            
				while( rs1.next() )
				{
					vNAME = rs1.getString ( 1 );
					vMAX_DEPTH = rs1.getString ( 2 );
					vFONT_FAMILY = rs1.getString ( 3 );
					vFONT_SIZE = rs1.getString ( 4 );
					vTITLE_FONT_SIZE = rs1.getString ( 5 );
					vMIN_COLOR = rs1.getString ( 6 );
					vMID_COLOR = rs1.getString ( 7 );
					vMAX_COLOR = rs1.getString ( 8 );
					vNO_COLOR = rs1.getString ( 9 );
					vHEADER_HEIGHT = rs1.getString ( 10 );
					vFONT_COLOR = rs1.getString ( 11 );
					vTITLE_FONT_COLOR = rs1.getString ( 12 );
					vMAX_POST_DEPTH = rs1.getString ( 13 );
					vSHOW_SCALE = rs1.getString ( 14 );
					vWEIGHTED_AVERAGE = rs1.getString ( 15 );
					vHEADER_COLOR = rs1.getString ( 16 );
					vHINT_OPACITY = rs1.getString ( 17 );
					vMIN_HIGH_COLOR = rs1.getString ( 18 ) ;
					vMID_HIGH_COLOR = rs1.getString ( 19 ) ;
					vMAX_HIGH_COLOR = rs1.getString ( 20 ) ;
					vNO_HIGH_COLOR = rs1.getString ( 21 );
					vHEADER_HIGH_COLOR = rs1.getString ( 22 );
					vMIN_COLOR_VALUE = rs1.getString ( 23 );
					vMAX_COLOR_VALUE = rs1.getString ( 24 );
					vDRILL = rs1.getString( 25 );
					vHIER_TYPE = rs1.getString( 26 );
					vHIER_TYPE = vHIER_TYPE.substring(0,7);
					vSQL_SELECT = rs1.getString ( 27 );
					vSQL_PART1 = rs1.getString ( 28 );
					vSQL_PART2 = rs1.getString ( 29 );
					vSQL_PART3 = rs1.getString ( 30 );
					vSQL_PART4 = rs1.getString ( 31 );
					vSQL_ORDER = rs1.getString ( 32 );
					 
					if ( vNAME != null && vSQL_PART1 != null)
					{
						vSQL_TEXT = vSQL_SELECT + vSQL_PART1;
						if (vSQL_PART2 != null)
							vSQL_TEXT = vSQL_TEXT + " UNION " + vSQL_PART2;
						if (vSQL_PART3 != null)
							vSQL_TEXT = vSQL_TEXT + " UNION " + vSQL_PART3;
						if (vSQL_PART4 != null)
							vSQL_TEXT = vSQL_TEXT + " UNION " + vSQL_PART4;							
						
						vSQL_TEXT = vSQL_TEXT + "  " + vSQL_ORDER;
						vSQL_TEXT = vSQL_TEXT.replace("%internal_id%", param_id);
						
						PreparedStatement ps2 = connection.prepareStatement( vSQL_TEXT );
						try
						{
							ResultSet rs2 = ps2.executeQuery();
							try
							{
								String vItem;
								String vIntl;
								String vParent;
								String vLevel;
								String vStrSize;
								String vStrColor;
								String vLinkUrl;
								String vAdditionalInfo;
								Double vSize;
								Double vColor;

								while( rs2.next() )
								{
									vItem = rs2.getString( 1 );
									vIntl = rs2.getString( 2 );
									vParent = rs2.getString( 3 );
									vLevel = rs2.getString( 4 );
									vStrSize = rs2.getString( 5 );
									vStrColor = rs2.getString( 6 );
									vLinkUrl =  rs2.getString( 7 );
									vAdditionalInfo = rs2.getString( 8 );
									
									if( vItem != null )
									{
										if ( vHIER_TYPE.equals("TreeMap") )
										{
											if ( vStrSize != null && vStrColor != null )
											{
												try
												{
													vSize = Double.parseDouble( vStrSize );
													vColor = Double.parseDouble( vStrColor );
												}
												catch(NumberFormatException nfe)
												{
													throw new ServletException( "Could not parse Size:" + vStrSize + " or Color:" + vStrColor, nfe );
												}
											}
											else
											{
												vSize = 0.00;
												vColor = 0.00;
											}
										}
										else
										{
											vSize = 0.00;
											vColor = 0.00;
										}
										itemList.add(vItem);
										intlList.add(vIntl);
										parentList.add(vParent);
										sizeList.add(vSize);
										colorList.add(vColor);
										colorNameList.add(vStrColor);
										linkList.add(vLinkUrl);
										addlList.add(vAdditionalInfo);
									}
								}
							}
							finally
							{
								rs2.close();
							}
						}
						finally
						{
							ps2.close();
						}
					}
				}
			}
			finally
			{
				rs1.close();
			}
        }
		finally
        {
			ps1.close();
        }
    }
    finally
    {
		connection.close();
    }
}
catch( Exception e )
{
	throw new ServletException( "Could not read from database", e );
}
%>

<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml">
	<head>
		<style>
			a.orgLightLink:link {color:#ffffff;text-decoration:none;}
			a.orgLightLink:visited {color:#ffffff;text-decoration:none;}
			a.orgLightLink:hover {color:#ffffff;text-decoration:underline;}
			a.orgDarkLink:link {color:#000000;text-decoration:none;}
			a.orgDarkLink:visited {color:#000000;text-decoration:none;}
			a.orgDarkLink:hover {color:#000000;text-decoration:underline;}
		</style>
		<title>Hierarchical View</title>
		<script type="text/javascript" src="https://www.google.com/jsapi?autoload={'modules':[{'name':'visualization','version':'1','packages':['treemap']}]}"></script>
		<script type="text/javascript" src="https://www.google.com/jsapi?autoload={'modules':[{'name':'visualization','version':'1','packages':['orgchart']}]}"></script>
		<script type="text/javascript">		
			var addlArray = [];
			var dataArray = [];
			//var vLinkUrl = "";
			var vDrillTarget = "";
			var debugLevel = 0;

			function showTreeMapTooltip(row, size, value)
			{
				//var linkComplete = vLinkUrl.replace("%internal_id%", addlArray[row+1][0]);
				var addlInfo = addlArray[row+1][2];
				var itemLink = addlArray[row+1][1]

			  return '<div style="background:#ccffff; padding:10px; border-style:solid">' +
						'<span style="font-family:Calibri">' + addlInfo +
						'<br>' + '<b><a target="' + vDrillTarget + '" href="' + itemLink + '">' + dataArray[row+1][0] + '</a></b><br></span></div>';
			}
			
			function drawChart() 
			{

				if (debugLevel > 1) window.alert("IN: drawChart");
				
				var vFontFamily = "'<%= vFONT_FAMILY %>'";
				var vHierType = "<%= vHIER_TYPE %>";
				var vDrillPage = <%= vDRILL %>;
				if ( vDrillPage == 1 )
					vDrillTarget = "_blank";
				else
					vDrillTarget = "_parent";
				
				if (vHierType == 'TreeMap')
				{
					dataArray.push(['Plan', 'Parent', 'Size', 'Color']);
					addlArray.push(['IntlID', 'Link URL', 'Additional Info']);
				}
				else
				{
					dataArray.push(['Plan', 'Parent', 'Additional Info']);
				}
			
				var linkComplete="";
				var addlInfo="";
				var itemName="";
				var itemNameLong="";
				var itemIntl="";
				var itemLink="";
				var colorName="";
				var linkClass="";
				var linkInfo="";
				
				<%
					String testParent;
					String parentItem;
					for (int ii=0; ii<itemList.size(); ii++)
					{
						testParent = parentList.get(ii);
						if (ii > 0)
						{
							 parentItem = "'" ;
							 parentItem += testParent;
							 parentItem += "'";
						}
						else
							parentItem = null;%>
				
						itemName = "<%= itemList.get(ii)%>";
						itemIntl = "<%= intlList.get(ii)%>";
						addlInfo = "<%= addlList.get(ii)%>";
						itemLink = "<%= linkList.get(ii)%>";
						
						if (vHierType == 'TreeMap')
						{
							dataArray.push([itemName, <%= parentItem %>, <%= sizeList.get(ii)%>,<%= colorList.get(ii)%> ]);
							addlArray.push([itemIntl, itemLink, addlInfo]);	
						}
						else
						{
							colorName = "<%= colorNameList.get(ii)%>";
							if (colorName == 'yellow' || colorName == 'lightblue')
								linkClass = 'orgDarkLink';
							else
								linkClass = 'orgLightLink';
							
							//linkComplete = vLinkUrl.replace("%internal_id%", itemIntl);
							
							itemNameLong = '<div style="background-color: ';
								itemNameLong += colorName;
								itemNameLong += '; padding:10px; font-family:' + vFontFamily;
								itemNameLong += '"><a class="' + linkClass +'"';
								itemNameLong += ' target="' + vDrillTarget + '" href="' + itemLink + '">' + itemName + '</a></div>';
							
							linkInfo = '<b><a target="' + vDrillTarget + '" href="' + itemLink + '">' + itemName + '</a></b>';
							dataArray.push([{v:itemName, f:itemNameLong}, <%= parentItem %>, addlInfo]);
							addlArray.push([itemIntl, itemLink, addlInfo]);	
						}
						
					<% } %>				

				if (debugLevel > 1) 
					window.alert(dataArray[1]);
						
				if (debugLevel > 0) 
					window.alert("dataArray is Ready");
			
				var data = google.visualization.arrayToDataTable(dataArray);

				if (vHierType == 'TreeMap')
					tree = new google.visualization.TreeMap(document.getElementById('map_canvas'));
				else
					tree = new google.visualization.OrgChart(document.getElementById('map_canvas'));
 
				var vMaxDepth = <%= vMAX_DEPTH %>;
				var vFontSize = <%= vFONT_SIZE %>;
				var vTitleFontSize = <%= vTITLE_FONT_SIZE %>;
				var vMinColor = "<%= vMIN_COLOR %>";
				var vMidColor = "<%= vMID_COLOR %>";
				var vMaxColor = "<%= vMAX_COLOR %>";
				var vNoColor = "<%= vNO_COLOR %>";
				var vHeaderHeight = <%= vHEADER_HEIGHT %>;
				var vFontColor = "<%= vFONT_COLOR %>";
				var vTitleFontColor = "<%= vTITLE_FONT_COLOR %>";
				var vMaxPostDepth = <%= vMAX_POST_DEPTH %>;
				var vShowScale = <%= vSHOW_SCALE %>;
				if ( vShowScale == 0 )
					var vShowScaleBoolean = false;
				else
					var vShowScaleBoolean = true;
				var vWeightedAverage = <%= vWEIGHTED_AVERAGE %>;
				if ( vWeightedAverage == 0 )
					var vWeightedAverageBoolean = false;
				else
					var vWeightedAverageBoolean = true;
				var vHeaderColor = "<%= vHEADER_COLOR %>";
				var vHintOpacity = <%= vHINT_OPACITY %>;
				vHintOpacity = vHintOpacity / 10000;
				var vMinHighColor = "<%= vMIN_HIGH_COLOR %>";
				var vMidHighColor = "<%= vMID_HIGH_COLOR %>";
				var vMaxHighColor = "<%= vMAX_HIGH_COLOR %>";
				var vNoHighColor = "<%= vNO_HIGH_COLOR %>";
				var vHeaderHighColor = "<%= vHEADER_HIGH_COLOR %>";
				var vMinColorValue = <%= vMIN_COLOR_VALUE %>;
				var vMaxColorValue = <%= vMAX_COLOR_VALUE  %>;
				var vTitle = "<%= vNAME %>";
				
				if ( debugLevel > 1 ) window.alert ("Iniciando Options");

		
				if (vHierType == 'TreeMap')
					tree.draw(data, 
					{
						maxDepth: vMaxDepth,
						fontFamily: vFontFamily,
						fontSize: vFontSize,
						fontColor: vFontColor,
						minColor: vMinColor,
						midColor: vMidColor,
						maxColor: vMaxColor,
						noColor:  vNoColor,
						headerHeight: vHeaderHeight,
						showScale: vShowScaleBoolean,
						maxPostDepth: vMaxPostDepth,
						useWeightedAverageForAggregation: vWeightedAverageBoolean,
						headerColor: vHeaderColor, 
						hintOpacity: vHintOpacity,
						headerHighlightColor: vHeaderHighColor,
						minHighlightColor: vMinHighColor,
						midHighlightColor: vMidHighColor,
						maxHighlightColor: vMaxHighColor,
						noHighlightColor: vNoHighColor,
						minColorValue: vMinColorValue,
						maxColorValue: vMaxColorValue,
						generateTooltip: showTreeMapTooltip,
						title: vTitle,
						titleTextStyle: 
									{
										color: vTitleFontColor,
										fontName: vFontFamily,
										fontSize: vTitleFontSize,
										bold: true,
										italic: false
									}
					});
				else
					tree.draw(data, {allowHtml:true, allowCollapse:true});

			  
				if (debugLevel > 1) window.alert("OUT: drawChart");	
			}
		</script>
	</head>
	<body onload="drawChart()" onunload="GUnload()">
		<form name="maps.page" method="post" action="hierView.jsp">
			<table border="0" cellspacing="1" cellpadding="0" class="tableGridList" width="100%">
			  <tr>
				<td align="left">
					<div style="width:1200px; height:550px;">				
						<div id="map_canvas" style="width:100%; height:100%"></div>
					<div>			
				  </td>
			  </tr>
			</table>	
		</form>
	</body>
</html>