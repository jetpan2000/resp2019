USE [Odiss_VW_Base]
GO

create VIEW [dbo].[vw_Users]
AS
SELECT [ID]
      ,[UserName]
      ,[Password]
      ,[Type]
      ,[FirstName]
      ,[LastName]
      ,[PhoneOffice]
      ,[PhoneMobile]
      ,[Email]
      ,[Company]
      ,[Expire]
      ,[Permissions]
      ,[CreatedDate]
      ,[ChangedDate]
      ,[Active]
      ,[LockAccessUntil]
      ,[WrongAccessAttempts]
      ,[ChangePassword],
	  (select top 1 Recorded from [Audit] with (nolock) where userName=U.UserName) as LastSignInDate,
	    STUFF((SELECT ' | ' + cast(name as varchar)  from Applications A inner join UsersApplications UA on A.ID=UA.IDApplication where IDUser=U.ID
  FOR XML PATH('')) ,1,1,'') AS AppNames,
     STUFF((SELECT ' | ' + UD.FieldValue  from UsersDocuments UD inner join Users U0 on U0.ID=UD.IDUser where IDApplication='BD8D8DFC-99B3-45A2-9D8D-94BB7C0BDB76' 
		and UD.IDUser=U.ID
  FOR XML PATH('')) ,1,1,'') AS APDocuments,
     STUFF((SELECT ' | ' + UD.FieldValue  from UsersDocuments UD inner join Users U0 on U0.ID=UD.IDUser where IDApplication='5E295B23-8075-40FD-8339-597056FAFF08' 
		and UD.IDUser=U.ID
  FOR XML PATH('')) ,1,1,'') AS APAffiliates,
  STUFF((SELECT ' | ' + UD.FieldValue  from UsersDocuments UD inner join Users U0 on U0.ID=UD.IDUser where IDApplication='3487F36B-2A7D-4AA5-B9BD-EA5D08234A19' 
		and UD.IDUser=U.ID
  FOR XML PATH('')) ,1,1,'') AS ARAffiliates,

    STUFF((SELECT ' | ' + UD.FieldValue  from UsersDocuments UD inner join Users U0 on U0.ID=UD.IDUser where IDApplication='AA30D6AC-C6AA-4A73-AA3D-4141067BD27C' 
		and UD.IDUser=U.ID
  FOR XML PATH('')) ,1,1,'') AS AssetDocuments,

      STUFF((SELECT ' | ' + UD.FieldValue  from UsersDocuments UD inner join Users U0 on U0.ID=UD.IDUser where IDApplication='5DA1FBE4-7D50-425E-8952-D17CC45484F6' 
		and UD.IDUser=U.ID
  FOR XML PATH('')) ,1,1,'') AS DealerFiles,

   STUFF((SELECT ' | ' + UD.FieldValue  from UsersDocuments UD inner join Users U0 on U0.ID=UD.IDUser where IDApplication='17D8B98D-53BC-4467-BD94-C4FCB12BF723' 
		and UD.IDUser=U.ID
  FOR XML PATH('')) ,1,1,'') AS ExpenseReports,

    STUFF((SELECT ' | ' + UD.FieldValue  from UsersDocuments UD inner join Users U0 on U0.ID=UD.IDUser where IDApplication='3B958656-8829-4B82-86B9-DB9965389F09' 
		and UD.IDUser=U.ID
  FOR XML PATH('')) ,1,1,'') AS FactoryInvoices,

    STUFF((SELECT ' | ' + UD.FieldValue  from UsersDocuments UD inner join Users U0 on U0.ID=UD.IDUser where IDApplication='62C6C86C-95A7-4FCE-B0F6-FB0D2D75E292' 
		and UD.IDUser=U.ID
  FOR XML PATH('')) ,1,1,'') AS JournalEntries,

    STUFF((SELECT ' | ' + UD.FieldValue  from UsersDocuments UD inner join Users U0 on U0.ID=UD.IDUser where IDApplication='F4873C29-4212-4A9E-AB02-7368CBCCA315' 
		and UD.IDUser=U.ID
  FOR XML PATH('')) ,1,1,'') AS LeaseFiles,

    STUFF((SELECT ' | ' + UD.FieldValue  from UsersDocuments UD inner join Users U0 on U0.ID=UD.IDUser where IDApplication='3488D002-2B42-447A-8D89-69BF8CE165BA' 
		and UD.IDUser=U.ID
  FOR XML PATH('')) ,1,1,'') AS MiscellaneousFiles,

      STUFF((SELECT ' | ' + UD.FieldValue  from UsersDocuments UD inner join Users U0 on U0.ID=UD.IDUser where IDApplication='87EA2F1A-8A9C-4B7F-9392-96049317439B' 
		and UD.IDUser=U.ID
  FOR XML PATH('')) ,1,1,'') AS VendorForms,

      STUFF((SELECT ' | ' + UD.FieldValue  from UsersDocuments UD inner join Users U0 on U0.ID=UD.IDUser where IDApplication='8E76B1B2-90F5-4275-942D-7E581B90CC8E' 
		and UD.IDUser=U.ID
  FOR XML PATH('')) ,1,1,'') AS VoidCheques

  FROM  [Users] as U 


GO



