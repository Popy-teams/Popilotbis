USE [UserControlled];
GO

IF OBJECT_ID(N'dbo.usp_UserControlled_Insert', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_UserControlled_Insert;
GO

CREATE PROCEDURE dbo.usp_UserControlled_Insert
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.UserControlled (CreatedDate, Status)
    VALUES (SYSDATETIME(), N'Active');

    SELECT @@ROWCOUNT AS RowsInserted;
END
GO

IF DATABASE_PRINCIPAL_ID(N'user-controlled-sql') IS NOT NULL
BEGIN
    GRANT EXECUTE ON dbo.usp_UserControlled_Insert TO [user-controlled-sql];
END
GO
