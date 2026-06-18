#Requires -Version 5.1
<#
.SYNOPSIS
    Corrige et (re)crée le job SQL Server Agent UserControlledSprocJob.

.DESCRIPTION
    - Démarre SQL Server Agent si nécessaire
    - Renomme un ancien job vers UserControlledSprocJob si présent
    - Corrige la commande T-SQL de l'étape (EXEC dbo.usp_UserControlled_Insert)
    - Attache une planification toutes les 5 minutes via New-DbaAgentJobSchedule

.EXAMPLE
    .\Fix-UserControlledSqlAgentJob.ps1
    .\Fix-UserControlledSqlAgentJob.ps1 -RunJobNow
    .\Fix-UserControlledSqlAgentJob.ps1 -PreviousJobName 'UserControlledSprocJob'
#>
[CmdletBinding()]
param(
    [string]$SqlInstance = 'USERCONTROLLED\USERCONTROLLEDSQL',
    [string]$JobName = 'UserControlledSprocJob',
    [string]$PreviousJobName = '',
    [string]$DatabaseName = 'UserControlled',
    [string]$SprocName = 'dbo.usp_UserControlled_Insert',
    [string]$ScheduleName = 'UserControlled_Every5Minutes',
    [switch]$RunJobNow
)

$ErrorActionPreference = 'Stop'

function Write-Step([string]$Message) {
    Write-Host $Message -ForegroundColor Cyan
}

function Ensure-SqlAgentRunning {
    $agent = Get-Service -Name SQLSERVERAGENT -ErrorAction SilentlyContinue
    if (-not $agent) {
        Write-Warning 'Service SQLSERVERAGENT introuvable sur cette machine.'
        return
    }
    if ($agent.Status -ne 'Running') {
        Write-Step 'Démarrage du service SQL Server Agent...'
        Start-Service SQLSERVERAGENT
        Set-Service SQLSERVERAGENT -StartupType Automatic
        $agent = Get-Service -Name SQLSERVERAGENT
    }
    Write-Host "SQL Server Agent : $($agent.Status)" -ForegroundColor Green
}

if (-not (Get-Module -ListAvailable -Name dbatools)) {
    throw 'Module dbatools requis : Install-Module dbatools -Scope CurrentUser'
}

Import-Module dbatools -ErrorAction Stop

Write-Step '=== Diagnostic UserControlledSprocJob ==='
Ensure-SqlAgentRunning

$existingJob = Get-DbaAgentJob -SqlInstance $SqlInstance -Job $JobName -ErrorAction SilentlyContinue
$legacyJob = $null
if ($PreviousJobName -and $PreviousJobName -ne $JobName) {
    $legacyJob = Get-DbaAgentJob -SqlInstance $SqlInstance -Job $PreviousJobName -ErrorAction SilentlyContinue
}

if ($legacyJob -and -not $existingJob) {
    Write-Step "Renommage du job '$PreviousJobName' -> '$JobName'..."
    Set-DbaAgentJob -SqlInstance $SqlInstance -Job $PreviousJobName -NewName $JobName
    $existingJob = Get-DbaAgentJob -SqlInstance $SqlInstance -Job $JobName
}

if ($existingJob) {
    Write-Step "Suppression du job existant '$JobName' pour recréation propre..."
    Remove-DbaAgentJob -SqlInstance $SqlInstance -Job $JobName -Confirm:$false
}

Write-Step "Création du job '$JobName'..."
New-DbaAgentJob `
    -SqlInstance $SqlInstance `
    -Job $JobName `
    -Description 'Exécute dbo.usp_UserControlled_Insert toutes les 5 minutes (UserControlled)' `
    -OwnerLogin sa `
    -ErrorAction Stop | Out-Null

$stepCommand = "EXEC $SprocName;"
Write-Step "Ajout de l'étape T-SQL : $stepCommand"
New-DbaAgentJobStep `
    -SqlInstance $SqlInstance `
    -Job $JobName `
    -StepName 'Run UserControlled Insert' `
    -Subsystem TSQL `
    -Database $DatabaseName `
    -Command $stepCommand `
    -OnSuccessAction QuitWithSuccess `
    -OnFailAction QuitWithFailure `
    -ErrorAction Stop | Out-Null

Write-Step 'Planification : toutes les 5 minutes'
New-DbaAgentJobSchedule `
    -SqlInstance $SqlInstance `
    -Job $JobName `
    -ScheduleName $ScheduleName `
    -FrequencyType Daily `
    -FrequencyInterval 1 `
    -FrequencySubdayType Minutes `
    -FrequencySubdayInterval 5 `
    -ActiveStartDate (Get-Date) `
    -ActiveStartTime '000000' `
    -ErrorAction Stop | Out-Null

Set-DbaAgentJob -SqlInstance $SqlInstance -Job $JobName -Enabled $true | Out-Null

Write-Step '=== Vérification ==='
Get-DbaAgentJob -SqlInstance $SqlInstance -Job $JobName |
    Select-Object Name, Enabled, LastRunDate, LastRunOutcome | Format-List

Get-DbaAgentJobSchedule -SqlInstance $SqlInstance -Job $JobName |
    Select-Object ScheduleName, FrequencySubdayType, FrequencySubdayInterval, IsEnabled | Format-List

if ($RunJobNow) {
    Write-Step 'Exécution immédiate du job...'
    Start-DbaAgentJob -SqlInstance $SqlInstance -Job $JobName
    Start-Sleep -Seconds 5
    Get-DbaAgentJobHistory -SqlInstance $SqlInstance -Job $JobName -Top 3 |
        Select-Object RunDate, StepName, RunStatus, Message | Format-List
}

Write-Host "`nJob '$JobName' configuré. Vérifiez les insertions :" -ForegroundColor Green
Write-Host "  SELECT TOP 10 * FROM [$DatabaseName].dbo.UserControlled ORDER BY Id DESC;" -ForegroundColor Gray
