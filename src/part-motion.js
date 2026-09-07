// A small set of painted pieces, cut once and posed every frame. Hinge lines stay
// joined as fins fold in projection; body markings follow rigid cross-sections.
// These are authored 2D motion signatures, not measured swimming kinematics.
const clamp=x=>Math.max(0,Math.min(1,x)),TAU=Math.PI*2;
const part=(name,polygon,hinge,fold,sweep,phase=0)=>({name,polygon,hinge,fold,sweep,phase});
const jaw=(polygon,root,open,cavity)=>({name:'jaw',mode:'jaw',polygon,hinge:[root,[root[0]+.01,root[1]]],open,cavity});
const smooth=(a,b,n)=>{const t=clamp((n-a)/(b-a));return t*t*(3-2*t);};
export function lightVisibility(time,{feed=0,flash=0}={}){
 const phase=((time/3.4)%1+1)%1;
 return Math.max(clamp(feed),clamp(flash),1-.96*smooth(.46,.57,phase)*(1-smooth(.77,.90,phase)));
}
export const PART_RIGS={
 s6:{frequency:2.15,scull:.62,underlay:{from:[.468,.245,.159,.21],to:[.468,.402,.159,.291]},parts:[
  part('tail',[[0,.25],[.171,.478],[.171,.591],[0,.84]],[[.169,.489],[.169,.586]],.35,.27,1.4),
  part('pectoral',[[.469,.403],[.526,.433],[.584,.507],[.626,.583],[.607,.655],[.550,.695],[.505,.659],[.478,.553]],[[.621,.584],[.606,.653]],.62,.22,.3),
  part('pelvic',[[.522,.807],[.626,.777],[.618,.927],[.551,1.03],[.445,1.03]],[[.527,.812],[.619,.787]],.38,.14,1.1),
  part('anal',[[.148,.590],[.224,.603],[.264,.732],[.330,.814],[.407,.836],[.366,1.03],[.123,1.03]],[[.218,.603],[.405,.836]],.20,.07,1.5)
 ]},
 s9:{frequency:2.05,scull:.40,spine:{root:.222,front:.78,axis:.49,amplitude:.025,lag:1.7},underlay:{from:[.558,.370,.192,.108],to:[.558,.485,.192,.151]},parts:[
  part('tail',[[0,.14],[.225,.427],[.225,.572],[0,.87]],[[.222,.430],[.222,.567]],.30,.32,1.6),
  part('rear dorsal',[[.275,.408],[.275,.06],[.49,.06],[.497,.281]],[[.295,.387],[.484,.286]],.32,.09,.4),
  part('anal',[[.282,.590],[.428,.643],[.493,.701],[.465,.94],[.252,.94]],[[.294,.594],[.484,.696]],.31,.11,1.4),
  part('pectoral',[[.562,.489],[.628,.494],[.721,.529],[.751,.547],[.730,.623],[.655,.634],[.594,.589]],[[.745,.549],[.724,.616]],.59,.20,.7),
  part('pelvic',[[.618,.717],[.740,.711],[.735,.886],[.577,.974]],[[.622,.720],[.731,.716]],.42,.12,1.2),
  {...part('near barbel',[[.947,.627],[.973,.642],[.967,.789],[.945,.901],[.904,1.02],[.884,1.02],[.930,.872],[.946,.746]],[[.948,.634],[.970,.640]],.40,.35,.2),mode:'barbel'},
  {...part('far barbel',[[.975,.628],[.995,.637],[1.013,.764],[.993,.901],[.955,1.01],[.940,1.01],[.972,.858],[.982,.748]],[[.976,.636],[.994,.640]],.32,-.28,2.1),mode:'barbel'}
 ]},
 s12:{frequency:1.85,scull:.39,spine:{root:.235,front:.80,axis:.52,amplitude:.020,lag:1.8},underlay:{from:[.545,.299,.181,.17],to:[.545,.480,.181,.21]},parts:[
  part('tail',[[0,.11],[.235,.445],[.235,.589],[0,.94]],[[.235,.451],[.235,.580]],.29,.31,1.6),
  part('rear dorsal',[[.270,.426],[.275,.10],[.453,.10],[.453,.313]],[[.286,.416],[.443,.321]],.32,.11,.4),
  part('anal',[[.288,.626],[.385,.688],[.463,.736],[.458,.96],[.250,.96]],[[.294,.633],[.457,.733]],.31,.10,1.5),
  part('pectoral',[[.545,.486],[.606,.493],[.674,.536],[.727,.575],[.713,.636],[.645,.686],[.600,.668],[.569,.596]],[[.720,.575],[.705,.645]],.58,.21,.7),
  part('pelvic',[[.605,.746],[.716,.731],[.728,1.04],[.550,1.04]],[[.611,.748],[.705,.739]],.41,.13,1.3)
 ]},
 s14:{frequency:1.65,scull:.40,spine:{root:.15,front:.74,axis:.50,amplitude:.021,lag:1.9},underlay:{from:[.528,.296,.20,.139],to:[.528,.431,.20,.245]},parts:[
  part('tail',[[0,.13],[.157,.391],[.157,.607],[0,.89]],[[.150,.407],[.150,.594]],.28,.29,1.6),
  part('rear dorsal',[[.203,.389],[.197,.034],[.463,.034],[.455,.174],[.335,.232]],[[.231,.345],[.447,.181]],.26,.09,.35),
  part('anal',[[.238,.618],[.350,.698],[.480,.748],[.462,.96],[.211,.96]],[[.254,.632],[.463,.747]],.29,.09,1.5),
  part('pectoral',[[.528,.433],[.616,.443],[.686,.506],[.724,.554],[.716,.630],[.665,.671],[.597,.635],[.557,.548]],[[.716,.557],[.709,.628]],.61,.22,.65),
  part('pelvic',[[.578,.781],[.714,.747],[.711,.90],[.524,1.04]],[[.582,.783],[.700,.761]],.42,.13,1.2)
 ]},
 s25:{frequency:2.30,scull:.65,underlay:{from:[.589,.262,.191,.144],to:[.589,.416,.191,.294]},parts:[
  part('tail',[[0,.21],[.217,.414],[.217,.587],[0,.81]],[[.214,.421],[.214,.579]],.34,.28,1.4),
  part('pectoral',[[.589,.423],[.656,.449],[.741,.517],[.782,.603],[.742,.656],[.647,.709],[.604,.668]],[[.767,.580],[.752,.645]],.65,.22,.35),
  part('pelvic',[[.628,.829],[.777,.786],[.765,.964],[.548,1.03]],[[.638,.830],[.767,.797]],.36,.13,1.1)
 ]},
 s50:{frequency:1.80,scull:.40,spine:{root:.169,front:.78,axis:.57,amplitude:.022,lag:1.9},underlay:{from:[.49,.321,.232,.156],to:[.49,.47,.232,.27]},parts:[
  part('tail',[[0,.225],[.171,.454],[.171,.612],[0,.85]],[[.169,.467],[.169,.605]],.31,.30,1.5),
  part('rear dorsal',[[.150,.443],[.154,.066],[.40,.066],[.40,.196],[.298,.286],[.223,.439]],[[.224,.427],[.39,.200]],.23,.08,.4),
  part('anal',[[.185,.646],[.270,.755],[.379,.817],[.488,.839],[.458,1.03],[.129,1.03]],[[.205,.655],[.476,.842]],.28,.09,1.4),
  part('pectoral',[[.49,.47],[.580,.502],[.663,.576],[.721,.624],[.701,.698],[.641,.737],[.572,.683],[.522,.583]],[[.714,.626],[.697,.699]],.59,.21,.7),
  part('pelvic',[[.561,.835],[.689,.817],[.69,.94],[.492,1.03]],[[.570,.841],[.678,.827]],.41,.14,1.2)
 ]},
 s51:{frequency:1.90,scull:.37,spine:{root:.225,front:.80,axis:.57,amplitude:.026,lag:1.8},underlay:{from:[.508,.406,.221,.126],to:[.508,.533,.221,.188]},parts:[
  part('tail',[[0,.20],[.232,.473],[.232,.644],[0,.98]],[[.225,.482],[.225,.636]],.30,.32,1.6),
  part('rear dorsal',[[.273,.466],[.266,.15],[.433,.15],[.432,.309],[.354,.383]],[[.291,.450],[.422,.316]],.26,.09,.4),
  part('anal',[[.281,.674],[.380,.782],[.470,.820],[.466,1.03],[.25,1.03]],[[.294,.687],[.461,.818]],.31,.11,1.5),
  part('pectoral',[[.508,.533],[.594,.545],[.671,.594],[.730,.620],[.716,.683],[.647,.722],[.572,.686]],[[.722,.623],[.707,.686]],.59,.21,.65),
  part('pelvic',[[.601,.842],[.726,.822],[.724,.944],[.557,1.04]],[[.610,.848],[.716,.830]],.40,.13,1.2)
 ]},
 s11:{frequency:2.75,scull:.48,spine:{root:.32,front:.80,axis:.53,amplitude:.018,lag:1.8},underlay:{from:[.595,.36,.19,.12],to:[.595,.503,.19,.23]},parts:[
  part('tail',[[0,.09],[.32,.405],[.32,.645],[0,1.02]],[[.32,.435],[.32,.638]],.30,.32,1.5),
  part('dorsal',[[.324,.33],[.324,-.02],[.81,-.02],[.813,.292],[.741,.277],[.619,.291],[.494,.331],[.391,.407]],[[.392,.395],[.788,.290]],.34,.10,.2),
  part('anal',[[.349,.658],[.464,.706],[.608,.762],[.562,1.02],[.302,1.02]],[[.353,.665],[.590,.763]],.35,.12,1.5),
  part('pectoral',[[.604,.506],[.680,.517],[.752,.548],[.779,.594],[.766,.655],[.705,.678],[.642,.628]],[[.755,.562],[.765,.627]],.63,.22,.8),
  part('pelvic',[[.625,.771],[.768,.734],[.781,1.04],[.563,1.04]],[[.640,.772],[.752,.745]],.48,.16,1.1)
 ]},
 s53:{frequency:2.1,scull:.50,spine:{root:.225,front:.71,axis:.57,amplitude:.025,lag:1.9},underlay:{from:[.55,.42,.15,.13],to:[.545,.545,.16,.17]},parts:[
  part('tail',[[0,.23],[.225,.469],[.225,.655],[0,.92]],[[.225,.474],[.225,.654]],.33,.33,1.6),
  part('dorsal',[[.258,.427],[.258,-.02],[.661,-.02],[.668,.238],[.560,.266],[.425,.318]],[[.271,.423],[.644,.247]],.22,.07,.4),
  part('pectoral',[[.551,.553],[.620,.565],[.693,.590],[.702,.637],[.677,.689],[.617,.704],[.570,.661]],[[.690,.599],[.692,.657]],.63,.22,.7),
  part('pelvic',[[.574,.814],[.703,.790],[.715,1.04],[.513,1.04]],[[.589,.816],[.691,.797]],.38,.13,1.2),
  {name:'light organ',mode:'glow',polygon:[[.744,.563],[.793,.560],[.844,.584],[.869,.645],[.856,.705],[.806,.765],[.754,.739],[.727,.659]],hinge:[[.79,.64],[.82,.64]]}
 ]},
 s55:{frequency:1.8,scull:.42,underlay:{from:[.397,.30,.35,.17],to:[.397,.461,.35,.216]},parts:[
  part('tail',[[0,.20],[.241,.470],[.241,.552],[0,.87]],[[.241,.478],[.241,.543]],.28,.32,1.6),
  part('dorsal',[[.18,-.03],[.68,-.03],[.68,.207],[.614,.219],[.257,.469],[.235,.478],[.235,.30],[.18,.10]],[[.257,.469],[.614,.219]],.30,.10,.3),
  part('anal',[[.255,.550],[.354,.655],[.487,.755],[.632,.793],[.613,1.03],[.285,1.03]],[[.267,.560],[.611,.794]],.29,.09,1.5),
  part('pectoral',[[.403,.462],[.527,.470],[.627,.501],[.724,.548],[.738,.602],[.694,.650],[.628,.623],[.543,.571]],[[.717,.554],[.726,.608]],.52,.17,.8),
  part('pelvic',[[.653,.807],[.744,.788],[.746,1.02],[.595,1.02]],[[.660,.814],[.730,.793]],.30,.11,1.3)
 ]},
 s58:{frequency:2.85,scull:.52,spine:{root:.272,front:.80,axis:.56,amplitude:.018,lag:2.1},underlay:{from:[.573,.37,.19,.14],to:[.573,.520,.19,.22]},parts:[
  part('tail',[[0,.25],[.272,.455],[.272,.669],[0,1.02]],[[.272,.477],[.272,.655]],.32,.34,1.6),
  part('dorsal',[[.313,.389],[.215,.20],[.215,-.02],[.809,-.02],[.817,.306],[.725,.287],[.613,.311],[.473,.369],[.349,.457]],[[.346,.441],[.789,.303]],.35,.11,.35),
  part('anal',[[.327,.688],[.443,.742],[.565,.791],[.551,1.03],[.247,1.03]],[[.339,.697],[.549,.791]],.35,.13,1.5),
  part('pectoral',[[.581,.532],[.657,.540],[.730,.565],[.756,.599],[.745,.663],[.685,.693],[.617,.650]],[[.739,.575],[.749,.638]],.64,.23,.7),
  part('pelvic',[[.607,.806],[.753,.763],[.768,1.04],[.557,1.04]],[[.624,.804],[.739,.775]],.46,.16,1.2)
 ]},
 s3:{frequency:2.15,scull:.62,underlay:{from:[.582,.29,.168,.13],to:[.582,.402,.168,.241]},parts:[
  part('tail',[[0,0],[.243,0],[.243,1],[0,1]],[[.243,.375],[.243,.640]],.28,.25,1.6),
  part('pectoral',[[.595,.410],[.654,.425],[.727,.458],[.748,.491],[.727,.568],[.655,.624],[.590,.638],[.581,.553]],[[.732,.463],[.742,.530]],.64,.20,.65),
  part('pelvic',[[.597,.721],[.749,.676],[.76,1.04],[.542,1.04]],[[.622,.729],[.734,.688]],.40,.13,1.2)
 ]},
 s31:{frequency:1.65,scull:.32,underlay:{from:[.335,.43,.195,.30],to:[.528,.50,.185,.247]},parts:[
  part('tail',[[0,0],[.232,0],[.232,1],[0,1]],[[.232,.458],[.232,.637]],.30,.28,1.6),
  part('pectoral',[[.531,.526],[.582,.534],[.643,.559],[.699,.592],[.706,.650],[.654,.709],[.592,.736],[.553,.685]],[[.690,.591],[.699,.656]],.68,.24,.7),
  part('pelvic',[[.599,.791],[.718,.766],[.728,1.04],[.53,1.04]],[[.614,.797],[.705,.778]],.40,.16,1.3)
 ]},
 s57:{frequency:1.55,scull:.30,underlay:{from:[.366,.435,.205,.26],to:[.558,.475,.188,.256]},parts:[
  part('tail',[[0,0],[.239,0],[.239,1],[0,1]],[[.239,.435],[.239,.635]],.29,.27,1.6),
  part('pectoral',[[.563,.496],[.621,.503],[.690,.535],[.735,.581],[.718,.641],[.664,.687],[.599,.714],[.565,.659]],[[.721,.571],[.721,.636]],.66,.23,.8),
  part('pelvic',[[.616,.774],[.749,.737],[.75,1.04],[.535,1.04]],[[.637,.780],[.730,.747]],.38,.14,1.3)
 ]},
 s16:{frequency:1.45,scull:.68,underlay:{from:[.32,.48,.175,.28],to:[.496,.486,.20,.278]},parts:[
  part('tail',[[0,0],[.228,0],[.228,1],[0,1]],[[.228,.484],[.228,.651]],.24,.27,1.6),
  part('pectoral',[[.500,.490],[.569,.513],[.659,.573],[.689,.619],[.674,.712],[.602,.758],[.553,.724],[.523,.634]],[[.670,.609],[.679,.668]],.70,.24,.7),
  part('pelvic',[[.605,.814],[.726,.768],[.72,1.05],[.54,1.05]],[[.620,.815],[.712,.782]],.36,.13,1.2),
  jaw([[.856,.669],[.891,.632],[.960,.582],[.984,.562],[1.01,.578],[1.005,.636],[.955,.693],[.901,.721],[.860,.716]],[.861,.694],.24,'#541c10')
 ]},
 s21:{frequency:1.15,scull:.64,underlay:{from:[.28,.48,.19,.345],to:[.466,.46,.252,.385]},parts:[
  part('tail',[[0,0],[.218,0],[.218,1],[0,1]],[[.218,.480],[.218,.635]],.20,.20,1.6),
  part('pectoral',[[.476,.487],[.551,.471],[.638,.532],[.704,.610],[.712,.710],[.653,.835],[.554,.824],[.492,.751],[.472,.644]],[[.688,.590],[.701,.704]],.57,.18,.8),
  part('pelvic',[[.574,.826],[.680,.792],[.69,1.05],[.480,1.05]],[[.582,.837],[.673,.803]],.30,.12,1.3),
  jaw([[.843,.672],[.889,.620],[.973,.551],[1.005,.571],[1.015,.740],[.961,.792],[.881,.793],[.840,.735]],[.851,.714],.23,'#351a12')
 ]},
 s38:{frequency:.95,scull:.72,underlay:{from:[.325,.45,.175,.32],to:[.500,.49,.19,.28]},parts:[
  part('tail',[[0,0],[.207,0],[.207,1],[0,1]],[[.207,.414],[.207,.637]],.20,.22,1.6),
  part('pectoral',[[.505,.510],[.576,.497],[.650,.560],[.681,.618],[.665,.700],[.600,.766],[.533,.754],[.503,.677]],[[.661,.600],[.667,.685]],.65,.23,.6),
  part('pelvic',[[.578,.813],[.701,.787],[.70,1.05],[.51,1.05]],[[.586,.820],[.688,.797]],.31,.12,1.2),
  jaw([[.828,.668],[.883,.624],[.986,.527],[1.010,.533],[1.013,.610],[.958,.690],[.878,.746],[.823,.738]],[.832,.707],.25,'#302218')
 ]},
 s39:{frequency:1.85,spine:{root:.292,front:.80,axis:.49,amplitude:.023,lag:1.8},underlay:{from:[.40,.40,.17,.30],to:[.565,.443,.188,.266]},parts:[
  part('tail',[[0,0],[.292,0],[.292,1],[0,1]],[[.292,.351],[.292,.552]],.24,.28,1.6),
  part('pectoral',[[.585,.450],[.660,.474],[.736,.560],[.744,.645],[.698,.692],[.633,.703],[.585,.659],[.569,.563]],[[.729,.560],[.735,.627]],.69,.23,.7),
  part('pelvic',[[.640,.751],[.754,.728],[.746,1.05],[.601,1.05]],[[.643,.760],[.736,.754]],.36,.13,1.2),
  jaw([[.875,.612],[.931,.558],[.972,.493],[.995,.490],[1.005,.511],[1.005,.604],[.962,.640],[.913,.685],[.878,.692]],[.881,.646],.26,'#521b0b')
 ]},
 s5:{frequency:2.1,scull:.70,underlay:{from:[.625,.30,.16,.17],to:[.615,.465,.18,.215]},parts:[
  part('tail',[[0,0],[.205,0],[.205,1],[0,1]],[[.205,.445],[.205,.574]],.28,.28,1.5),
  part('pectoral',[[.617,.471],[.682,.489],[.788,.545],[.770,.627],[.748,.671],[.708,.649],[.661,.578]],[[.770,.556],[.758,.624]],.72,.25,.6),
  part('pelvic',[[.653,.821],[.790,.798],[.76,1.05],[.568,1.05]],[[.654,.831],[.774,.808]],.39,.14,1.1)
 ]},
 s8:{frequency:1.8,scull:.72,underlay:{from:[.57,.635,.16,.075],to:[.562,.31,.168,.31]},parts:[
  part('tail',[[0,0],[.20,0],[.20,1],[0,1]],[[.20,.425],[.20,.530]],.26,.25,1.6),
  part('pectoral',[[.565,.314],[.622,.329],[.692,.388],[.724,.490],[.724,.590],[.668,.615],[.610,.580],[.570,.470]],[[.697,.417],[.705,.537]],.71,.23,.7),
  part('pelvic',[[.610,.732],[.717,.708],[.71,1.05],[.515,1.05]],[[.627,.735],[.706,.718]],.40,.15,1.3)
 ]},
 s10:{frequency:2.65,scull:.70,underlay:{from:[.48,.395,.15,.19],to:[.627,.395,.15,.19]},parts:[
  part('tail',[[0,0],[.176,0],[.176,1],[0,1]],[[.176,.404],[.176,.640]],.30,.32,1.6),
  part('pectoral',[[.664,.445],[.705,.424],[.759,.454],[.739,.540],[.680,.580],[.636,.582]],[[.753,.460],[.738,.514]],.67,.24,.5),
  part('pelvic',[[.645,.732],[.742,.725],[.74,1.05],[.604,1.05]],[[.658,.744],[.730,.738]],.44,.15,1.2)
 ]},
 s15:{frequency:1.55,scull:.70,underlay:{from:[.31,.38,.23,.32],to:[.528,.377,.23,.32]},parts:[
  part('tail',[[0,0],[.22,0],[.22,1],[0,1]],[[.22,.379],[.22,.610]],.23,.26,1.6),
  part('pectoral',[[.530,.382],[.632,.427],[.746,.523],[.754,.640],[.674,.685],[.597,.623],[.552,.509]],[[.735,.547],[.731,.623]],.73,.25,.8),
  part('pelvic',[[.614,.768],[.765,.729],[.77,1.04],[.55,1.04]],[[.625,.780],[.744,.746]],.35,.14,1.3)
 ]},
 s29:{frequency:1.12,scull:.75,underlay:{from:[.34,.43,.155,.295],to:[.494,.43,.185,.31]},parts:[
  part('tail',[[0,0],[.197,0],[.197,1],[0,1]],[[.197,.340],[.197,.568]],.19,.21,1.6),
  part('pectoral',[[.498,.435],[.553,.462],[.637,.538],[.669,.590],[.642,.669],[.584,.731],[.529,.709],[.507,.641]],[[.653,.566],[.659,.652]],.67,.25,.6),
  part('pelvic',[[.559,.780],[.694,.771],[.70,1.03],[.46,1.03]],[[.561,.787],[.678,.774]],.33,.12,1.2)
 ]},
 s52:{frequency:1.9,scull:.72,underlay:{from:[.388,.43,.195,.28],to:[.574,.464,.181,.227]},parts:[
  part('tail',[[0,0],[.20,0],[.20,1],[0,1]],[[.20,.435],[.20,.565]],.26,.28,1.6),
  part('pectoral',[[.576,.470],[.657,.479],[.746,.570],[.739,.627],[.697,.679],[.636,.650],[.598,.576]],[[.738,.573],[.722,.644]],.73,.26,.65),
  part('pelvic',[[.610,.784],[.710,.764],[.72,1.04],[.558,1.04]],[[.620,.790],[.701,.775]],.37,.13,1.2)
 ]},
 s41:{frequency:2.35,scull:.72,parts:[
  part('tail',[[0,0],[.117,0],[.117,1],[0,1]],[[.117,.423],[.117,.588]],.26,.23,1.5),
  part('dorsal',[[.177,.302],[.177,0],[.365,0],[.365,.282]],[[.195,.316],[.349,.282]],.60,.15,.2),
  part('anal',[[.177,.643],[.345,.615],[.36,1.03],[.16,1.03]],[[.192,.656],[.332,.628]],.56,.13,1.5),
  part('pelvic',[[.558,.682],[.638,.672],[.643,1.04],[.547,1.04]],[[.570,.690],[.627,.686]],.43,.13,.8)
 ]},
 s1:{frequency:2.6,scull:.70,underlay:{from:[.51,.34,.23,.16],to:[.51,.50,.23,.18]},parts:[
  part('tail',[[0,0],[.235,0],[.235,1],[0,1]],[[.235,.438],[.235,.593]],.30,.30,1.6),
  part('pectoral',[[.51,.50],[.64,.52],[.744,.56],[.749,.60],[.71,.657],[.60,.684],[.503,.611]],[[.735,.556],[.739,.610]],.76,.23,.7),
  part('pelvic',[[.597,.750],[.744,.721],[.755,1.05],[.525,1.05]],[[.609,.749],[.736,.734]],.38,.13,1.1)
 ]},
 s2:{frequency:2.0,scull:.82,underlay:{from:[.55,.265,.22,.14],to:[.545,.400,.218,.325]},parts:[
  part('tail',[[0,0],[.267,0],[.267,1],[0,1]],[[.267,.391],[.267,.640]],.27,.24,1.6),
  part('pectoral',[[.730,.475],[.676,.425],[.615,.397],[.573,.418],[.543,.495],[.550,.599],[.596,.690],[.680,.730],[.733,.680],[.763,.645],[.763,.477]],[[.749,.485],[.756,.647]],.70,.21,.6)
 ]},
 s7:{frequency:2.2,scull:.68,underlay:{from:[.596,.249,.146,.15],to:[.549,.372,.21,.342]},parts:[
  part('tail',[[0,0],[.262,0],[.262,1],[0,1]],[[.262,.423],[.262,.638]],.32,.29,1.6),
  part('pectoral',[[.72,.56],[.697,.434],[.635,.370],[.579,.380],[.550,.439],[.548,.630],[.590,.715],[.650,.717],[.727,.650],[.760,.616]],[[.738,.549],[.739,.624]],.70,.23,.7),
  part('pelvic',[[.618,.754],[.742,.728],[.75,1.04],[.55,1.04]],[[.628,.750],[.733,.738]],.40,.16,1.2)
 ]},
 s30:{frequency:2.8,scull:.75,underlay:{from:[.625,.405,.135,.115],to:[.622,.510,.138,.195]},parts:[
  part('tail',[[0,0],[.294,0],[.294,1],[0,1]],[[.294,.382],[.294,.590]],.31,.28,1.6),
  part('pectoral',[[.625,.509],[.692,.535],[.762,.584],[.749,.632],[.704,.675],[.655,.698],[.620,.644]],[[.748,.570],[.750,.626]],.73,.22,.8),
  part('pelvic',[[.605,.803],[.745,.752],[.75,1.05],[.51,1.05]],[[.623,.790],[.732,.765]],.36,.11,1.1)
 ]},
 s0:{frequency:2.7,spine:{root:.19,front:.79,axis:.52,amplitude:.045,lag:2.0},parts:[
  part('tail',[[0,0],[.19,0],[.19,1],[0,1]],[[.19,.435],[.19,.615]],.35,.38,1.6),
  part('dorsal',[[.397,.335],[.397,0],[.615,0],[.615,.285]],[[.407,.322],[.601,.283]],.30,.08,.4),
  part('pelvic',[[.532,.78],[.632,.774],[.64,1.02],[.51,1.02]],[[.537,.786],[.626,.777]],.48,.14,1.2)
 ]},
 s17:{frequency:1.65,spine:{root:.20,front:.79,axis:.54,amplitude:.031,lag:1.5},parts:[
  part('tail',[[0,0],[.20,0],[.20,1],[0,1]],[[.20,.45],[.20,.63]],.28,.34,1.6),
  part('dorsal',[[.325,.368],[.325,0],[.513,0],[.513,.341]],[[.337,.36],[.505,.346]],.22,.07,.3),
  part('rear dorsal',[[.657,.347],[.657,.1],[.744,.1],[.744,.355]],[[.662,.347],[.735,.351]],.18,.05,.7),
  part('pelvic',[[.687,.714],[.748,.699],[.75,1.02],[.674,1.02]],[[.690,.719],[.743,.706]],.43,.15,1.0)
 ]},
 s18:{frequency:2.15,spine:{root:.106,front:.585,axis:.56,amplitude:.020,lag:1.45},parts:[
  part('tail',[[0,0],[.106,0],[.106,1],[0,1]],[[.106,.49],[.106,.66]],.42,.42,1.6),
  part('dorsal',[[.171,.447],[.171,0],[.298,0],[.298,.356]],[[.181,.432],[.289,.367]],.38,.09,.4),
  part('pelvic',[[.339,.735],[.391,.722],[.40,1.02],[.32,1.02]],[[.343,.738],[.384,.726]],.48,.11,1.1)
 ]},
 s23:{frequency:2.5,scull:.78,underlay:{from:[.695,.47,.09,.16],to:[.665,.625,.09,.16]},parts:[
  part('tail',[[0,0],[.198,0],[.198,1],[0,1]],[[.198,.49],[.198,.64]],.24,.18),
  part('dorsal',[[.28,.45],[.29,0],[.48,0],[.48,.35],[.43,.385],[.33,.445]],[[.33,.435],[.46,.36]],.62,.12,.8),
  part('pectoral',[[.708,.632],[.741,.622],[.751,.711],[.711,.843],[.611,.921],[.629,.853],[.671,.729]],[[.716,.638],[.740,.687]],.72,.32,1.4)
 ]},
 s28:{frequency:1.95,spine:{root:.20,front:.78,axis:.535,amplitude:.044,lag:1.8},parts:[
  part('tail',[[0,0],[.20,0],[.20,1],[0,1]],[[.20,.466],[.20,.604]],.30,.40,1.6),
  part('dorsal',[[.443,.292],[.44,0],[.64,0],[.64,.215],[.585,.215],[.51,.237]],[[.448,.289],[.626,.214]],.25,.07,.3),
  part('pelvic',[[.664,.757],[.748,.742],[.76,1.02],[.65,1.02]],[[.670,.764],[.741,.748]],.44,.18,1.1)
 ]},
 s32:{frequency:1.05,spine:true,parts:[
  part('tail',[[0,0],[.21,0],[.21,1],[0,1]],[[.21,.425],[.21,.65]],.22,.25,1.7),
  part('dorsal',[[.435,.37],[.435,0],[.60,0],[.623,.345]],[[.445,.366],[.613,.345]],.12,.04,.3),
  part('pectoral',[[.605,.633],[.728,.606],[.725,.652],[.69,.800],[.627,.92],[.562,1.08],[.50,1.08],[.545,.84]],[[.610,.640],[.721,.621]],.43,.17,1.1)
 ]},
 s33:{frequency:.90,spine:{root:.20,front:.79,axis:.56,amplitude:.070,lag:2.4},parts:[
  part('tail',[[0,0],[.20,0],[.20,1],[0,1]],[[.20,.455],[.20,.643]],.16,.23,1.8),
  part('dorsal',[[.43,.412],[.43,0],[.624,0],[.624,.34]],[[.440,.401],[.615,.348]],.11,.04,.3),
  part('pectoral',[[.627,.660],[.732,.61],[.73,.73],[.61,.96],[.55,1.03],[.575,.86]],[[.638,.661],[.725,.632]],.40,.16,1.1)
 ]},
 s34:{frequency:.72,spine:{root:.188,front:.76,axis:.56,amplitude:.040,lag:1.7},parts:[
  part('tail',[[0,0],[.188,0],[.188,1],[0,1]],[[.188,.476],[.188,.614]],.15,.20,1.8),
  part('dorsal',[[.430,.32],[.43,0],[.632,0],[.632,.28]],[[.443,.308],[.620,.287]],.085,.025,.3),
  part('pectoral',[[.515,.712],[.670,.604],[.68,.650],[.626,.81],[.55,.94],[.48,1.10],[.405,1.10],[.448,.89]],[[.529,.692],[.664,.628]],.32,.12,1.1)
 ]},
 s35:{frequency:.82,spine:{root:.18,front:.78,axis:.58,amplitude:.060,lag:2.4},parts:[
  part('tail',[[0,0],[.18,0],[.18,1],[0,1]],[[.18,.507],[.18,.657]],.20,.27,1.8),
  part('dorsal',[[.430,.367],[.43,0],[.631,0],[.631,.303]],[[.444,.359],[.621,.312]],.12,.04,.3),
  part('pectoral',[[.578,.72],[.711,.631],[.713,.69],[.665,.80],[.603,.90],[.54,1.1],[.465,1.1],[.525,.87]],[[.591,.704],[.698,.655]],.37,.16,1.1)
 ]},
 s42:{frequency:2.2,spine:true,parts:[
  part('tail',[[0,0],[.21,0],[.21,1],[0,1]],[[.21,.46],[.21,.59]],.30,.34,1.7),
  part('pelvic',[[.625,.765],[.754,.719],[.75,1.02],[.58,1.02]],[[.630,.765],[.742,.730]],.38,.14,1.1)
 ]},
 s49:{frequency:2.25,spine:{root:.20,front:.78,axis:.52,amplitude:.031,lag:1.7},parts:[
  part('tail',[[0,0],[.20,0],[.20,1],[0,1]],[[.20,.420],[.20,.609]],.35,.37,1.6),
  part('dorsal',[[.365,.337],[.365,0],[.593,0],[.593,.260]],[[.375,.328],[.583,.268]],.25,.08,.3),
  part('pelvic',[[.632,.797],[.709,.787],[.72,1.02],[.61,1.02]],[[.638,.802],[.702,.793]],.45,.17,1.1)
 ]},
 s27:{frequency:.82,parts:[
  part('tail',[[0,0],[.44,0],[.44,1],[0,1]],[[.44,.38],[.44,.51]],.015,.035,.9),
  part('upper disc',[[.455,.395],[.455,0],[.91,0],[.91,.395]],[[.455,.395],[.91,.395]],.48,.07),
  part('lower disc',[[.445,.49],[.845,.58],[1,.64],[1,1.03],[.42,1.03]],[[.445,.49],[.845,.58]],.43,-.08,.35)
 ]}
};

