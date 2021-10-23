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
        /**@private @type {Map<String,Constant}*/
        this.constants = new Map();
        /**@private @type {Map<String,UnaryOperator>}*/
        this.prefixUnaryOperators = new Map();
        /**@private @type {Map<String,UnaryOperator>}*/
        this.postfixUnaryOperators = new Map();
        /**@private @type {Map<String,BinaryOperator>}*/
        this.binaryOperators = new Map();
    }

    /**
     * @returns {ExpressionParser}
     */
    registerCommon(){
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
        this.registerBinaryOperator("+", (a, b) => a + b, 1);
        this.registerBinaryOperator("-", (a, b) => a - b, 1);
        this.registerBinaryOperator("*", (a, b) => a * b, 2);
        this.registerBinaryOperator("/", (a, b) => a / b, 2);
		this.registerBinaryOperator("%", (a,b) => ((a % b) + b) % b, 2);
        this.registerBinaryOperator("^", Math.pow, 3);

		this.registerBinaryOperator("XOR", (a,b) => a ^ b, 0);
		this.registerBinaryOperator("OR", (a,b) => a | b, 0);
		this.registerBinaryOperator("AND", (a,b) => a & b, 0);

        return this;
    }

    /**
     * @param {String} name
     * @param {Number} value
     * @returns {ExpressionParser}
     */
    registerConstant(name,value){
        return this.constants.set(name,{name:name,value:value}), this;
    }
    /**
     * @param {String} name 
     * @param {(x:Number)=>Number} operation 
     * @returns {ExpressionParser}
     */
    registerPrefixUnaryOperator(name,operation){
        return this.prefixUnaryOperators.set(name,{name:name, operation:operation}), this;
    }
    /**
     * @param {String} name 
     * @param {(x:Number)=>Number} operation 
     */
    registerPostfixUnaryOperator(name,operation){
        this.postfixUnaryOperators.set(name,{name:name, operation:operation});
    }
    /**
     * @param {String} name 
     * @param {(x:Number)=>Number} operation 
     * @param {Number} precedence
     */
    registerBinaryOperator(name,operation,precedence){
        this.binaryOperators.set(name,{name:name.replace(/\*|\^|\+/g,"\\$&"), operation:operation, precedence:precedence});
    }

    /**
     * Tokenizes a string and converts it to Reverse-Polish-Notation (RPN)
     * @param {String} expression
     * @returns {CompiledExpression}
     */
    compile(expression){
        //Regex pattern to match all operators, variables, and constants
        const pattern = new RegExp(`(\\()|(\\))|(${
			[...this.prefixUnaryOperators.values()].map(i=>i.name).join("|")})|(${
            [...this.postfixUnaryOperators.values()].map(i=>i.name).join("|")})|(${
            [...this.binaryOperators.values()].map(i=>i.name).join("|")})|(${
            [...this.constants.values()].map(i=>i.name).join("|")
		})|([a-zA-Z]_[_\\w]+|[a-zA-Z])|(\\d+\\.\\d+|\\.\\d+|\\d+)`,"g");

        //Excecute the regex and figure out the token type and token value
		let tkns = [...expression.matchAll(pattern)].map(i=>`${
			i[1]?"lparentheses":  i[2]?"rparentheses":
            i[3]?"pre-unary": i[4]?"post-unary": i[5]?"binary":
            i[6]?"number": i[7]?"var": i[8]?"number": "token"
		} ${i[6] ? this.constants.get(i[0]).value : i[0]}`);

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
                    while(opStack.length > 0 && peek(opStack).type == 'binary' && this.binaryOperators.get(token.val).precedence <= this.binaryOperators.get(peek(opStack).val).precedence){
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

    
    static default = new ExpressionParser().registerCommon();

    /**
     * Tokenizes a string and converts it to Reverse-Polish-Notation (RPN)
     * @param {String} expression 
     * @returns {CompiledExpression}
     */
    static compile(expression){
        return ExpressionParser.default.compile(expression);
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
}