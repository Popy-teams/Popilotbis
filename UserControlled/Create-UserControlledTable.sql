-- Table cible pour le job Agent
USE [UserControlled];
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.objects
    WHERE object_id = OBJECT_ID(N'[dbo].[UserControlled]') AND type = N'U'
)
BEGIN
    CREATE TABLE [dbo].[UserControlled] (
        [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [CreatedDate] DATETIME2(0) NOT NULL CONSTRAINT DF_UserControlled_CreatedDate DEFAULT (SYSDATETIME()),
        [Status] NVARCHAR(50) NOT NULL CONSTRAINT DF_UserControlled_Status DEFAULT (N'Active')
    );

    CREATE INDEX IX_UserControlled_CreatedDate ON [dbo].[UserControlled] ([CreatedDate]);
END
GO
