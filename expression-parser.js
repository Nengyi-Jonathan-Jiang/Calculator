const ooo = {'B:^':3,	'B:*':2,	'B:/':2,	'B:+':1,	'B:-':1,	'('  :0};

function tokenize(input,regex){
    return [...input.matchAll(regex)].map(i=>`<${
        i[1]||1[2]?"":
        i[3]?"pre-unary":
        i[4]?"post-unary":
        i[5]?"binary":
        i[6]?"constant":
        i[7]?"var":
        i[8]?"number":
        "token"
    } ${i[0]}>`)
}

class ExpressionParser{
    /**
     * @typedef {{
     *      name: String,
     *      value: Number
     * }} Constant
     * 
     * @typedef {{
     *      name: String,
     *      operation: (x:Number)=>Number
     * }} UnaryOperator
     * 
     * @typedef {{
     *      name: String,
     *      operation: (a:Number, b:Number)=>Number,
     *      precedence: Number
     * }} BinaryOperator
     */

    constructor(){
        /**@type {Constant[]}*/
        this.constants = [];
        /**@type {UnaryOperator[]}*/
        this.prefixUnaryOperators = [];
        /**@type {UnaryOperator[]}*/
        this.postfixUnaryOperators = [];
        /**@type {BinaryOperator[]}*/
        this.binaryOperators = [];

        //Built-in constants
        this.registerConstant("e",   Math.E);
        this.registerConstant("π",   Math.PI);
        this.registerConstant("pi",  Math.PI);
        this.registerConstant("τ",   Math.PI * 2);
        this.registerConstant("tau", Math.PI * 2);
        this.registerConstant("Φ",   Math.sqrt(1.25) + .5);
        this.registerConstant("phi", Math.sqrt(1.25) + .5);
        this.registerConstant("ε",   ".0000000001");
        this.registerConstant("epsilon", 1 / (1 << 32));

        //Common prefix unary operators
        this.registerPrefixUnaryOperator("√", Math.sqrt);
        this.registerPrefixUnaryOperator("sqrt", Math.sqrt);
        this.registerPrefixUnaryOperator("-", x=>-x);
        this.registerPrefixUnaryOperator("−", x=>-x);

        this.registerPrefixUnaryOperator("log2", Math.log2);
        this.registerPrefixUnaryOperator("log", Math.log10);
        this.registerPrefixUnaryOperator("ln", Math.log);
        this.registerPrefixUnaryOperator("exp", Math.exp);

        this.registerPrefixUnaryOperator("sin",Math.sin);
        this.registerPrefixUnaryOperator("cos",Math.cos);
        this.registerPrefixUnaryOperator("tan",Math.tan);
        this.registerPrefixUnaryOperator("asin",Math.asin);
        this.registerPrefixUnaryOperator("acos",Math.acos);
        this.registerPrefixUnaryOperator("atan",Math.atan);

        this.registerPrefixUnaryOperator("sign",x=>x/Math.abs(x));
        this.registerPrefixUnaryOperator("abs", x=>Math.abs(x));

        //Common postfix unary operators
        this.registerPostfixUnaryOperator("²", x=>x*x);
        this.registerPostfixUnaryOperator("³", x=>x*x*x);

        //Common binary operators
        this.registerBinaryOperator("\\+", (a, b) => a + b, 1);
        this.registerBinaryOperator("-", (a, b) => a - b, 1);
        this.registerBinaryOperator("\\*", (a, b) => a * b, 2);
        this.registerBinaryOperator("/", (a, b) => a / b, 2);
        this.registerBinaryOperator("\\^", Math.pow, 3);
    }

    /**
     * @param {String} name
     * @param {Number} value
     */
    registerConstant(name,value){
        this.constants.push({name:name,value:value});
    }
    /**
     * @param {String} name 
     * @param {(x:Number)=>Number} operation 
     */
    registerPrefixUnaryOperator(name,operation){
        this.prefixUnaryOperators.push({name:name, operation:operation});
    }
    /**
     * @param {String} name 
     * @param {(x:Number)=>Number} operation 
     */
    registerPostfixUnaryOperator(name,operation){
        this.postfixUnaryOperators.push({name:name, operation:operation});
    }
    /**
     * @param {String} name 
     * @param {(x:Number)=>Number} operation 
     * @param {Number} precedence
     */
    registerBinaryOperator(name,operation,precedence){
        this.binaryOperators.push({name:name, operation:operation, precedence:precedence});
    }

    /**@param expression {String}*/
    parse(expression){
        //Tokenize

        //Helper function
        /**
         * @param {String} string
         * @param {String} search
         * @param {String} replace
         */
        const replaceAll = (string, search, replace)=>string.replace(new RegExp(search,"g"),replace);
          
        

        console.log("Fixing spaces");

        //Fix spaces
        expression = expression.replace(/ /g,'').replace(new RegExp(
            "/(?<=(\\*|\\/|\\+|-|\\()|^)-(?=[\\da-z(]|" + this.constants.map(i=>`(${i.name})`).join("|") + ")"
        ,"g"),'|U:_');

        console.log("Replacing unary operators");

        //Replace prefix unary operators
        for(let i = 0; i < this.prefixUnaryOperators.length; i++){
            const op = this.prefixUnaryOperators[i];
            expression = replaceAll(expression, op.name, `|PREFIX:${i}`);
        }
        //Replace postfix unary operators
        for(let i = 0; i < this.postfixUnaryOperators.length; i++){
            const op = this.postfixUnaryOperators[i];
            expression = replaceAll(expression, op.name, `|POSTFIX:${i}`);
        }
        
        console.log("Replacing numbers")
        //Replace literals (numbers) and constants
        expression = expression.replace(/\d+(\.\d+)?/g,"|LITERAL:$&");
        for(let i = 0; i < this.constants.length; i++){
            const constant = this.constants[i];
            expression = replaceAll(expression, constant.name, `|LITERAL:${constant.value}`);
        }

        console.log("Replacing binary operators")
        //Replace binary operators
        for(let i = 0; i < this.postfixUnaryOperators.length; i++){
            const op = this.binaryOperators[i];
            expression = replaceAll(expression, op.name, `|BINARY:${i}`);
        }

        //Replace parentheses
        expression = expression.replace(/\(/g,"|(:(");
        expression = expression.replace(/\)/g,"|):)");

        //Replace variable names
        expression = expression.replace(/[a-z]/g, "|VAR:$&");

        let tokenList = expression.split('|').filter(i=>i!='')

        //console.log(tokenList);
        return tokenList;
    }
}


