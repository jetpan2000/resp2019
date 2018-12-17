USE [Octacom.OICS]
GO
/****** Object:  StoredProcedure [dbo].[GetAribaExceptionBatchType]    Script Date: 11/28/2018 12:50:23 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
--  [GetAribaExceptionBatchType]  'OPG_AP.20181015.000002.61XML1457517715131737'
-- =============================================
create PROCEDURE [dbo].[GetAribaExceptionBatchType] 
	@primaryFileName varchar(200)  -- 'OPG_AP.20181015.000002.61XML1457517715131737'
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    Select top 1 OP.PrimaryFileName collate DATABASE_DEFAULT As AribaXMLFILE,
OP.FinalizationTime As FinalizationTime,
OP.OriginalFileName collate DATABASE_DEFAULT As DCOutputXMLFile,
OU.BATCH_TYPE Collate Database_default as BatchType
from [Octacom.OICS].[dbo].[OICSConnectorProcess] OP
Inner join
[OPG_PO_IMPORT].[dbo].[vw_Report] OU
on
OP.OriginalFileName collate DATABASE_DEFAULT = OU.XML_FILENAME
Where OP.PrimaryFileName=@primaryFileName;

END
