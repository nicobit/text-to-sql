import{aQ as ce,aR as oe,aS as le,aT as ue,aU as Me,aV as Et,aW as Ie,aL as zt,aM as Nt,_ as o,aX as q,d as ut,s as Ae,g as Le,p as Ye,q as Fe,c as We,b as Ve,y as Oe,n as ze,l as wt,j as bt,aY as Ne,aZ as Pe,a_ as Re,k as Be,a4 as Ge,a$ as He,b0 as $t,b1 as Kt,b2 as Jt,b3 as te,b4 as ee,b5 as se,b6 as re,b7 as Xe,e as qe,x as je,b8 as Ue,b9 as Ze,ba as Qe,bb as $e,bc as Ke,bd as Je,be as ts}from"./index-a9cf502a.js";const es=Math.PI/180,ss=180/Math.PI,_t=18,de=.96422,fe=1,he=.82521,ke=4/29,dt=6/29,me=3*dt*dt,rs=dt*dt*dt;function ye(t){if(t instanceof et)return new et(t.l,t.a,t.b,t.opacity);if(t instanceof rt)return ge(t);t instanceof le||(t=Me(t));var e=Lt(t.r),s=Lt(t.g),i=Lt(t.b),a=Mt((.2225045*e+.7168786*s+.0606169*i)/fe),k,d;return e===s&&s===i?k=d=a:(k=Mt((.4360747*e+.3850649*s+.1430804*i)/de),d=Mt((.0139322*e+.0971045*s+.7141733*i)/he)),new et(116*a-16,500*(k-a),200*(a-d),t.opacity)}function is(t,e,s,i){return arguments.length===1?ye(t):new et(t,e,s,i??1)}function et(t,e,s,i){this.l=+t,this.a=+e,this.b=+s,this.opacity=+i}ce(et,is,oe(ue,{brighter(t){return new et(this.l+_t*(t??1),this.a,this.b,this.opacity)},darker(t){return new et(this.l-_t*(t??1),this.a,this.b,this.opacity)},rgb(){var t=(this.l+16)/116,e=isNaN(this.a)?t:t+this.a/500,s=isNaN(this.b)?t:t-this.b/200;return e=de*It(e),t=fe*It(t),s=he*It(s),new le(At(3.1338561*e-1.6168667*t-.4906146*s),At(-.9787684*e+1.9161415*t+.033454*s),At(.0719453*e-.2289914*t+1.4052427*s),this.opacity)}}));function Mt(t){return t>rs?Math.pow(t,1/3):t/me+ke}function It(t){return t>dt?t*t*t:me*(t-ke)}function At(t){return 255*(t<=.0031308?12.92*t:1.055*Math.pow(t,1/2.4)-.055)}function Lt(t){return(t/=255)<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4)}function ns(t){if(t instanceof rt)return new rt(t.h,t.c,t.l,t.opacity);if(t instanceof et||(t=ye(t)),t.a===0&&t.b===0)return new rt(NaN,0<t.l&&t.l<100?0:NaN,t.l,t.opacity);var e=Math.atan2(t.b,t.a)*ss;return new rt(e<0?e+360:e,Math.sqrt(t.a*t.a+t.b*t.b),t.l,t.opacity)}function Yt(t,e,s,i){return arguments.length===1?ns(t):new rt(t,e,s,i??1)}function rt(t,e,s,i){this.h=+t,this.c=+e,this.l=+s,this.opacity=+i}function ge(t){if(isNaN(t.h))return new et(t.l,0,0,t.opacity);var e=t.h*es;return new et(t.l,Math.cos(e)*t.c,Math.sin(e)*t.c,t.opacity)}ce(rt,Yt,oe(ue,{brighter(t){return new rt(this.h,this.c,this.l+_t*(t??1),this.opacity)},darker(t){return new rt(this.h,this.c,this.l-_t*(t??1),this.opacity)},rgb(){return ge(this).rgb()}}));function as(t){return function(e,s){var i=t((e=Yt(e)).h,(s=Yt(s)).h),a=Et(e.c,s.c),k=Et(e.l,s.l),d=Et(e.opacity,s.opacity);return function(b){return e.h=i(b),e.c=a(b),e.l=k(b),e.opacity=d(b),e+""}}}const cs=as(Ie);var pe={exports:{}};(function(t,e){(function(s,i){t.exports=i()})(zt,function(){var s="day";return function(i,a,k){var d=function(E){return E.add(4-E.isoWeekday(),s)},b=a.prototype;b.isoWeekYear=function(){return d(this).year()},b.isoWeek=function(E){if(!this.$utils().u(E))return this.add(7*(E-this.isoWeek()),s);var g,M,O,z,B=d(this),S=(g=this.isoWeekYear(),M=this.$u,O=(M?k.utc:k)().year(g).startOf("year"),z=4-O.isoWeekday(),O.isoWeekday()>4&&(z+=7),O.add(z,s));return B.diff(S,"week")+1},b.isoWeekday=function(E){return this.$utils().u(E)?this.day()||7:this.day(this.day()%7?E:E-7)};var F=b.startOf;b.startOf=function(E,g){var M=this.$utils(),O=!!M.u(g)||g;return M.p(E)==="isoweek"?O?this.date(this.date()-(this.isoWeekday()-1)).startOf("day"):this.date(this.date()-1-(this.isoWeekday()-1)+7).endOf("day"):F.bind(this)(E,g)}}})})(pe);var os=pe.exports;const ls=Nt(os);var ve={exports:{}};(function(t,e){(function(s,i){t.exports=i()})(zt,function(){var s={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},i=/(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|Q|YYYY|YY?|ww?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g,a=/\d/,k=/\d\d/,d=/\d\d?/,b=/\d*[^-_:/,()\s\d]+/,F={},E=function(p){return(p=+p)+(p>68?1900:2e3)},g=function(p){return function(C){this[p]=+C}},M=[/[+-]\d\d:?(\d\d)?|Z/,function(p){(this.zone||(this.zone={})).offset=function(C){if(!C||C==="Z")return 0;var L=C.match(/([+-]|\d\d)/g),Y=60*L[1]+(+L[2]||0);return Y===0?0:L[0]==="+"?-Y:Y}(p)}],O=function(p){var C=F[p];return C&&(C.indexOf?C:C.s.concat(C.f))},z=function(p,C){var L,Y=F.meridiem;if(Y){for(var H=1;H<=24;H+=1)if(p.indexOf(Y(H,0,C))>-1){L=H>12;break}}else L=p===(C?"pm":"PM");return L},B={A:[b,function(p){this.afternoon=z(p,!1)}],a:[b,function(p){this.afternoon=z(p,!0)}],Q:[a,function(p){this.month=3*(p-1)+1}],S:[a,function(p){this.milliseconds=100*+p}],SS:[k,function(p){this.milliseconds=10*+p}],SSS:[/\d{3}/,function(p){this.milliseconds=+p}],s:[d,g("seconds")],ss:[d,g("seconds")],m:[d,g("minutes")],mm:[d,g("minutes")],H:[d,g("hours")],h:[d,g("hours")],HH:[d,g("hours")],hh:[d,g("hours")],D:[d,g("day")],DD:[k,g("day")],Do:[b,function(p){var C=F.ordinal,L=p.match(/\d+/);if(this.day=L[0],C)for(var Y=1;Y<=31;Y+=1)C(Y).replace(/\[|\]/g,"")===p&&(this.day=Y)}],w:[d,g("week")],ww:[k,g("week")],M:[d,g("month")],MM:[k,g("month")],MMM:[b,function(p){var C=O("months"),L=(O("monthsShort")||C.map(function(Y){return Y.slice(0,3)})).indexOf(p)+1;if(L<1)throw new Error;this.month=L%12||L}],MMMM:[b,function(p){var C=O("months").indexOf(p)+1;if(C<1)throw new Error;this.month=C%12||C}],Y:[/[+-]?\d+/,g("year")],YY:[k,function(p){this.year=E(p)}],YYYY:[/\d{4}/,g("year")],Z:M,ZZ:M};function S(p){var C,L;C=p,L=F&&F.formats;for(var Y=(p=C.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,function(x,w,m){var _=m&&m.toUpperCase();return w||L[m]||s[m]||L[_].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,function(c,l,h){return l||h.slice(1)})})).match(i),H=Y.length,X=0;X<H;X+=1){var Q=Y[X],j=B[Q],y=j&&j[0],T=j&&j[1];Y[X]=T?{regex:y,parser:T}:Q.replace(/^\[|\]$/g,"")}return function(x){for(var w={},m=0,_=0;m<H;m+=1){var c=Y[m];if(typeof c=="string")_+=c.length;else{var l=c.regex,h=c.parser,f=x.slice(_),v=l.exec(f)[0];h.call(w,v),x=x.replace(v,"")}}return function(n){var u=n.afternoon;if(u!==void 0){var r=n.hours;u?r<12&&(n.hours+=12):r===12&&(n.hours=0),delete n.afternoon}}(w),w}}return function(p,C,L){L.p.customParseFormat=!0,p&&p.parseTwoDigitYear&&(E=p.parseTwoDigitYear);var Y=C.prototype,H=Y.parse;Y.parse=function(X){var Q=X.date,j=X.utc,y=X.args;this.$u=j;var T=y[1];if(typeof T=="string"){var x=y[2]===!0,w=y[3]===!0,m=x||w,_=y[2];w&&(_=y[2]),F=this.$locale(),!x&&_&&(F=L.Ls[_]),this.$d=function(f,v,n,u){try{if(["x","X"].indexOf(v)>-1)return new Date((v==="X"?1e3:1)*f);var r=S(v)(f),I=r.year,D=r.month,A=r.day,R=r.hours,W=r.minutes,V=r.seconds,$=r.milliseconds,ct=r.zone,ot=r.week,kt=new Date,mt=A||(I||D?1:kt.getDate()),lt=I||kt.getFullYear(),N=0;I&&!D||(N=D>0?D-1:kt.getMonth());var Z,G=R||0,nt=W||0,K=V||0,it=$||0;return ct?new Date(Date.UTC(lt,N,mt,G,nt,K,it+60*ct.offset*1e3)):n?new Date(Date.UTC(lt,N,mt,G,nt,K,it)):(Z=new Date(lt,N,mt,G,nt,K,it),ot&&(Z=u(Z).week(ot).toDate()),Z)}catch{return new Date("")}}(Q,T,j,L),this.init(),_&&_!==!0&&(this.$L=this.locale(_).$L),m&&Q!=this.format(T)&&(this.$d=new Date("")),F={}}else if(T instanceof Array)for(var c=T.length,l=1;l<=c;l+=1){y[1]=T[l-1];var h=L.apply(this,y);if(h.isValid()){this.$d=h.$d,this.$L=h.$L,this.init();break}l===c&&(this.$d=new Date(""))}else H.call(this,X)}}})})(ve);var us=ve.exports;const ds=Nt(us);var be={exports:{}};(function(t,e){(function(s,i){t.exports=i()})(zt,function(){return function(s,i){var a=i.prototype,k=a.format;a.format=function(d){var b=this,F=this.$locale();if(!this.isValid())return k.bind(this)(d);var E=this.$utils(),g=(d||"YYYY-MM-DDTHH:mm:ssZ").replace(/\[([^\]]+)]|Q|wo|ww|w|WW|W|zzz|z|gggg|GGGG|Do|X|x|k{1,2}|S/g,function(M){switch(M){case"Q":return Math.ceil((b.$M+1)/3);case"Do":return F.ordinal(b.$D);case"gggg":return b.weekYear();case"GGGG":return b.isoWeekYear();case"wo":return F.ordinal(b.week(),"W");case"w":case"ww":return E.s(b.week(),M==="w"?1:2,"0");case"W":case"WW":return E.s(b.isoWeek(),M==="W"?1:2,"0");case"k":case"kk":return E.s(String(b.$H===0?24:b.$H),M==="k"?1:2,"0");case"X":return Math.floor(b.$d.getTime()/1e3);case"x":return b.$d.getTime();case"z":return"["+b.offsetName()+"]";case"zzz":return"["+b.offsetName("long")+"]";default:return M}});return k.bind(this)(g)}}})})(be);var fs=be.exports;const hs=Nt(fs);var Ft=function(){var t=o(function(_,c,l,h){for(l=l||{},h=_.length;h--;l[_[h]]=c);return l},"o"),e=[6,8,10,12,13,14,15,16,17,18,20,21,22,23,24,25,26,27,28,29,30,31,33,35,36,38,40],s=[1,26],i=[1,27],a=[1,28],k=[1,29],d=[1,30],b=[1,31],F=[1,32],E=[1,33],g=[1,34],M=[1,9],O=[1,10],z=[1,11],B=[1,12],S=[1,13],p=[1,14],C=[1,15],L=[1,16],Y=[1,19],H=[1,20],X=[1,21],Q=[1,22],j=[1,23],y=[1,25],T=[1,35],x={trace:o(function(){},"trace"),yy:{},symbols_:{error:2,start:3,gantt:4,document:5,EOF:6,line:7,SPACE:8,statement:9,NL:10,weekday:11,weekday_monday:12,weekday_tuesday:13,weekday_wednesday:14,weekday_thursday:15,weekday_friday:16,weekday_saturday:17,weekday_sunday:18,weekend:19,weekend_friday:20,weekend_saturday:21,dateFormat:22,inclusiveEndDates:23,topAxis:24,axisFormat:25,tickInterval:26,excludes:27,includes:28,todayMarker:29,title:30,acc_title:31,acc_title_value:32,acc_descr:33,acc_descr_value:34,acc_descr_multiline_value:35,section:36,clickStatement:37,taskTxt:38,taskData:39,click:40,callbackname:41,callbackargs:42,href:43,clickStatementDebug:44,$accept:0,$end:1},terminals_:{2:"error",4:"gantt",6:"EOF",8:"SPACE",10:"NL",12:"weekday_monday",13:"weekday_tuesday",14:"weekday_wednesday",15:"weekday_thursday",16:"weekday_friday",17:"weekday_saturday",18:"weekday_sunday",20:"weekend_friday",21:"weekend_saturday",22:"dateFormat",23:"inclusiveEndDates",24:"topAxis",25:"axisFormat",26:"tickInterval",27:"excludes",28:"includes",29:"todayMarker",30:"title",31:"acc_title",32:"acc_title_value",33:"acc_descr",34:"acc_descr_value",35:"acc_descr_multiline_value",36:"section",38:"taskTxt",39:"taskData",40:"click",41:"callbackname",42:"callbackargs",43:"href"},productions_:[0,[3,3],[5,0],[5,2],[7,2],[7,1],[7,1],[7,1],[11,1],[11,1],[11,1],[11,1],[11,1],[11,1],[11,1],[19,1],[19,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,2],[9,2],[9,1],[9,1],[9,1],[9,2],[37,2],[37,3],[37,3],[37,4],[37,3],[37,4],[37,2],[44,2],[44,3],[44,3],[44,4],[44,3],[44,4],[44,2]],performAction:o(function(c,l,h,f,v,n,u){var r=n.length-1;switch(v){case 1:return n[r-1];case 2:this.$=[];break;case 3:n[r-1].push(n[r]),this.$=n[r-1];break;case 4:case 5:this.$=n[r];break;case 6:case 7:this.$=[];break;case 8:f.setWeekday("monday");break;case 9:f.setWeekday("tuesday");break;case 10:f.setWeekday("wednesday");break;case 11:f.setWeekday("thursday");break;case 12:f.setWeekday("friday");break;case 13:f.setWeekday("saturday");break;case 14:f.setWeekday("sunday");break;case 15:f.setWeekend("friday");break;case 16:f.setWeekend("saturday");break;case 17:f.setDateFormat(n[r].substr(11)),this.$=n[r].substr(11);break;case 18:f.enableInclusiveEndDates(),this.$=n[r].substr(18);break;case 19:f.TopAxis(),this.$=n[r].substr(8);break;case 20:f.setAxisFormat(n[r].substr(11)),this.$=n[r].substr(11);break;case 21:f.setTickInterval(n[r].substr(13)),this.$=n[r].substr(13);break;case 22:f.setExcludes(n[r].substr(9)),this.$=n[r].substr(9);break;case 23:f.setIncludes(n[r].substr(9)),this.$=n[r].substr(9);break;case 24:f.setTodayMarker(n[r].substr(12)),this.$=n[r].substr(12);break;case 27:f.setDiagramTitle(n[r].substr(6)),this.$=n[r].substr(6);break;case 28:this.$=n[r].trim(),f.setAccTitle(this.$);break;case 29:case 30:this.$=n[r].trim(),f.setAccDescription(this.$);break;case 31:f.addSection(n[r].substr(8)),this.$=n[r].substr(8);break;case 33:f.addTask(n[r-1],n[r]),this.$="task";break;case 34:this.$=n[r-1],f.setClickEvent(n[r-1],n[r],null);break;case 35:this.$=n[r-2],f.setClickEvent(n[r-2],n[r-1],n[r]);break;case 36:this.$=n[r-2],f.setClickEvent(n[r-2],n[r-1],null),f.setLink(n[r-2],n[r]);break;case 37:this.$=n[r-3],f.setClickEvent(n[r-3],n[r-2],n[r-1]),f.setLink(n[r-3],n[r]);break;case 38:this.$=n[r-2],f.setClickEvent(n[r-2],n[r],null),f.setLink(n[r-2],n[r-1]);break;case 39:this.$=n[r-3],f.setClickEvent(n[r-3],n[r-1],n[r]),f.setLink(n[r-3],n[r-2]);break;case 40:this.$=n[r-1],f.setLink(n[r-1],n[r]);break;case 41:case 47:this.$=n[r-1]+" "+n[r];break;case 42:case 43:case 45:this.$=n[r-2]+" "+n[r-1]+" "+n[r];break;case 44:case 46:this.$=n[r-3]+" "+n[r-2]+" "+n[r-1]+" "+n[r];break}},"anonymous"),table:[{3:1,4:[1,2]},{1:[3]},t(e,[2,2],{5:3}),{6:[1,4],7:5,8:[1,6],9:7,10:[1,8],11:17,12:s,13:i,14:a,15:k,16:d,17:b,18:F,19:18,20:E,21:g,22:M,23:O,24:z,25:B,26:S,27:p,28:C,29:L,30:Y,31:H,33:X,35:Q,36:j,37:24,38:y,40:T},t(e,[2,7],{1:[2,1]}),t(e,[2,3]),{9:36,11:17,12:s,13:i,14:a,15:k,16:d,17:b,18:F,19:18,20:E,21:g,22:M,23:O,24:z,25:B,26:S,27:p,28:C,29:L,30:Y,31:H,33:X,35:Q,36:j,37:24,38:y,40:T},t(e,[2,5]),t(e,[2,6]),t(e,[2,17]),t(e,[2,18]),t(e,[2,19]),t(e,[2,20]),t(e,[2,21]),t(e,[2,22]),t(e,[2,23]),t(e,[2,24]),t(e,[2,25]),t(e,[2,26]),t(e,[2,27]),{32:[1,37]},{34:[1,38]},t(e,[2,30]),t(e,[2,31]),t(e,[2,32]),{39:[1,39]},t(e,[2,8]),t(e,[2,9]),t(e,[2,10]),t(e,[2,11]),t(e,[2,12]),t(e,[2,13]),t(e,[2,14]),t(e,[2,15]),t(e,[2,16]),{41:[1,40],43:[1,41]},t(e,[2,4]),t(e,[2,28]),t(e,[2,29]),t(e,[2,33]),t(e,[2,34],{42:[1,42],43:[1,43]}),t(e,[2,40],{41:[1,44]}),t(e,[2,35],{43:[1,45]}),t(e,[2,36]),t(e,[2,38],{42:[1,46]}),t(e,[2,37]),t(e,[2,39])],defaultActions:{},parseError:o(function(c,l){if(l.recoverable)this.trace(c);else{var h=new Error(c);throw h.hash=l,h}},"parseError"),parse:o(function(c){var l=this,h=[0],f=[],v=[null],n=[],u=this.table,r="",I=0,D=0,A=2,R=1,W=n.slice.call(arguments,1),V=Object.create(this.lexer),$={yy:{}};for(var ct in this.yy)Object.prototype.hasOwnProperty.call(this.yy,ct)&&($.yy[ct]=this.yy[ct]);V.setInput(c,$.yy),$.yy.lexer=V,$.yy.parser=this,typeof V.yylloc>"u"&&(V.yylloc={});var ot=V.yylloc;n.push(ot);var kt=V.options&&V.options.ranges;typeof $.yy.parseError=="function"?this.parseError=$.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;function mt(U){h.length=h.length-2*U,v.length=v.length-U,n.length=n.length-U}o(mt,"popStack");function lt(){var U;return U=f.pop()||V.lex()||R,typeof U!="number"&&(U instanceof Array&&(f=U,U=f.pop()),U=l.symbols_[U]||U),U}o(lt,"lex");for(var N,Z,G,nt,K={},it,J,Qt,vt;;){if(Z=h[h.length-1],this.defaultActions[Z]?G=this.defaultActions[Z]:((N===null||typeof N>"u")&&(N=lt()),G=u[Z]&&u[Z][N]),typeof G>"u"||!G.length||!G[0]){var St="";vt=[];for(it in u[Z])this.terminals_[it]&&it>A&&vt.push("'"+this.terminals_[it]+"'");V.showPosition?St="Parse error on line "+(I+1)+`:
`+V.showPosition()+`
Expecting `+vt.join(", ")+", got '"+(this.terminals_[N]||N)+"'":St="Parse error on line "+(I+1)+": Unexpected "+(N==R?"end of input":"'"+(this.terminals_[N]||N)+"'"),this.parseError(St,{text:V.match,token:this.terminals_[N]||N,line:V.yylineno,loc:ot,expected:vt})}if(G[0]instanceof Array&&G.length>1)throw new Error("Parse Error: multiple actions possible at state: "+Z+", token: "+N);switch(G[0]){case 1:h.push(N),v.push(V.yytext),n.push(V.yylloc),h.push(G[1]),N=null,D=V.yyleng,r=V.yytext,I=V.yylineno,ot=V.yylloc;break;case 2:if(J=this.productions_[G[1]][1],K.$=v[v.length-J],K._$={first_line:n[n.length-(J||1)].first_line,last_line:n[n.length-1].last_line,first_column:n[n.length-(J||1)].first_column,last_column:n[n.length-1].last_column},kt&&(K._$.range=[n[n.length-(J||1)].range[0],n[n.length-1].range[1]]),nt=this.performAction.apply(K,[r,D,I,$.yy,G[1],v,n].concat(W)),typeof nt<"u")return nt;J&&(h=h.slice(0,-1*J*2),v=v.slice(0,-1*J),n=n.slice(0,-1*J)),h.push(this.productions_[G[1]][0]),v.push(K.$),n.push(K._$),Qt=u[h[h.length-2]][h[h.length-1]],h.push(Qt);break;case 3:return!0}}return!0},"parse")},w=function(){var _={EOF:1,parseError:o(function(l,h){if(this.yy.parser)this.yy.parser.parseError(l,h);else throw new Error(l)},"parseError"),setInput:o(function(c,l){return this.yy=l||this.yy||{},this._input=c,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},"setInput"),input:o(function(){var c=this._input[0];this.yytext+=c,this.yyleng++,this.offset++,this.match+=c,this.matched+=c;var l=c.match(/(?:\r\n?|\n).*/g);return l?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),c},"input"),unput:o(function(c){var l=c.length,h=c.split(/(?:\r\n?|\n)/g);this._input=c+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-l),this.offset-=l;var f=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),h.length-1&&(this.yylineno-=h.length-1);var v=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:h?(h.length===f.length?this.yylloc.first_column:0)+f[f.length-h.length].length-h[0].length:this.yylloc.first_column-l},this.options.ranges&&(this.yylloc.range=[v[0],v[0]+this.yyleng-l]),this.yyleng=this.yytext.length,this},"unput"),more:o(function(){return this._more=!0,this},"more"),reject:o(function(){if(this.options.backtrack_lexer)this._backtrack=!0;else return this.parseError("Lexical error on line "+(this.yylineno+1)+`. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).
`+this.showPosition(),{text:"",token:null,line:this.yylineno});return this},"reject"),less:o(function(c){this.unput(this.match.slice(c))},"less"),pastInput:o(function(){var c=this.matched.substr(0,this.matched.length-this.match.length);return(c.length>20?"...":"")+c.substr(-20).replace(/\n/g,"")},"pastInput"),upcomingInput:o(function(){var c=this.match;return c.length<20&&(c+=this._input.substr(0,20-c.length)),(c.substr(0,20)+(c.length>20?"...":"")).replace(/\n/g,"")},"upcomingInput"),showPosition:o(function(){var c=this.pastInput(),l=new Array(c.length+1).join("-");return c+this.upcomingInput()+`
`+l+"^"},"showPosition"),test_match:o(function(c,l){var h,f,v;if(this.options.backtrack_lexer&&(v={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(v.yylloc.range=this.yylloc.range.slice(0))),f=c[0].match(/(?:\r\n?|\n).*/g),f&&(this.yylineno+=f.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:f?f[f.length-1].length-f[f.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+c[0].length},this.yytext+=c[0],this.match+=c[0],this.matches=c,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(c[0].length),this.matched+=c[0],h=this.performAction.call(this,this.yy,this,l,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),h)return h;if(this._backtrack){for(var n in v)this[n]=v[n];return!1}return!1},"test_match"),next:o(function(){if(this.done)return this.EOF;this._input||(this.done=!0);var c,l,h,f;this._more||(this.yytext="",this.match="");for(var v=this._currentRules(),n=0;n<v.length;n++)if(h=this._input.match(this.rules[v[n]]),h&&(!l||h[0].length>l[0].length)){if(l=h,f=n,this.options.backtrack_lexer){if(c=this.test_match(h,v[n]),c!==!1)return c;if(this._backtrack){l=!1;continue}else return!1}else if(!this.options.flex)break}return l?(c=this.test_match(l,v[f]),c!==!1?c:!1):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+`. Unrecognized text.
`+this.showPosition(),{text:"",token:null,line:this.yylineno})},"next"),lex:o(function(){var l=this.next();return l||this.lex()},"lex"),begin:o(function(l){this.conditionStack.push(l)},"begin"),popState:o(function(){var l=this.conditionStack.length-1;return l>0?this.conditionStack.pop():this.conditionStack[0]},"popState"),_currentRules:o(function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},"_currentRules"),topState:o(function(l){return l=this.conditionStack.length-1-Math.abs(l||0),l>=0?this.conditionStack[l]:"INITIAL"},"topState"),pushState:o(function(l){this.begin(l)},"pushState"),stateStackSize:o(function(){return this.conditionStack.length},"stateStackSize"),options:{"case-insensitive":!0},performAction:o(function(l,h,f,v){switch(f){case 0:return this.begin("open_directive"),"open_directive";case 1:return this.begin("acc_title"),31;case 2:return this.popState(),"acc_title_value";case 3:return this.begin("acc_descr"),33;case 4:return this.popState(),"acc_descr_value";case 5:this.begin("acc_descr_multiline");break;case 6:this.popState();break;case 7:return"acc_descr_multiline_value";case 8:break;case 9:break;case 10:break;case 11:return 10;case 12:break;case 13:break;case 14:this.begin("href");break;case 15:this.popState();break;case 16:return 43;case 17:this.begin("callbackname");break;case 18:this.popState();break;case 19:this.popState(),this.begin("callbackargs");break;case 20:return 41;case 21:this.popState();break;case 22:return 42;case 23:this.begin("click");break;case 24:this.popState();break;case 25:return 40;case 26:return 4;case 27:return 22;case 28:return 23;case 29:return 24;case 30:return 25;case 31:return 26;case 32:return 28;case 33:return 27;case 34:return 29;case 35:return 12;case 36:return 13;case 37:return 14;case 38:return 15;case 39:return 16;case 40:return 17;case 41:return 18;case 42:return 20;case 43:return 21;case 44:return"date";case 45:return 30;case 46:return"accDescription";case 47:return 36;case 48:return 38;case 49:return 39;case 50:return":";case 51:return 6;case 52:return"INVALID"}},"anonymous"),rules:[/^(?:%%\{)/i,/^(?:accTitle\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*\{\s*)/i,/^(?:[\}])/i,/^(?:[^\}]*)/i,/^(?:%%(?!\{)*[^\n]*)/i,/^(?:[^\}]%%*[^\n]*)/i,/^(?:%%*[^\n]*[\n]*)/i,/^(?:[\n]+)/i,/^(?:\s+)/i,/^(?:%[^\n]*)/i,/^(?:href[\s]+["])/i,/^(?:["])/i,/^(?:[^"]*)/i,/^(?:call[\s]+)/i,/^(?:\([\s]*\))/i,/^(?:\()/i,/^(?:[^(]*)/i,/^(?:\))/i,/^(?:[^)]*)/i,/^(?:click[\s]+)/i,/^(?:[\s\n])/i,/^(?:[^\s\n]*)/i,/^(?:gantt\b)/i,/^(?:dateFormat\s[^#\n;]+)/i,/^(?:inclusiveEndDates\b)/i,/^(?:topAxis\b)/i,/^(?:axisFormat\s[^#\n;]+)/i,/^(?:tickInterval\s[^#\n;]+)/i,/^(?:includes\s[^#\n;]+)/i,/^(?:excludes\s[^#\n;]+)/i,/^(?:todayMarker\s[^\n;]+)/i,/^(?:weekday\s+monday\b)/i,/^(?:weekday\s+tuesday\b)/i,/^(?:weekday\s+wednesday\b)/i,/^(?:weekday\s+thursday\b)/i,/^(?:weekday\s+friday\b)/i,/^(?:weekday\s+saturday\b)/i,/^(?:weekday\s+sunday\b)/i,/^(?:weekend\s+friday\b)/i,/^(?:weekend\s+saturday\b)/i,/^(?:\d\d\d\d-\d\d-\d\d\b)/i,/^(?:title\s[^\n]+)/i,/^(?:accDescription\s[^#\n;]+)/i,/^(?:section\s[^\n]+)/i,/^(?:[^:\n]+)/i,/^(?::[^#\n;]+)/i,/^(?::)/i,/^(?:$)/i,/^(?:.)/i],conditions:{acc_descr_multiline:{rules:[6,7],inclusive:!1},acc_descr:{rules:[4],inclusive:!1},acc_title:{rules:[2],inclusive:!1},callbackargs:{rules:[21,22],inclusive:!1},callbackname:{rules:[18,19,20],inclusive:!1},href:{rules:[15,16],inclusive:!1},click:{rules:[24,25],inclusive:!1},INITIAL:{rules:[0,1,3,5,8,9,10,11,12,13,14,17,23,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52],inclusive:!0}}};return _}();x.lexer=w;function m(){this.yy={}}return o(m,"Parser"),m.prototype=x,x.Parser=m,new m}();Ft.parser=Ft;var ks=Ft;q.extend(ls);q.extend(ds);q.extend(hs);var ie={friday:5,saturday:6},tt="",Pt="",Rt=void 0,Bt="",yt=[],gt=[],Gt=new Map,Ht=[],Dt=[],ht="",Xt="",Te=["active","done","crit","milestone"],qt=[],pt=!1,jt=!1,Ut="sunday",Ct="saturday",Wt=0,ms=o(function(){Ht=[],Dt=[],ht="",qt=[],Tt=0,Ot=void 0,xt=void 0,P=[],tt="",Pt="",Xt="",Rt=void 0,Bt="",yt=[],gt=[],pt=!1,jt=!1,Wt=0,Gt=new Map,Oe(),Ut="sunday",Ct="saturday"},"clear"),ys=o(function(t){Pt=t},"setAxisFormat"),gs=o(function(){return Pt},"getAxisFormat"),ps=o(function(t){Rt=t},"setTickInterval"),vs=o(function(){return Rt},"getTickInterval"),bs=o(function(t){Bt=t},"setTodayMarker"),Ts=o(function(){return Bt},"getTodayMarker"),xs=o(function(t){tt=t},"setDateFormat"),ws=o(function(){pt=!0},"enableInclusiveEndDates"),_s=o(function(){return pt},"endDatesAreInclusive"),Ds=o(function(){jt=!0},"enableTopAxis"),Cs=o(function(){return jt},"topAxisEnabled"),Ss=o(function(t){Xt=t},"setDisplayMode"),Es=o(function(){return Xt},"getDisplayMode"),Ms=o(function(){return tt},"getDateFormat"),Is=o(function(t){yt=t.toLowerCase().split(/[\s,]+/)},"setIncludes"),As=o(function(){return yt},"getIncludes"),Ls=o(function(t){gt=t.toLowerCase().split(/[\s,]+/)},"setExcludes"),Ys=o(function(){return gt},"getExcludes"),Fs=o(function(){return Gt},"getLinks"),Ws=o(function(t){ht=t,Ht.push(t)},"addSection"),Vs=o(function(){return Ht},"getSections"),Os=o(function(){let t=ne();const e=10;let s=0;for(;!t&&s<e;)t=ne(),s++;return Dt=P,Dt},"getTasks"),xe=o(function(t,e,s,i){return i.includes(t.format(e.trim()))?!1:s.includes("weekends")&&(t.isoWeekday()===ie[Ct]||t.isoWeekday()===ie[Ct]+1)||s.includes(t.format("dddd").toLowerCase())?!0:s.includes(t.format(e.trim()))},"isInvalidDate"),zs=o(function(t){Ut=t},"setWeekday"),Ns=o(function(){return Ut},"getWeekday"),Ps=o(function(t){Ct=t},"setWeekend"),we=o(function(t,e,s,i){if(!s.length||t.manualEndTime)return;let a;t.startTime instanceof Date?a=q(t.startTime):a=q(t.startTime,e,!0),a=a.add(1,"d");let k;t.endTime instanceof Date?k=q(t.endTime):k=q(t.endTime,e,!0);const[d,b]=Rs(a,k,e,s,i);t.endTime=d.toDate(),t.renderEndTime=b},"checkTaskDates"),Rs=o(function(t,e,s,i,a){let k=!1,d=null;for(;t<=e;)k||(d=e.toDate()),k=xe(t,s,i,a),k&&(e=e.add(1,"d")),t=t.add(1,"d");return[e,d]},"fixTaskDates"),Vt=o(function(t,e,s){s=s.trim();const a=/^after\s+(?<ids>[\d\w- ]+)/.exec(s);if(a!==null){let d=null;for(const F of a.groups.ids.split(" ")){let E=at(F);E!==void 0&&(!d||E.endTime>d.endTime)&&(d=E)}if(d)return d.endTime;const b=new Date;return b.setHours(0,0,0,0),b}let k=q(s,e.trim(),!0);if(k.isValid())return k.toDate();{wt.debug("Invalid date:"+s),wt.debug("With date format:"+e.trim());const d=new Date(s);if(d===void 0||isNaN(d.getTime())||d.getFullYear()<-1e4||d.getFullYear()>1e4)throw new Error("Invalid date:"+s);return d}},"getStartDate"),_e=o(function(t){const e=/^(\d+(?:\.\d+)?)([Mdhmswy]|ms)$/.exec(t.trim());return e!==null?[Number.parseFloat(e[1]),e[2]]:[NaN,"ms"]},"parseDuration"),De=o(function(t,e,s,i=!1){s=s.trim();const k=/^until\s+(?<ids>[\d\w- ]+)/.exec(s);if(k!==null){let g=null;for(const O of k.groups.ids.split(" ")){let z=at(O);z!==void 0&&(!g||z.startTime<g.startTime)&&(g=z)}if(g)return g.startTime;const M=new Date;return M.setHours(0,0,0,0),M}let d=q(s,e.trim(),!0);if(d.isValid())return i&&(d=d.add(1,"d")),d.toDate();let b=q(t);const[F,E]=_e(s);if(!Number.isNaN(F)){const g=b.add(F,E);g.isValid()&&(b=g)}return b.toDate()},"getEndDate"),Tt=0,ft=o(function(t){return t===void 0?(Tt=Tt+1,"task"+Tt):t},"parseId"),Bs=o(function(t,e){let s;e.substr(0,1)===":"?s=e.substr(1,e.length):s=e;const i=s.split(","),a={};Zt(i,a,Te);for(let d=0;d<i.length;d++)i[d]=i[d].trim();let k="";switch(i.length){case 1:a.id=ft(),a.startTime=t.endTime,k=i[0];break;case 2:a.id=ft(),a.startTime=Vt(void 0,tt,i[0]),k=i[1];break;case 3:a.id=ft(i[0]),a.startTime=Vt(void 0,tt,i[1]),k=i[2];break}return k&&(a.endTime=De(a.startTime,tt,k,pt),a.manualEndTime=q(k,"YYYY-MM-DD",!0).isValid(),we(a,tt,gt,yt)),a},"compileData"),Gs=o(function(t,e){let s;e.substr(0,1)===":"?s=e.substr(1,e.length):s=e;const i=s.split(","),a={};Zt(i,a,Te);for(let k=0;k<i.length;k++)i[k]=i[k].trim();switch(i.length){case 1:a.id=ft(),a.startTime={type:"prevTaskEnd",id:t},a.endTime={data:i[0]};break;case 2:a.id=ft(),a.startTime={type:"getStartDate",startData:i[0]},a.endTime={data:i[1]};break;case 3:a.id=ft(i[0]),a.startTime={type:"getStartDate",startData:i[1]},a.endTime={data:i[2]};break}return a},"parseData"),Ot,xt,P=[],Ce={},Hs=o(function(t,e){const s={section:ht,type:ht,processed:!1,manualEndTime:!1,renderEndTime:null,raw:{data:e},task:t,classes:[]},i=Gs(xt,e);s.raw.startTime=i.startTime,s.raw.endTime=i.endTime,s.id=i.id,s.prevTaskId=xt,s.active=i.active,s.done=i.done,s.crit=i.crit,s.milestone=i.milestone,s.order=Wt,Wt++;const a=P.push(s);xt=s.id,Ce[s.id]=a-1},"addTask"),at=o(function(t){const e=Ce[t];return P[e]},"findTaskById"),Xs=o(function(t,e){const s={section:ht,type:ht,description:t,task:t,classes:[]},i=Bs(Ot,e);s.startTime=i.startTime,s.endTime=i.endTime,s.id=i.id,s.active=i.active,s.done=i.done,s.crit=i.crit,s.milestone=i.milestone,Ot=s,Dt.push(s)},"addTaskOrg"),ne=o(function(){const t=o(function(s){const i=P[s];let a="";switch(P[s].raw.startTime.type){case"prevTaskEnd":{const k=at(i.prevTaskId);i.startTime=k.endTime;break}case"getStartDate":a=Vt(void 0,tt,P[s].raw.startTime.startData),a&&(P[s].startTime=a);break}return P[s].startTime&&(P[s].endTime=De(P[s].startTime,tt,P[s].raw.endTime.data,pt),P[s].endTime&&(P[s].processed=!0,P[s].manualEndTime=q(P[s].raw.endTime.data,"YYYY-MM-DD",!0).isValid(),we(P[s],tt,gt,yt))),P[s].processed},"compileTask");let e=!0;for(const[s,i]of P.entries())t(s),e=e&&i.processed;return e},"compileTasks"),qs=o(function(t,e){let s=e;ut().securityLevel!=="loose"&&(s=ze(e)),t.split(",").forEach(function(i){at(i)!==void 0&&(Ee(i,()=>{window.open(s,"_self")}),Gt.set(i,s))}),Se(t,"clickable")},"setLink"),Se=o(function(t,e){t.split(",").forEach(function(s){let i=at(s);i!==void 0&&i.classes.push(e)})},"setClass"),js=o(function(t,e,s){if(ut().securityLevel!=="loose"||e===void 0)return;let i=[];if(typeof s=="string"){i=s.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);for(let k=0;k<i.length;k++){let d=i[k].trim();d.startsWith('"')&&d.endsWith('"')&&(d=d.substr(1,d.length-2)),i[k]=d}}i.length===0&&i.push(t),at(t)!==void 0&&Ee(t,()=>{je.runFunc(e,...i)})},"setClickFun"),Ee=o(function(t,e){qt.push(function(){const s=document.querySelector(`[id="${t}"]`);s!==null&&s.addEventListener("click",function(){e()})},function(){const s=document.querySelector(`[id="${t}-text"]`);s!==null&&s.addEventListener("click",function(){e()})})},"pushFun"),Us=o(function(t,e,s){t.split(",").forEach(function(i){js(i,e,s)}),Se(t,"clickable")},"setClickEvent"),Zs=o(function(t){qt.forEach(function(e){e(t)})},"bindFunctions"),Qs={getConfig:o(()=>ut().gantt,"getConfig"),clear:ms,setDateFormat:xs,getDateFormat:Ms,enableInclusiveEndDates:ws,endDatesAreInclusive:_s,enableTopAxis:Ds,topAxisEnabled:Cs,setAxisFormat:ys,getAxisFormat:gs,setTickInterval:ps,getTickInterval:vs,setTodayMarker:bs,getTodayMarker:Ts,setAccTitle:Ae,getAccTitle:Le,setDiagramTitle:Ye,getDiagramTitle:Fe,setDisplayMode:Ss,getDisplayMode:Es,setAccDescription:We,getAccDescription:Ve,addSection:Ws,getSections:Vs,getTasks:Os,addTask:Hs,findTaskById:at,addTaskOrg:Xs,setIncludes:Is,getIncludes:As,setExcludes:Ls,getExcludes:Ys,setClickEvent:Us,setLink:qs,getLinks:Fs,bindFunctions:Zs,parseDuration:_e,isInvalidDate:xe,setWeekday:zs,getWeekday:Ns,setWeekend:Ps};function Zt(t,e,s){let i=!0;for(;i;)i=!1,s.forEach(function(a){const k="^\\s*"+a+"\\s*$",d=new RegExp(k);t[0].match(d)&&(e[a]=!0,t.shift(1),i=!0)})}o(Zt,"getTaskTags");var $s=o(function(){wt.debug("Something is calling, setConf, remove the call")},"setConf"),ae={monday:Ue,tuesday:Ze,wednesday:Qe,thursday:$e,friday:Ke,saturday:Je,sunday:ts},Ks=o((t,e)=>{let s=[...t].map(()=>-1/0),i=[...t].sort((k,d)=>k.startTime-d.startTime||k.order-d.order),a=0;for(const k of i)for(let d=0;d<s.length;d++)if(k.startTime>=s[d]){s[d]=k.endTime,k.order=d+e,d>a&&(a=d);break}return a},"getMaxIntersections"),st,Js=o(function(t,e,s,i){const a=ut().gantt,k=ut().securityLevel;let d;k==="sandbox"&&(d=bt("#i"+e));const b=k==="sandbox"?bt(d.nodes()[0].contentDocument.body):bt("body"),F=k==="sandbox"?d.nodes()[0].contentDocument:document,E=F.getElementById(e);st=E.parentElement.offsetWidth,st===void 0&&(st=1200),a.useWidth!==void 0&&(st=a.useWidth);const g=i.db.getTasks();let M=[];for(const y of g)M.push(y.type);M=j(M);const O={};let z=2*a.topPadding;if(i.db.getDisplayMode()==="compact"||a.displayMode==="compact"){const y={};for(const x of g)y[x.section]===void 0?y[x.section]=[x]:y[x.section].push(x);let T=0;for(const x of Object.keys(y)){const w=Ks(y[x],T)+1;T+=w,z+=w*(a.barHeight+a.barGap),O[x]=w}}else{z+=g.length*(a.barHeight+a.barGap);for(const y of M)O[y]=g.filter(T=>T.type===y).length}E.setAttribute("viewBox","0 0 "+st+" "+z);const B=b.select(`[id="${e}"]`),S=Ne().domain([Pe(g,function(y){return y.startTime}),Re(g,function(y){return y.endTime})]).rangeRound([0,st-a.leftPadding-a.rightPadding]);function p(y,T){const x=y.startTime,w=T.startTime;let m=0;return x>w?m=1:x<w&&(m=-1),m}o(p,"taskCompare"),g.sort(p),C(g,st,z),Be(B,z,st,a.useMaxWidth),B.append("text").text(i.db.getDiagramTitle()).attr("x",st/2).attr("y",a.titleTopMargin).attr("class","titleText");function C(y,T,x){const w=a.barHeight,m=w+a.barGap,_=a.topPadding,c=a.leftPadding,l=Ge().domain([0,M.length]).range(["#00B9FA","#F95002"]).interpolate(cs);Y(m,_,c,T,x,y,i.db.getExcludes(),i.db.getIncludes()),H(c,_,T,x),L(y,m,_,c,w,l,T),X(m,_),Q(c,_,T,x)}o(C,"makeGantt");function L(y,T,x,w,m,_,c){const h=[...new Set(y.map(u=>u.order))].map(u=>y.find(r=>r.order===u));B.append("g").selectAll("rect").data(h).enter().append("rect").attr("x",0).attr("y",function(u,r){return r=u.order,r*T+x-2}).attr("width",function(){return c-a.rightPadding/2}).attr("height",T).attr("class",function(u){for(const[r,I]of M.entries())if(u.type===I)return"section section"+r%a.numberSectionStyles;return"section section0"});const f=B.append("g").selectAll("rect").data(y).enter(),v=i.db.getLinks();if(f.append("rect").attr("id",function(u){return u.id}).attr("rx",3).attr("ry",3).attr("x",function(u){return u.milestone?S(u.startTime)+w+.5*(S(u.endTime)-S(u.startTime))-.5*m:S(u.startTime)+w}).attr("y",function(u,r){return r=u.order,r*T+x}).attr("width",function(u){return u.milestone?m:S(u.renderEndTime||u.endTime)-S(u.startTime)}).attr("height",m).attr("transform-origin",function(u,r){return r=u.order,(S(u.startTime)+w+.5*(S(u.endTime)-S(u.startTime))).toString()+"px "+(r*T+x+.5*m).toString()+"px"}).attr("class",function(u){const r="task";let I="";u.classes.length>0&&(I=u.classes.join(" "));let D=0;for(const[R,W]of M.entries())u.type===W&&(D=R%a.numberSectionStyles);let A="";return u.active?u.crit?A+=" activeCrit":A=" active":u.done?u.crit?A=" doneCrit":A=" done":u.crit&&(A+=" crit"),A.length===0&&(A=" task"),u.milestone&&(A=" milestone "+A),A+=D,A+=" "+I,r+A}),f.append("text").attr("id",function(u){return u.id+"-text"}).text(function(u){return u.task}).attr("font-size",a.fontSize).attr("x",function(u){let r=S(u.startTime),I=S(u.renderEndTime||u.endTime);u.milestone&&(r+=.5*(S(u.endTime)-S(u.startTime))-.5*m),u.milestone&&(I=r+m);const D=this.getBBox().width;return D>I-r?I+D+1.5*a.leftPadding>c?r+w-5:I+w+5:(I-r)/2+r+w}).attr("y",function(u,r){return r=u.order,r*T+a.barHeight/2+(a.fontSize/2-2)+x}).attr("text-height",m).attr("class",function(u){const r=S(u.startTime);let I=S(u.endTime);u.milestone&&(I=r+m);const D=this.getBBox().width;let A="";u.classes.length>0&&(A=u.classes.join(" "));let R=0;for(const[V,$]of M.entries())u.type===$&&(R=V%a.numberSectionStyles);let W="";return u.active&&(u.crit?W="activeCritText"+R:W="activeText"+R),u.done?u.crit?W=W+" doneCritText"+R:W=W+" doneText"+R:u.crit&&(W=W+" critText"+R),u.milestone&&(W+=" milestoneText"),D>I-r?I+D+1.5*a.leftPadding>c?A+" taskTextOutsideLeft taskTextOutside"+R+" "+W:A+" taskTextOutsideRight taskTextOutside"+R+" "+W+" width-"+D:A+" taskText taskText"+R+" "+W+" width-"+D}),ut().securityLevel==="sandbox"){let u;u=bt("#i"+e);const r=u.nodes()[0].contentDocument;f.filter(function(I){return v.has(I.id)}).each(function(I){var D=r.querySelector("#"+I.id),A=r.querySelector("#"+I.id+"-text");const R=D.parentNode;var W=r.createElement("a");W.setAttribute("xlink:href",v.get(I.id)),W.setAttribute("target","_top"),R.appendChild(W),W.appendChild(D),W.appendChild(A)})}}o(L,"drawRects");function Y(y,T,x,w,m,_,c,l){if(c.length===0&&l.length===0)return;let h,f;for(const{startTime:D,endTime:A}of _)(h===void 0||D<h)&&(h=D),(f===void 0||A>f)&&(f=A);if(!h||!f)return;if(q(f).diff(q(h),"year")>5){wt.warn("The difference between the min and max time is more than 5 years. This will cause performance issues. Skipping drawing exclude days.");return}const v=i.db.getDateFormat(),n=[];let u=null,r=q(h);for(;r.valueOf()<=f;)i.db.isInvalidDate(r,v,c,l)?u?u.end=r:u={start:r,end:r}:u&&(n.push(u),u=null),r=r.add(1,"d");B.append("g").selectAll("rect").data(n).enter().append("rect").attr("id",function(D){return"exclude-"+D.start.format("YYYY-MM-DD")}).attr("x",function(D){return S(D.start)+x}).attr("y",a.gridLineStartPadding).attr("width",function(D){const A=D.end.add(1,"day");return S(A)-S(D.start)}).attr("height",m-T-a.gridLineStartPadding).attr("transform-origin",function(D,A){return(S(D.start)+x+.5*(S(D.end)-S(D.start))).toString()+"px "+(A*y+.5*m).toString()+"px"}).attr("class","exclude-range")}o(Y,"drawExcludeDays");function H(y,T,x,w){let m=He(S).tickSize(-w+T+a.gridLineStartPadding).tickFormat($t(i.db.getAxisFormat()||a.axisFormat||"%Y-%m-%d"));const c=/^([1-9]\d*)(millisecond|second|minute|hour|day|week|month)$/.exec(i.db.getTickInterval()||a.tickInterval);if(c!==null){const l=c[1],h=c[2],f=i.db.getWeekday()||a.weekday;switch(h){case"millisecond":m.ticks(re.every(l));break;case"second":m.ticks(se.every(l));break;case"minute":m.ticks(ee.every(l));break;case"hour":m.ticks(te.every(l));break;case"day":m.ticks(Jt.every(l));break;case"week":m.ticks(ae[f].every(l));break;case"month":m.ticks(Kt.every(l));break}}if(B.append("g").attr("class","grid").attr("transform","translate("+y+", "+(w-50)+")").call(m).selectAll("text").style("text-anchor","middle").attr("fill","#000").attr("stroke","none").attr("font-size",10).attr("dy","1em"),i.db.topAxisEnabled()||a.topAxis){let l=Xe(S).tickSize(-w+T+a.gridLineStartPadding).tickFormat($t(i.db.getAxisFormat()||a.axisFormat||"%Y-%m-%d"));if(c!==null){const h=c[1],f=c[2],v=i.db.getWeekday()||a.weekday;switch(f){case"millisecond":l.ticks(re.every(h));break;case"second":l.ticks(se.every(h));break;case"minute":l.ticks(ee.every(h));break;case"hour":l.ticks(te.every(h));break;case"day":l.ticks(Jt.every(h));break;case"week":l.ticks(ae[v].every(h));break;case"month":l.ticks(Kt.every(h));break}}B.append("g").attr("class","grid").attr("transform","translate("+y+", "+T+")").call(l).selectAll("text").style("text-anchor","middle").attr("fill","#000").attr("stroke","none").attr("font-size",10)}}o(H,"makeGrid");function X(y,T){let x=0;const w=Object.keys(O).map(m=>[m,O[m]]);B.append("g").selectAll("text").data(w).enter().append(function(m){const _=m[0].split(qe.lineBreakRegex),c=-(_.length-1)/2,l=F.createElementNS("http://www.w3.org/2000/svg","text");l.setAttribute("dy",c+"em");for(const[h,f]of _.entries()){const v=F.createElementNS("http://www.w3.org/2000/svg","tspan");v.setAttribute("alignment-baseline","central"),v.setAttribute("x","10"),h>0&&v.setAttribute("dy","1em"),v.textContent=f,l.appendChild(v)}return l}).attr("x",10).attr("y",function(m,_){if(_>0)for(let c=0;c<_;c++)return x+=w[_-1][1],m[1]*y/2+x*y+T;else return m[1]*y/2+T}).attr("font-size",a.sectionFontSize).attr("class",function(m){for(const[_,c]of M.entries())if(m[0]===c)return"sectionTitle sectionTitle"+_%a.numberSectionStyles;return"sectionTitle"})}o(X,"vertLabels");function Q(y,T,x,w){const m=i.db.getTodayMarker();if(m==="off")return;const _=B.append("g").attr("class","today"),c=new Date,l=_.append("line");l.attr("x1",S(c)+y).attr("x2",S(c)+y).attr("y1",a.titleTopMargin).attr("y2",w-a.titleTopMargin).attr("class","today"),m!==""&&l.attr("style",m.replace(/,/g,";"))}o(Q,"drawToday");function j(y){const T={},x=[];for(let w=0,m=y.length;w<m;++w)Object.prototype.hasOwnProperty.call(T,y[w])||(T[y[w]]=!0,x.push(y[w]));return x}o(j,"checkUnique")},"draw"),tr={setConf:$s,draw:Js},er=o(t=>`
  .mermaid-main-font {
        font-family: ${t.fontFamily};
  }

  .exclude-range {
    fill: ${t.excludeBkgColor};
  }

  .section {
    stroke: none;
    opacity: 0.2;
  }

  .section0 {
    fill: ${t.sectionBkgColor};
  }

  .section2 {
    fill: ${t.sectionBkgColor2};
  }

  .section1,
  .section3 {
    fill: ${t.altSectionBkgColor};
    opacity: 0.2;
  }

  .sectionTitle0 {
    fill: ${t.titleColor};
  }

  .sectionTitle1 {
    fill: ${t.titleColor};
  }

  .sectionTitle2 {
    fill: ${t.titleColor};
  }

  .sectionTitle3 {
    fill: ${t.titleColor};
  }

  .sectionTitle {
    text-anchor: start;
    font-family: ${t.fontFamily};
  }


  /* Grid and axis */

  .grid .tick {
    stroke: ${t.gridColor};
    opacity: 0.8;
    shape-rendering: crispEdges;
  }

  .grid .tick text {
    font-family: ${t.fontFamily};
    fill: ${t.textColor};
  }

  .grid path {
    stroke-width: 0;
  }


  /* Today line */

  .today {
    fill: none;
    stroke: ${t.todayLineColor};
    stroke-width: 2px;
  }


  /* Task styling */

  /* Default task */

  .task {
    stroke-width: 2;
  }

  .taskText {
    text-anchor: middle;
    font-family: ${t.fontFamily};
  }

  .taskTextOutsideRight {
    fill: ${t.taskTextDarkColor};
    text-anchor: start;
    font-family: ${t.fontFamily};
  }

  .taskTextOutsideLeft {
    fill: ${t.taskTextDarkColor};
    text-anchor: end;
  }


  /* Special case clickable */

  .task.clickable {
    cursor: pointer;
  }

  .taskText.clickable {
    cursor: pointer;
    fill: ${t.taskTextClickableColor} !important;
    font-weight: bold;
  }

  .taskTextOutsideLeft.clickable {
    cursor: pointer;
    fill: ${t.taskTextClickableColor} !important;
    font-weight: bold;
  }

  .taskTextOutsideRight.clickable {
    cursor: pointer;
    fill: ${t.taskTextClickableColor} !important;
    font-weight: bold;
  }


  /* Specific task settings for the sections*/

  .taskText0,
  .taskText1,
  .taskText2,
  .taskText3 {
    fill: ${t.taskTextColor};
  }

  .task0,
  .task1,
  .task2,
  .task3 {
    fill: ${t.taskBkgColor};
    stroke: ${t.taskBorderColor};
  }

  .taskTextOutside0,
  .taskTextOutside2
  {
    fill: ${t.taskTextOutsideColor};
  }

  .taskTextOutside1,
  .taskTextOutside3 {
    fill: ${t.taskTextOutsideColor};
  }


  /* Active task */

  .active0,
  .active1,
  .active2,
  .active3 {
    fill: ${t.activeTaskBkgColor};
    stroke: ${t.activeTaskBorderColor};
  }

  .activeText0,
  .activeText1,
  .activeText2,
  .activeText3 {
    fill: ${t.taskTextDarkColor} !important;
  }


  /* Completed task */

  .done0,
  .done1,
  .done2,
  .done3 {
    stroke: ${t.doneTaskBorderColor};
    fill: ${t.doneTaskBkgColor};
    stroke-width: 2;
  }

  .doneText0,
  .doneText1,
  .doneText2,
  .doneText3 {
    fill: ${t.taskTextDarkColor} !important;
  }


  /* Tasks on the critical line */

  .crit0,
  .crit1,
  .crit2,
  .crit3 {
    stroke: ${t.critBorderColor};
    fill: ${t.critBkgColor};
    stroke-width: 2;
  }

  .activeCrit0,
  .activeCrit1,
  .activeCrit2,
  .activeCrit3 {
    stroke: ${t.critBorderColor};
    fill: ${t.activeTaskBkgColor};
    stroke-width: 2;
  }

  .doneCrit0,
  .doneCrit1,
  .doneCrit2,
  .doneCrit3 {
    stroke: ${t.critBorderColor};
    fill: ${t.doneTaskBkgColor};
    stroke-width: 2;
    cursor: pointer;
    shape-rendering: crispEdges;
  }

  .milestone {
    transform: rotate(45deg) scale(0.8,0.8);
  }

  .milestoneText {
    font-style: italic;
  }
  .doneCritText0,
  .doneCritText1,
  .doneCritText2,
  .doneCritText3 {
    fill: ${t.taskTextDarkColor} !important;
  }

  .activeCritText0,
  .activeCritText1,
  .activeCritText2,
  .activeCritText3 {
    fill: ${t.taskTextDarkColor} !important;
  }

  .titleText {
    text-anchor: middle;
    font-size: 18px;
    fill: ${t.titleColor||t.textColor};
    font-family: ${t.fontFamily};
  }
`,"getStyles"),sr=er,ir={parser:ks,db:Qs,renderer:tr,styles:sr};export{ir as diagram};
