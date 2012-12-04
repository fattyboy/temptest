var triggerData = [ 
 [[1527.3506473629427,1476.4389591175113],[1578.262335608374,1476.4389591175113],[1578.262335608374,1527.3506473629427],[1541.4927829866738,1518.8653659887043]] , 
[[101.82337649086286,50.91168824543143],[203.6467529817257,50.91168824543143],[203.6467529817257,152.73506473629428],[101.82337649086286,152.73506473629428]] , 
[[356.38181771802,1069.1454531540599],[407.2935059634514,1069.1454531540599],[407.2935059634514,1120.0571413994915],[356.38181771802,1120.0571413994915]] , 
[[1425.52727087208,101.82337649086286],[1476.4389591175113,101.82337649086286],[1476.4389591175113,152.73506473629428],[1425.52727087208,152.73506473629428]] 
 ] ;
var enemyData = [ 
 [[263.0437226013957,192.33304448274095],[552.9575028878802,196.57568516986024],[634.9818895055197,264.4579361637688],[647.7098115668775,511.94530957906045],[301.2274887854693,497.8031739553295],[224.85995641732214,415.77878733768995]] , 
[[1497.6521625531077,866.9129137347073],[1465.1252506185265,1073.3880938411792],[1271.3779925734125,1052.1748904055828],[1226.1231585774735,637.8103166302659],[1308.147545195113,589.7270555095806],[1442.497833620557,584.0702012600883]] , 
[[958.8367952889585,1049.3464632808366],[999.8489885977783,1467.9536777432727],[882.4692629208114,1506.1374439273463],[789.131167804187,1448.1546878700494],[705.6925676241744,1303.9049045079937],[712.76363543604,1076.2165209659254],[855.5992052357226,933.3809511662428]] , 
[[152.73506473629428,1312.3901858822323],[159.80613254815975,981.464212286928],[370.52395334175094,861.2560594852149],[531.7442994522838,981.464212286928],[565.685424949238,1134.1992770232223],[673.1656556895933,1165.3119753954304],[670.3372285648471,1217.637877203235],[680.2367235014588,1271.3779925734125],[554.3717164502533,1277.034846822905],[551.5432893255071,1343.5028842544405],[630.7392488184005,1508.9658710520926],[159.80613254815975,1511.7942981768388]] , 
[[1138.4419177103416,439.8204178980326],[1115.8145007123721,179.60512242138307],[1320.8754672564708,140.00714267493643],[1047.9322497184635,131.52186130069785],[745.2905473706212,147.0782104868019],[1055.003317530329,195.16147160748713],[1060.6601717798214,596.7981233214462],[838.6286424872454,626.4966081312812],[1104.5007922133873,692.9646455628166],[1210.5668093913694,510.53109601668734]] , 
[[1323.703894381217,1170.9688296449228],[1323.703894381217,1527.3506473629427],[1069.1454531540599,1527.3506473629427],[1069.1454531540599,1170.9688296449228]] 
 ] ;
var blockData = [ 
 [[0,1578.262335608374],[1629.1740238538057,1578.262335608374],[1629.1740238538057,1629.1740238538057],[0,1629.1740238538057]] , 
[[1578.262335608374,0],[1629.1740238538057,0],[1629.1740238538057,1578.262335608374],[1578.262335608374,1578.262335608374]] , 
[[0,0],[50.91168824543143,0],[50.91168824543143,1578.262335608374],[0,1578.262335608374]] , 
[[50.91168824543143,0],[1578.262335608374,0],[1578.262335608374,50.91168824543143],[50.91168824543143,50.91168824543143]] , 
[[305.47012947258855,254.55844122715712],[560.0285706997457,254.55844122715712],[560.0285706997457,407.2935059634514],[305.47012947258855,407.2935059634514]] , 
[[763.6753236814714,254.55844122715712],[967.3220766631971,254.55844122715712],[967.3220766631971,305.47012947258855],[763.6753236814714,305.47012947258855]] , 
[[967.3220766631971,254.55844122715712],[1018.2337649086285,254.55844122715712],[1018.2337649086285,509.11688245431424],[967.3220766631971,509.11688245431424]] , 
[[763.6753236814714,458.2051942088828],[967.3220766631971,458.2051942088828],[967.3220766631971,509.11688245431424],[763.6753236814714,509.11688245431424]] , 
[[1170.9688296449228,203.6467529817257],[1374.6155826266486,203.6467529817257],[1374.6155826266486,356.38181771802],[1170.9688296449228,356.38181771802]] , 
[[203.6467529817257,610.9402589451771],[305.47012947258855,610.9402589451771],[305.47012947258855,712.76363543604],[203.6467529817257,712.76363543604]] , 
[[509.11688245431424,610.9402589451771],[610.9402589451771,610.9402589451771],[610.9402589451771,865.4987001723342],[509.11688245431424,865.4987001723342]] , 
[[610.9402589451771,712.76363543604],[763.6753236814714,712.76363543604],[763.6753236814714,814.5870119269028],[610.9402589451771,814.5870119269028]] , 
[[967.3220766631971,763.6753236814714],[1170.9688296449228,763.6753236814714],[1170.9688296449228,916.4103884177656],[967.3220766631971,916.4103884177656]] , 
[[1323.703894381217,661.8519471906085],[1425.52727087208,661.8519471906085],[1425.52727087208,967.3220766631971],[1323.703894381217,967.3220766631971]] , 
[[203.6467529817257,1018.2337649086285],[305.47012947258855,1018.2337649086285],[305.47012947258855,1425.52727087208],[254.55844122715712,1425.52727087208],[203.6467529817257,1425.52727087208]] , 
[[305.47012947258855,1018.2337649086285],[458.2051942088828,1018.2337649086285],[458.2051942088828,1069.1454531540599],[305.47012947258855,1069.1454531540599]] , 
[[458.2051942088828,1018.2337649086285],[509.11688245431424,1018.2337649086285],[509.11688245431424,1170.9688296449228],[458.2051942088828,1170.9688296449228]] , 
[[305.47012947258855,1374.6155826266486],[458.2051942088828,1374.6155826266486],[458.2051942088828,1425.52727087208],[305.47012947258855,1425.52727087208]] , 
[[458.2051942088828,1323.703894381217],[509.11688245431424,1323.703894381217],[509.11688245431424,1425.52727087208],[458.2051942088828,1425.52727087208]] , 
[[814.5870119269028,1069.1454531540599],[916.4103884177656,1069.1454531540599],[916.4103884177656,1323.703894381217],[814.5870119269028,1323.703894381217]] , 
[[1120.0571413994915,1221.8805178903542],[1272.7922061357856,1221.8805178903542],[1272.7922061357856,1323.703894381217],[1120.0571413994915,1323.703894381217]] , 
[[1170.9688296449228,1323.703894381217],[1272.7922061357856,1323.703894381217],[1272.7922061357856,1476.4389591175113],[1170.9688296449228,1476.4389591175113]] , 
[[1476.4389591175113,1374.6155826266486],[1578.262335608374,1374.6155826266486],[1578.262335608374,1476.4389591175113],[1476.4389591175113,1476.4389591175113]] 
 ] ;
