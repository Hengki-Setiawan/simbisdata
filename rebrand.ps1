$srcPath = 'd:\Vibe coding (tugas)\Software Simbisdis\simbisdata\src'
$files = Get-ChildItem -Path $srcPath -Recurse -Include '*.ts','*.tsx'
$count = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match 'simbisdata') {
        $content = $content -replace 'simbisdata', 'simbisai'
        Set-Content $file.FullName -Value $content -NoNewline
        Write-Output "Updated lowercase: $($file.Name)"
        $count++
    }
}
Write-Output "Total files updated (lowercase): $count"
