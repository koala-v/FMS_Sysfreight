using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WebApi.ServiceModel;
using WebApi.ServiceModel.Freight;
using WebApi.ServiceModel.Utils;

namespace WebApi.ServiceInterface.Utils
{
				public class Qiniu
				{
								public string Q_UpToken(QiniuToken request, QiniuToken_Logic logic)
								{
												return logic.GetUpToken(request);
								}
				}
}

