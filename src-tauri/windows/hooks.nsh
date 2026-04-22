!macro NSIS_HOOK_POSTINSTALL
  ; Use a dedicated document icon for .qse files on Windows Explorer.
  WriteRegStr SHELL_CONTEXT "Software\Classes\QueenSkin.Project\DefaultIcon" "" "$INSTDIR\qse-document.ico"
  !insertmacro UPDATEFILEASSOC
!macroend
