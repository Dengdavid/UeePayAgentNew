export default {
    // 乘
    accMul(arg1, arg2) { 
        arg1 = arg1 || 0;
        arg2 = arg2 || 0;
    	var m=0,s1=arg1.toString(),s2=arg2.toString(); 
    	try{m+=s1.split(".")[1].length}catch(e){} 
    	try{m+=s2.split(".")[1].length}catch(e){} 
    	return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m) 
    },
    // 除
    division(arg1, arg2) {
        arg1 = arg1 || 0;
        arg2 = arg2 || 0;
    	var m=0,s1=arg1.toString(),s2=arg2.toString();
    	try{m+=s1.split(".")[1].length}catch(e){} 
    	try{m+=s2.split(".")[1].length}catch(e){} 
    	return (Number(s1.replace(".",""))/Number(s2.replace(".","")))/Math.pow(10,m)
    },
    // 加
    add(a, b) {
        a = a || 0;
        b = b || 0;
        const n1 = (a.toString().split(".")[1] || "").length;
        const n2 = (b.toString().split(".")[1] || "").length;
        const e = Math.pow(10,Math.max(n1, n2));
        return (this.accMul(a, e) + this.accMul(b, e)) / e;
    },
    // 减
    reduce(a, b) {
        a = a || 0;
        b = b || 0;
        const n1 = (a.toString().split(".")[1] || "").length;
        const n2 = (b.toString().split(".")[1] || "").length;
        const e = Math.pow(10,Math.max(n1, n2));
        return (a * e - b * e) / e;
    }
}