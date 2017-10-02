import{I,chain,curry,curryObjectK,fork,isFunction,length,map,pipe,reject}from'f-utility';import Future,{Future as Future$1,isFuture,of,reject as reject$1}from'fluture';import{e2}from'entrust';var version='0.0.1',guided=curry(function(a,b){return isFuture(b)?b:a(b)}),GuidedLeft=guided(reject$1),GuidedRight=guided(of),plural=function(a){return 1<a.length?'s':''},expectFunctionProps=curry(function(a,b){return new Error(a+': Expected '+b.join(', ')+' to be function'+plural(b)+'.')}),rejectNonFunctions=reject(isFunction),safeRailInputs=pipe(rejectNonFunctions,Object.keys),anchor=curry(function(a,b,c){if(null==c)return GuidedLeft(new Error('anchor: Expected to be given non-null input.'));var d=safeRailInputs({assertion:a,wrongPath:b});return 0<d.length?GuidedLeft(expectFunctionProps('anchor',d)):(a(c)?GuidedRight:pipe(b,GuidedLeft))(c)}),allPropsAreFunctions=pipe(reject(isFunction),Object.keys,length,function(a){return 0===a}),judgement=curryObjectK(['jury','law','input'],function(a){var b=a.jury,c=a.law,d=a.input,e=a.deliberation;void 0===e&&(e=I);var f=a.pre;void 0===f&&(f=I);var g=a.post;return void 0===g&&(g=I),pipe(c,pipe(f,e,g),b)(d)}),judgeObject=curryObjectK(['jury','law','input'],function(a){var b=a.jury,c=a.law,d=a.input,e=a.pre;void 0===e&&(e=I);var f=a.post;return void 0===f&&(f=I),judgement({deliberation:Object.keys,pre:e,post:f,jury:b,law:c,input:d})}),safeWarn=curry(function(a,b){return judgeObject({deliberation:I,jury:expectFunctionProps(a),law:rejectNonFunctions,input:b})}),safetyNet=curry(function(a,b,c,d){return new Future(function(e,f){var g={assertion:a,wrongPath:b,rightPath:c};return allPropsAreFunctions(g)?pipe(anchor(a,b),map(c),fork(e,f))(d):e(safeWarn('safetyNet',g))})}),syncCase=curry(function(b,c){return new Future$1(function(d,e){for(var f=0;f<b.length;f++){var a=b[f],g=a[0],h=a[1];if(!g(c))return d(h(c))}return e(c)})}),asyncCase=curry(function(b,c){return new Future$1(function(d,e){for(var f=0;f<b.length;f++){var a=b[f],g=a[0],h=a[1];if(!g(c))return d(h(c))}return e(c)})}),tether=curry(function(a,b,c){return map(b,isFuture(c)?chain(asyncCase(a),c):syncCase(a,c))}),bimap=e2('bimap'),map$1=map,chain$1=chain;export{map$1 as map,chain$1 as chain,version,safetyNet,anchor,tether,bimap,GuidedLeft,GuidedRight,guided};export{ap,fold,fork}from'f-utility';