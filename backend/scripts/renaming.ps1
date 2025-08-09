# renames files as needed for db ingest (the renamed files are proper file names as scraped from ZZZS)
$rootPath = Join-Path -Path $PSScriptRoot -ChildPath "data"

Get-ChildItem -Path $rootPath -Recurse -File -Filter *.xlsx | ForEach-Object {
    if ($_.Name -match '^(\d{4})-(\d{2})-(\d{2})_(ginekologi|zobozdravniki|zdravniki)\.xlsx$') {
        $year = $matches[1]
        $month = $matches[2]
        $day = $matches[3]
        $type = $matches[4]

        switch ($type) {
            'ginekologi'               { $prefix = 'GIN_ZO' }
            'zobozdravniki'             { $prefix = 'ZOB_ZO' }
            'zdravniki'                 { $prefix = 'SA_ZO' }
        }

        $newName = "${prefix}_${day}_${month}_${year}.xlsx"
        Rename-Item -Path $_.FullName -NewName $newName -Force
        Write-Host "Renamed '$($_.Name)' as '$newName'"
    }
}
