@echo off
set PATH=\
lib\ajaxmin jmoney\jmoney.js -o jmoney\jmoney.min.js -clobber
copy jMoney\jmoney.min.js ".nuget\content\Scripts"
copy jMoney\jmoney.js ".nuget\content\Scripts"
del .nuget\*.nupkg
.nuget\NuGet Pack .nuget\jMoney.js.nuspec -OutputDirectory .nuget\
echo ----------------------------------------------