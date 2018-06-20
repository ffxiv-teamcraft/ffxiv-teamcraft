!macro customUnInit
  ${IfNot} ${Silent}
    MessageBox MB_YESNO "Uninstalling the application will delete all related settings. Do you want to continue?" IDYES true IDNO false
    false:
      Quit
    true:
      RMDir /r "$PROFILE\AppData\Roaming\zzz"
      DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "zzz"
  ${EndIf}
!macroend

!macro customInit
    ${if} $installMode == "all"
        ${IfNot} ${UAC_IsAdmin}
            ShowWindow $HWNDPARENT ${SW_HIDE}
            !insertmacro UAC_RunElevated
            Quit
        ${endif}
    ${endif}
!macroend