export function partPose(id,name,time,effort=1,{brake=0,turn=0,feed=0,flash=0,probe=0}={}){
 const rig=PART_RIGS[id],part=rig.parts.find(p=>p.name===name),a=clamp(effort);
 if(part.mode==='jaw')return {scale:1,shear:0,angle:part.open*clamp(feed),brake:0};
 if(part.mode==='glow')return {scale:1,shear:0,opacity:lightVisibility(time,{feed,flash}),brake:0};
 if(part.mode==='barbel'){
  const phase=time*TAU*1.1+part.phase,active=.12+.88*Math.max(clamp(probe),clamp(feed));
  return {scale:1-part.fold*active*(1-Math.cos(phase))*.5,shear:part.sweep*active*Math.sin(phase),brake:0};
 }
 const phase=time*rig.frequency*TAU+part.phase;
 // Propulsion is legible at ordinary NPC speed. Braking opens stabilizing fins
 // while the tail comes to rest; hoverers and cowfish keep sculling in place.
 const drive=name==='tail'?.05+.95*Math.sqrt(a):rig.scull!=null?rig.scull+(1-rig.scull)*a:.12+.88*Math.sqrt(a);
 const stroke=(1-Math.cos(phase))*.5,active=drive*(1-clamp(feed)*.65);
 const fold=part.fold*active*(1-clamp(brake)*.75);
 return {scale:1-fold*stroke,shear:Math.sin(phase)*part.sweep*active+Math.max(-1,Math.min(1,turn))*.08,brake:clamp(brake)};
}

