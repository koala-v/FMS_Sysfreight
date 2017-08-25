using System;
using System.Collections;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Text;
using ServiceStack;
using ServiceStack.Common.Web;
using ServiceStack.OrmLite;
using ServiceStack.ServiceHost;
using WebApi.ServiceModel.Tables;
using WebApi.ServiceModel.Utils;

namespace WebApi.ServiceModel.Freight
{
				[Route("/freight/upload/img", "Post")]						//img?JobNo= & FileName= & Extension= & Base64=
				[Route("/freight/upload/img", "Options")]			//img?FileName= & Extension=
				public class UploadFile : IReturn<CommonResponse>
				{
								public string JobNo { get; set; }
								public string FileName { get; set; }
								public string Extension { get; set; }
								public string Base64 { get; set; }
								public Stream RequestStream { get; set; }
				}
				public class UploadFile_Logic
				{
								public IDbConnectionFactory DbConnectionFactory { get; set; }
								public int upload(UploadFile request)
								{
												int i = -1;
												string filePath = "";
												if (!string.IsNullOrEmpty(request.JobNo))
												{																
																try
																{
																				using (var db = DbConnectionFactory.OpenDbConnection())
																				{
																								string strSQL = "Select Top 1 DocumentPath From Saco1";
																								List<Saco1> saco1 = db.Select<Saco1>(strSQL);
																								if (saco1.Count > 0)
																								{
																												filePath = saco1[0].DocumentPath + "\\Jmjm1\\" + request.JobNo;
																								}
																				}
																				if (!Directory.Exists(filePath))
																				{
																								Directory.CreateDirectory(filePath);
																				}
																				if (string.IsNullOrEmpty(request.FileName))
																				{
																								//request.FileName = DateTime.Now.ToString("YYYY-MM-DD-HH-mm-ss") + ".jpg";
																				}
																				string resultFile = Path.Combine(filePath, request.FileName);
																				if (File.Exists(resultFile))
																				{
																								File.Delete(resultFile);
																				}		
																				if (string.IsNullOrEmpty(request.Base64))
																				{
																								using (FileStream file = File.Create(resultFile))
																								{
																												request.RequestStream.Copy(file);
																												i = 0;
																								}
																				}
																				else
																				{
																								string strBase64 = request.Base64;
																								string[] base64s = strBase64.Split(',');
																								if (base64s.Length > 0)
																								{
																												byte[] arr = Convert.FromBase64String(base64s[1]);
																												using (MemoryStream ms = new MemoryStream(arr))
																												{
																																Bitmap bmp = new Bitmap(ms);
																																bmp.Save(resultFile, System.Drawing.Imaging.ImageFormat.Jpeg);
																																//bmp.Save(txtFileName + ".bmp", ImageFormat.Bmp);
																																//bmp.Save(txtFileName + ".gif", ImageFormat.Gif);
																																//bmp.Save(txtFileName + ".png", ImageFormat.Png);
																																i = 0;
																												}				
																								}														
																				}																				
																				if (i.Equals(0))
																				{
																								using (var db = DbConnectionFactory.OpenDbConnection())
																								{
																												i = db.Update<Jmjm1>(
																																new
																																{
																																				AttachmentFlag = "Y"
																																},
																																p => p.JobNo == request.JobNo
																												);
																								}
																				}
																}															
																catch { throw; }
												}
												return i;
								}
				}
}
