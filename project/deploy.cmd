@echo off
setlocal

set REPO_ROOT=C:\repos\Steuertool
set PROJECT_DIR=%~dp0
set BUILD_DIR=%PROJECT_DIR%build
set WORKTREE_DIR=%REPO_ROOT%\.deploy-worktree

echo Building...
cd /d "%PROJECT_DIR%"
call yarn build
if errorlevel 1 (
    echo Build failed.
    exit /b 1
)

if not exist "%BUILD_DIR%\" (
    echo Build directory not found: %BUILD_DIR%
    exit /b 1
)

echo Setting up worktree for github-pages branch...
git -C "%REPO_ROOT%" worktree remove "%WORKTREE_DIR%" --force 2>nul
git -C "%REPO_ROOT%" worktree add "%WORKTREE_DIR%" github-pages
if errorlevel 1 (
    echo Failed to create worktree.
    exit /b 1
)

echo Clearing old files from branch...
for /f "delims=" %%f in ('dir /b /a-d "%WORKTREE_DIR%" 2^>nul') do (
    if /I not "%%f"==".git" del /F /Q "%WORKTREE_DIR%\%%f"
)
for /d %%d in ("%WORKTREE_DIR%\*") do (
    if /I not "%%~nxd"==".git" rmdir /S /Q "%%d"
)

echo Copying build output...
robocopy "%BUILD_DIR%" "%WORKTREE_DIR%" /E /NFL /NDL /NJH /NJS
if errorlevel 8 (
    echo Copy failed.
    git -C "%REPO_ROOT%" worktree remove "%WORKTREE_DIR%" --force
    exit /b 1
)

echo Committing and pushing...
git -C "%WORKTREE_DIR%" add -A
git -C "%WORKTREE_DIR%" commit -m "Deploy: %DATE% %TIME%"
git -C "%WORKTREE_DIR%" push origin github-pages

echo Cleaning up worktree...
git -C "%REPO_ROOT%" worktree remove "%WORKTREE_DIR%" --force

echo Deployed successfully.
endlocal