var mapData = [ 
35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,
35,28,34,34,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,35,
35,27,33,33,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,35,
35,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,35,
35,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,35,35,35,35,27,27,27,27,35,
35,27,27,27,27,27,35,35,35,35,35,27,27,27,27,35,35,35,35,35,27,27,27,35,35,35,35,27,27,27,27,35,
35,27,27,27,27,27,35,35,35,35,35,27,27,27,27,28,28,28,28,35,27,27,27,35,35,35,35,27,27,27,27,35,
35,27,27,27,27,27,35,35,35,35,35,27,27,27,27,27,27,27,27,35,27,27,27,28,28,28,28,27,27,27,27,35,
35,27,27,27,27,27,28,28,28,28,28,27,27,27,27,27,27,27,27,35,27,27,27,27,27,27,27,27,27,27,27,35,
35,27,27,27,27,27,27,27,27,27,27,27,27,27,27,35,35,35,35,35,27,27,27,27,27,27,27,27,27,27,27,35,
35,27,27,27,27,27,27,27,27,27,27,27,27,27,27,28,28,28,28,28,27,27,27,27,27,27,27,27,27,27,27,35,
35,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,35,
35,27,27,27,35,35,27,27,27,27,35,35,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,35,
35,27,27,27,35,35,27,27,27,27,35,35,27,27,27,27,27,27,27,27,27,27,27,27,27,27,35,35,27,27,27,35,
35,27,27,27,28,28,27,27,27,27,35,35,35,35,35,27,27,27,27,27,27,27,27,27,27,27,35,35,27,27,27,35,
35,27,27,27,27,27,27,27,27,27,35,35,35,35,35,27,27,27,27,35,35,35,35,27,27,27,35,35,27,27,27,35,
35,27,27,27,27,27,27,27,27,27,35,35,28,28,28,27,27,27,27,35,35,35,35,27,27,27,35,35,27,27,27,35,
35,27,27,27,27,27,27,27,27,27,28,28,27,27,27,27,27,27,27,35,35,35,35,27,27,27,35,35,27,27,27,35,
35,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,28,28,28,28,27,27,27,35,35,27,27,27,35,
35,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,28,28,27,27,27,35,
35,27,27,27,35,35,35,35,35,35,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,35,
35,27,27,27,35,35,28,28,28,35,27,27,27,27,27,27,35,35,27,27,27,27,27,27,27,27,27,27,27,27,27,35,
35,27,27,27,35,35,27,27,27,35,27,27,27,27,27,27,35,35,27,27,27,27,27,27,27,27,27,27,27,27,27,35,
35,27,27,27,35,35,27,27,27,28,27,27,27,27,27,27,35,35,27,27,27,27,27,27,27,27,27,27,27,27,27,35,
35,27,27,27,35,35,27,27,27,27,27,27,27,27,27,27,35,35,27,27,27,27,35,35,35,27,27,27,27,27,27,35,
35,27,27,27,35,35,27,27,27,27,27,27,27,27,27,27,35,35,27,27,27,27,35,35,35,27,27,27,27,27,27,35,
35,27,27,27,35,35,27,27,27,35,27,27,27,27,27,27,28,28,27,27,27,27,27,35,35,27,27,27,27,27,27,35,
35,27,27,27,35,35,35,35,35,35,27,27,27,27,27,27,27,27,27,27,27,27,27,35,35,27,27,27,27,35,35,35,
35,27,27,27,28,28,28,28,28,28,27,27,27,27,27,27,27,27,27,27,27,27,27,35,35,27,27,27,27,35,35,35,
35,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,28,28,27,27,27,27,26,26,35,
35,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,25,25,35,
35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35,35
 ]; 