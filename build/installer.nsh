; NovaGitX — Explorer context-menu integration
;
; Adds "Open in NovaGitX" to:
;   - Right-click on a folder              (Directory\shell)
;   - Right-click on the empty area inside (Directory\Background\shell)
;   - Right-click on a drive root          (Drive\shell)
;
; %V is the directory path that Explorer passes; %1 is used for Background where %V is empty.

!macro customInstall
  WriteRegStr HKCU "Software\Classes\Directory\shell\NovaGitX" "" "Open in NovaGitX"
  WriteRegStr HKCU "Software\Classes\Directory\shell\NovaGitX" "Icon" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKCU "Software\Classes\Directory\shell\NovaGitX\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%V"'

  WriteRegStr HKCU "Software\Classes\Directory\Background\shell\NovaGitX" "" "Open in NovaGitX"
  WriteRegStr HKCU "Software\Classes\Directory\Background\shell\NovaGitX" "Icon" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKCU "Software\Classes\Directory\Background\shell\NovaGitX\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%V"'

  WriteRegStr HKCU "Software\Classes\Drive\shell\NovaGitX" "" "Open in NovaGitX"
  WriteRegStr HKCU "Software\Classes\Drive\shell\NovaGitX" "Icon" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKCU "Software\Classes\Drive\shell\NovaGitX\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%V"'
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\Classes\Directory\shell\NovaGitX"
  DeleteRegKey HKCU "Software\Classes\Directory\Background\shell\NovaGitX"
  DeleteRegKey HKCU "Software\Classes\Drive\shell\NovaGitX"
!macroend
