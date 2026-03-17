@echo off
echo Starting development servers...

wt -w 0 nt -d "%cd%\backend" --title "Backend" cmd /k "npm run dev" ; nt -d "%cd%\frontend" --title "Frontend" cmd /k "npm run dev"
