' Rutin Zinciri programini pencere acmadan baslatir (Windows acilisinda kullanilir).
Set fso = CreateObject("Scripting.FileSystemObject")
Set sh = CreateObject("WScript.Shell")
sh.CurrentDirectory = fso.GetParentFolderName(WScript.ScriptFullName)
sh.Run "node server.js", 0, False