export function bodyPoint(id,u,v,time,effort=1,state={}){
 if(!PART_RIGS[id]?.spine)return {x:u,y:v};
 const rig=PART_RIGS[id],f=rig.spine===true?{root:.21,front:.78,axis:.54,amplitude:.060,lag:1.8}:rig.spine;
 const a=clamp(effort),span=f.front-f.root,rear=clamp((f.front-u)/span),phase=time*rig.frequency*TAU;
 const drive=(.035+.965*Math.sqrt(a))*(1-clamp(state.feed||0)*.75),aspect=state.aspect||.44;
 const bend=q=>Math.sin(phase+q*f.lag)*q*q*f.amplitude*drive+(state.turn||0)*q*q*.026;
 // The tail hinge uses the same tangent as the final body section. Switching
 // to zero slope exactly at the joint made that cross-section discontinuous.
 const derivative=u<f.front?-(Math.cos(phase+rear*f.lag)*f.lag*rear*rear*f.amplitude*drive+Math.sin(phase+rear*f.lag)*2*rear*f.amplitude*drive+(state.turn||0)*2*rear*.026)/span:0;
 const angle=Math.atan(derivative),cross=(v-f.axis)*aspect;
 return {x:u-cross*Math.sin(angle),y:f.axis+(cross*Math.cos(angle)+bend(rear))/aspect};
}

