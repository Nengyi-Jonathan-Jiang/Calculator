/**
 * @param {T[]} arr 
 * @returns {T}
 * @template T 
 */
function peek(arr){return arr[arr.length - 1];}

/**
 * @param {T} x 
 * @returns {T}
 * @template T
 */
function logAndReturn(x){return console.log(x),x}


const ooo = {'B:^':3,	'B:*':2,	'B:/':2,	'B:+':1,	'B:-':1,	'('  :0};

/**
 * @typedef {"lparentheses" | "rparentheses" | "pre-unary" | "post-unary" | "binary" | "number" | "var" | "token"} tokenType
 * @typedef {{type:tokenType,value:string}} Token
 */

const ExpressionParser = {
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

    
    /**@private @type {Map<String,Constant}*/
    constants : new Map(),
    /**@private @type {Map<String,UnaryOperator>}*/
    prefixUnaryOperators : new Map(),
    /**@private @type {Map<String,UnaryOperator>}*/
    postfixUnaryOperators : new Map(),
    /**@private @type {Map<String,BinaryOperator>}*/
    binaryOperators : new Map(),

    registerCommon:()=>{
        //Built-in constants
        ExpressionParser.registerConstant("e",   Math.E);
        ExpressionParser.registerConstant("π",   Math.PI);
        ExpressionParser.registerConstant("pi",  Math.PI);
        ExpressionParser.registerConstant("τ",   Math.PI * 2);
        ExpressionParser.registerConstant("tau", Math.PI * 2);
        ExpressionParser.registerConstant("Φ",   Math.sqrt(1.25) + .5);
        ExpressionParser.registerConstant("phi", Math.sqrt(1.25) + .5);
        ExpressionParser.registerConstant("ε",   ".0000000001");
        ExpressionParser.registerConstant("epsilon", 1 / (1 << 32));

        //Common prefix unary operators
        ExpressionParser.registerPrefixUnaryOperator("√", Math.sqrt);
        ExpressionParser.registerPrefixUnaryOperator("sqrt", Math.sqrt);
        ExpressionParser.registerPrefixUnaryOperator("-", x=>-x);
        ExpressionParser.registerPrefixUnaryOperator("−", x=>-x);

        ExpressionParser.registerPrefixUnaryOperator("log2", Math.log2);
        ExpressionParser.registerPrefixUnaryOperator("log", Math.log10);
        ExpressionParser.registerPrefixUnaryOperator("ln", Math.log);
        ExpressionParser.registerPrefixUnaryOperator("exp", Math.exp);

        ExpressionParser.registerPrefixUnaryOperator("sin",Math.sin);
        ExpressionParser.registerPrefixUnaryOperator("cos",Math.cos);
        ExpressionParser.registerPrefixUnaryOperator("tan",Math.tan);
        ExpressionParser.registerPrefixUnaryOperator("asin",Math.asin);
        ExpressionParser.registerPrefixUnaryOperator("acos",Math.acos);
        ExpressionParser.registerPrefixUnaryOperator("atan",Math.atan);

        ExpressionParser.registerPrefixUnaryOperator("sign",x=>x/Math.abs(x));
        ExpressionParser.registerPrefixUnaryOperator("abs", x=>Math.abs(x));

        //Common postfix unary operators
        ExpressionParser.registerPostfixUnaryOperator("²", x=>x*x);
        ExpressionParser.registerPostfixUnaryOperator("³", x=>x*x*x);

        //Common binary operators
        ExpressionParser.registerBinaryOperator("+", (a, b) => a + b, 1);
        ExpressionParser.registerBinaryOperator("-", (a, b) => a - b, 1);
        ExpressionParser.registerBinaryOperator("*", (a, b) => a * b, 2);
        ExpressionParser.registerBinaryOperator("/", (a, b) => a / b, 2);
		ExpressionParser.registerBinaryOperator("%", (a,b) => ((a % b) + b) % b, 2);
        ExpressionParser.registerBinaryOperator("^", Math.pow, 3);

		ExpressionParser.registerBinaryOperator("XOR", (a,b) => a ^ b, 0);
		ExpressionParser.registerBinaryOperator("OR", (a,b) => a | b, 0);
		ExpressionParser.registerBinaryOperator("AND", (a,b) => a & b, 0);
    },

    /**
     * @param {String} name
     * @param {Number} value
     */
    registerConstant:function registerConstant(name,value){
        ExpressionParser.constants.set(name,{name:name,value:value});
    },
    /**
     * @param {String} name 
     * @param {(x:Number)=>Number} operation 
     */
    registerPrefixUnaryOperator:function registerPrefixUnaryOperator(name,operation){
        ExpressionParser.prefixUnaryOperators.set(name,{name:name, operation:operation});
    },
    /**
     * @param {String} name 
     * @param {(x:Number)=>Number} operation 
     */
    registerPostfixUnaryOperator:function registerPostfixUnaryOperator(name,operation){
        ExpressionParser.postfixUnaryOperators.set(name,{name:name, operation:operation});
    },
    /**
     * @param {String} name 
     * @param {(x:Number)=>Number} operation 
     * @param {Number} precedence
     */
    registerBinaryOperator: function registerBinaryOperator(name,operation,precedence){
        ExpressionParser.binaryOperators.set(name,{name:name.replace(/\*|\^|\+/g,"\\$&"), operation:operation, precedence:precedence});
    },

    /**@param {String} expression*/
    compile: function compile(expression){
        //Regex pattern to match all operators, variables, and constants
        const pattern = new RegExp(`(\\()|(\\))|(${
			[...ExpressionParser.prefixUnaryOperators.values()].map(i=>i.name).join("|")})|(${
            [...ExpressionParser.postfixUnaryOperators.values()].map(i=>i.name).join("|")})|(${
            [...ExpressionParser.binaryOperators.values()].map(i=>i.name).join("|")})|(${
            [...ExpressionParser.constants.values()].map(i=>i.name).join("|")
		})|([a-zA-Z]_[_\\w]+|[a-zA-Z])|(\\d+\\.\\d+|\\.\\d+|\\d+)`,"g");

        //Excecute the regex and figure out the token type and token value
		let tkns = [...expression.matchAll(pattern)].map(i=>`${
			i[1]?"lparentheses":  i[2]?"rparentheses":
            i[3]?"pre-unary": i[4]?"post-unary": i[5]?"binary":
            i[6]?"number": i[7]?"var": i[8]?"number": "token"
		} ${i[6] ? ExpressionParser.constants.get(i[0]).value : i[0]}`);

        //Change unary negatives to bianry minus in right context, and insert multiplication signs between consective terms
        {
            let res = [];
            let i = 0, lastTknType, tknType = "token",tknVal, tkn;
            while(i < tkns.length){
                lastTknType = tknType;
                tkn = tkns[i], [tknType, tknVal] = tkn.split(" ");

                if(!["lparentheses","binary","pre-unary"].includes(lastTknType) && tkn == "pre-unary -") tkn = tkns[i] = "binary -";
                if(["number","var","post-unary","rparenthesis"].includes(lastTknType) && ["number", "var","pre-unary","lparentheses"].includes(tknType)){
                    res.push("binary *");
                }

                res.push(tkn);
                i++;
            }

            tkns = res;
        }
        console.log(tkns);
        /**@type {Token[]}*/
        let tokens = tkns.map(i=>i.split(" ")).map(([type,val])=>({type:type,val:val}));
        //console.log(tokens);

        /**@type {Token[]}*/
        let stack = [];
        /**@type {Token[]}*/
        let opStack = [];

        for(const token of tokens){
            switch(token.type){
                case 'number':
                case 'var':
                    stack.push(token);
                    
                    while(opStack.length > 0 && peek(opStack).type == 'pre-unary'){
                        stack.push(opStack.pop());
                    }

                    break;
                
                case 'pre-unary':
                case 'lparentheses':
                    opStack.push(token);
                    break;
                case 'rparentheses':
                    let topToken = opStack.pop();
                    while(topToken.type != 'lparentheses'){
                        stack.push(topToken);
                        topToken = opStack.pop();
                        if(!topToken) throw Error("Invalid syntax: unmatched right parentheses")
                    }
                    while(opStack.length > 0 && peek(opStack).type == 'pre-unary'){
                        stack.push(opStack.pop());
                    }
                    break;
                case 'post-unary':
                    stack.push(token);
                    break;
                case 'binary':
                    while(opStack.length > 0 && peek(opStack).type == 'binary' && ExpressionParser.binaryOperators.get(token.val).precedence <= ExpressionParser.binaryOperators.get(peek(opStack).val).precedence){
                        stack.push(opStack.pop());
                    }
                    opStack.push(token);
                    break;
            }
            
            console.log(`TOKEN: <${token.type} ${token.val}>` + "\nSTACK: " + stack.map(i=>`<${i.type} ${i.val}>`).join(" ") + "\nOPSTACK: " + opStack.map(i=>`<${i.type} ${i.val}>`).join(" "));
        }
        console.log([...stack, ...opStack.reverse()].map(i=>i.val).join(" "));
        return new CompiledExpression([...stack, ...opStack.reverse()]);
    }
};


class CompiledExpression{
    /**@param {Token[]} tokens*/
    constructor(tokens){
        this.tokens = tokens;
    }
    /**
     * @param {Map<String,Number>} vars
     * @returns 
     */
    eval(vars){
        /**@type {Number[]}*/
        stack = [];
        for(const token of this.tokens){
            switch(token.type){
                case 'number':
                    stack.push(+token.value);
                    break;
                case 'var':
                    stack.push(vars.get(token.value));
                    break;
                case 'pre-unary':
                case 'post-unary':
                    stack.push(ops[value](stack.pop()));
                    break;
                case 'binary':
                    stack.push(ops[value](stack.pop(),stack.pop()));
                    break;
            }
        }
        return Math.round(stack[0]*100000)/100000;
    }
    simplify(){
        
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
    let res=[],lastEl;
    for(token of expr){
        lastEl=res[res.length - 1]
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