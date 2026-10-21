$ErrorActionPreference = "Stop"
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $dir

$docx = Get-ChildItem -Filter "*v1.docx" | Where-Object { $_.Name -notlike "~$*" -and $_.Name -notlike "*backup*" } | Select-Object -First 1
if (-not $docx) { throw "docx not found" }

$config = Get-Content (Join-Path $dir "replacements.json") -Raw -Encoding UTF8 | ConvertFrom-Json
$tempDir = Join-Path $env:TEMP "resume-export"
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
$outDocx = Join-Path $tempDir "resume-v1-optimized.docx"
$pdfPath = Join-Path $tempDir "resume-v1-optimized.pdf"
$finalPdf = Join-Path $dir ($docx.BaseName + ".pdf")
$finalDocx = Join-Path $dir ($docx.BaseName + ".docx")

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
$doc = $word.Documents.Open($docx.FullName, $false, $true)

foreach ($pair in $config.simpleReplace) {
    $findText = [string]$pair[0]
    $replaceText = [string]$pair[1]
    $range = $doc.Content
    $f = $range.Find
    $f.ClearFormatting()
    $f.Replacement.ClearFormatting()
    $f.Text = $findText
    $f.Replacement.Text = $replaceText
    $f.Forward = $true
    $f.Wrap = 1
    [void]$f.Execute($findText, $false, $true, $false, $false, $false, $true, 1, $false, $replaceText, 2)
}

for ($i = 1; $i -le $doc.Paragraphs.Count; $i++) {
    $para = $doc.Paragraphs.Item($i)
    $text = $para.Range.Text
    foreach ($rule in $config.paragraphStartsWith) {
        if ($text.StartsWith($rule.match)) {
            $para.Range.Text = $rule.text
            break
        }
    }
}

foreach ($rule in $config.insertAfter) {
    $range = $doc.Content
    $f = $range.Find
    $f.Text = $rule.after
    if ($f.Execute()) {
        $range.Collapse(0)
        $range.InsertAfter($rule.text)
    }
}

$doc.SaveAs([ref]$outDocx, [ref]12)
$doc.ExportAsFixedFormat($pdfPath, 17)
$doc.Close($false)
$word.Quit()

Copy-Item $outDocx $finalDocx -Force
Copy-Item $pdfPath $finalPdf -Force
Write-Host "OK"
