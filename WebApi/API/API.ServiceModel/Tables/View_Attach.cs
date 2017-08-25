using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace WebApi.ServiceModel.Tables
{
				public class View_Attach
				{
								public string JobNo { get; set; }
								public string FileName { get; set; }
								public string Extension { get; set; }
								public class FileInfos
								{
												public string FileName { get; set; }
												public string Extension { get; set; }
								}
								public List<FileInfos> Files { get; set; }
    }
}
