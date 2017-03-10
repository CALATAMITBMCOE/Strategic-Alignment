@Echo Off
SET XOG_HOME=c:\apps\clients\xog151\bin
SET SERVERNAME=ppmlatam174.ca.com
SET PORTNUMBER=80
SET SSLENABLED=false
SET USERNAME=xog
SET PASSWORD=gox
SET JAVA_HOME=c:/apps/jdk1.8.0_66
IF NOT EXIST output md output
CD C:\Users\assal01\Documents\GitHub\Strategic-Alignment\DataLoad
Call %XOG_HOME%/xog -servername %SERVERNAME% -portnumber %PORTNUMBER% -sslenabled %SSLENABLED%  -username %USERNAME% -password %PASSWORD% -output c:\Users\assal01\Documents\GitHub\Strategic-Alignment\DataLoad/output/Measures_out.xml -input c:\Users\assal01\Documents\GitHub\Strategic-Alignment\DataLoad/Measures.xml
Call %XOG_HOME%/xog -servername %SERVERNAME% -portnumber %PORTNUMBER% -sslenabled %SSLENABLED%  -username %USERNAME% -password %PASSWORD% -output c:\Users\assal01\Documents\GitHub\Strategic-Alignment\DataLoad/output/Targets_out.xml -input c:\Users\assal01\Documents\GitHub\Strategic-Alignment\DataLoad/Targets.xml
pause
