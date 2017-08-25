using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Qiniu.Conf;
using Qiniu.RS;
using ServiceStack;
using ServiceStack.OrmLite;
using ServiceStack.ServiceHost;

namespace WebApi.ServiceModel.Utils
{
				[Route("/qiniu/uptoken", "Get")]
				public class QiniuToken : IReturn<CommonResponse>
				{
				}
				public class QiniuToken_Logic
				{
								public string GetUpToken(QiniuToken request)
								{
												Qiniu.Conf.Config.ACCESS_KEY = "88_zth5M0BXGRvLHBJM59I3yTJbjzRAFhVZqGkKz";
												Qiniu.Conf.Config.SECRET_KEY = "s8HnQb5fSM0vDE7kTt1Ab42nPR9lkPkuSiMDtGI-";
												string bucket = "sysmagic";
												PutPolicy put = new PutPolicy(bucket, 3600);
												string upToken = put.Token();
												return upToken;
								}
				}
}