function path(c,points,w,h){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x*w,y*h):c.moveTo(x*w,y*h));c.closePath();}
function surface(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}

export class PaintedParts{
 constructor(){this.images=new WeakMap();this.prepared=0;this.preparedPixels=0;this.draws=0;}
 prepare(image,id){
  let versions=this.images.get(image);if(!versions){versions=new Map();this.images.set(image,versions);}if(versions.has(id))return versions.get(id);
  const w=image.width,h=image.height,body=surface(w,h),c=body.getContext('2d');c.drawImage(image,0,0);
  const pieces=PART_RIGS[id].parts.map(p=>{
   const left=Math.max(0,Math.floor(Math.min(...p.polygon.map(p=>p[0]))*w)-2),top=Math.max(0,Math.floor(Math.min(...p.polygon.map(p=>p[1]))*h)-2),right=Math.min(w,Math.ceil(Math.max(...p.polygon.map(p=>p[0]))*w)+2),bottom=Math.min(h,Math.ceil(Math.max(...p.polygon.map(p=>p[1]))*h)+2);
   const canvas=surface(right-left,bottom-top),pc=canvas.getContext('2d');pc.save();pc.translate(-left,-top);path(pc,p.polygon,w,h);pc.clip();pc.drawImage(image,0,0);pc.restore();c.save();path(c,p.polygon,w,h);c.clip();c.clearRect(0,0,w,h);c.restore();
   let cavityCanvas;
   if(p.mode==='jaw'){
    cavityCanvas=surface(canvas.width,canvas.height);const cc=cavityCanvas.getContext('2d');cc.drawImage(canvas,0,0);cc.globalCompositeOperation='source-in';cc.fillStyle=p.cavity;cc.fillRect(0,0,canvas.width,canvas.height);
   }
   if(p.mode==='glow'){
    // Preserve painted gill texture in the dim phase. This patch is fixed on
    // the protected head; the luminous painting is blended over it below.
    c.drawImage(canvas,left,top);c.save();path(c,p.polygon,w,h);c.clip();c.globalCompositeOperation='source-atop';c.translate(w*.80,h*.66);c.scale(w*.095,h*.125);const shade=c.createRadialGradient(0,0,0,0,0,1);shade.addColorStop(0,'#071f38');shade.addColorStop(.45,'#071f38f5');shade.addColorStop(1,'#071f3800');c.fillStyle=shade;c.fillRect(-1,-1,2,2);c.restore();
   }
   return {...p,canvas,left,top,cavityCanvas};
  });
  // Overlaid pectorals need a painted flank beneath them as they fold. Keep
  // this local reconstruction inside the authored cut, preserving source bytes.
  const underlay=PART_RIGS[id].underlay;
  if(underlay){const p=PART_RIGS[id].parts.find(p=>p.name==='pectoral'),[x,y,sw,sh]=underlay.from,[dx,dy,dw,dh]=underlay.to;c.save();path(c,p.polygon,w,h);c.clip();c.drawImage(image,x*w,y*h,sw*w,sh*h,dx*w,dy*h,dw*w,dh*h);c.restore();}
  const result={body,pieces};versions.set(id,result);this.prepared++;this.preparedPixels+=w*h+pieces.reduce((n,p)=>n+p.canvas.width*p.canvas.height*(p.cavityCanvas?2:1),0);return result;
 }
 draw(c,image,id,width,height,time,effort,state={}){
  const {body,pieces}=this.prepare(image,id),aspect=height/width,s={...state,aspect};this.draws++;
  c.save();c.translate(-width/2,-height/2);
  // Fourteen small triangles replace hundreds of full-image triangle draws.
  // All fin pieces use one affine draw each and have no pose-cache fallback.
  if(PART_RIGS[id].spine){
   const f=PART_RIGS[id].spine,root=f.root??.21,front=f.front??.78;
   const xs=[0,.16,.33,.50,.67,.85,1].map(t=>root+(front-root)*t);xs.push(1);
   for(let i=0;i<xs.length-1;i++){const l=xs[i],r=xs[i+1],source=[[l,0],[r,0],[l,1],[r,1]],dest=source.map(([u,v])=>bodyPoint(id,u,v,time,effort,s));
    triangle(c,body,source[0],source[1],source[2],dest[0],dest[1],dest[2],width,height);
    triangle(c,body,source[1],source[3],source[2],dest[1],dest[3],dest[2],width,height);
   }
  }else c.drawImage(body,0,0,width,height);
  for(const p of pieces){
   if(p.mode==='glow'){
    c.save();c.globalAlpha*=partPose(id,p.name,time,effort,state).opacity;c.drawImage(p.canvas,p.left/image.width*width,p.top/image.height*height,p.canvas.width/image.width*width,p.canvas.height/image.height*height);c.restore();continue;
   }
   if(p.mode==='jaw'){
    const pose=partPose(id,p.name,time,effort,state),[root]=p.hinge,ax=root[0]*width,ay=root[1]*height;
    // The existing contact envelope opens the mandible before consumption and
    // closes it during recovery. Preserve the painted alpha silhouette instead
    // of filling the cutting polygon's transparent corners beside the lips.
    if(pose.angle>0)c.drawImage(p.cavityCanvas,p.left/image.width*width,p.top/image.height*height,p.cavityCanvas.width/image.width*width,p.cavityCanvas.height/image.height*height);
    c.save();c.translate(ax,ay);c.rotate(pose.angle);c.drawImage(p.canvas,p.left/image.width*width-ax,p.top/image.height*height-ay,p.canvas.width/image.width*width,p.canvas.height/image.height*height);c.restore();continue;
   }
   const pose=partPose(id,p.name,time,effort,state),[a,b]=p.hinge,A=bodyPoint(id,...a,time,effort,s),B=bodyPoint(id,...b,time,effort,s);
   const ax=a[0]*width,ay=a[1]*height,bx=b[0]*width,by=b[1]*height,length=Math.hypot(bx-ax,by-ay),ux=(bx-ax)/length,uy=(by-ay)/length;
   const vx=(B.x-A.x)*width/length,vy=(B.y-A.y)*height/length;
   // In hinge coordinates, tangent is fixed; normal is foreshortened and swept.
   const nx=-vy*pose.scale+vx*pose.shear,ny=vx*pose.scale+vy*pose.shear;
   c.save();c.translate(A.x*width,A.y*height);c.transform(vx*ux-nx*uy,vy*ux-ny*uy,vx*uy+nx*ux,vy*uy+ny*ux,0,0);c.drawImage(p.canvas,p.left/image.width*width-ax,p.top/image.height*height-ay,p.canvas.width/image.width*width,p.canvas.height/image.height*height);c.restore();
  }
  c.restore();
 }
}

function triangle(c,image,a,b,d,A,B,D,w,h){
 const ux=b[0]-a[0],uy=b[1]-a[1],vx=d[0]-a[0],vy=d[1]-a[1],det=ux*vy-vx*uy;
 const m11=((B.x-A.x)*vy-(D.x-A.x)*uy)/det,m21=((B.y-A.y)*vy-(D.y-A.y)*uy)/det;
 const m12=(ux*(D.x-A.x)-vx*(B.x-A.x))/det,m22=(ux*(D.y-A.y)-vx*(B.y-A.y))/det;
 c.save();c.beginPath();const cx=(A.x+B.x+D.x)/3,cy=(A.y+B.y+D.y)/3;
 [A,B,D].forEach((p,i)=>{const dx=p.x-cx,dy=p.y-cy,len=Math.hypot(dx*w,dy*h),x=p.x*w+dx*w/len*1.3,y=p.y*h+dy*h/len*1.3;i?c.lineTo(x,y):c.moveTo(x,y);});c.closePath();c.clip();
 c.transform(m11,m21*h/w,m12*w/h,m22,(A.x-m11*a[0]-m12*a[1])*w,(A.y-m21*a[0]-m22*a[1])*h);c.drawImage(image,0,0,w,h);c.restore();
}
