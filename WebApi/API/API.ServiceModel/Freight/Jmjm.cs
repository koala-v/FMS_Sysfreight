using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data;
using ServiceStack;
using ServiceStack.ServiceHost;
using ServiceStack.OrmLite;
using WebApi.ServiceModel.Tables;
using System.IO;

namespace WebApi.ServiceModel.Freight
{
				[Route("/freight/jmjm1/doc", "Get")]				// doc?JobNo=
				[Route("/freight/jmjm1/attach", "Get")]	// attach?JobNo=
    public class Jmjm : IReturn<CommonResponse>
    {
        public string JobNo { get; set; }
    }
				public class Jmjm_Logic
    {
        public IDbConnectionFactory DbConnectionFactory { get; set; }
								public struct JobNoAttachs
								{
												public string Key;
												public class FileInfos
												{
																public string FileName { get; set; }
																public string Extension { get; set; }
												}
												public List<FileInfos> Files { get; set; }
								}
								private List<JobNoAttachs> attachs = null;
								private void SortAsFileCreationTime(ref FileInfo[] arrFi)
								{
												Array.Sort<FileInfo>(arrFi, delegate(FileInfo x, FileInfo y) { return y.CreationTime.CompareTo(x.CreationTime); });
								}
								public void GetAllDirList(string strPath)
								{
												try
												{
																if (Directory.Exists(strPath))
																{
																				DirectoryInfo di = new DirectoryInfo(strPath);
																				DirectoryInfo[] diA = di.GetDirectories();
																				if (diA.Length > 0)
																				{
																								for (int i = 0; i <= diA.Length - 1; i++)
																								{
																												JobNoAttachs attach = new JobNoAttachs();
																												attach.Key = diA[i].Name;
																												attach.Files = new List<JobNoAttachs.FileInfos>();
																												FileInfo[] arrFi = diA[i].GetFiles();
																												if (arrFi.Length > 0)
																												{
																																SortAsFileCreationTime(ref arrFi);
																																foreach (FileInfo j in arrFi)
																																{
																																				JobNoAttachs.FileInfos fi = new JobNoAttachs.FileInfos();
																																				fi.FileName = j.Name;
																																				fi.Extension = j.Extension;
																																				attach.Files.Add(fi);
																																}
																												}
																												else
																												{
																																JobNoAttachs.FileInfos fi = new JobNoAttachs.FileInfos();
																																fi.FileName = "";
																																fi.Extension = "";
																																attach.Files.Add(fi);
																												}
																												attachs.Add(attach);
																												GetAllDirList(diA[i].FullName);
																								}
																				}
																				else
																				{
																								JobNoAttachs attach = new JobNoAttachs();
																								attach.Key = di.Name;
																								attach.Files = new List<JobNoAttachs.FileInfos>();
																								FileInfo[] arrFi = di.GetFiles();
																								if (arrFi.Length > 0)
																								{
																												SortAsFileCreationTime(ref arrFi);
																												foreach (FileInfo j in arrFi)
																												{
																																JobNoAttachs.FileInfos fi = new JobNoAttachs.FileInfos();
																																fi.FileName = j.Name;
																																fi.Extension = j.Extension;
																																attach.Files.Add(fi);
																												}
																								}
																								else
																								{
																												JobNoAttachs.FileInfos fi = new JobNoAttachs.FileInfos();
																												fi.FileName = "";
																												fi.Extension = "";
																												attach.Files.Add(fi);
																								}
																								attachs.Add(attach);
																				}																				
																}
												}
												catch { throw; }
								}
								public object Get_Jmjm1_Attach_List(Jmjm request)
								{
												object Result = null;
												attachs = new List<JobNoAttachs>();
												string strPath = "";
												string DocumentPath = "";
												try
												{
																using (var db = DbConnectionFactory.OpenDbConnection())
																{
																				string strSQL = "Select Top 1 DocumentPath From Saco1";
																				List<Saco1> saco1 = db.Select<Saco1>(strSQL);
																				if (saco1.Count > 0)
																				{
																								DocumentPath = saco1[0].DocumentPath;
																				}
																}
																strPath = DocumentPath + "\\Jmjm1\\" + request.JobNo;
																GetAllDirList(strPath);
																if (attachs.Count > 0)
																{
																				string strKeys = "";
																				for (int i = 0; i <= attachs.Count - 1; i++)
																				{
																								strKeys = strKeys + "'" + attachs[i].Key + "',";
																				}
																				if (strKeys.LastIndexOf(",").Equals(strKeys.Length - 1))
																				{
																								strKeys = strKeys.Substring(0, strKeys.Length - 1);
																				}
																				using (var db = DbConnectionFactory.OpenDbConnection())
																				{
																								string strSQL = "Select JobNo From Jmjm1 Where IsNull(AttachmentFlag,'')='Y' And JobNo in (" + strKeys + ")";
																								List<View_Attach> rJmjm = db.Select<View_Attach>(strSQL);
																								foreach (View_Attach vi in rJmjm)
																								{
																												vi.Files = new List<View_Attach.FileInfos>();
																												for (int i = 0; i <= attachs.Count - 1; i++)
																												{
																																if (attachs[i].Key.Equals(vi.JobNo.ToString()))
																																{
																																				foreach (JobNoAttachs.FileInfos j in attachs[i].Files)
																																				{
																																								View_Attach.FileInfos fi = new View_Attach.FileInfos();
																																								fi.FileName = j.FileName;
																																								fi.Extension = j.Extension;
																																								vi.Files.Add(fi);
																																				}																																				
																																				break;
																																}
																												}
																								}
																								Result = rJmjm;
																				}
																}
												}
												catch { throw; }
												return Result;
								}
								public List<Jmjm1_Doc> Get_Jmjm1_Doc_List(Jmjm request)
        {
												List<Jmjm1_Doc> Result = null;
            try
            {
																using (var db = DbConnectionFactory.OpenDbConnection())
                {
																				string strSQL = "SELECT Top 1 JobNo " +
																								"FROM Jmjm1 Where JobNo='" + request.JobNo + "' And IsNull(StatusCode,'')<>'DEL'";
																				Result = db.Select<Jmjm1_Doc>(strSQL);
                }
            }
            catch { throw; }
            return Result;
        }
    }
}
