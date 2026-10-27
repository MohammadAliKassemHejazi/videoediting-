param(
    [ValidateSet('codex', 'claude')][string]$Assistant = 'codex',
    [switch]$Check
)
$studioRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
if (-not (Test-Path -LiteralPath (Join-Path $studioRoot 'AGENTS.md'))) { throw 'Studio root not found' }
$commandNames = if ($Assistant -eq 'claude') { @('claude.cmd', 'claude') } else { @('codex.exe', 'codex') }
$editorCommand = $null
foreach ($commandName in $commandNames) {
    $editorCommand = Get-Command $commandName -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($editorCommand) { break }
}
if (-not $editorCommand) { throw "The $Assistant CLI is not installed. Open this folder in its app and use the video-editor skill." }
if ($Check) {
    Write-Output "Ready: $Assistant video editor"
    Write-Output "Workspace: $studioRoot"
    Write-Output "CLI: $($editorCommand.Source)"
    Write-Output 'Preview-first: no startup production/export job will be requested.'
    exit 0
}
$initialPrompt = 'Read AGENTS.md, RESUME.md and the video-editor skill. Briefly report current project state, then wait for my editing request. Do not start or restart any production or export job.'
Push-Location -LiteralPath $studioRoot
try {
    if ($Assistant -eq 'claude') { & $editorCommand.Source --agent video-editor $initialPrompt }
    else { & $editorCommand.Source --cd $studioRoot ('$video-editor ' + $initialPrompt) }
} finally { Pop-Location }
