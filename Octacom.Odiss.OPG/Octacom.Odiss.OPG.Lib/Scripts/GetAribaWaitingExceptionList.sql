USE [Octacom.OICS]
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
 --  GetAribaWaitingExceptionList '2018-1-1', '2018-11-20'
-- =============================================
create PROCEDURE GetAribaWaitingExceptionList
(	@startDate datetime,
	@endDate datetime)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	
	select * from OICSConnectorProcess with (nolock) where HasErrors = 1 and Datediff(d, @startDate, FinalizationTime)>=0 
		and DATEDIFF(d, FinalizationTime, @endDate)>=0 and OICSConnectorProcessId not in (select OICSConnectorProcessId from AribaProcessedException with (nolock));
END
GO
 