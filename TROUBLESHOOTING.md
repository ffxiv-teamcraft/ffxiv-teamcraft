# User Troubleshooting Guide
This Information can also be found (in more depth) at https://wiki.ffxivteamcraft.com/troubleshooting
## Troubleshooting
A quick list of common fixes for standard issues like packet capture not working properly, inventory not updating, TC not detecting gearset's stats from the game, etc.

### Attention PS4/PS5 Players:
Packet capture (and therefore inventory tracking) does not work for the PS4/PS5, only on PC.

### Are you using the Desktop App?
Packet capture (and therefore inventory tracking) only works on the desktop app (and only when your game is running DirectX 11; if you are still using DirectX 9, packet capture can no longer work due to packet changes by Square-Enix). It will not work on the web version, and inventory information is only stored locally on your computer. Please make sure you have the app installed before trying to use packet capture.

### Is the app updated?
Teamcraft needs to be on the latest version of the app for packet capture to work. If you are not up to date, please update before continuing.

### Have you restarted Teamcraft?
As of version 8.0.12, PCAP no longer requires a client update to update OPCodes. Restarting Teamcraft can resolve issues related to this.

If the above are true, please try the following:
### Open the console by pressing `Ctrl-Shift-I` and clicking the Console tab. 
Then type
window.debugPackets = true;
Press Enter,  and move in game/teleport to a new zone. Is there any output after the command says true? If there is output, congratulations; packet capture itself is working! However, if Teamcraft is still telling you that your inventory is outdated, it is likely something has broken with your character linking.
Type `window.debugPackets = true;`
Press Enter, and move in game/teleport to a new zone. Is there any output after the command says true?

If there is output, packet capture is working. However, if your inventory is still outdated, there may be an issue with your character linking. Please see the section on character linking below.

### Still no output?
- Are you using a VPN or a tool to lower your ping? This may no longer impact packet capture, but see the section on VPNs below.
- Teamcraft might be getting blocked by your antivirus. Try excluding the Teamcraft install folder in your antivirus: `%LocalAppData%\ffxiv-teamcraft\`.

#### If your antivirus is BitDefender:
Whitelist `%LocalAppData%\ffxiv-teamcraft\app-X.X.X\FFXIV Teamcraft.exe`. This path changes with every update due to the Squirrel Installer.

### Still not working. :(
Please post your `main.log` and the most recent Deucalion session log in `#troubleshooting` on our Discord (https://discord.com/invite/r6qxt6P).

#### My `main.log` said "tasklist is unknown"!
Here's how to fix it:
1. Press the Windows key, search "env" and hit Enter.
2. Click "Environment Variables" in the advanced tab.
3. Under "System Variables", locate the Path entry.
4. Click "New" and paste in `%SystemRoot%\system32\WindowsPowerShell\v1.0`.
5. Confirm and try reopening TC.

### Character Linking Issues
- Ensure you're logged into a Teamcraft account.
- For the Chinese client, set the correct folder for character data in Settings.
- Use the 'Reset ignored characters' and 'Reset linked characters' buttons.
- Teleport to a new zone after linking your character to ensure proper updating.

### VPNs and Security Tools
Instructions on making VPNs work with Teamcraft:
- NordVPN: Disable Threat Protection or add exceptions.
- Mudfish: Disable WFP feature.
- ExitLag: Use Raw Socket mode and run both TC and FFXIV as admin.
- Mullvad: Disable the ad blocker feature.

Kaspersky may block Firestore, which is needed by Teamcraft. Whitelist Firestore in Kaspersky settings.

### Dirty Install
To fully remove old versions of Teamcraft:
1. Back up any offline lists.
2. Export settings from the Settings > General menu.
3. End all Teamcraft processes in Task Manager.
4. Delete Teamcraft folders in `%localappdata%` and `%appdata%`.
5. Uninstall Teamcraft from Control Panel.
6. Restart your computer.
7. Download and reinstall Teamcraft.

### Still having issues?
Make a bug report in the `#troubleshooting` channel on our Discord (https://discord.com/invite/r6qxt6P).

#### How to open the console for troubleshooting:
Press `Ctrl+Shift+I` and click the Console tab.

#### How to submit a bug report:
- **Issue:** [Description]
- **Steps to Reproduce:** [Detailed steps]
- **Expected Behavior:** [What you expected to happen]
- **Software Version/Type:** [Website or desktop app? Which version or browser?]
- **Additional Information:** [Any extra context]
- **Screenshots:** [Attach screenshots]

Bug Report Template:

```plaintext
**Issue:** 
> 
**Steps to Reproduce:**
> 
**Expected Behaviour:**
> 
**Teamcraft Version - Browser / Desktop Client**
