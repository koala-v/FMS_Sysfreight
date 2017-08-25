using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using ServiceStack;
using ServiceStack.Common.Web;
using ServiceStack.OrmLite;
using ServiceStack.ServiceHost;
using WebApi.ServiceModel.Tables;

namespace WebApi.ServiceModel.Freight
{
				[Route("/freight/view/file", "Get")]								// file? eDoc=1/0 & Type=pdf/img/txt & FolderName= & Key= & FileName=
				[Route("/freight/view/file/list", "Get")]			// list? eDoc=1/0 & FolderName=
				public class ViewFile : IReturn<CommonResponse>
				{
								public string eDoc { get; set; }
								public string Type { get; set; }
								public string FolderName { get; set; }
								public string Key { get; set; }
								public string FileName { get; set; }
				}
				public class ViewFile_Logic
				{
								public IDbConnectionFactory DbConnectionFactory { get; set; }
								public struct eDocAttachs
								{
												public string Key;
												public class FileInfos
												{
																public string FileName { get; set; }
																public string Extension { get; set; }
												}
												public List<FileInfos> Files { get; set; }
								}
								private List<eDocAttachs> attachs = null;
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
																												eDocAttachs attach = new eDocAttachs();
																												attach.Key = diA[i].Name;
																												attach.Files = new List<eDocAttachs.FileInfos>();
																												FileInfo[] arrFi = diA[i].GetFiles();
																												if (arrFi.Length > 0)
																												{
																																SortAsFileCreationTime(ref arrFi);
																																foreach (FileInfo j in arrFi)
																																{
																																				eDocAttachs.FileInfos fi = new eDocAttachs.FileInfos();
																																				fi.FileName = j.Name;
																																				fi.Extension = j.Extension;
																																				attach.Files.Add(fi);
																																}
																												}
																												else
																												{
																																eDocAttachs.FileInfos fi = new eDocAttachs.FileInfos();
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
																								eDocAttachs attach = new eDocAttachs();
																								attach.Key = di.Name;
																								attach.Files = new List<eDocAttachs.FileInfos>();
																								FileInfo[] arrFi = di.GetFiles();
																								if (arrFi.Length > 0)
																								{
																												SortAsFileCreationTime(ref arrFi);
																												foreach (FileInfo j in arrFi)
																												{
																																eDocAttachs.FileInfos fi = new eDocAttachs.FileInfos();
																																fi.FileName = j.Name;
																																fi.Extension = j.Extension;
																																attach.Files.Add(fi);
																												}
																								}
																								else
																								{
																												eDocAttachs.FileInfos fi = new eDocAttachs.FileInfos();
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
								public object Get_List(ViewFile request)
								{
												object Result = null;
												attachs = new List<eDocAttachs>();
												string strPath = "";
												string eDocumentPath = "";
												try
												{
																using (var db = DbConnectionFactory.OpenDbConnection())
																{
																				string strSQL = "Select Top 1 eDocumentPath From Saco1";
																				List<Saco1> saco1 = db.Select<Saco1>(strSQL);
																				if (saco1.Count > 0)
																				{
																								eDocumentPath = saco1[0].eDocumentPath;
																				}
																}
																if (!string.IsNullOrEmpty(request.FolderName))
																{
																				strPath = eDocumentPath + "\\" + request.FolderName + "\\eDoc";
																				GetAllDirList(strPath);
																}
																if (attachs.Count > 0)
																{
																				string strKeys = "";
																				for (int i = 0; i <= attachs.Count - 1; i++)
																				{
																								strKeys = strKeys + "'" + attachs[i].Key + "',";
																				}
																				if (strKeys.LastIndexOf(",").Equals(strKeys.Length-1)){
																								strKeys = strKeys.Substring(0,strKeys.Length-1);
																				}
																				using (var db = DbConnectionFactory.OpenDbConnection())
																				{
																								string strSQL = "";
																								switch(request.FolderName.ToLower())
																								{
																												case "ivcr1":
																																strSQL = "Select TrxNo,InvoiceNo,InvoiceDate,CustomerName,InvoiceAmt From Ivcr1 Where TrxNo in (" + strKeys + ")";
																																List<ViewPDF_Ivcr> rIvcr = db.Select<ViewPDF_Ivcr>(strSQL);
																																foreach (ViewPDF_Ivcr vi in rIvcr)
																																{
																																				vi.Files = new List<ViewPDF_Ivcr.FileInfos>();
																																				for (int i = 0; i <= attachs.Count - 1; i++)
																																				{
																																								if (attachs[i].Key.Equals(vi.TrxNo.ToString()))
																																								{
																																												foreach (eDocAttachs.FileInfos j in attachs[i].Files)
																																												{
																																																ViewPDF_Ivcr.FileInfos fi = new ViewPDF_Ivcr.FileInfos();
																																																fi.FileName = j.FileName;
																																																fi.Extension = j.Extension;
																																																vi.Files.Add(fi);
																																												}
																																												break;
																																								}
																																				}
																																}
																																Result = rIvcr;
																																break;
																												case "jmjm1":
																																strSQL = "Select JobNo,JobDate,CustomerName,InvoiceLocalAmt From Jmjm1 Where JobNo in (" + strKeys + ")";
																																List<ViewPDF_Jmjm> rJmjm = db.Select<ViewPDF_Jmjm>(strSQL);
																																foreach (ViewPDF_Jmjm vi in rJmjm)
																																{
																																				vi.Files = new List<ViewPDF_Jmjm.FileInfos>();
																																				for (int i = 0; i <= attachs.Count - 1; i++)
																																				{
																																								if (attachs[i].Key.Equals(vi.JobNo.ToString()))
																																								{
																																												foreach (eDocAttachs.FileInfos j in attachs[i].Files)
																																												{
																																																ViewPDF_Jmjm.FileInfos fi = new ViewPDF_Jmjm.FileInfos();
																																																fi.FileName = j.FileName;
																																																fi.Extension = j.Extension;
																																																vi.Files.Add(fi);
																																												}
																																												break;
																																								}
																																				}
																																}
																																Result = rJmjm;
																																break;
																												case "slcu1":
																																strSQL = "Select TrxNo,InvoiceNo,InvoiceDate,CustomerName,InvoiceAmt From Ivcr1 Where TrxNo in (" + strKeys + ")";
																																List<ViewPDF_Ivcr> rSlcu = db.Select<ViewPDF_Ivcr>(strSQL);
																																foreach (ViewPDF_Ivcr vi in rSlcu)
																																{
																																				vi.Files = new List<ViewPDF_Ivcr.FileInfos>();
																																				for (int i = 0; i <= attachs.Count - 1; i++)
																																				{
																																								if (attachs[i].Key.Equals(vi.TrxNo.ToString()))
																																								{
																																												foreach (eDocAttachs.FileInfos j in attachs[i].Files)
																																												{
																																																ViewPDF_Ivcr.FileInfos fi = new ViewPDF_Ivcr.FileInfos();
																																																fi.FileName = j.FileName;
																																																fi.Extension = j.Extension;
																																																vi.Files.Add(fi);
																																												}
																																												break;
																																								}
																																				}
																																}
																																Result = rSlcu;
																																break;
																								}
																				}																				
																}																
												}
												catch { throw; }
												return Result;
								}
								public byte[] Get_File(ViewFile request, bool blnEDoc)
								{
												byte[] Result = null;
												string strPath = "";
												string DocumentPath = "";
												string eDocumentPath = "";
												try
												{
																using (var db = DbConnectionFactory.OpenDbConnection())
																{
																				string strSQL = "Select Top 1 DocumentPath,eDocumentPath From Saco1";
																				List<Saco1> saco1 = db.Select<Saco1>(strSQL);
																				DocumentPath = saco1[0].DocumentPath;
																				eDocumentPath = saco1[0].eDocumentPath;
																				if (blnEDoc)
																				{
																								strPath = eDocumentPath + "\\" + request.FolderName + "\\eDoc\\" + request.Key + "\\" + request.FileName;
																				}
																				else
																				{
																								strPath = DocumentPath + "\\" + request.FolderName + "\\" + request.Key + "\\" + request.FileName;
																				}
																				using (FileStream fsRead = new FileStream(strPath, FileMode.Open))
																				{
																								int fsLen = (int)fsRead.Length;
																								byte[] heByte = new byte[fsLen];
																								int r = fsRead.Read(heByte, 0, heByte.Length);
																								Result = heByte;
																				}
																}
												}
												catch { throw; }
												return Result;
								}								
				}
}
