param([Parameter(Mandatory=$true)][string]$WorkPath)
$ErrorActionPreference = 'Stop'
$studioRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$expectedBase = [IO.Path]::GetFullPath((Join-Path $studioRoot '.cache\texas-cinema-myth\enhancement'))
$resolvedWork = (Resolve-Path -LiteralPath $WorkPath).Path
if ([IO.Path]::GetDirectoryName($resolvedWork) -ne $expectedBase -or
    [IO.Path]::GetFileName($resolvedWork) -notmatch '^\d{2}-[a-f0-9-]{36}$') {
    throw 'Refusing to remove frames outside a verified episode enhancement job.'
}
$workItem = Get-Item -LiteralPath $resolvedWork
if ($workItem.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Refusing a linked job directory.' }
$verifiedTargets = @()
foreach ($leaf in @('input','output')) {
    $candidate = Join-Path $resolvedWork $leaf
    if (!(Test-Path -LiteralPath $candidate)) { continue }
    $resolvedTarget = (Resolve-Path -LiteralPath $candidate).Path
    if ([IO.Path]::GetDirectoryName($resolvedTarget) -ne $resolvedWork) { throw 'Frame directory escaped job.' }
    $item = Get-Item -LiteralPath $resolvedTarget
    if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Refusing linked frame directory.' }
    $unexpected = Get-ChildItem -LiteralPath $resolvedTarget -Force | Where-Object {
        $_.PSIsContainer -or $_.Name -notmatch '^\d{8}\.png$' -or ($_.Attributes -band [IO.FileAttributes]::ReparsePoint)
    }
    if ($unexpected) { throw 'Unexpected files in rebuildable frame directory; preserving them.' }
    $verifiedTargets += $resolvedTarget
}
# Only per-job rebuildable PNG frames are removed after the enhanced MP4 has
# passed full decode. Preserve native H3 footage, artwork, MP4, manifest and log.
foreach ($verifiedTarget in $verifiedTargets) {
    Write-Output ('Removing verified rebuildable frame directory: ' + $verifiedTarget)
    Remove-Item -LiteralPath $verifiedTarget -Recurse -Force
}