const toRPN = (expr)=>{
    const formatted_expr = (expr.replace(/ /g,'')                                   					//remove whitespace
            .replace(/(?<=(\*|\/|\+|-|\()|^)-(?=[\da-z(π])/g,'|U:_')                              	    //negative 			(unary op)
            .replace(/asin/g,'|U:ASIN').replace(/acos/g,'|U:ACOS').replace(/atan/g,'|U:ATAN')           //trig-inverse      (unary op)
            .replace(/sec/g,'|U:SEC').replace(/cot/g,'|U:COT').replace(/csc/g,'|U:CSC')        			//trig-other		(unary op)
            .replace(/sin/g,'|U:SIN').replace(/cos/g,'|U:COS').replace(/tan/g,'|U:TAN')        			//trig-simple		(unary op)
            .replace(/√/g,'|U:SQRT').replace(/²/g,'|U:<SQ>')     				                        //sq,sqrt   		(unary op)
            .replace(/abs/g,'|U:ABS').replace(/sign/g,'|U:SIGN')     				                    //abs,sign   		(unary op)
            .replace(/\d+(\.\d+)?/g,'|L:$&')                    										//numbers 			(literal)
            .replace(/pi|π/g ,'|L:'+Math.PI).replace(/e/g    ,'|L:'+Math.E)								//math constants 	(literal)
            .replace(/[\*\/\+\-\^]/g,'|B:$&')                   										//+-/*^				(binary ops)
            .replace(/[\(\)]/g,'|$&') 				            										//parentheses		(grouping)
            .replace(/[a-z]/g,'|V:$&')                          										//vars				(variables)
    );

    const tokens=clean(formatted_expr.split('|').filter(i=>i!=''));
    let stack = [];
    let opStack = [];
    for(const token of tokens){
        switch(token[0]){
            case 'L':   stack.push(token);if(opStack.length!=0){if(opStack[opStack.length-1][0]=='U')stack.push(opStack.pop());}break;
            case '(':   opStack.push(token);break;
            case ')':   let topToken = opStack.pop();while(topToken!='('){stack.push(topToken);topToken = opStack.pop();if(!topToken){return[];}}if(opStack.length!=0){if(opStack[opStack.length-1][0]=='U')stack.push(opStack.pop());}break;
            case 'U':   if(token[2]=='<'){stack.push(token);break;}if(opStack.length!=0){if(opStack[opStack.length-1][0]=='U')stack.push(opStack.pop());}opStack.push(token);break;
            case 'B':   while(opStack!=[]&&ooo[token]<=ooo[opStack[opStack.length-1]]){stack.push(opStack.pop());}opStack.push(token);break;
            case 'V':   stack.push(token);if(opStack.length!=0){if(opStack[opStack.length-1][0]=='U')stack.push(opStack.pop());}break;
        }
    }
    stack=stack.concat(opStack.reverse())
    return stack;
}

const clean = (expr) =>{
    res=[];
    for(token of expr){
        lastEl=res.pop();
        res.push(lastEl);
        if(lastEl)if(('VL)'.includes(lastEl[0])||lastEl=="U:<SQ>")&&('VL('.includes(token[0]))){res.push('B:*');} //chained multiplication
        res.push(token);
    }
    return res.slice(1);
}

ops = {
    'SQRT':Math.sqrt,'<SQ>':x=>x*x,             //sqrt,sq
    'ABS':Math.abs,'SIGN':x=>x/Math.abs(x),     //abs,sign
    '_':(x)=>(-x),                              //unary neg
    'SIN': Math.sin,'COS': Math.cos,'TAN': Math.tan,        //trig-simple
    'ASIN': Math.asin,'ACOS': Math.acos,'ATAN': Math.atan,  //trig-inverse
    'SEC': x=>1/Math.cos(x),    //trig-other
    'COT': x=>1/Math.tan(x),    //trig-other
    'CSC': x=>1/Math.sin(x),    //trig-other
    '*':(y,x)=>x*y,'/': (y,x)=>x/y,'+':(y,x)=>x+y,'-':(y,x)=>x-y,'^':(y,x)=>Math.pow(x,y)   //+-*/^
}

const evaluate_expr = (rpn,vars={}) =>{
    stack = [];
    for(const token of rpn){
        const value = token.substring(2);
        switch(token[0]){
            case 'L':{stack.push(+value);break;}
            case 'V':{stack.push(vars[value]);break;}
            case 'U':{stack.push(ops[value](stack.pop()));break;}
            case 'B':{stack.push(ops[value](stack.pop(),stack.pop()));break;}
        }
    }
    return Math.round(stack[0]*100000)/100000;
}