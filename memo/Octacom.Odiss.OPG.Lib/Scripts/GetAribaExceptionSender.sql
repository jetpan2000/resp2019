USE [Octacom.OICS]
GO
/****** Object:  StoredProcedure [dbo].[GetAribaExceptionSender]    Script Date: 12/11/2018 1:30:35 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

 --  [GetAribaExceptionSender]  'OPG_AP.20181001.000000.09XML1444570947882254'    --
 -- [GetAribaExceptionSender]  'OPG_AP.20181112.000001.19XML1480844455713905'
  

create PROCEDURE [dbo].[GetAribaExceptionSender]
	@primaryFileName varchar(200)  -- 'OPG_AP.20181001.000000.09XML1444570947882254'
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	Select op.OriginalFileName, OP.PrimaryFileName collate DATABASE_DEFAULT As AribaXMLFILE,
OP.OriginalFileName collate DATABASE_DEFAULT As DCOutputXMLFile,
OU.BATCH_TYPE Collate Database_default as BatchType,
OU.SourceImage Collate Database_default as SourceImage,
OE.Sender Collate Database_default as Sender,
OE.RecievedDate ReceivedDate,
OE.FileName Collate Database_default as Filename
from [Octacom.OICS].[dbo].[OICSConnectorProcess] OP
Inner join
[OPG_PO_IMPORT].[dbo].[tbl_OPG_LOG] OU
on
OP.OriginalFileName collate DATABASE_DEFAULT = OU.XML_FILENAME
Inner Join
[OPG_EMAIL].[dbo].[vw_Email] OE
ON rtrim(substring(OU.SourceImage,1,15)) collate DATABASE_DEFAULT = rtrim(OE.ProcessFileName) 
Where OP.PrimaryFileName=@primaryFileName
END
