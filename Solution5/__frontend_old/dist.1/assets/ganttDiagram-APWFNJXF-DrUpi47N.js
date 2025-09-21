import{aP as fe,aQ as Ae,aR as he,aS as ke,aT as me,aU as At,aV as Fe,aL as Rt,_ as o,g as Le,s as Ye,x as We,v as Pe,a as Ve,b as Oe,c as ut,d as bt,aW as ze,aX as Ne,aY as Re,e as Be,a4 as qe,aZ as X,l as Ct,a_ as Ge,a$ as Jt,b0 as te,b1 as He,b2 as Xe,b3 as Ue,b4 as Ze,b5 as je,b6 as $e,b7 as Qe,b8 as ee,b9 as re,ba as se,bb as ie,bc as ne,bd as Ke,k as Je,j as tr,B as er,u as rr}from"./index-C-jmaZ3O.js";const sr=Math.PI/180,ir=180/Math.PI,St=18,ye=.96422,ge=1,pe=.82521,ve=4/29,dt=6/29,be=3*dt*dt,nr=dt*dt*dt;function xe(t){if(t instanceof et)return new et(t.l,t.a,t.b,t.opacity);if(t instanceof st)return Te(t);t instanceof fe||(t=Ae(t));var e=Wt(t.r),r=Wt(t.g),i=Wt(t.b),a=Ft((.2225045*e+.7168786*r+.0606169*i)/ge),k,d;return e===r&&r===i?k=d=a:(k=Ft((.4360747*e+.3850649*r+.1430804*i)/ye),d=Ft((.0139322*e+.0971045*r+.7141733*i)/pe)),new et(116*a-16,500*(k-a),200*(a-d),t.opacity)}function ar(t,e,r,i){return arguments.length===1?xe(t):new et(t,e,r,i??1)}function et(t,e,r,i){this.l=+t,this.a=+e,this.b=+r,this.opacity=+i}he(et,ar,ke(me,{brighter(t){return new et(this.l+St*(t??1),this.a,this.b,this.opacity)},darker(t){return new et(this.l-St*(t??1),this.a,this.b,this.opacity)},rgb(){var t=(this.l+16)/116,e=isNaN(this.a)?t:t+this.a/500,r=isNaN(this.b)?t:t-this.b/200;return e=ye*Lt(e),t=ge*Lt(t),r=pe*Lt(r),new fe(Yt(3.1338561*e-1.6168667*t-.4906146*r),Yt(-.9787684*e+1.9161415*t+.033454*r),Yt(.0719453*e-.2289914*t+1.4052427*r),this.opacity)}}));function Ft(t){return t>nr?Math.pow(t,1/3):t/be+ve}function Lt(t){return t>dt?t*t*t:be*(t-ve)}function Yt(t){return 255*(t<=.0031308?12.92*t:1.055*Math.pow(t,1/2.4)-.055)}function Wt(t){return(t/=255)<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4)}function cr(t){if(t instanceof st)return new st(t.h,t.c,t.l,t.opacity);if(t instanceof et||(t=xe(t)),t.a===0&&t.b===0)return new st(NaN,0<t.l&&t.l<100?0:NaN,t.l,t.opacity);var e=Math.atan2(t.b,t.a)*ir;return new st(e<0?e+360:e,Math.sqrt(t.a*t.a+t.b*t.b),t.l,t.opacity)}function Pt(t,e,r,i){return arguments.length===1?cr(t):new st(t,e,r,i??1)}function st(t,e,r,i){this.h=+t,this.c=+e,this.l=+r,this.opacity=+i}function Te(t){if(isNaN(t.h))return new et(t.l,0,0,t.opacity);var e=t.h*sr;return new et(t.l,Math.cos(e)*t.c,Math.sin(e)*t.c,t.opacity)}he(st,Pt,ke(me,{brighter(t){return new st(this.h,this.c,this.l+St*(t??1),this.opacity)},darker(t){return new st(this.h,this.c,this.l-St*(t??1),this.opacity)},rgb(){return Te(this).rgb()}}));function or(t){return function(e,r){var i=t((e=Pt(e)).h,(r=Pt(r)).h),a=At(e.c,r.c),k=At(e.l,r.l),d=At(e.opacity,r.opacity);return function(b){return e.h=i(b),e.c=a(b),e.l=k(b),e.opacity=d(b),e+""}}}const lr=or(Fe);var xt={exports:{}},ur=xt.exports,ae;function dr(){return ae||(ae=1,function(t,e){(function(r,i){t.exports=i()})(ur,function(){var r="day";return function(i,a,k){var d=function(E){return E.add(4-E.isoWeekday(),r)},b=a.prototype;b.isoWeekYear=function(){return d(this).year()},b.isoWeek=function(E){if(!this.$utils().u(E))return this.add(7*(E-this.isoWeek()),r);var g,M,V,O,B=d(this),S=(g=this.isoWeekYear(),M=this.$u,V=(M?k.utc:k)().year(g).startOf("year"),O=4-V.isoWeekday(),V.isoWeekday()>4&&(O+=7),V.add(O,r));return B.diff(S,"week")+1},b.isoWeekday=function(E){return this.$utils().u(E)?this.day()||7:this.day(this.day()%7?E:E-7)};var Y=b.startOf;b.startOf=function(E,g){var M=this.$utils(),V=!!M.u(g)||g;return M.p(E)==="isoweek"?V?this.date(this.date()-(this.isoWeekday()-1)).startOf("day"):this.date(this.date()-1-(this.isoWeekday()-1)+7).endOf("day"):Y.bind(this)(E,g)}}})}(xt)),xt.exports}var fr=dr();const hr=Rt(fr);var Tt={exports:{}},kr=Tt.exports,ce;function mr(){return ce||(ce=1,function(t,e){(function(r,i){t.exports=i()})(kr,function(){var r={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},i=/(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|Q|YYYY|YY?|ww?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g,a=/\d/,k=/\d\d/,d=/\d\d?/,b=/\d*[^-_:/,()\s\d]+/,Y={},E=function(p){return(p=+p)+(p>68?1900:2e3)},g=function(p){return function(C){this[p]=+C}},M=[/[+-]\d\d:?(\d\d)?|Z/,function(p){(this.zone||(this.zone={})).offset=function(C){if(!C||C==="Z")return 0;var F=C.match(/([+-]|\d\d)/g),L=60*F[1]+(+F[2]||0);return L===0?0:F[0]==="+"?-L:L}(p)}],V=function(p){var C=Y[p];return C&&(C.indexOf?C:C.s.concat(C.f))},O=function(p,C){var F,L=Y.meridiem;if(L){for(var G=1;G<=24;G+=1)if(p.indexOf(L(G,0,C))>-1){F=G>12;break}}else F=p===(C?"pm":"PM");return F},B={A:[b,function(p){this.afternoon=O(p,!1)}],a:[b,function(p){this.afternoon=O(p,!0)}],Q:[a,function(p){this.month=3*(p-1)+1}],S:[a,function(p){this.milliseconds=100*+p}],SS:[k,function(p){this.milliseconds=10*+p}],SSS:[/\d{3}/,function(p){this.milliseconds=+p}],s:[d,g("seconds")],ss:[d,g("seconds")],m:[d,g("minutes")],mm:[d,g("minutes")],H:[d,g("hours")],h:[d,g("hours")],HH:[d,g("hours")],hh:[d,g("hours")],D:[d,g("day")],DD:[k,g("day")],Do:[b,function(p){var C=Y.ordinal,F=p.match(/\d+/);if(this.day=F[0],C)for(var L=1;L<=31;L+=1)C(L).replace(/\[|\]/g,"")===p&&(this.day=L)}],w:[d,g("week")],ww:[k,g("week")],M:[d,g("month")],MM:[k,g("month")],MMM:[b,function(p){var C=V("months"),F=(V("monthsShort")||C.map(function(L){return L.slice(0,3)})).indexOf(p)+1;if(F<1)throw new Error;this.month=F%12||F}],MMMM:[b,function(p){var C=V("months").indexOf(p)+1;if(C<1)throw new Error;this.month=C%12||C}],Y:[/[+-]?\d+/,g("year")],YY:[k,function(p){this.year=E(p)}],YYYY:[/\d{4}/,g("year")],Z:M,ZZ:M};function S(p){var C,F;C=p,F=Y&&Y.formats;for(var L=(p=C.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,function(T,w,m){var _=m&&m.toUpperCase();return w||F[m]||r[m]||F[_].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,function(c,l,h){return l||h.slice(1)})})).match(i),G=L.length,H=0;H<G;H+=1){var $=L[H],U=B[$],y=U&&U[0],x=U&&U[1];L[H]=x?{regex:y,parser:x}:$.replace(/^\[|\]$/g,"")}return function(T){for(var w={},m=0,_=0;m<G;m+=1){var c=L[m];if(typeof c=="string")_+=c.length;else{var l=c.regex,h=c.parser,f=T.slice(_),v=l.exec(f)[0];h.call(w,v),T=T.replace(v,"")}}return function(n){var u=n.afternoon;if(u!==void 0){var s=n.hours;u?s<12&&(n.hours+=12):s===12&&(n.hours=0),delete n.afternoon}}(w),w}}return function(p,C,F){F.p.customParseFormat=!0,p&&p.parseTwoDigitYear&&(E=p.parseTwoDigitYear);var L=C.prototype,G=L.parse;L.parse=function(H){var $=H.date,U=H.utc,y=H.args;this.$u=U;var x=y[1];if(typeof x=="string"){var T=y[2]===!0,w=y[3]===!0,m=T||w,_=y[2];w&&(_=y[2]),Y=this.$locale(),!T&&_&&(Y=F.Ls[_]),this.$d=function(f,v,n,u){try{if(["x","X"].indexOf(v)>-1)return new Date((v==="X"?1e3:1)*f);var s=S(v)(f),I=s.year,D=s.month,A=s.day,R=s.hours,W=s.minutes,P=s.seconds,Q=s.milliseconds,ct=s.zone,ot=s.week,kt=new Date,mt=A||(I||D?1:kt.getDate()),lt=I||kt.getFullYear(),z=0;I&&!D||(z=D>0?D-1:kt.getMonth());var j,q=R||0,nt=W||0,K=P||0,it=Q||0;return ct?new Date(Date.UTC(lt,z,mt,q,nt,K,it+60*ct.offset*1e3)):n?new Date(Date.UTC(lt,z,mt,q,nt,K,it)):(j=new Date(lt,z,mt,q,nt,K,it),ot&&(j=u(j).week(ot).toDate()),j)}catch{return new Date("")}}($,x,U,F),this.init(),_&&_!==!0&&(this.$L=this.locale(_).$L),m&&$!=this.format(x)&&(this.$d=new Date("")),Y={}}else if(x instanceof Array)for(var c=x.length,l=1;l<=c;l+=1){y[1]=x[l-1];var h=F.apply(this,y);if(h.isValid()){this.$d=h.$d,this.$L=h.$L,this.init();break}l===c&&(this.$d=new Date(""))}else G.call(this,H)}}})}(Tt)),Tt.exports}var yr=mr();const gr=Rt(yr);var wt={exports:{}},pr=wt.exports,oe;function vr(){return oe||(oe=1,function(t,e){(function(r,i){t.exports=i()})(pr,function(){return function(r,i){var a=i.prototype,k=a.format;a.format=function(d){var b=this,Y=this.$locale();if(!this.isValid())return k.bind(this)(d);var E=this.$utils(),g=(d||"YYYY-MM-DDTHH:mm:ssZ").replace(/\[([^\]]+)]|Q|wo|ww|w|WW|W|zzz|z|gggg|GGGG|Do|X|x|k{1,2}|S/g,function(M){switch(M){case"Q":return Math.ceil((b.$M+1)/3);case"Do":return Y.ordinal(b.$D);case"gggg":return b.weekYear();case"GGGG":return b.isoWeekYear();case"wo":return Y.ordinal(b.week(),"W");case"w":case"ww":return E.s(b.week(),M==="w"?1:2,"0");case"W":case"WW":return E.s(b.isoWeek(),M==="W"?1:2,"0");case"k":case"kk":return E.s(String(b.$H===0?24:b.$H),M==="k"?1:2,"0");case"X":return Math.floor(b.$d.getTime()/1e3);case"x":return b.$d.getTime();case"z":return"["+b.offsetName()+"]";case"zzz":return"["+b.offsetName("long")+"]";default:return M}});return k.bind(this)(g)}}})}(wt)),wt.exports}var br=vr();const xr=Rt(br);var Vt=function(){var t=o(function(_,c,l,h){for(l=l||{},h=_.length;h--;l[_[h]]=c);return l},"o"),e=[6,8,10,12,13,14,15,16,17,18,20,21,22,23,24,25,26,27,28,29,30,31,33,35,36,38,40],r=[1,26],i=[1,27],a=[1,28],k=[1,29],d=[1,30],b=[1,31],Y=[1,32],E=[1,33],g=[1,34],M=[1,9],V=[1,10],O=[1,11],B=[1,12],S=[1,13],p=[1,14],C=[1,15],F=[1,16],L=[1,19],G=[1,20],H=[1,21],$=[1,22],U=[1,23],y=[1,25],x=[1,35],T={trace:o(function(){},"trace"),yy:{},symbols_:{error:2,start:3,gantt:4,document:5,EOF:6,line:7,SPACE:8,statement:9,NL:10,weekday:11,weekday_monday:12,weekday_tuesday:13,weekday_wednesday:14,weekday_thursday:15,weekday_friday:16,weekday_saturday:17,weekday_sunday:18,weekend:19,weekend_friday:20,weekend_saturday:21,dateFormat:22,inclusiveEndDates:23,topAxis:24,axisFormat:25,tickInterval:26,excludes:27,includes:28,todayMarker:29,title:30,acc_title:31,acc_title_value:32,acc_descr:33,acc_descr_value:34,acc_descr_multiline_value:35,section:36,clickStatement:37,taskTxt:38,taskData:39,click:40,callbackname:41,callbackargs:42,href:43,clickStatementDebug:44,$accept:0,$end:1},terminals_:{2:"error",4:"gantt",6:"EOF",8:"SPACE",10:"NL",12:"weekday_monday",13:"weekday_tuesday",14:"weekday_wednesday",15:"weekday_thursday",16:"weekday_friday",17:"weekday_saturday",18:"weekday_sunday",20:"weekend_friday",21:"weekend_saturday",22:"dateFormat",23:"inclusiveEndDates",24:"topAxis",25:"axisFormat",26:"tickInterval",27:"excludes",28:"includes",29:"todayMarker",30:"title",31:"acc_title",32:"acc_title_value",33:"acc_descr",34:"acc_descr_value",35:"acc_descr_multiline_value",36:"section",38:"taskTxt",39:"taskData",40:"click",41:"callbackname",42:"callbackargs",43:"href"},productions_:[0,[3,3],[5,0],[5,2],[7,2],[7,1],[7,1],[7,1],[11,1],[11,1],[11,1],[11,1],[11,1],[11,1],[11,1],[19,1],[19,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,2],[9,2],[9,1],[9,1],[9,1],[9,2],[37,2],[37,3],[37,3],[37,4],[37,3],[37,4],[37,2],[44,2],[44,3],[44,3],[44,4],[44,3],[44,4],[44,2]],performAction:o(function(c,l,h,f,v,n,u){var s=n.length-1;switch(v){case 1:return n[s-1];case 2:this.$=[];break;case 3:n[s-1].push(n[s]),this.$=n[s-1];break;case 4:case 5:this.$=n[s];break;case 6:case 7:this.$=[];break;case 8:f.setWeekday("monday");break;case 9:f.setWeekday("tuesday");break;case 10:f.setWeekday("wednesday");break;case 11:f.setWeekday("thursday");break;case 12:f.setWeekday("friday");break;case 13:f.setWeekday("saturday");break;case 14:f.setWeekday("sunday");break;case 15:f.setWeekend("friday");break;case 16:f.setWeekend("saturday");break;case 17:f.setDateFormat(n[s].substr(11)),this.$=n[s].substr(11);break;case 18:f.enableInclusiveEndDates(),this.$=n[s].substr(18);break;case 19:f.TopAxis(),this.$=n[s].substr(8);break;case 20:f.setAxisFormat(n[s].substr(11)),this.$=n[s].substr(11);break;case 21:f.setTickInterval(n[s].substr(13)),this.$=n[s].substr(13);break;case 22:f.setExcludes(n[s].substr(9)),this.$=n[s].substr(9);break;case 23:f.setIncludes(n[s].substr(9)),this.$=n[s].substr(9);break;case 24:f.setTodayMarker(n[s].substr(12)),this.$=n[s].substr(12);break;case 27:f.setDiagramTitle(n[s].substr(6)),this.$=n[s].substr(6);break;case 28:this.$=n[s].trim(),f.setAccTitle(this.$);break;case 29:case 30:this.$=n[s].trim(),f.setAccDescription(this.$);break;case 31:f.addSection(n[s].substr(8)),this.$=n[s].substr(8);break;case 33:f.addTask(n[s-1],n[s]),this.$="task";break;case 34:this.$=n[s-1],f.setClickEvent(n[s-1],n[s],null);break;case 35:this.$=n[s-2],f.setClickEvent(n[s-2],n[s-1],n[s]);break;case 36:this.$=n[s-2],f.setClickEvent(n[s-2],n[s-1],null),f.setLink(n[s-2],n[s]);break;case 37:this.$=n[s-3],f.setClickEvent(n[s-3],n[s-2],n[s-1]),f.setLink(n[s-3],n[s]);break;case 38:this.$=n[s-2],f.setClickEvent(n[s-2],n[s],null),f.setLink(n[s-2],n[s-1]);break;case 39:this.$=n[s-3],f.setClickEvent(n[s-3],n[s-1],n[s]),f.setLink(n[s-3],n[s-2]);break;case 40:this.$=n[s-1],f.setLink(n[s-1],n[s]);break;case 41:case 47:this.$=n[s-1]+" "+n[s];break;case 42:case 43:case 45:this.$=n[s-2]+" "+n[s-1]+" "+n[s];break;case 44:case 46:this.$=n[s-3]+" "+n[s-2]+" "+n[s-1]+" "+n[s];break}},"anonymous"),table:[{3:1,4:[1,2]},{1:[3]},t(e,[2,2],{5:3}),{6:[1,4],7:5,8:[1,6],9:7,10:[1,8],11:17,12:r,13:i,14:a,15:k,16:d,17:b,18:Y,19:18,20:E,21:g,22:M,23:V,24:O,25:B,26:S,27:p,28:C,29:F,30:L,31:G,33:H,35:$,36:U,37:24,38:y,40:x},t(e,[2,7],{1:[2,1]}),t(e,[2,3]),{9:36,11:17,12:r,13:i,14:a,15:k,16:d,17:b,18:Y,19:18,20:E,21:g,22:M,23:V,24:O,25:B,26:S,27:p,28:C,29:F,30:L,31:G,33:H,35:$,36:U,37:24,38:y,40:x},t(e,[2,5]),t(e,[2,6]),t(e,[2,17]),t(e,[2,18]),t(e,[2,19]),t(e,[2,20]),t(e,[2,21]),t(e,[2,22]),t(e,[2,23]),t(e,[2,24]),t(e,[2,25]),t(e,[2,26]),t(e,[2,27]),{32:[1,37]},{34:[1,38]},t(e,[2,30]),t(e,[2,31]),t(e,[2,32]),{39:[1,39]},t(e,[2,8]),t(e,[2,9]),t(e,[2,10]),t(e,[2,11]),t(e,[2,12]),t(e,[2,13]),t(e,[2,14]),t(e,[2,15]),t(e,[2,16]),{41:[1,40],43:[1,41]},t(e,[2,4]),t(e,[2,28]),t(e,[2,29]),t(e,[2,33]),t(e,[2,34],{42:[1,42],43:[1,43]}),t(e,[2,40],{41:[1,44]}),t(e,[2,35],{43:[1,45]}),t(e,[2,36]),t(e,[2,38],{42:[1,46]}),t(e,[2,37]),t(e,[2,39])],defaultActions:{},parseError:o(function(c,l){if(l.recoverable)this.trace(c);else{var h=new Error(c);throw h.hash=l,h}},"parseError"),parse:o(function(c){var l=this,h=[0],f=[],v=[null],n=[],u=this.table,s="",I=0,D=0,A=2,R=1,W=n.slice.call(arguments,1),P=Object.create(this.lexer),Q={yy:{}};for(var ct in this.yy)Object.prototype.hasOwnProperty.call(this.yy,ct)&&(Q.yy[ct]=this.yy[ct]);P.setInput(c,Q.yy),Q.yy.lexer=P,Q.yy.parser=this,typeof P.yylloc>"u"&&(P.yylloc={});var ot=P.yylloc;n.push(ot);var kt=P.options&&P.options.ranges;typeof Q.yy.parseError=="function"?this.parseError=Q.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;function mt(Z){h.length=h.length-2*Z,v.length=v.length-Z,n.length=n.length-Z}o(mt,"popStack");function lt(){var Z;return Z=f.pop()||P.lex()||R,typeof Z!="number"&&(Z instanceof Array&&(f=Z,Z=f.pop()),Z=l.symbols_[Z]||Z),Z}o(lt,"lex");for(var z,j,q,nt,K={},it,J,Kt,vt;;){if(j=h[h.length-1],this.defaultActions[j]?q=this.defaultActions[j]:((z===null||typeof z>"u")&&(z=lt()),q=u[j]&&u[j][z]),typeof q>"u"||!q.length||!q[0]){var It="";vt=[];for(it in u[j])this.terminals_[it]&&it>A&&vt.push("'"+this.terminals_[it]+"'");P.showPosition?It="Parse error on line "+(I+1)+`:
`+P.showPosition()+`
Expecting `+vt.join(", ")+", got '"+(this.terminals_[z]||z)+"'":It="Parse error on line "+(I+1)+": Unexpected "+(z==R?"end of input":"'"+(this.terminals_[z]||z)+"'"),this.parseError(It,{text:P.match,token:this.terminals_[z]||z,line:P.yylineno,loc:ot,expected:vt})}if(q[0]instanceof Array&&q.length>1)throw new Error("Parse Error: multiple actions possible at state: "+j+", token: "+z);switch(q[0]){case 1:h.push(z),v.push(P.yytext),n.push(P.yylloc),h.push(q[1]),z=null,D=P.yyleng,s=P.yytext,I=P.yylineno,ot=P.yylloc;break;case 2:if(J=this.productions_[q[1]][1],K.$=v[v.length-J],K._$={first_line:n[n.length-(J||1)].first_line,last_line:n[n.length-1].last_line,first_column:n[n.length-(J||1)].first_column,last_column:n[n.length-1].last_column},kt&&(K._$.range=[n[n.length-(J||1)].range[0],n[n.length-1].range[1]]),nt=this.performAction.apply(K,[s,D,I,Q.yy,q[1],v,n].concat(W)),typeof nt<"u")return nt;J&&(h=h.slice(0,-1*J*2),v=v.slice(0,-1*J),n=n.slice(0,-1*J)),h.push(this.productions_[q[1]][0]),v.push(K.$),n.push(K._$),Kt=u[h[h.length-2]][h[h.length-1]],h.push(Kt);break;case 3:return!0}}return!0},"parse")},w=function(){var _={EOF:1,parseError:o(function(l,h){if(this.yy.parser)this.yy.parser.parseError(l,h);else throw new Error(l)},"parseError"),setInput:o(function(c,l){return this.yy=l||this.yy||{},this._input=c,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},"setInput"),input:o(function(){var c=this._input[0];this.yytext+=c,this.yyleng++,this.offset++,this.match+=c,this.matched+=c;var l=c.match(/(?:\r\n?|\n).*/g);return l?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),c},"input"),unput:o(function(c){var l=c.length,h=c.split(/(?:\r\n?|\n)/g);this._input=c+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-l),this.offset-=l;var f=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),h.length-1&&(this.yylineno-=h.length-1);var v=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:h?(h.length===f.length?this.yylloc.first_column:0)+f[f.length-h.length].length-h[0].length:this.yylloc.first_column-l},this.options.ranges&&(this.yylloc.range=[v[0],v[0]+this.yyleng-l]),this.yyleng=this.yytext.length,this},"unput"),more:o(function(){return this._more=!0,this},"more"),reject:o(function(){if(this.options.backtrack_lexer)this._backtrack=!0;else return this.parseError("Lexical error on line "+(this.yylineno+1)+`. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).
`+this.showPosition(),{text:"",token:null,line:this.yylineno});return this},"reject"),less:o(function(c){this.unput(this.match.slice(c))},"less"),pastInput:o(function(){var c=this.matched.substr(0,this.matched.length-this.match.length);return(c.length>20?"...":"")+c.substr(-20).replace(/\n/g,"")},"pastInput"),upcomingInput:o(function(){var c=this.match;return c.length<20&&(c+=this._input.substr(0,20-c.length)),(c.substr(0,20)+(c.length>20?"...":"")).replace(/\n/g,"")},"upcomingInput"),showPosition:o(function(){var c=this.pastInput(),l=new Array(c.length+1).join("-");return c+this.upcomingInput()+`
`+l+"^"},"showPosition"),test_match:o(function(c,l){var h,f,v;if(this.options.backtrack_lexer&&(v={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(v.yylloc.range=this.yylloc.range.slice(0))),f=c[0].match(/(?:\r\n?|\n).*/g),f&&(this.yylineno+=f.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:f?f[f.length-1].length-f[f.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+c[0].length},this.yytext+=c[0],this.match+=c[0],this.matches=c,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(c[0].length),this.matched+=c[0],h=this.performAction.call(this,this.yy,this,l,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),h)return h;if(this._backtrack){for(var n in v)this[n]=v[n];return!1}return!1},"test_match"),next:o(function(){if(this.done)return this.EOF;this._input||(this.done=!0);var c,l,h,f;this._more||(this.yytext="",this.match="");for(var v=this._currentRules(),n=0;n<v.length;n++)if(h=this._input.match(this.rules[v[n]]),h&&(!l||h[0].length>l[0].length)){if(l=h,f=n,this.options.backtrack_lexer){if(c=this.test_match(h,v[n]),c!==!1)return c;if(this._backtrack){l=!1;continue}else return!1}else if(!this.options.flex)break}return l?(c=this.test_match(l,v[f]),c!==!1?c:!1):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+`. Unrecognized text.
`+this.showPosition(),{text:"",token:null,line:this.yylineno})},"next"),lex:o(function(){var l=this.next();return l||this.lex()},"lex"),begin:o(function(l){this.conditionStack.push(l)},"begin"),popState:o(function(){var l=this.conditionStack.length-1;return l>0?this.conditionStack.pop():this.conditionStack[0]},"popState"),_currentRules:o(function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},"_currentRules"),topState:o(function(l){return l=this.conditionStack.length-1-Math.abs(l||0),l>=0?this.conditionStack[l]:"INITIAL"},"topState"),pushState:o(function(l){this.begin(l)},"pushState"),stateStackSize:o(function(){return this.conditionStack.length},"stateStackSize"),options:{"case-insensitive":!0},performAction:o(function(l,h,f,v){switch(f){case 0:return this.begin("open_directive"),"open_directive";case 1:return this.begin("acc_title"),31;case 2:return this.popState(),"acc_title_value";case 3:return this.begin("acc_descr"),33;case 4:return this.popState(),"acc_descr_value";case 5:this.begin("acc_descr_multiline");break;case 6:this.popState();break;case 7:return"acc_descr_multiline_value";case 8:break;case 9:break;case 10:break;case 11:return 10;case 12:break;case 13:break;case 14:this.begin("href");break;case 15:this.popState();break;case 16:return 43;case 17:this.begin("callbackname");break;case 18:this.popState();break;case 19:this.popState(),this.begin("callbackargs");break;case 20:return 41;case 21:this.popState();break;case 22:return 42;case 23:this.begin("click");break;case 24:this.popState();break;case 25:return 40;case 26:return 4;case 27:return 22;case 28:return 23;case 29:return 24;case 30:return 25;case 31:return 26;case 32:return 28;case 33:return 27;case 34:return 29;case 35:return 12;case 36:return 13;case 37:return 14;case 38:return 15;case 39:return 16;case 40:return 17;case 41:return 18;case 42:return 20;case 43:return 21;case 44:return"date";case 45:return 30;case 46:return"accDescription";case 47:return 36;case 48:return 38;case 49:return 39;case 50:return":";case 51:return 6;case 52:return"INVALID"}},"anonymous"),rules:[/^(?:%%\{)/i,/^(?:accTitle\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*\{\s*)/i,/^(?:[\}])/i,/^(?:[^\}]*)/i,/^(?:%%(?!\{)*[^\n]*)/i,/^(?:[^\}]%%*[^\n]*)/i,/^(?:%%*[^\n]*[\n]*)/i,/^(?:[\n]+)/i,/^(?:\s+)/i,/^(?:%[^\n]*)/i,/^(?:href[\s]+["])/i,/^(?:["])/i,/^(?:[^"]*)/i,/^(?:call[\s]+)/i,/^(?:\([\s]*\))/i,/^(?:\()/i,/^(?:[^(]*)/i,/^(?:\))/i,/^(?:[^)]*)/i,/^(?:click[\s]+)/i,/^(?:[\s\n])/i,/^(?:[^\s\n]*)/i,/^(?:gantt\b)/i,/^(?:dateFormat\s[^#\n;]+)/i,/^(?:inclusiveEndDates\b)/i,/^(?:topAxis\b)/i,/^(?:axisFormat\s[^#\n;]+)/i,/^(?:tickInterval\s[^#\n;]+)/i,/^(?:includes\s[^#\n;]+)/i,/^(?:excludes\s[^#\n;]+)/i,/^(?:todayMarker\s[^\n;]+)/i,/^(?:weekday\s+monday\b)/i,/^(?:weekday\s+tuesday\b)/i,/^(?:weekday\s+wednesday\b)/i,/^(?:weekday\s+thursday\b)/i,/^(?:weekday\s+friday\b)/i,/^(?:weekday\s+saturday\b)/i,/^(?:weekday\s+sunday\b)/i,/^(?:weekend\s+friday\b)/i,/^(?:weekend\s+saturday\b)/i,/^(?:\d\d\d\d-\d\d-\d\d\b)/i,/^(?:title\s[^\n]+)/i,/^(?:accDescription\s[^#\n;]+)/i,/^(?:section\s[^\n]+)/i,/^(?:[^:\n]+)/i,/^(?::[^#\n;]+)/i,/^(?::)/i,/^(?:$)/i,/^(?:.)/i],conditions:{acc_descr_multiline:{rules:[6,7],inclusive:!1},acc_descr:{rules:[4],inclusive:!1},acc_title:{rules:[2],inclusive:!1},callbackargs:{rules:[21,22],inclusive:!1},callbackname:{rules:[18,19,20],inclusive:!1},href:{rules:[15,16],inclusive:!1},click:{rules:[24,25],inclusive:!1},INITIAL:{rules:[0,1,3,5,8,9,10,11,12,13,14,17,23,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52],inclusive:!0}}};return _}();T.lexer=w;function m(){this.yy={}}return o(m,"Parser"),m.prototype=T,T.Parser=m,new m}();Vt.parser=Vt;var Tr=Vt;X.extend(hr);X.extend(gr);X.extend(xr);var le={friday:5,saturday:6},tt="",Bt="",qt=void 0,Gt="",yt=[],gt=[],Ht=new Map,Xt=[],Et=[],ht="",Ut="",we=["active","done","crit","milestone"],Zt=[],pt=!1,jt=!1,$t="sunday",Mt="saturday",Ot=0,wr=o(function(){Xt=[],Et=[],ht="",Zt=[],_t=0,Nt=void 0,Dt=void 0,N=[],tt="",Bt="",Ut="",qt=void 0,Gt="",yt=[],gt=[],pt=!1,jt=!1,Ot=0,Ht=new Map,er(),$t="sunday",Mt="saturday"},"clear"),_r=o(function(t){Bt=t},"setAxisFormat"),Dr=o(function(){return Bt},"getAxisFormat"),Cr=o(function(t){qt=t},"setTickInterval"),Sr=o(function(){return qt},"getTickInterval"),Er=o(function(t){Gt=t},"setTodayMarker"),Mr=o(function(){return Gt},"getTodayMarker"),Ir=o(function(t){tt=t},"setDateFormat"),Ar=o(function(){pt=!0},"enableInclusiveEndDates"),Fr=o(function(){return pt},"endDatesAreInclusive"),Lr=o(function(){jt=!0},"enableTopAxis"),Yr=o(function(){return jt},"topAxisEnabled"),Wr=o(function(t){Ut=t},"setDisplayMode"),Pr=o(function(){return Ut},"getDisplayMode"),Vr=o(function(){return tt},"getDateFormat"),Or=o(function(t){yt=t.toLowerCase().split(/[\s,]+/)},"setIncludes"),zr=o(function(){return yt},"getIncludes"),Nr=o(function(t){gt=t.toLowerCase().split(/[\s,]+/)},"setExcludes"),Rr=o(function(){return gt},"getExcludes"),Br=o(function(){return Ht},"getLinks"),qr=o(function(t){ht=t,Xt.push(t)},"addSection"),Gr=o(function(){return Xt},"getSections"),Hr=o(function(){let t=ue();const e=10;let r=0;for(;!t&&r<e;)t=ue(),r++;return Et=N,Et},"getTasks"),_e=o(function(t,e,r,i){return i.includes(t.format(e.trim()))?!1:r.includes("weekends")&&(t.isoWeekday()===le[Mt]||t.isoWeekday()===le[Mt]+1)||r.includes(t.format("dddd").toLowerCase())?!0:r.includes(t.format(e.trim()))},"isInvalidDate"),Xr=o(function(t){$t=t},"setWeekday"),Ur=o(function(){return $t},"getWeekday"),Zr=o(function(t){Mt=t},"setWeekend"),De=o(function(t,e,r,i){if(!r.length||t.manualEndTime)return;let a;t.startTime instanceof Date?a=X(t.startTime):a=X(t.startTime,e,!0),a=a.add(1,"d");let k;t.endTime instanceof Date?k=X(t.endTime):k=X(t.endTime,e,!0);const[d,b]=jr(a,k,e,r,i);t.endTime=d.toDate(),t.renderEndTime=b},"checkTaskDates"),jr=o(function(t,e,r,i,a){let k=!1,d=null;for(;t<=e;)k||(d=e.toDate()),k=_e(t,r,i,a),k&&(e=e.add(1,"d")),t=t.add(1,"d");return[e,d]},"fixTaskDates"),zt=o(function(t,e,r){r=r.trim();const a=/^after\s+(?<ids>[\d\w- ]+)/.exec(r);if(a!==null){let d=null;for(const Y of a.groups.ids.split(" ")){let E=at(Y);E!==void 0&&(!d||E.endTime>d.endTime)&&(d=E)}if(d)return d.endTime;const b=new Date;return b.setHours(0,0,0,0),b}let k=X(r,e.trim(),!0);if(k.isValid())return k.toDate();{Ct.debug("Invalid date:"+r),Ct.debug("With date format:"+e.trim());const d=new Date(r);if(d===void 0||isNaN(d.getTime())||d.getFullYear()<-1e4||d.getFullYear()>1e4)throw new Error("Invalid date:"+r);return d}},"getStartDate"),Ce=o(function(t){const e=/^(\d+(?:\.\d+)?)([Mdhmswy]|ms)$/.exec(t.trim());return e!==null?[Number.parseFloat(e[1]),e[2]]:[NaN,"ms"]},"parseDuration"),Se=o(function(t,e,r,i=!1){r=r.trim();const k=/^until\s+(?<ids>[\d\w- ]+)/.exec(r);if(k!==null){let g=null;for(const V of k.groups.ids.split(" ")){let O=at(V);O!==void 0&&(!g||O.startTime<g.startTime)&&(g=O)}if(g)return g.startTime;const M=new Date;return M.setHours(0,0,0,0),M}let d=X(r,e.trim(),!0);if(d.isValid())return i&&(d=d.add(1,"d")),d.toDate();let b=X(t);const[Y,E]=Ce(r);if(!Number.isNaN(Y)){const g=b.add(Y,E);g.isValid()&&(b=g)}return b.toDate()},"getEndDate"),_t=0,ft=o(function(t){return t===void 0?(_t=_t+1,"task"+_t):t},"parseId"),$r=o(function(t,e){let r;e.substr(0,1)===":"?r=e.substr(1,e.length):r=e;const i=r.split(","),a={};Qt(i,a,we);for(let d=0;d<i.length;d++)i[d]=i[d].trim();let k="";switch(i.length){case 1:a.id=ft(),a.startTime=t.endTime,k=i[0];break;case 2:a.id=ft(),a.startTime=zt(void 0,tt,i[0]),k=i[1];break;case 3:a.id=ft(i[0]),a.startTime=zt(void 0,tt,i[1]),k=i[2];break}return k&&(a.endTime=Se(a.startTime,tt,k,pt),a.manualEndTime=X(k,"YYYY-MM-DD",!0).isValid(),De(a,tt,gt,yt)),a},"compileData"),Qr=o(function(t,e){let r;e.substr(0,1)===":"?r=e.substr(1,e.length):r=e;const i=r.split(","),a={};Qt(i,a,we);for(let k=0;k<i.length;k++)i[k]=i[k].trim();switch(i.length){case 1:a.id=ft(),a.startTime={type:"prevTaskEnd",id:t},a.endTime={data:i[0]};break;case 2:a.id=ft(),a.startTime={type:"getStartDate",startData:i[0]},a.endTime={data:i[1]};break;case 3:a.id=ft(i[0]),a.startTime={type:"getStartDate",startData:i[1]},a.endTime={data:i[2]};break}return a},"parseData"),Nt,Dt,N=[],Ee={},Kr=o(function(t,e){const r={section:ht,type:ht,processed:!1,manualEndTime:!1,renderEndTime:null,raw:{data:e},task:t,classes:[]},i=Qr(Dt,e);r.raw.startTime=i.startTime,r.raw.endTime=i.endTime,r.id=i.id,r.prevTaskId=Dt,r.active=i.active,r.done=i.done,r.crit=i.crit,r.milestone=i.milestone,r.order=Ot,Ot++;const a=N.push(r);Dt=r.id,Ee[r.id]=a-1},"addTask"),at=o(function(t){const e=Ee[t];return N[e]},"findTaskById"),Jr=o(function(t,e){const r={section:ht,type:ht,description:t,task:t,classes:[]},i=$r(Nt,e);r.startTime=i.startTime,r.endTime=i.endTime,r.id=i.id,r.active=i.active,r.done=i.done,r.crit=i.crit,r.milestone=i.milestone,Nt=r,Et.push(r)},"addTaskOrg"),ue=o(function(){const t=o(function(r){const i=N[r];let a="";switch(N[r].raw.startTime.type){case"prevTaskEnd":{const k=at(i.prevTaskId);i.startTime=k.endTime;break}case"getStartDate":a=zt(void 0,tt,N[r].raw.startTime.startData),a&&(N[r].startTime=a);break}return N[r].startTime&&(N[r].endTime=Se(N[r].startTime,tt,N[r].raw.endTime.data,pt),N[r].endTime&&(N[r].processed=!0,N[r].manualEndTime=X(N[r].raw.endTime.data,"YYYY-MM-DD",!0).isValid(),De(N[r],tt,gt,yt))),N[r].processed},"compileTask");let e=!0;for(const[r,i]of N.entries())t(r),e=e&&i.processed;return e},"compileTasks"),ts=o(function(t,e){let r=e;ut().securityLevel!=="loose"&&(r=tr.sanitizeUrl(e)),t.split(",").forEach(function(i){at(i)!==void 0&&(Ie(i,()=>{window.open(r,"_self")}),Ht.set(i,r))}),Me(t,"clickable")},"setLink"),Me=o(function(t,e){t.split(",").forEach(function(r){let i=at(r);i!==void 0&&i.classes.push(e)})},"setClass"),es=o(function(t,e,r){if(ut().securityLevel!=="loose"||e===void 0)return;let i=[];if(typeof r=="string"){i=r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);for(let k=0;k<i.length;k++){let d=i[k].trim();d.startsWith('"')&&d.endsWith('"')&&(d=d.substr(1,d.length-2)),i[k]=d}}i.length===0&&i.push(t),at(t)!==void 0&&Ie(t,()=>{rr.runFunc(e,...i)})},"setClickFun"),Ie=o(function(t,e){Zt.push(function(){const r=document.querySelector(`[id="${t}"]`);r!==null&&r.addEventListener("click",function(){e()})},function(){const r=document.querySelector(`[id="${t}-text"]`);r!==null&&r.addEventListener("click",function(){e()})})},"pushFun"),rs=o(function(t,e,r){t.split(",").forEach(function(i){es(i,e,r)}),Me(t,"clickable")},"setClickEvent"),ss=o(function(t){Zt.forEach(function(e){e(t)})},"bindFunctions"),is={getConfig:o(()=>ut().gantt,"getConfig"),clear:wr,setDateFormat:Ir,getDateFormat:Vr,enableInclusiveEndDates:Ar,endDatesAreInclusive:Fr,enableTopAxis:Lr,topAxisEnabled:Yr,setAxisFormat:_r,getAxisFormat:Dr,setTickInterval:Cr,getTickInterval:Sr,setTodayMarker:Er,getTodayMarker:Mr,setAccTitle:Oe,getAccTitle:Ve,setDiagramTitle:Pe,getDiagramTitle:We,setDisplayMode:Wr,getDisplayMode:Pr,setAccDescription:Ye,getAccDescription:Le,addSection:qr,getSections:Gr,getTasks:Hr,addTask:Kr,findTaskById:at,addTaskOrg:Jr,setIncludes:Or,getIncludes:zr,setExcludes:Nr,getExcludes:Rr,setClickEvent:rs,setLink:ts,getLinks:Br,bindFunctions:ss,parseDuration:Ce,isInvalidDate:_e,setWeekday:Xr,getWeekday:Ur,setWeekend:Zr};function Qt(t,e,r){let i=!0;for(;i;)i=!1,r.forEach(function(a){const k="^\\s*"+a+"\\s*$",d=new RegExp(k);t[0].match(d)&&(e[a]=!0,t.shift(1),i=!0)})}o(Qt,"getTaskTags");var ns=o(function(){Ct.debug("Something is calling, setConf, remove the call")},"setConf"),de={monday:Qe,tuesday:$e,wednesday:je,thursday:Ze,friday:Ue,saturday:Xe,sunday:He},as=o((t,e)=>{let r=[...t].map(()=>-1/0),i=[...t].sort((k,d)=>k.startTime-d.startTime||k.order-d.order),a=0;for(const k of i)for(let d=0;d<r.length;d++)if(k.startTime>=r[d]){r[d]=k.endTime,k.order=d+e,d>a&&(a=d);break}return a},"getMaxIntersections"),rt,cs=o(function(t,e,r,i){const a=ut().gantt,k=ut().securityLevel;let d;k==="sandbox"&&(d=bt("#i"+e));const b=k==="sandbox"?bt(d.nodes()[0].contentDocument.body):bt("body"),Y=k==="sandbox"?d.nodes()[0].contentDocument:document,E=Y.getElementById(e);rt=E.parentElement.offsetWidth,rt===void 0&&(rt=1200),a.useWidth!==void 0&&(rt=a.useWidth);const g=i.db.getTasks();let M=[];for(const y of g)M.push(y.type);M=U(M);const V={};let O=2*a.topPadding;if(i.db.getDisplayMode()==="compact"||a.displayMode==="compact"){const y={};for(const T of g)y[T.section]===void 0?y[T.section]=[T]:y[T.section].push(T);let x=0;for(const T of Object.keys(y)){const w=as(y[T],x)+1;x+=w,O+=w*(a.barHeight+a.barGap),V[T]=w}}else{O+=g.length*(a.barHeight+a.barGap);for(const y of M)V[y]=g.filter(x=>x.type===y).length}E.setAttribute("viewBox","0 0 "+rt+" "+O);const B=b.select(`[id="${e}"]`),S=ze().domain([Ne(g,function(y){return y.startTime}),Re(g,function(y){return y.endTime})]).rangeRound([0,rt-a.leftPadding-a.rightPadding]);function p(y,x){const T=y.startTime,w=x.startTime;let m=0;return T>w?m=1:T<w&&(m=-1),m}o(p,"taskCompare"),g.sort(p),C(g,rt,O),Be(B,O,rt,a.useMaxWidth),B.append("text").text(i.db.getDiagramTitle()).attr("x",rt/2).attr("y",a.titleTopMargin).attr("class","titleText");function C(y,x,T){const w=a.barHeight,m=w+a.barGap,_=a.topPadding,c=a.leftPadding,l=qe().domain([0,M.length]).range(["#00B9FA","#F95002"]).interpolate(lr);L(m,_,c,x,T,y,i.db.getExcludes(),i.db.getIncludes()),G(c,_,x,T),F(y,m,_,c,w,l,x),H(m,_),$(c,_,x,T)}o(C,"makeGantt");function F(y,x,T,w,m,_,c){const h=[...new Set(y.map(u=>u.order))].map(u=>y.find(s=>s.order===u));B.append("g").selectAll("rect").data(h).enter().append("rect").attr("x",0).attr("y",function(u,s){return s=u.order,s*x+T-2}).attr("width",function(){return c-a.rightPadding/2}).attr("height",x).attr("class",function(u){for(const[s,I]of M.entries())if(u.type===I)return"section section"+s%a.numberSectionStyles;return"section section0"});const f=B.append("g").selectAll("rect").data(y).enter(),v=i.db.getLinks();if(f.append("rect").attr("id",function(u){return u.id}).attr("rx",3).attr("ry",3).attr("x",function(u){return u.milestone?S(u.startTime)+w+.5*(S(u.endTime)-S(u.startTime))-.5*m:S(u.startTime)+w}).attr("y",function(u,s){return s=u.order,s*x+T}).attr("width",function(u){return u.milestone?m:S(u.renderEndTime||u.endTime)-S(u.startTime)}).attr("height",m).attr("transform-origin",function(u,s){return s=u.order,(S(u.startTime)+w+.5*(S(u.endTime)-S(u.startTime))).toString()+"px "+(s*x+T+.5*m).toString()+"px"}).attr("class",function(u){const s="task";let I="";u.classes.length>0&&(I=u.classes.join(" "));let D=0;for(const[R,W]of M.entries())u.type===W&&(D=R%a.numberSectionStyles);let A="";return u.active?u.crit?A+=" activeCrit":A=" active":u.done?u.crit?A=" doneCrit":A=" done":u.crit&&(A+=" crit"),A.length===0&&(A=" task"),u.milestone&&(A=" milestone "+A),A+=D,A+=" "+I,s+A}),f.append("text").attr("id",function(u){return u.id+"-text"}).text(function(u){return u.task}).attr("font-size",a.fontSize).attr("x",function(u){let s=S(u.startTime),I=S(u.renderEndTime||u.endTime);u.milestone&&(s+=.5*(S(u.endTime)-S(u.startTime))-.5*m),u.milestone&&(I=s+m);const D=this.getBBox().width;return D>I-s?I+D+1.5*a.leftPadding>c?s+w-5:I+w+5:(I-s)/2+s+w}).attr("y",function(u,s){return s=u.order,s*x+a.barHeight/2+(a.fontSize/2-2)+T}).attr("text-height",m).attr("class",function(u){const s=S(u.startTime);let I=S(u.endTime);u.milestone&&(I=s+m);const D=this.getBBox().width;let A="";u.classes.length>0&&(A=u.classes.join(" "));let R=0;for(const[P,Q]of M.entries())u.type===Q&&(R=P%a.numberSectionStyles);let W="";return u.active&&(u.crit?W="activeCritText"+R:W="activeText"+R),u.done?u.crit?W=W+" doneCritText"+R:W=W+" doneText"+R:u.crit&&(W=W+" critText"+R),u.milestone&&(W+=" milestoneText"),D>I-s?I+D+1.5*a.leftPadding>c?A+" taskTextOutsideLeft taskTextOutside"+R+" "+W:A+" taskTextOutsideRight taskTextOutside"+R+" "+W+" width-"+D:A+" taskText taskText"+R+" "+W+" width-"+D}),ut().securityLevel==="sandbox"){let u;u=bt("#i"+e);const s=u.nodes()[0].contentDocument;f.filter(function(I){return v.has(I.id)}).each(function(I){var D=s.querySelector("#"+I.id),A=s.querySelector("#"+I.id+"-text");const R=D.parentNode;var W=s.createElement("a");W.setAttribute("xlink:href",v.get(I.id)),W.setAttribute("target","_top"),R.appendChild(W),W.appendChild(D),W.appendChild(A)})}}o(F,"drawRects");function L(y,x,T,w,m,_,c,l){if(c.length===0&&l.length===0)return;let h,f;for(const{startTime:D,endTime:A}of _)(h===void 0||D<h)&&(h=D),(f===void 0||A>f)&&(f=A);if(!h||!f)return;if(X(f).diff(X(h),"year")>5){Ct.warn("The difference between the min and max time is more than 5 years. This will cause performance issues. Skipping drawing exclude days.");return}const v=i.db.getDateFormat(),n=[];let u=null,s=X(h);for(;s.valueOf()<=f;)i.db.isInvalidDate(s,v,c,l)?u?u.end=s:u={start:s,end:s}:u&&(n.push(u),u=null),s=s.add(1,"d");B.append("g").selectAll("rect").data(n).enter().append("rect").attr("id",function(D){return"exclude-"+D.start.format("YYYY-MM-DD")}).attr("x",function(D){return S(D.start)+T}).attr("y",a.gridLineStartPadding).attr("width",function(D){const A=D.end.add(1,"day");return S(A)-S(D.start)}).attr("height",m-x-a.gridLineStartPadding).attr("transform-origin",function(D,A){return(S(D.start)+T+.5*(S(D.end)-S(D.start))).toString()+"px "+(A*y+.5*m).toString()+"px"}).attr("class","exclude-range")}o(L,"drawExcludeDays");function G(y,x,T,w){let m=Ge(S).tickSize(-w+x+a.gridLineStartPadding).tickFormat(Jt(i.db.getAxisFormat()||a.axisFormat||"%Y-%m-%d"));const c=/^([1-9]\d*)(millisecond|second|minute|hour|day|week|month)$/.exec(i.db.getTickInterval()||a.tickInterval);if(c!==null){const l=c[1],h=c[2],f=i.db.getWeekday()||a.weekday;switch(h){case"millisecond":m.ticks(ne.every(l));break;case"second":m.ticks(ie.every(l));break;case"minute":m.ticks(se.every(l));break;case"hour":m.ticks(re.every(l));break;case"day":m.ticks(ee.every(l));break;case"week":m.ticks(de[f].every(l));break;case"month":m.ticks(te.every(l));break}}if(B.append("g").attr("class","grid").attr("transform","translate("+y+", "+(w-50)+")").call(m).selectAll("text").style("text-anchor","middle").attr("fill","#000").attr("stroke","none").attr("font-size",10).attr("dy","1em"),i.db.topAxisEnabled()||a.topAxis){let l=Ke(S).tickSize(-w+x+a.gridLineStartPadding).tickFormat(Jt(i.db.getAxisFormat()||a.axisFormat||"%Y-%m-%d"));if(c!==null){const h=c[1],f=c[2],v=i.db.getWeekday()||a.weekday;switch(f){case"millisecond":l.ticks(ne.every(h));break;case"second":l.ticks(ie.every(h));break;case"minute":l.ticks(se.every(h));break;case"hour":l.ticks(re.every(h));break;case"day":l.ticks(ee.every(h));break;case"week":l.ticks(de[v].every(h));break;case"month":l.ticks(te.every(h));break}}B.append("g").attr("class","grid").attr("transform","translate("+y+", "+x+")").call(l).selectAll("text").style("text-anchor","middle").attr("fill","#000").attr("stroke","none").attr("font-size",10)}}o(G,"makeGrid");function H(y,x){let T=0;const w=Object.keys(V).map(m=>[m,V[m]]);B.append("g").selectAll("text").data(w).enter().append(function(m){const _=m[0].split(Je.lineBreakRegex),c=-(_.length-1)/2,l=Y.createElementNS("http://www.w3.org/2000/svg","text");l.setAttribute("dy",c+"em");for(const[h,f]of _.entries()){const v=Y.createElementNS("http://www.w3.org/2000/svg","tspan");v.setAttribute("alignment-baseline","central"),v.setAttribute("x","10"),h>0&&v.setAttribute("dy","1em"),v.textContent=f,l.appendChild(v)}return l}).attr("x",10).attr("y",function(m,_){if(_>0)for(let c=0;c<_;c++)return T+=w[_-1][1],m[1]*y/2+T*y+x;else return m[1]*y/2+x}).attr("font-size",a.sectionFontSize).attr("class",function(m){for(const[_,c]of M.entries())if(m[0]===c)return"sectionTitle sectionTitle"+_%a.numberSectionStyles;return"sectionTitle"})}o(H,"vertLabels");function $(y,x,T,w){const m=i.db.getTodayMarker();if(m==="off")return;const _=B.append("g").attr("class","today"),c=new Date,l=_.append("line");l.attr("x1",S(c)+y).attr("x2",S(c)+y).attr("y1",a.titleTopMargin).attr("y2",w-a.titleTopMargin).attr("class","today"),m!==""&&l.attr("style",m.replace(/,/g,";"))}o($,"drawToday");function U(y){const x={},T=[];for(let w=0,m=y.length;w<m;++w)Object.prototype.hasOwnProperty.call(x,y[w])||(x[y[w]]=!0,T.push(y[w]));return T}o(U,"checkUnique")},"draw"),os={setConf:ns,draw:cs},ls=o(t=>`
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
`,"getStyles"),us=ls,fs={parser:Tr,db:is,renderer:os,styles:us};export{fs as diagram};
