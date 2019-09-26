USE [Odiss_VW_FactoryInvoices]
GO

/****** Object:  View [dbo].[vwVinReport]    Script Date: 02/13/2019 3:17:03 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE VIEW [dbo].[vwVinReport]
AS
 select D.Model + ' | ' + D.VIN + ' | ' + Cast(D.Amount as varchar) as MODELVIN, D.Vin, G.InvoiceNumber,D.Model,D.Amount as Total, G.GUID, G.I_CaptureDate, G.EffectiveDate, G.InvoiceDate from tblGroup G Inner join tblGroupDetails D ON G.GUID=d.tblGroup_GUID 



GO


