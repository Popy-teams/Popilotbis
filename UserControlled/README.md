# UserControlled — SQL Server Agent

Scripts pour la base **UserControlled** sur `USERCONTROLLED\USERCONTROLLEDSQL`.

## Fichiers

| Fichier | Rôle |
|---------|------|
| `Create-UserControlledTable.sql` | Crée la table `dbo.UserControlled` |
| `Create-UserControlledSproc.sql` | Crée `dbo.usp_UserControlled_Insert` |
| `Fix-UserControlledSqlAgentJob.ps1` | Corrige / recrée le job **UserControlledSprocJob** (toutes les 5 min) |

## Ordre d'exécution (PowerShell admin, Windows)

```powershell
cd UserControlled

# 1. Schéma + procédure
Invoke-Sqlcmd -ServerInstance "USERCONTROLLED\USERCONTROLLEDSQL" -InputFile "Create-UserControlledTable.sql"
Invoke-Sqlcmd -ServerInstance "USERCONTROLLED\USERCONTROLLEDSQL" -InputFile "Create-UserControlledSproc.sql"

# 2. Job Agent (nom : UserControlledSprocJob)
.\Fix-UserControlledSqlAgentJob.ps1 -RunJobNow
```

## Renommer un ancien job

Si le job existait sous un autre nom :

```powershell
.\Fix-UserControlledSqlAgentJob.ps1 `
    -PreviousJobName 'AncienNomDuJob' `
    -JobName 'UserControlledSprocJob' `
    -RunJobNow
```

## Vérifications

```powershell
Get-Service SQLSERVERAGENT
Get-DbaAgentJob -SqlInstance "USERCONTROLLED\USERCONTROLLEDSQL" -Job UserControlledSprocJob
Get-DbaAgentJobHistory -SqlInstance "USERCONTROLLED\USERCONTROLLEDSQL" -Job UserControlledSprocJob -Top 5
```

```sql
USE UserControlled;
SELECT TOP 20 * FROM dbo.UserControlled ORDER BY Id DESC;
```
